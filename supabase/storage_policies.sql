-- Storage RLS policies - jalankan di Supabase Dashboard > SQL Editor
-- Semua bucket via proxy agar tidak bocor supabase.co / project ref

-- Hapus policy lama jika re-run
drop policy if exists "public read storage" on storage.objects;
drop policy if exists "public read resumes" on storage.objects;
drop policy if exists "service_role read storage" on storage.objects;
drop policy if exists "service_role write storage" on storage.objects;
drop policy if exists "authenticated write storage" on storage.objects;

-- TIDAK ada public read untuk bucket apapun agar link supabase.co tidak bisa ditebak
-- Semua baca via service_role proxy /api/file & /api/resume
create policy "service_role read storage"
on storage.objects for select
using (auth.role() = 'service_role');

-- Write hanya service_role (dipakai /api/upload server) - anon tidak bisa upload langsung
create policy "service_role write storage"
on storage.objects for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
