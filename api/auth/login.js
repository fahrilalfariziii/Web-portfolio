import { getSupabaseAnon, json } from '../_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  // Basic rate-limit-ish: require JSON and limit body size implicitly via Vercel
  let body = '';
  try {
    body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; if (data.length > 1e6) reject(new Error('Payload too large')); });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  } catch (e) {
    return json(res, 413, { error: e.message });
  }

  let parsed = {};
  try { parsed = body ? JSON.parse(body) : {}; } catch { return json(res, 400, { error: 'Invalid JSON' }); }

  const email = (parsed.email || '').trim().toLowerCase();
  const password = parsed.password || '';

  if (!email || !password) return json(res, 400, { error: 'Email dan password wajib' });
  // Very basic email format check to prevent injection
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Format email tidak valid' });
  if (password.length < 6 || password.length > 128) return json(res, 400, { error: 'Password harus 6-128 karakter' });

  try {
    const supabase = getSupabaseAnon();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Do not leak whether email exists
      return json(res, 401, { error: 'Email atau password salah' });
    }

    // Enforce admin allowlist if configured
    const allowRaw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
    const allow = allowRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (allow.length > 0 && !allow.includes((data.user.email || '').toLowerCase())) {
      return json(res, 403, { error: 'Akun ini bukan admin' });
    }

    // Return tokens - stored in memory/httpOnly cookie alternative could be set here
    // We set httpOnly cookie for refresh_token to reduce XSS theft, but also return for SPA compatibility
    const access_token = data.session?.access_token;
    const refresh_token = data.session?.refresh_token;

    // Set secure httpOnly cookie for refresh_token if possible (Vercel supports)
    if (refresh_token) {
      res.setHeader('Set-Cookie', `sb-refresh-token=${refresh_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60*60*24*7}`);
    }

    return json(res, 200, {
      access_token,
      refresh_token,
      user: { id: data.user.id, email: data.user.email, role: data.user.role },
      expires_in: data.session?.expires_in || 3600,
    });
  } catch (e) {
    console.error('[api/auth/login] error', e.message);
    return json(res, 500, { error: 'Login gagal' });
  }
}
