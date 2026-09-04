import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Smriti] Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing or incomplete. Using offline/local storage mode.'
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

// TEMPORARY DEBUG
if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
}