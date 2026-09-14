// Frontend API client - never embeds Supabase keys.
// All data goes through /api/* server routes which hold keys server-side.

function getToken() {
  try { return localStorage.getItem('admin_token') || ''; } catch { return ''; }
}

function setToken(t) {
  try {
    if (t) localStorage.setItem('admin_token', t);
    else localStorage.removeItem('admin_token');
  } catch {}
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login gagal');
  if (data.access_token) setToken(data.access_token);
  if (data.refresh_token) {
    try { localStorage.setItem('refresh_token', data.refresh_token); } catch {}
  }
  return data;
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', headers: authHeaders() });
  } catch {}
  setToken('');
  try { localStorage.removeItem('refresh_token'); } catch {}
}

export function getStoredUser() {
  // Token is JWT; decode payload without verification (server verifies)
  const t = getToken();
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1]));
    return { email: payload.email || '', id: payload.sub || '', exp: payload.exp };
  } catch { return null; }
}

// Portfolio public read - no auth needed
export async function fetchPortfolio() {
  const res = await fetch('/api/portfolio', { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Gagal memuat portfolio');
  return res.json();
}

// Admin CRUD via /api/admin?table=xxx
export async function adminList(table) {
  const res = await fetch(`/api/admin?table=${encodeURIComponent(table)}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal memuat data');
  // Normalize single-row vs array
  if (data.data && !Array.isArray(data.data) && typeof data.data === 'object' && !data.data.length) {
    return data.data ? [data.data] : [];
  }
  return data.data || [];
}

export async function adminGetSingle(table) {
  const res = await fetch(`/api/admin?table=${encodeURIComponent(table)}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal memuat');
  return data.data || null;
}

export async function adminCreate(table, payload) {
  const res = await fetch(`/api/admin?table=${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
  return data.data;
}

export async function adminUpdate(table, id, payload) {
  const res = await fetch(`/api/admin?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal update');
  return data.data;
}

export async function adminDelete(table, id) {
  const res = await fetch(`/api/admin?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal hapus');
  return data;
}

// For single-row tables (profile/site_settings) use PUT without id
export async function adminUpsertSingle(table, payload) {
  const res = await fetch(`/api/admin?table=${encodeURIComponent(table)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
  return data.data;
}

// Upload via /api/upload - expects base64
export async function uploadFile(bucket, file) {
  const b64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === 'string' ? result.split(',')[1] : '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      bucket,
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      data: b64,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload gagal');
  return data.url;
}

export function isAuthenticated() {
  return !!getToken();
}
