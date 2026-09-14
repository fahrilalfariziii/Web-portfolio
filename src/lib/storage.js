// Storage via server /api/upload so anon key never leaves server
import { uploadFile as apiUpload } from './apiClient';

function extOf(file) {
  const parts = (file?.name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'bin';
}

// Client-side pre-validation before sending to server
function preValidate(file) {
  if (!file) throw new Error('File kosong');
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) throw new Error('Ukuran file maksimal 2MB');
  const allowed = /^(image\/|application\/pdf)/;
  if (file.type && !allowed.test(file.type) && !/\.(svg|png|jpe?g|webp|gif)$/i.test(file.name || '')) {
    throw new Error('Format file harus gambar (PNG/JPG/SVG/WebP) atau PDF');
  }
}

export async function uploadToBucket(bucket, file) {
  preValidate(file);
  // Server does deeper validation (magic bytes, SVG sanitization)
  return apiUpload(bucket, file);
}

export const uploadProfilePhoto = (file) => uploadToBucket('profile-photos', file);
export const uploadSkillLogo = (file) => uploadToBucket('skill-logos', file);
export const uploadResume = (file) => uploadToBucket('resumes', file);
