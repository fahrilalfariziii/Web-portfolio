import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client = null;
if (isSupabaseConfigured) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else if (import.meta.env.DEV) {
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diset. Pakai data lokal fallback.');
}

export const supabase = client;
