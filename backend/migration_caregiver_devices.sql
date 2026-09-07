-- ==============================================================================
-- MIGRATION: CAREGIVER DEVICES TABLE (Web Push Notification Subscriptions)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.caregiver_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caretaker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_caretaker_endpoint UNIQUE (caretaker_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_caregiver_devices_caretaker ON public.caregiver_devices(caretaker_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_devices_active ON public.caregiver_devices(is_active);

ALTER TABLE public.caregiver_devices ENABLE ROW LEVEL SECURITY;

-- Caregivers can view and manage their own push subscriptions
DROP POLICY IF EXISTS "Caregiver Devices Select Policy" ON public.caregiver_devices;
CREATE POLICY "Caregiver Devices Select Policy"
    ON public.caregiver_devices FOR SELECT
    USING (auth.uid() = caretaker_id);

DROP POLICY IF EXISTS "Caregiver Devices Insert Policy" ON public.caregiver_devices;
CREATE POLICY "Caregiver Devices Insert Policy"
    ON public.caregiver_devices FOR INSERT
    WITH CHECK (auth.uid() = caretaker_id);

DROP POLICY IF EXISTS "Caregiver Devices Update Policy" ON public.caregiver_devices;
CREATE POLICY "Caregiver Devices Update Policy"
    ON public.caregiver_devices FOR UPDATE
    USING (auth.uid() = caretaker_id);

DROP POLICY IF EXISTS "Caregiver Devices Delete Policy" ON public.caregiver_devices;
CREATE POLICY "Caregiver Devices Delete Policy"
    ON public.caregiver_devices FOR DELETE
    USING (auth.uid() = caretaker_id);
