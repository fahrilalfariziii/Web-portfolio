import { supabase, isSupabaseConfigured } from './supabase';

function extOf(file) {
  const parts = (file?.name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'bin';
}

export async function uploadToBucket(bucket, file, prefix = '') {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase belum dikonfigurasi');
  if (!file) throw new Error('File kosong');
  // Validasi ringan agar file rusak tidak tersimpan lalu gagal tampil di landing.
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) throw new Error('Ukuran file maksimal 2MB');
  const allowed = /^(image\/|application\/pdf)/;
  if (file.type && !allowed.test(file.type) && !/\.(svg|png|jpe?g|webp|gif)$/i.test(file.name || '')) {
    throw new Error('Format file harus gambar (PNG/JPG/SVG/WebP) atau PDF');
  }
  const safePrefix = prefix ? `${prefix.replace(/\/$/, '')}/` : '';
  const path = `${safePrefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${extOf(file)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Gagal mendapatkan URL publik. Pastikan bucket bersifat public.');
  return data.publicUrl;
}

export const uploadProfilePhoto = (file) => uploadToBucket('profile-photos', file, 'profile');
export const uploadSkillLogo = (file) => uploadToBucket('skill-logos', file, 'skills');
export const uploadResume = (file) => uploadToBucket('resumes', file, 'resume');
