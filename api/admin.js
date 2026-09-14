import { getSupabaseService, verifyAdmin, json } from './_supabase.js';

// Allowed tables and their column allowlists for write
const TABLE_CONFIG = {
  profile: { allowed: ['full_name','tagline','bio','photo_url','resume_url','credential_url','socials','email','location','updated_at'], singleRow: true },
  education: { allowed: ['school','major','start_year','end_year','sort_order'] },
  experiences: { allowed: ['type','title','company','date_text','bullets','link_url','sort_order'] },
  skills: { allowed: ['name','logo_url','level','sort_order'] },
  projects: { allowed: ['title','description','technologies','category','year_text','web_url','repo_url','sort_order','is_visible'] },
  site_settings: { alias: 'site_settings', allowed: ['formspree_id','footer_text'], singleRow: true },
  siteSettings: { alias: 'site_settings', allowed: ['formspree_id','footer_text'], singleRow: true },
};

function sanitizePayload(table, payload) {
  const cfg = TABLE_CONFIG[table];
  if (!cfg) throw new Error('Table not allowed');
  const out = {};
  for (const k of cfg.allowed) {
    if (k in payload) out[k] = payload[k];
  }
  return out;
}

function isSafeUrl(url) {
  if (!url) return true; // empty allowed
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' || u.protocol === 'mailto:';
  } catch { return false; }
}

function validatePayload(table, payload) {
  // URL fields must be safe
  const urlFields = ['photo_url','logo_url','resume_url','credential_url','link_url','web_url','repo_url'];
  for (const f of urlFields) {
    if (payload[f] && !isSafeUrl(payload[f])) {
      const e = new Error(`URL tidak aman untuk ${f}: hanya https/http diperbolehkan`);
      e.status = 400;
      throw e;
    }
  }
  if (table === 'skills') {
    if (payload.name && (payload.name.length < 1 || payload.name.length > 80)) { const e=new Error('Nama skill 1-80 karakter'); e.status=400; throw e; }
    if (payload.level !== undefined && (payload.level < 0 || payload.level > 100)) { const e=new Error('Level 0-100'); e.status=400; throw e; }
  }
  if (table === 'profile') {
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) { const e=new Error('Email profile tidak valid'); e.status=400; throw e; }
    if (payload.socials && typeof payload.socials === 'object') {
      for (const v of Object.values(payload.socials)) {
        if (v && !isSafeUrl(v)) { const e=new Error('Social URL harus https/http'); e.status=400; throw e; }
      }
    }
  }
  if (table === 'projects') {
    if (payload.category && !['ML','Web','CV','NLP','n8n'].includes(payload.category)) { const e=new Error('Kategori tidak valid'); e.status=400; throw e; }
  }
  if (table === 'experiences') {
    if (payload.type && !['works','professional'].includes(payload.type)) { const e=new Error('Tipe experience tidak valid'); e.status=400; throw e; }
  }
}

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Only allow JSON
  res.setHeader('Content-Type', 'application/json');

  // Parse URL: /api/admin?table=skills or /api/admin/skills
  const url = new URL(req.url, `http://${req.headers.host}`);
  const tableParam = url.searchParams.get('table') || url.pathname.split('/').pop();
  const tableKey = tableParam?.toLowerCase();
  const cfg = TABLE_CONFIG[tableKey];
  if (!cfg) return json(res, 400, { error: 'Table tidak dikenal. Allowed: profile, education, experiences, skills, projects, site_settings' });
  const table = cfg.alias || tableKey;

  // Auth required for all methods (GET still requires admin for admin.js; public reads via /api/portfolio)
  try {
    await verifyAdmin(req);
  } catch (e) {
    return json(res, e.status || 401, { error: e.message });
  }

  const supabase = getSupabaseService();

  try {
    if (req.method === 'GET') {
      // Single-row tables (profile, site_settings) tidak punya sort_order
      if (cfg.singleRow) {
        const { data: single, error: e2 } = await supabase.from(table).select('*').limit(1).maybeSingle();
        if (e2) throw e2;
        return json(res, 200, { data: single });
      }
      // For admin lists, support limit
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 200);
      const { data, error } = await supabase.from(table).select('*').order('sort_order', { ascending: true }).limit(limit);
      if (error) throw error;
      return json(res, 200, { data });
    }

    // For POST/PUT/PATCH/DELETE parse body
    let bodyStr = '';
    if (['POST','PUT','PATCH','DELETE'].includes(req.method)) {
      bodyStr = await new Promise((resolve, reject) => {
        let d = '';
        req.on('data', c => { d += c; if (d.length > 1e6) reject(new Error('Payload too large')); });
        req.on('end', () => resolve(d));
        req.on('error', reject);
      });
    }
    let body = {};
    if (bodyStr) {
      try { body = JSON.parse(bodyStr); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
    }

    if (req.method === 'POST') {
      const payload = sanitizePayload(tableKey, body);
      validatePayload(tableKey, payload);
      const { data, error } = await supabase.from(table).insert(payload).select().maybeSingle();
      if (error) throw error;
      return json(res, 201, { data });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const payload = sanitizePayload(tableKey, body);
      delete payload.id;
      validatePayload(tableKey, payload);
      // Special handling for single-row tables (profile/site_settings) - upsert tanpa butuh id
      if (cfg.singleRow) {
        if (table === 'profile') payload.updated_at = new Date().toISOString();
        const { data: existing } = await supabase.from(table).select('id').limit(1).maybeSingle();
        let result;
        if (existing?.id) {
          result = await supabase.from(table).update(payload).eq('id', existing.id).select().maybeSingle();
        } else {
          result = await supabase.from(table).insert({ ...payload, id: 1 }).select().maybeSingle();
        }
        if (result.error) throw result.error;
        return json(res, 200, { data: result.data });
      }
      const id = url.searchParams.get('id') || body.id;
      if (!id) return json(res, 400, { error: 'Missing id' });
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return json(res, 200, { data });
    }

    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id') || body.id;
      if (!id) return json(res, 400, { error: 'Missing id' });
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return json(res, 200, { ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE');
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    console.error(`[api/admin:${table}]`, e.message);
    const status = e.status || 500;
    // In production hide 500 details, but include hint for sort_order bug
    const isDev = process.env.NODE_ENV !== 'production';
    const msg = status >= 500 && !isDev ? 'Internal error' : (e.message || 'Internal error');
    return json(res, status, { error: msg });
  }
}
