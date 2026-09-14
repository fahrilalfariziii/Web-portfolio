# CMS Portfolio + Supabase — Panduan Setup

CMS mengatur **keseluruhan landing page**: foto profile, tagline, bio, resume, education,
pengalaman (works & professional), skills, projects, contact, footer.

Stack: Vite SPA (Vercel) + Supabase (Postgres + Auth + Storage) + Vercel Functions `/api/*` (server-only keys, tidak ter-bundle ke frontend).

## 1. Buat project Supabase

1. Buka https://supabase.com > New project.
2. Catat `Project URL` dan `anon public key` + `service_role key` (Project Settings > API).

## 2. Jalankan schema SQL

1. Supabase Dashboard > SQL Editor > New query.
2. Paste isi `supabase/schema.sql` > Run, lalu `supabase/storage_policies.sql` > Run.
3. Pastikan 6 tabel terbentuk: `profile, education, experiences, skills, projects, site_settings`.

## 3. Buat Storage buckets

Storage > Create bucket (public ON):
- `profile-photos`
- `skill-logos`
- `resumes`

Policy sudah di-handle oleh `storage_policies.sql`: `SELECT` public, write hanya `service_role` via `/api/upload`.

## 4. Buat 1 akun admin

Authentication > Users > Add user > Create new user:
- Email + password (satu akun saja, harus ada di `ADMIN_EMAILS`).
- Auto Confirm User = ON.
- Login di `https://domain-kamu.vercel.app/admin/login`.

## 5. Seed data awal (opsional tapi disarankan)

Di lokal:

```bash
cp .env.example .env
# isi .env (server-only, tanpa VITE_):
# SUPABASE_URL=https://xyz.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=... (dari Project Settings > API, JANGAN commit / pasang sebagai VITE_)
# ADMIN_EMAILS=admin@kamu.com
npm install
npm run seed
```

Seed mengisi `education, experiences, skills, projects` dari data lama.
`profile` dan `site_settings` sudah terisi dari `schema.sql`.

## 6. Env untuk lokal & Vercel (TANPA VITE_ untuk Supabase)

`.env` lokal:

```
VITE_GA_ID=G-XXXXXXXXXX
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_EMAILS=admin@kamu.com
```

Vercel > Project > Settings > Environment Variables, tambah sebagai **Secret**:
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, `VITE_GA_ID` → lalu Redeploy.
JANGAN pakai `VITE_SUPABASE_*` karena Vercel tidak bisa set `VITE_` sebagai Secret (akan ter-bundle ke `dist`).

Tanpa env Supabase, landing tetap tampil memakai data fallback lokal
(`src/data/fallback.js`), tapi `fetch('/api/portfolio')` akan error dan admin tidak bisa login.

## 7. Pakai CMS

- Landing: `/`
- Login: `/admin/login`
- Dashboard: `/admin` — tab Profile, Education, Experience, Skills, Projects, Settings.
- Upload foto/logo/resume via `/api/upload` (validasi magic bytes + sanitasi SVG, max 2MB).
- Projects: `is_visible=false` menyembunyikan dari landing tanpa menghapus.
- `vercel.json` sudah rewrite semua route ke `index.html` + security headers (CSP, HSTS, X-Frame-Options).

## 8. Keamanan

- RLS: `SELECT` public, tulis hanya `service_role` via `/api/*` (`supabase/schema.sql`).
- `src/utils/url.js` `isSafeUrl()` hanya izinkan `https://`/`http://` untuk semua `href/src` (cegah `javascript:` XSS).
- Upload: SVG di-sanitasi, `ga.js` pakai `textContent` bukan `innerHTML`.
- Jangan pernah expose `SERVICE_ROLE_KEY` ke frontend / `VITE_*`.
- Bila butuh cabut akses admin: ubah `ADMIN_EMAILS` atau Authentication > Users > Delete / reset password.
