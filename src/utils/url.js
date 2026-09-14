// Safe URL validation to prevent javascript: and data: XSS
export function isSafeUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
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
