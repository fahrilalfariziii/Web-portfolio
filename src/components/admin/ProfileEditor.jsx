import React, { useEffect, useState } from 'react';
import { uploadProfilePhoto, uploadResume } from '../../lib/storage';
import { adminGetSingle, adminUpsertSingle } from '../../lib/apiClient';
import { isSafeUrl } from '../../utils/url';

const emptyProfile = {
  full_name: '',
  tagline: '',
  bio: '',
  photo_url: '',
  resume_url: '',
  credential_url: '',
  email: '',
  location: '',
  socials: { linkedin: '', instagram: '', github: '' },
};

const ProfileEditor = () => {
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('notice');

  useEffect(() => {
    (async () => {
      try {
        const data = await adminGetSingle('profile');
        if (data) setForm({ ...emptyProfile, ...data, socials: data.socials || emptyProfile.socials });
      } catch (e) {
        setMsg(`Gagal memuat: ${e.message}`);
        setMsgType('error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSocial = (k, v) => setForm((f) => ({ ...f, socials: { ...f.socials, [k]: v } }));

  const onFile = async (file, kind) => {
    if (!file) return;
    setSaving(true);
    setMsg('');
    try {
      const url = kind === 'photo' ? await uploadProfilePhoto(file) : await uploadResume(file);
      set(kind === 'photo' ? 'photo_url' : 'resume_url', url);
      setMsg('Upload berhasil, klik Simpan untuk menyimpan.');
      setMsgType('notice');
    } catch (e) {
      setMsg(`Upload gagal: ${e.message}`);
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    // Client-side URL validation
    const toCheck = [form.photo_url, form.resume_url, form.credential_url, form.socials.linkedin, form.socials.instagram, form.socials.github].filter(Boolean);
    for (const u of toCheck) {
      if (!isSafeUrl(u)) {
        setMsg(`URL tidak aman: ${u} — hanya https/http diperbolehkan`);
        setMsgType('error');
        return;
      }
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setMsg('Email tidak valid');
      setMsgType('error');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const payload = { ...form, updated_at: new Date().toISOString() };
      delete payload.id;
      await adminUpsertSingle('profile', payload);
      setMsg('Profile tersimpan.');
      setMsgType('notice');
    } catch (e2) {
      setMsg(`Gagal menyimpan: ${e2.message}`);
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-muted">Memuat profile...</p>;

  return (
    <form className="admin-form" onSubmit={onSave}>
      {msg && <p className={msgType === 'error' ? 'admin-error' : 'admin-notice'}>{msg}</p>}
      <div className="admin-grid2">
        <label>Nama lengkap<input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required maxLength={80} /></label>
        <label>Email<input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
      </div>
      <label>Tagline<input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="AI/ML Engineer | ..." maxLength={120} /></label>
      <label>Bio<textarea rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)} maxLength={1000} /></label>
      <div className="admin-grid2">
        <label>Lokasi<input value={form.location} onChange={(e) => set('location', e.target.value)} maxLength={80} /></label>
        <label>Credential URL<input type="url" value={form.credential_url} onChange={(e) => set('credential_url', e.target.value)} placeholder="https://..." /></label>
      </div>
      <div className="admin-grid3">
        <label>LinkedIn<input type="url" value={form.socials?.linkedin || ''} onChange={(e) => setSocial('linkedin', e.target.value)} placeholder="https://..." /></label>
        <label>Instagram<input type="url" value={form.socials?.instagram || ''} onChange={(e) => setSocial('instagram', e.target.value)} placeholder="https://..." /></label>
        <label>GitHub<input type="url" value={form.socials?.github || ''} onChange={(e) => setSocial('github', e.target.value)} placeholder="https://..." /></label>
      </div>
      <div className="admin-grid2">
        <label>Foto profile URL<input type="url" value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)} placeholder="https://... atau upload" /></label>
        <label>Resume URL (PDF)<input type="url" value={form.resume_url} onChange={(e) => set('resume_url', e.target.value)} placeholder="https://... atau upload" /></label>
      </div>
      <div className="admin-grid2">
        <label>Upload foto baru<input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0], 'photo')} /></label>
        <label>Upload resume (PDF)<input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0], 'resume')} /></label>
      </div>
      {form.photo_url && isSafeUrl(form.photo_url) && <img src={form.photo_url} alt="Preview" className="admin-preview" referrerPolicy="no-referrer" />}
      <button className="admin-btn primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Profile'}</button>
    </form>
  );
};

export default ProfileEditor;
