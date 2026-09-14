// Shim: Supabase keys are server-only via /api/* . Never bundle keys to frontend.
// This file intentionally does NOT read import.meta.env.VITE_SUPABASE_* to prevent leakage.

export const isSupabaseConfigured = false;
export const supabase = null;
