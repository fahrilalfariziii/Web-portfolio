import { getSupabaseService } from './_supabase.js';

function extractResumePath(urlOrPath) {
  if (!urlOrPath) return null;
  // If already a path like "resume/123.pdf" or "resumes/resume/123.pdf"
  if (!urlOrPath.startsWith('http')) {
    // Normalize: remove leading slash and bucket prefix duplication
    let p = urlOrPath.replace(/^\/+/, '');
    // If starts with "api/resume", ignore
    if (p.startsWith('api/')) return null;
    // If starts with bucket name, strip it
    if (p.startsWith('resumes/')) p = p.slice('resumes/'.length);
    return p;
  }
  try {
    const u = new URL(urlOrPath);
    // Supabase public URL: /storage/v1/object/public/resumes/<path>  or /storage/v1/object/resumes/<path>
    const markerPublic = '/storage/v1/object/public/resumes/';
    const markerPrivate = '/storage/v1/object/resumes/';
    const markerAlt = '/storage/v1/object/sign/resumes/';
    let idx = u.pathname.indexOf(markerPublic);
    if (idx !== -1) return decodeURIComponent(u.pathname.slice(idx + markerPublic.length));
    idx = u.pathname.indexOf(markerPrivate);
    if (idx !== -1) return decodeURIComponent(u.pathname.slice(idx + markerPrivate.length));
    idx = u.pathname.indexOf(markerAlt);
    if (idx !== -1) return decodeURIComponent(u.pathname.slice(idx + markerAlt.length));
    // Fallback: try last segment after resumes/
    const parts = u.pathname.split('/resumes/');
    if (parts.length > 1) return decodeURIComponent(parts[1]);
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  // Allow embedding only same-origin
  res.setHeader('X-Frame-Options', 'DENY');

  try {
    const supabase = getSupabaseService();

    // Fetch profile resume_url/path - try service role to get raw value even if RLS hides it later
    const { data: profile, error } = await supabase.from('profile').select('resume_url').limit(1).maybeSingle();
    if (error) throw error;
    if (!profile || !profile.resume_url) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Resume belum tersedia' }));
      return;
    }

    const raw = profile.resume_url;
    const storagePath = extractResumePath(raw);

    if (!storagePath) {
      // If custom link stored (e.g., /api/resume), we can't extract - return redirect to stored URL if it's safe supabase URL?
      // Fallback: try to treat raw as direct supabase public URL and redirect with 302 via proxy download attempt
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Format resume tidak valid' }));
      return;
    }

    // Download via service_role (works even if bucket private)
    const { data: fileData, error: dlError } = await supabase.storage.from('resumes').download(storagePath);
    if (dlError) {
      console.error('[api/resume] download error', dlError.message, storagePath);
      // Try signed URL fallback
      const { data: signed, error: signErr } = await supabase.storage.from('resumes').createSignedUrl(storagePath, 60);
      if (!signErr && signed?.signedUrl) {
        res.statusCode = 302;
        res.setHeader('Location', signed.signedUrl);
        res.end();
        return;
      }
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Gagal mengambil resume' }));
      return;
    }

    // fileData is Blob
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const filename = `Resume-Fahril-Sidik-Alfarizi.pdf`;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Length', buffer.length.toString());
    // Cache for 1 hour on CDN, must-revalidate
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(buffer);
  } catch (e) {
    console.error('[api/resume] error', e.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}
