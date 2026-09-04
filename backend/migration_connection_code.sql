-- ==============================================================================
-- SMRITI: SAFE DATABASE MIGRATION FOR HUMAN-FRIENDLY CONNECTION CODES
-- ==============================================================================
-- Description:
--   1. Creates random SMRITI connection code generator.
--   2. Adds connection_code to public.patients table.
--   3. Safely backfills all existing patient rows row-by-row with unique codes.
--   4. Sets connection_code NOT NULL, DEFAULT generator, and UNIQUE index.
--   5. Updates the auth trigger handle_new_user() for auto-generation.
--   6. Drops old connect_patient() signatures and defines ONE unified RPC function:
--      - Validates caller has role = 'caretaker' in profiles.
--      - Accepts either SMRITI-XXXXXX code or legacy UUID.
--      - Prevents self-linking and unauthenticated calls.
--      - Fully transactional and idempotent.
-- ==============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. CREATE SMRITI CONNECTION CODE GENERATOR FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_smriti_connection_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; -- Excludes confusing characters (0, O, 1, I)
    result TEXT := 'SMRITI-';
    i INTEGER;
    code_exists BOOLEAN;
BEGIN
    LOOP
        result := 'SMRITI-';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;

        SELECT EXISTS(SELECT 1 FROM public.patients WHERE connection_code = result) INTO code_exists;
        IF NOT code_exists THEN
            RETURN result;
        END IF;
    END LOOP;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. ADD connection_code COLUMN TO public.patients (IF NOT ALREADY PRESENT)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'patients' 
          AND column_name = 'connection_code'
    ) THEN
        ALTER TABLE public.patients ADD COLUMN connection_code TEXT;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. SAFELY BACKFILL EXISTING PATIENTS WITH UNIQUE CODES (ROW-BY-ROW)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
    v_new_code TEXT;
BEGIN
    FOR r IN SELECT id FROM public.patients WHERE connection_code IS NULL OR connection_code = '' LOOP
        v_new_code := public.generate_smriti_connection_code();
        UPDATE public.patients
        SET connection_code = v_new_code
        WHERE id = r.id;
    END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 4. SET DEFAULT GENERATOR, NOT NULL CONSTRAINT, AND UNIQUE INDEX
-- -----------------------------------------------------------------------------
ALTER TABLE public.patients 
    ALTER COLUMN connection_code SET DEFAULT public.generate_smriti_connection_code(),
    ALTER COLUMN connection_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_connection_code 
    ON public.patients(connection_code);

-- -----------------------------------------------------------------------------
-- 5. UPDATE AUTH TRIGGER FUNCTION handle_new_user()
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
    user_phone TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User');
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

    -- 1. Insert/Upsert into public.profiles
    INSERT INTO public.profiles (id, full_name, role, phone)
    VALUES (NEW.id, user_name, user_role, user_phone)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        phone = EXCLUDED.phone;

    -- 2. If role is patient, insert into public.patients with unique SMRITI connection_code
    IF user_role = 'patient' THEN
        INSERT INTO public.patients (profile_id, connection_code)
        VALUES (NEW.id, public.generate_smriti_connection_code())
        ON CONFLICT (profile_id) DO UPDATE SET
            connection_code = COALESCE(public.patients.connection_code, EXCLUDED.connection_code);
    END IF;

    RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. DROP OLD FUNCTION OVERLOADS BEFORE CREATING UNIFIED SIGNATURE
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.connect_patient(UUID, TEXT);
DROP FUNCTION IF EXISTS public.connect_patient(TEXT, TEXT);

-- -----------------------------------------------------------------------------
-- 7. CREATE UNIFIED connect_patient() RPC FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.connect_patient(
    p_code TEXT DEFAULT NULL,
    p_relationship TEXT DEFAULT 'Caregiver',
    p_patient_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_input TEXT;
    v_clean_code TEXT;
    v_caretaker_role TEXT;
    v_patient_rec RECORD;
    v_profile_rec RECORD;
    v_link_rec RECORD;
    v_is_uuid BOOLEAN;
BEGIN
    -- 1. Authentication check
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Authorize caller is a Caretaker
    SELECT role INTO v_caretaker_role FROM public.profiles WHERE id = auth.uid();
    IF v_caretaker_role IS NULL OR v_caretaker_role <> 'caretaker' THEN
        RAISE EXCEPTION 'Only users with the Caretaker role can link patients.';
    END IF;

    -- 3. Resolve connection code / input
    v_input := COALESCE(p_code, p_patient_id::TEXT);
    IF v_input IS NULL OR TRIM(v_input) = '' THEN
        RAISE EXCEPTION 'Connection code cannot be empty.';
    END IF;

    v_clean_code := UPPER(TRIM(v_input));
    v_is_uuid := v_input ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

    -- 4. Lookup patient by SMRITI connection_code, fallback to id if UUID
    SELECT * INTO v_patient_rec
    FROM public.patients
    WHERE UPPER(connection_code) = v_clean_code
       OR (v_is_uuid AND id = v_input::UUID);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid Patient Connection Code. Patient not found.';
    END IF;

    -- 5. Prevent linking own patient account
    IF v_patient_rec.profile_id = auth.uid() THEN
        RAISE EXCEPTION 'You cannot link your own patient account as a caretaker.';
    END IF;

    SELECT * INTO v_profile_rec FROM public.profiles WHERE id = v_patient_rec.profile_id;

    -- 6. Insert / Upsert relationship mapping
    INSERT INTO public.caretaker_patient (caretaker_id, patient_id, relationship)
    VALUES (auth.uid(), v_patient_rec.id, COALESCE(p_relationship, 'Caregiver'))
    ON CONFLICT (caretaker_id, patient_id) DO UPDATE SET
        relationship = EXCLUDED.relationship
    RETURNING * INTO v_link_rec;

    -- 7. Return safe linkage payload
    RETURN jsonb_build_object(
        'success', true,
        'link_id', v_link_rec.id,
        'patient_id', v_patient_rec.id,
        'connection_code', v_patient_rec.connection_code,
        'patient_name', v_profile_rec.full_name,
        'patient_phone', v_profile_rec.phone,
        'relationship', v_link_rec.relationship
    );
END;
$$;

COMMIT;
