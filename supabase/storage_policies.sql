-- Storage RLS policies - jalankan di Supabase Dashboard > SQL Editor
-- Bucket: profile-photos (public), skill-logos (public), resumes (PRIVATE via proxy)

-- Hapus policy lama jika re-run
drop policy if exists "public read storage" on storage.objects;
drop policy if exists "public read resumes" on storage.objects;
drop policy if exists "service_role write storage" on storage.objects;
drop policy if exists "authenticated write storage" on storage.objects;

-- Public read hanya untuk foto & logo (resume TIDAK public agar tidak bocor project ref)
create policy "public read storage"
on storage.objects for select
using (bucket_id in ('profile-photos','skill-logos'));

-- Resumes: tidak ada public read — hanya service_role via /api/resume proxy
-- Jika butuh, bisa tambah policy signed URL, tapi tetap private

-- Write hanya service_role (dipakai /api/upload server) - anon tidak bisa upload langsung
create policy "service_role write storage"
on storage.objects for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
