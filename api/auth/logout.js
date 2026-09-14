import { json } from '../_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }
  // Clear refresh cookie
  res.setHeader('Set-Cookie', 'sb-refresh-token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  return json(res, 200, { ok: true });
}
