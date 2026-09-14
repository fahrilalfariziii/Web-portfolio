import { createClient } from '@supabase/supabase-js';

// Server-only env: never expose to client. Hanya SUPABASE_* (Secret di Vercel), bukan VITE_*.
const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAnon() {
  if (!url || !anonKey) throw new Error('Missing SUPABASE_URL / SUPABASE_ANON_KEY server env');
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

export function getSupabaseService() {
  if (url && serviceKey) return createClient(url, serviceKey, { auth: { persistSession: false } });
  // Fallback dev tanpa service key: pakai anon + RLS lama (butuh policy allow authenticated)
  // Warning: di produksi HARUS set SUPABASE_SERVICE_ROLE_KEY dan jalankan schema.sql harden
  if (!url || !anonKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY dan ANON_KEY server env');
  console.warn('[api] SUPABASE_SERVICE_ROLE_KEY tidak diset, fallback ke anon key (dev only, tidak aman untuk prod)');
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

export function getSupabaseForUser(token) {
  if (!url || !anonKey) throw new Error('Missing SUPABASE_URL / SUPABASE_ANON_KEY');
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export function getSupabaseUrl() {
  if (!url) throw new Error('Missing SUPABASE_URL server env');
  return url;
}

// Verify JWT and ensure is admin
export async function verifyAdmin(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    const err = new Error('Unauthorized: missing Bearer token');
    err.status = 401;
    throw err;
  }
  const token = auth.slice(7);
  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    const e = new Error('Unauthorized: invalid token');
    e.status = 401;
    throw e;
  }
  const email = data.user.email || '';
  // Allowlist: ADMIN_EMAILS=comma sep or ADMIN_EMAIL single
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
  const allow = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  // If no allowlist configured, allow any authenticated user but log warning (tighten later)
  if (allow.length > 0 && !allow.includes(email.toLowerCase())) {
    const e = new Error('Forbidden: email not authorized as admin');
    e.status = 403;
    throw e;
  }
  return data.user;
}

// Helper to send JSON
export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
