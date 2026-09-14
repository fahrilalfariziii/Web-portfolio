import { getSupabaseService } from './_supabase.js';

const ALLOWED_BUCKETS = ['skill-logos', 'profile-photos'];

function contentTypeForPath(path) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map = {
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'avif': 'image/avif',
  };
  return map[ext] || 'application/octet-stream';
}

function sanitizePath(p) {
  if (!p) return null;
  // Prevent directory traversal
  if (p.includes('..') || p.includes('\\')) return null;
  // Remove leading slashes and bucket prefix duplication
  let s = p.replace(/^\/+/, '');
  // Basic length check
  if (s.length > 500) return null;
  return s;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const bucket = url.searchParams.get('bucket');
    let rawPath = url.searchParams.get('path');

    // Support legacy ?file= or ?url= with full supabase URL
    if (!rawPath) {
      const maybeUrl = url.searchParams.get('file') || url.searchParams.get('url');
      if (maybeUrl && maybeUrl.startsWith('http')) {
        try {
          const u = new URL(maybeUrl);
          // Try extract after /storage/v1/object/public/<bucket>/
          const marker = `/storage/v1/object/public/${bucket}/`;
          const idx = u.pathname.indexOf(marker);
          if (idx !== -1) rawPath = decodeURIComponent(u.pathname.slice(idx + marker.length));
          else {
            const marker2 = `/storage/v1/object/${bucket}/`;
            const idx2 = u.pathname.indexOf(marker2);
            if (idx2 !== -1) rawPath = decodeURIComponent(u.pathname.slice(idx2 + marker2.length));
          }
        } catch {}
      }
    }

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Bucket tidak diizinkan' }));
      return;
    }

    const path = sanitizePath(rawPath);
    if (!path) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Path tidak valid' }));
      return;
    }

    const supabase = getSupabaseService();

    // Try download via service_role (works even if bucket private)
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) {
      console.error('[api/file] download error', bucket, path, error.message);
      // Fallback to signed URL redirect (for public buckets as fallback)
      const { data: signed, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
      if (!signErr && signed?.signedUrl) {
        res.statusCode = 302;
        res.setHeader('Location', signed.signedUrl);
        res.end();
        return;
      }
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'File tidak ditemukan' }));
      return;
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const ct = contentTypeForPath(path);

    // SVG sanitization already done on upload, but double-check for javascript:
    if (ct === 'image/svg+xml' && buffer.toString('utf-8').toLowerCase().includes('javascript:')) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'SVG tidak aman' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', ct);
    // Cache aggressively on CDN
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
    res.setHeader('Content-Length', buffer.length.toString());
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(buffer);
  } catch (e) {
    console.error('[api/file] error', e.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}
