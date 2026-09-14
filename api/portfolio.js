import { getSupabaseAnon, json } from './_supabase.js';
import { createClient } from '@supabase/supabase-js';

// Cache simple in-memory for 60s to reduce Supabase calls and prevent abuse
let cache = { data: null, expires: 0 };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }

  // Security headers
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const now = Date.now();
  if (cache.data && cache.expires > now) {
    return json(res, 200, cache.data);
  }

  try {
    const supabase = getSupabaseAnon();
    // Try anon read first (RLS allows public read)
    const [profileRes, eduRes, expRes, skillRes, projRes, settingsRes] = await Promise.all([
      supabase.from('profile').select('*').order('id').limit(1).maybeSingle(),
      supabase.from('education').select('*').order('sort_order'),
      supabase.from('experiences').select('*').order('sort_order'),
      supabase.from('skills').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('site_settings').select('*').order('id').limit(1).maybeSingle(),
    ]);

    // Collect errors but fallback to empty so page still renders
    const firstError = profileRes.error || eduRes.error || expRes.error || skillRes.error || projRes.error || settingsRes.error;
    if (firstError) throw firstError;

    const data = {
      profile: profileRes.data || null,
      education: eduRes.data || [],
      experiences: expRes.data || [],
      skills: skillRes.data || [],
      projects: projRes.data || [],
      siteSettings: settingsRes.data || null,
    };

    cache = { data, expires: now + 60_000 };
    return json(res, 200, data);
  } catch (e) {
    console.error('[api/portfolio] error', e.message);
    return json(res, 500, { error: e.message || 'Failed to fetch portfolio' });
  }
}
