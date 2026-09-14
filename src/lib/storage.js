import { supabase, isSupabaseConfigured } from './supabase';

function extOf(file) {
  const parts = (file?.name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'bin';
}

export async function uploadToBucket(bucket, file, prefix = '') {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase belum dikonfigurasi');
  if (!file) throw new Error('File kosong');
  const safePrefix = prefix ? `${prefix.replace(/\/$/, '')}/` : '';
  const path = `${safePrefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${extOf(file)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadProfilePhoto = (file) => uploadToBucket('profile-photos', file, 'profile');
export const uploadSkillLogo = (file) => uploadToBucket('skill-logos', file, 'skills');
export const uploadResume = (file) => uploadToBucket('resumes', file, 'resume');
