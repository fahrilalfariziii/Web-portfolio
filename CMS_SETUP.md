# CMS Portfolio + Supabase — Panduan Setup

CMS mengatur **keseluruhan landing page**: foto profile, tagline, bio, resume, education,
pengalaman (works & professional), skills, projects, contact, footer.

Stack: Vite SPA (Vercel) + Supabase (Postgres + Auth + Storage). Tidak ada server tambahan,
jadi aman untuk Vercel.

## 1. Buat project Supabase

1. Buka https://supabase.com > New project.
2. Catat `Project URL` dan `anon public key` (Project Settings > API).

## 2. Jalankan schema SQL

1. Supabase Dashboard > SQL Editor > New query.
2. Paste isi `supabase/schema.sql` > Run.
3. Pastikan 6 tabel terbentuk: `profile, education, experiences, skills, projects, site_settings`.

## 3. Buat Storage buckets

Storage > Create bucket (public ON):
- `profile-photos`
- `skill-logos`
- `resumes`

Lalu tiap bucket > Policies: `SELECT` untuk public, `INSERT/UPDATE/DELETE` untuk authenticated.
(Cepatnya: Storage > Policies > New policy from template.)

## 4. Buat 1 akun admin

Authentication > Users > Add user > Create new user:
- Email + password (satu akun saja).
- Auto Confirm User = ON.
- Login di `https://domain-kamu.vercel.app/admin/login`.

## 5. Seed data awal (opsional tapi disarankan)

Di lokal:

```bash
cp .env.example .env
# isi .env:
# VITE_SUPABASE_URL=https://xyz.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=... (dari Project Settings > API, JANGAN commit / pasang di Vercel)
npm install
npm run seed
```

Seed mengisi `education, experiences, skills, projects` dari data lama.
`profile` dan `site_settings` sudah terisi dari `schema.sql`.

## 6. Env untuk lokal & Vercel

`.env` lokal:

```
VITE_GA_ID=
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Vercel > Project > Settings > Environment Variables, tambah 3 var yang sama
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GA_ID`), lalu Redeploy.

Tanpa env Supabase, landing tetap tampil memakai data fallback lokal
(`src/data/fallback.js`), tapi CMS login akan menampilkan peringatan konfigurasi.

## 7. Pakai CMS

- Landing: `/`
- Login: `/admin/login`
- Dashboard: `/admin` — tab Profile, Education, Experience, Skills, Projects, Settings.
- Upload foto/logo/resume otomatis masuk ke Storage dan mengisi URL.
- Projects: `is_visible=false` menyembunyikan dari landing tanpa menghapus.
- `vercel.json` sudah rewrite semua route ke `index.html`, jadi `/admin` aman di-refresh.

## 8. Keamanan

- RLS: `SELECT` public, tulis hanya `authenticated` (lihat `schema.sql`).
- Jangan pernah expose `SERVICE_ROLE_KEY` ke frontend / Vercel env `VITE_*`.
- Bila butuh cabut akses admin: Authentication > Users > Delete / reset password.
