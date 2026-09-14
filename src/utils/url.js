// Safe URL validation to prevent javascript: and data: XSS
export function isSafeUrl(url) {
  if (!url) return false;
  // Allow internal proxy paths and local assets (hide supabase domain)
  if (url.startsWith('/api/file') || url.startsWith('/api/resume') || url.startsWith('assets/') || url.startsWith('/assets/')) return true;
  try {
    // Handle relative URLs with base
    const u = new URL(url, 'https://example.com');
    // If original was relative without protocol, URL will be https://example.com/... -> check original started with http
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch { return false; }
}

export function isSafeUrlOrEmpty(url) {
  if (!url) return true;
  return isSafeUrl(url);
}

export function sanitizeUrl(url) {
  if (!url) return '';
  return isSafeUrl(url) ? url : '';
}

// For images/logos that may be proxied, allow proxy + https
export function isSafeImageUrl(url) {
  if (!url) return false;
  if (url.startsWith('/api/file') || url.startsWith('/api/resume')) return true;
  return isSafeUrl(url);
}
