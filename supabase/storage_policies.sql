-- Storage RLS policies - jalankan di Supabase Dashboard > SQL Editor
-- Bucket harus sudah dibuat: profile-photos, skill-logos, resumes (Public)

-- Enable RLS sudah otomatis untuk storage.objects

-- Hapus policy lama jika re-run
drop policy if exists "public read storage" on storage.objects;
drop policy if exists "service_role write storage" on storage.objects;
drop policy if exists "authenticated write storage" on storage.objects;

-- Public read untuk bucket portfolio (logo & foto bisa dilihat pengunjung)
create policy "public read storage"
on storage.objects for select
using (bucket_id in ('profile-photos','skill-logos','resumes'));

-- Write hanya service_role (dipakai /api/upload server) - anon tidak bisa upload langsung
create policy "service_role write storage"
on storage.objects for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Jika kamu butuh upload langsung dari client tanpa /api/upload (tidak disarankan), 
-- gunakan policy authenticated terbatas:
-- create policy "authenticated write storage" on storage.objects for insert
-- with check (auth.role() = 'authenticated' and bucket_id in ('skill-logos','profile-photos'));
