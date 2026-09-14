import { getSupabaseService, verifyAdmin, json } from './_supabase.js';

// Vercel body parsing for multipart is not automatic - we parse via busboy-like logic manually
// Keep simple: expect base64 JSON payload { bucket, filename, contentType, data (base64) } from frontend fetch

export const config = {
  api: {
    bodyParser: false,
  },
};

function extOf(name) {
  const parts = (name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'bin';
}

function isAllowedBucket(b) {
  return ['profile-photos','skill-logos','resumes'].includes(b);
}

function sanitizeSvg(content) {
  // Very basic SVG sanitization: strip script, event handlers
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\bon\w+\s*=/gi, 'data-blocked=');
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);
  } catch (e) {
    return json(res, e.status || 401, { error: e.message });
  }

  // Collect body
  let raw = '';
  try {
    raw = await new Promise((resolve, reject) => {
      let d = '';
      req.on('data', c => { d += c; if (d.length > 5 * 1024 * 1024) reject(new Error('Payload too large (max 5MB)')); });
      req.on('end', () => resolve(d));
      req.on('error', reject);
    });
  } catch (e) {
    return json(res, 413, { error: e.message });
  }

  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { return json(res, 400, { error: 'Invalid JSON, expect {bucket, filename, contentType, data: base64}' }); }

  const bucket = body.bucket;
  const filename = body.filename || 'file';
  const contentType = body.contentType || 'application/octet-stream';
  const b64 = body.data;

  if (!isAllowedBucket(bucket)) return json(res, 400, { error: 'Bucket tidak diizinkan' });
  if (!b64) return json(res, 400, { error: 'Missing data (base64)' });

  // Decode base64
  let buffer;
  try { buffer = Buffer.from(b64, 'base64'); } catch { return json(res, 400, { error: 'Invalid base64' }); }

  // Size check 2MB
  if (buffer.length > 2 * 1024 * 1024) return json(res, 400, { error: 'Ukuran file maksimal 2MB' });

  // MIME allowlist
  const allowedMimes = ['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml','application/pdf'];
  // For svg, contentType may be image/svg+xml or text/xml - normalize
  const normalizedType = contentType.toLowerCase();
  const isSvg = normalizedType.includes('svg') || /\.svg$/i.test(filename);
  const isImage = normalizedType.startsWith('image/');
  const isPdf = normalizedType === 'application/pdf';

  // Bucket-specific rules
  if (bucket === 'resumes' && !isPdf) return json(res, 400, { error: 'Resume harus PDF' });
  if (bucket === 'skill-logos' && !(isImage || isSvg)) return json(res, 400, { error: 'Logo harus gambar' });
  if (bucket === 'profile-photos' && !(isImage || isSvg)) return json(res, 400, { error: 'Foto harus gambar' });

  // SVG sanitization - if svg, treat as text and sanitize
  if (isSvg) {
    const text = buffer.toString('utf-8');
    if (/<script/i.test(text) || /onload\s*=/i.test(text)) {
      // Sanitize but still reject if script remains after sanitization
      const sanitized = sanitizeSvg(text);
      if (/<script/i.test(sanitized)) return json(res, 400, { error: 'SVG mengandung script terlarang' });
      buffer = Buffer.from(sanitized, 'utf-8');
    }
    // Enforce svg mime
    // Do not allow svg with embedded javascript: href
    if (/javascript:/i.test(text)) return json(res, 400, { error: 'SVG mengandung javascript:' });
  }

  // Magic bytes check for non-svg images (PNG, JPG, GIF, WEBP, PDF)
  if (!isSvg) {
    const header = buffer.slice(0, 8);
    const isPng = header[0] === 0x89 && header[1] === 0x50;
    const isJpg = header[0] === 0xFF && header[1] === 0xD8;
    const isGif = header[0] === 0x47 && header[1] === 0x49;
    const isWebp = buffer.slice(8,12).toString() === 'WEBP';
    const isPdfHeader = buffer.slice(0,4).toString() === '%PDF';
    if (!(isPng || isJpg || isGif || isWebp || isPdfHeader)) {
      // For strictness, if bucket is skill-logos/profile and not svg, require magic
      if (bucket !== 'resumes') {
        // Allow but warn? We reject to prevent polyglot
        return json(res, 400, { error: 'File bukan gambar valid (magic bytes mismatch)' });
      }
    }
  }

  const ext = extOf(filename);
  // Prevent extension spoofing
  const safeExtMap = { 'png':'png','jpg':'jpg','jpeg':'jpg','webp':'webp','gif':'gif','svg':'svg','pdf':'pdf' };
  const safeExt = safeExtMap[ext] || 'bin';
  const prefix = bucket === 'skill-logos' ? 'skills' : bucket === 'profile-photos' ? 'profile' : 'resume';
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

  try {
    const supabase = getSupabaseService();
    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: isSvg ? 'image/svg+xml' : normalizedType,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('Gagal mendapatkan URL publik');
    return json(res, 200, { url: data.publicUrl, path });
  } catch (e) {
    console.error('[api/upload]', e.message);
    return json(res, 500, { error: e.message || 'Upload gagal' });
  }
}
