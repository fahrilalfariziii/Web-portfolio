import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadProfilePhoto, uploadResume } from '../../lib/storage';

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

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('profile').select('*').limit(1).maybeSingle();
      if (!error && data) {
        setForm({ ...emptyProfile, ...data, socials: data.socials || emptyProfile.socials });
      }
      setLoading(false);
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
    } catch (e) {
      setMsg(`Upload gagal: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload = { ...form, updated_at: new Date().toISOString() };
      delete payload.id;
      const { data: existing } = await supabase.from('profile').select('id').limit(1).maybeSingle();
      let error;
      if (existing?.id) {
        ({ error } = await supabase.from('profile').update(payload).eq('id', existing.id));
      } else {
        ({ error } = await supabase.from('profile').insert({ ...payload, id: 1 }));
      }
      if (error) throw error;
      setMsg('Profile tersimpan.');
    } catch (e2) {
      setMsg(`Gagal menyimpan: ${e2.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-muted">Memuat profile...</p>;

  return (
    <form className="admin-form" onSubmit={onSave}>
      {msg && <p className="admin-notice">{msg}</p>}
      <div className="admin-grid2">
        <label>Nama lengkap<input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required /></label>
        <label>Email<input value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
      </div>
      <label>Tagline<input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="AI/ML Engineer | ..." /></label>
      <label>Bio<textarea rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)} /></label>
      <div className="admin-grid2">
        <label>Lokasi<input value={form.location} onChange={(e) => set('location', e.target.value)} /></label>
        <label>Credential URL<input value={form.credential_url} onChange={(e) => set('credential_url', e.target.value)} /></label>
      </div>
      <div className="admin-grid3">
        <label>LinkedIn<input value={form.socials?.linkedin || ''} onChange={(e) => setSocial('linkedin', e.target.value)} /></label>
        <label>Instagram<input value={form.socials?.instagram || ''} onChange={(e) => setSocial('instagram', e.target.value)} /></label>
        <label>GitHub<input value={form.socials?.github || ''} onChange={(e) => setSocial('github', e.target.value)} /></label>
      </div>
      <div className="admin-grid2">
        <label>Foto profile URL<input value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)} placeholder="https://... atau upload" /></label>
        <label>Resume URL (PDF)<input value={form.resume_url} onChange={(e) => set('resume_url', e.target.value)} placeholder="https://... atau upload" /></label>
      </div>
      <div className="admin-grid2">
        <label>Upload foto baru<input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0], 'photo')} /></label>
        <label>Upload resume (PDF)<input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0], 'resume')} /></label>
      </div>
      {form.photo_url && <img src={form.photo_url} alt="Preview" className="admin-preview" />}
      <button className="admin-btn primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Profile'}</button>
    </form>
  );
};

export default ProfileEditor;
