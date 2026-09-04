-- ==============================================================================
-- SMRITI DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) FOR SUPABASE
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'caretaker', 'admin')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 2. PATIENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_patient_profile UNIQUE (profile_id)
);

-- -----------------------------------------------------------------------------
-- 3. CARETAKER_PATIENT TABLE (Relationship mapping)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.caretaker_patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caretaker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    relationship TEXT DEFAULT 'Caregiver',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_caretaker_patient UNIQUE (caretaker_id, patient_id)
);

-- -----------------------------------------------------------------------------
-- 4. MEDICATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    dosage TEXT,
    frequency INTEGER DEFAULT 1,
    times JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 5. MEDICATION_LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    taken BOOLEAN NOT NULL DEFAULT false,
    taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_medication_dose UNIQUE (medication_id, scheduled_date, scheduled_time)
);

-- -----------------------------------------------------------------------------
-- 6. MEMORY_SESSIONS TABLE (Cognitive game sessions & stats)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memory_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    total_rounds INTEGER NOT NULL DEFAULT 5,
    correct_count INTEGER NOT NULL DEFAULT 0,
    accuracy NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    score INTEGER NOT NULL DEFAULT 0,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 7. SOS_ALERTS TABLE (Emergency distress signals)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    acknowledged_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 8. LOCATIONS TABLE (GPS tracking & geofencing logs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy NUMERIC,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 9. DOCUMENTS TABLE (Medical records & reports metadata)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT DEFAULT 'application/pdf',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 10. GALLERY_IMAGES TABLE (Memory/Face recognition photos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 11. APPOINTMENTS TABLE (Doctor visits & family visitor reminders)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'doctor' CHECK (kind IN ('doctor', 'visitor')),
    specialization TEXT,
    relation TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    location TEXT,
    purpose TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    acknowledged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 12. EMERGENCY_CONTACTS TABLE (Family & caregiver emergency numbers)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 13. PATIENT_SETTINGS TABLE (Preferences & accessibility configs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_settings (
    patient_id UUID PRIMARY KEY REFERENCES public.patients(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'English',
    reminder_sound BOOLEAN DEFAULT true,
    voice_enabled BOOLEAN DEFAULT true,
    difficulty TEXT DEFAULT 'Medium',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_patients_profile_id ON public.patients(profile_id);
CREATE INDEX IF NOT EXISTS idx_caretaker_patient_caretaker ON public.caretaker_patient(caretaker_id);
CREATE INDEX IF NOT EXISTS idx_caretaker_patient_patient ON public.caretaker_patient(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON public.medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_patient ON public.medication_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_date ON public.medication_logs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_memory_sessions_patient ON public.memory_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_patient ON public.sos_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON public.sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_locations_patient ON public.locations(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON public.documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_patient ON public.gallery_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient ON public.emergency_contacts(patient_id);

-- ==============================================================================
-- SECURITY DEFINER HELPER FUNCTIONS (Bypasses recursion in RLS policies)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_my_patient_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT id FROM public.patients WHERE profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_assigned_patient_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT patient_id FROM public.caretaker_patient WHERE caretaker_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_assigned_patient_profile_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT p.profile_id FROM public.patients p
    JOIN public.caretaker_patient cp ON cp.patient_id = p.id
    WHERE cp.caretaker_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_assigned_caretaker_profile_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT cp.caretaker_id FROM public.caretaker_patient cp
    JOIN public.patients p ON p.id = cp.patient_id
    WHERE p.profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_patient_access(p_patient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT (
        p_patient_id IN (SELECT public.get_my_patient_ids())
        OR p_patient_id IN (SELECT public.get_assigned_patient_ids())
    );
$$;

-- ==============================================================================
-- AUTOMATIC PROFILE & PATIENT CREATION TRIGGER ON AUTH.USERS
-- ==============================================================================

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

    -- 2. If role is patient, automatically insert into public.patients
    IF user_role = 'patient' THEN
        INSERT INTO public.patients (profile_id)
        VALUES (NEW.id)
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SECURE PATIENT-CARETAKER LINKING RPC FUNCTION
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.connect_patient(p_patient_id UUID, p_relationship TEXT DEFAULT 'Caregiver')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_patient_rec RECORD;
    v_profile_rec RECORD;
    v_link_rec RECORD;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_patient_rec FROM public.patients WHERE id = p_patient_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid Patient Connection Code. Patient not found.';
    END IF;

    SELECT * INTO v_profile_rec FROM public.profiles WHERE id = v_patient_rec.profile_id;

    IF v_patient_rec.profile_id = auth.uid() THEN
        RAISE EXCEPTION 'You cannot link your own patient account as a caretaker.';
    END IF;

    INSERT INTO public.caretaker_patient (caretaker_id, patient_id, relationship)
    VALUES (auth.uid(), p_patient_id, COALESCE(p_relationship, 'Caregiver'))
    ON CONFLICT (caretaker_id, patient_id) DO UPDATE SET
        relationship = EXCLUDED.relationship
    RETURNING * INTO v_link_rec;

    RETURN jsonb_build_object(
        'success', true,
        'link_id', v_link_rec.id,
        'patient_id', v_patient_rec.id,
        'patient_name', v_profile_rec.full_name,
        'patient_phone', v_profile_rec.phone,
        'relationship', v_link_rec.relationship
    );
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES (DATABASE TABLES)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caretaker_patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_settings ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Caretakers can view assigned patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Patients can view assigned caretaker profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Caretakers can view assigned patient profiles"
    ON public.profiles FOR SELECT
    USING (id IN (SELECT public.get_assigned_patient_profile_ids()));

CREATE POLICY "Patients can view assigned caretaker profiles"
    ON public.profiles FOR SELECT
    USING (id IN (SELECT public.get_assigned_caretaker_profile_ids()));

-- 2. Patients Policies
DROP POLICY IF EXISTS "Patients can view own patient record" ON public.patients;
DROP POLICY IF EXISTS "Patients can create own patient record" ON public.patients;
DROP POLICY IF EXISTS "Caretakers can view assigned patient records" ON public.patients;

CREATE POLICY "Patients can view own patient record"
    ON public.patients FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Patients can create own patient record"
    ON public.patients FOR INSERT
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Caretakers can view assigned patient records"
    ON public.patients FOR SELECT
    USING (id IN (SELECT public.get_assigned_patient_ids()));

-- 3. Caretaker_Patient Policies
DROP POLICY IF EXISTS "Caretakers and Patients can view relationships" ON public.caretaker_patient;
DROP POLICY IF EXISTS "Caretakers can link to patient" ON public.caretaker_patient;
DROP POLICY IF EXISTS "Caretakers can update relationship" ON public.caretaker_patient;
DROP POLICY IF EXISTS "Caretakers can remove link to patient" ON public.caretaker_patient;

CREATE POLICY "Caretakers and Patients can view relationships"
    ON public.caretaker_patient FOR SELECT
    USING (
        caretaker_id = auth.uid()
        OR patient_id IN (SELECT public.get_my_patient_ids())
    );

CREATE POLICY "Caretakers can link to patient"
    ON public.caretaker_patient FOR INSERT
    WITH CHECK (caretaker_id = auth.uid());

CREATE POLICY "Caretakers can update relationship"
    ON public.caretaker_patient FOR UPDATE
    USING (caretaker_id = auth.uid());

CREATE POLICY "Caretakers can remove link to patient"
    ON public.caretaker_patient FOR DELETE
    USING (caretaker_id = auth.uid());

-- 4. Medications Policies
DROP POLICY IF EXISTS "Medications Select Policy" ON public.medications;
DROP POLICY IF EXISTS "Medications Insert Policy" ON public.medications;
DROP POLICY IF EXISTS "Medications Update Policy" ON public.medications;
DROP POLICY IF EXISTS "Medications Delete Policy" ON public.medications;

CREATE POLICY "Medications Select Policy"
    ON public.medications FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Medications Insert Policy"
    ON public.medications FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

CREATE POLICY "Medications Update Policy"
    ON public.medications FOR UPDATE
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Medications Delete Policy"
    ON public.medications FOR DELETE
    USING (public.has_patient_access(patient_id));

-- 5. Medication_Logs Policies
DROP POLICY IF EXISTS "Medication Logs Select Policy" ON public.medication_logs;
DROP POLICY IF EXISTS "Medication Logs Insert Policy" ON public.medication_logs;
DROP POLICY IF EXISTS "Medication Logs Update Policy" ON public.medication_logs;

CREATE POLICY "Medication Logs Select Policy"
    ON public.medication_logs FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Medication Logs Insert Policy"
    ON public.medication_logs FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

CREATE POLICY "Medication Logs Update Policy"
    ON public.medication_logs FOR UPDATE
    USING (public.has_patient_access(patient_id));

-- 6. Memory_Sessions Policies
DROP POLICY IF EXISTS "Memory Sessions Select Policy" ON public.memory_sessions;
DROP POLICY IF EXISTS "Memory Sessions Insert Policy" ON public.memory_sessions;

CREATE POLICY "Memory Sessions Select Policy"
    ON public.memory_sessions FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Memory Sessions Insert Policy"
    ON public.memory_sessions FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

-- 7. SOS_Alerts Policies
DROP POLICY IF EXISTS "SOS Alerts Select Policy" ON public.sos_alerts;
DROP POLICY IF EXISTS "SOS Alerts Insert Policy" ON public.sos_alerts;
DROP POLICY IF EXISTS "SOS Alerts Update Policy" ON public.sos_alerts;

CREATE POLICY "SOS Alerts Select Policy"
    ON public.sos_alerts FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "SOS Alerts Insert Policy"
    ON public.sos_alerts FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

CREATE POLICY "SOS Alerts Update Policy"
    ON public.sos_alerts FOR UPDATE
    USING (public.has_patient_access(patient_id));

-- 8. Locations Policies
DROP POLICY IF EXISTS "Locations Select Policy" ON public.locations;
DROP POLICY IF EXISTS "Locations Insert Policy" ON public.locations;

CREATE POLICY "Locations Select Policy"
    ON public.locations FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Locations Insert Policy"
    ON public.locations FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

-- 9. Documents Policies
DROP POLICY IF EXISTS "Documents Select Policy" ON public.documents;
DROP POLICY IF EXISTS "Documents Insert Policy" ON public.documents;
DROP POLICY IF EXISTS "Documents Delete Policy" ON public.documents;

CREATE POLICY "Documents Select Policy"
    ON public.documents FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Documents Insert Policy"
    ON public.documents FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

CREATE POLICY "Documents Delete Policy"
    ON public.documents FOR DELETE
    USING (public.has_patient_access(patient_id));

-- 10. Gallery_Images Database Policies
DROP POLICY IF EXISTS "Gallery Images Select Policy" ON public.gallery_images;
DROP POLICY IF EXISTS "Gallery Images Insert Policy" ON public.gallery_images;
DROP POLICY IF EXISTS "Gallery Images Delete Policy" ON public.gallery_images;

CREATE POLICY "Gallery Images Select Policy"
    ON public.gallery_images FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Gallery Images Insert Policy"
    ON public.gallery_images FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

CREATE POLICY "Gallery Images Delete Policy"
    ON public.gallery_images FOR DELETE
    USING (public.has_patient_access(patient_id));

-- 11. Appointments Policies
DROP POLICY IF EXISTS "Appointments Select Policy" ON public.appointments;
DROP POLICY IF EXISTS "Appointments Insert Policy" ON public.appointments;
DROP POLICY IF EXISTS "Appointments Update Policy" ON public.appointments;
DROP POLICY IF EXISTS "Appointments Delete Policy" ON public.appointments;

CREATE POLICY "Appointments Select Policy"
    ON public.appointments FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Appointments Insert Policy"
    ON public.appointments FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

CREATE POLICY "Appointments Update Policy"
    ON public.appointments FOR UPDATE
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Appointments Delete Policy"
    ON public.appointments FOR DELETE
    USING (public.has_patient_access(patient_id));

-- 12. Emergency Contacts Policies
DROP POLICY IF EXISTS "Emergency Contacts Select Policy" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Emergency Contacts Insert Policy" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Emergency Contacts Update Policy" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Emergency Contacts Delete Policy" ON public.emergency_contacts;

CREATE POLICY "Emergency Contacts Select Policy"
    ON public.emergency_contacts FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Emergency Contacts Insert Policy"
    ON public.emergency_contacts FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

CREATE POLICY "Emergency Contacts Update Policy"
    ON public.emergency_contacts FOR UPDATE
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Emergency Contacts Delete Policy"
    ON public.emergency_contacts FOR DELETE
    USING (public.has_patient_access(patient_id));

-- 13. Patient Settings Policies
DROP POLICY IF EXISTS "Patient Settings Select Policy" ON public.patient_settings;
DROP POLICY IF EXISTS "Patient Settings Insert Policy" ON public.patient_settings;
DROP POLICY IF EXISTS "Patient Settings Update Policy" ON public.patient_settings;

CREATE POLICY "Patient Settings Select Policy"
    ON public.patient_settings FOR SELECT
    USING (public.has_patient_access(patient_id));

CREATE POLICY "Patient Settings Insert Policy"
    ON public.patient_settings FOR INSERT
    WITH CHECK (public.has_patient_access(patient_id));

CREATE POLICY "Patient Settings Update Policy"
    ON public.patient_settings FOR UPDATE
    USING (public.has_patient_access(patient_id));

-- ==============================================================================
-- REALTIME REPLICATION PUBLICATION SETUP (IDEMPOTENT)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'gallery_images'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_images;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'memory_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memory_sessions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'medications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'medication_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.medication_logs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'sos_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
END $$;

-- ==============================================================================
-- SUPABASE STORAGE BUCKETS & STORAGE RLS POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Clean up any existing policies on storage.objects for gallery & documents
DROP POLICY IF EXISTS "Patients and Caretakers can read gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Caretakers and Patients can upload gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Caretakers and Patients can delete gallery photos" ON storage.objects;

DROP POLICY IF EXISTS "Patients and Caretakers can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Caretakers and Patients can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Caretakers and Patients can delete documents" ON storage.objects;

-- GALLERY POLICIES
CREATE POLICY "Patients and Caretakers can read gallery photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'gallery'
    AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_patient_access((split_part(name, '/', 1))::uuid)
);

CREATE POLICY "Caretakers and Patients can upload gallery photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'gallery'
    AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_patient_access((split_part(name, '/', 1))::uuid)
);

CREATE POLICY "Caretakers and Patients can delete gallery photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'gallery'
    AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_patient_access((split_part(name, '/', 1))::uuid)
);

-- DOCUMENTS POLICIES
CREATE POLICY "Patients and Caretakers can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_patient_access((split_part(name, '/', 1))::uuid)
);

CREATE POLICY "Caretakers and Patients can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents'
    AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_patient_access((split_part(name, '/', 1))::uuid)
);

CREATE POLICY "Caretakers and Patients can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents'
    AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_patient_access((split_part(name, '/', 1))::uuid)
);
