-- ==============================================================================
-- MIGRATION: ENABLE SUPABASE REALTIME REPLICATION FOR SOS_ALERTS
-- ==============================================================================

-- 1. Ensure REPLICA IDENTITY is set to FULL so Realtime receives complete row data for RLS evaluation
ALTER TABLE public.sos_alerts REPLICA IDENTITY FULL;

-- 2. Add sos_alerts to supabase_realtime publication if not already included
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'sos_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
  END IF;
END $$;
