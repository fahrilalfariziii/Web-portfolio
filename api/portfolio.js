import { getSupabaseAnon, json } from './_supabase.js';

// Cache simple in-memory for 60s to reduce Supabase calls and prevent abuse
let cache = { data: null, expires: 0 };

function toProxyUrl(logoUrl, bucket) {
  if (!logoUrl) return '';
  // Already proxy or local asset -> keep
  if (logoUrl.startsWith('/api/') || logoUrl.startsWith('assets/') || logoUrl.startsWith('/assets/')) return logoUrl;
  // If not http, treat as path
  if (!logoUrl.startsWith('http')) {
    const p = logoUrl.replace(/^\/+/, '');
    // If already like "skills/xxx.svg" assume bucket skill-logos
    return `/api/file?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(p)}`;
  }
  try {
    const u = new URL(logoUrl);
    // Hide supabase domain - extract storage path
    const markerPublic = `/storage/v1/object/public/${bucket}/`;
    const markerPrivate = `/storage/v1/object/${bucket}/`;
    let idx = u.pathname.indexOf(markerPublic);
    if (idx !== -1) {
      const p = decodeURIComponent(u.pathname.slice(idx + markerPublic.length));
      return `/api/file?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(p)}`;
    }
    idx = u.pathname.indexOf(markerPrivate);
    if (idx !== -1) {
      const p = decodeURIComponent(u.pathname.slice(idx + markerPrivate.length));
      return `/api/file?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(p)}`;
    }
    // Not supabase storage URL -> block to avoid leaking, return empty
    if (u.hostname.includes('supabase.co')) return '';
    return logoUrl;
  } catch {
    return '';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const now = Date.now();
  if (cache.data && cache.expires > now) {
    return json(res, 200, cache.data);
  }

  try {
    const supabase = getSupabaseAnon();
    const [profileRes, eduRes, expRes, skillRes, projRes, settingsRes] = await Promise.all([
      supabase.from('profile').select('*').order('id').limit(1).maybeSingle(),
      supabase.from('education').select('*').order('sort_order'),
      supabase.from('experiences').select('*').order('sort_order'),
      supabase.from('skills').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('site_settings').select('*').order('id').limit(1).maybeSingle(),
    ]);

    const firstError = profileRes.error || eduRes.error || expRes.error || skillRes.error || projRes.error || settingsRes.error;
    if (firstError) throw firstError;

    // Hide Supabase project ref for resume & images
    let profile = profileRes.data || null;
    if (profile) {
      const rewritten = { ...profile };
      if (rewritten.resume_url) rewritten.resume_url = '/api/resume';
      if (rewritten.photo_url) {
        const proxied = toProxyUrl(rewritten.photo_url, 'profile-photos');
        // Keep original if not supabase (allow external https? we proxy only supabase storage)
        if (proxied) rewritten.photo_url = proxied;
        else if (rewritten.photo_url.includes('supabase.co')) rewritten.photo_url = '';
      }
      profile = rewritten;
    }

    let skills = skillRes.data || [];
    skills = skills.map(s => {
      if (!s.logo_url) return s;
      // Already proxy or local asset -> keep
      if (s.logo_url.startsWith('/api/') || s.logo_url.startsWith('assets/')) return s;
      const proxied = toProxyUrl(s.logo_url, 'skill-logos');
      // If supabase URL successfully proxied, use proxy; if external non-supabase, keep original but isSafeUrl will filter later
      // For hide purpose, if it's supabase URL we must proxy, otherwise keep
      if (proxied) return { ...s, logo_url: proxied };
      if (s.logo_url.includes('supabase.co')) return { ...s, logo_url: '' };
      return s;
    });

    const data = {
      profile,
      education: eduRes.data || [],
      experiences: expRes.data || [],
      skills,
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
