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

function isResumeValueValid(v) {
  if (!v) return true;
  // Custom proxy link hide supabase domain
  if (v === '/api/resume' || v.startsWith('/api/resume')) return true;
  // Legacy: allow stored supabase path like resume/xxx.pdf (no domain) - treat as internal
  if (!v.startsWith('http') && v.includes('/')) return true;
  return isSafeUrl(v);
}

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
      setMsg(kind === 'resume' ? 'Upload resume berhasil — link download sekarang via /api/resume (custom, tidak bocor project ref). Klik Simpan.' : 'Upload berhasil, klik Simpan untuk menyimpan.');
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
    // Client-side URL validation (resume boleh /api/resume)
    const toCheck = [
      { v: form.photo_url, name: 'Foto' },
      { v: form.resume_url, name: 'Resume', allowResume: true },
      { v: form.credential_url, name: 'Credential' },
      { v: form.socials.linkedin, name: 'LinkedIn' },
      { v: form.socials.instagram, name: 'Instagram' },
      { v: form.socials.github, name: 'GitHub' },
    ];
    for (const { v, name, allowResume } of toCheck) {
      if (!v) continue;
      const ok = allowResume ? isResumeValueValid(v) : isSafeUrl(v);
      if (!ok) {
        setMsg(`URL ${name} tidak aman: ${v} — hanya https/http atau /api/resume diperbolehkan`);
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

  const resumeIsProxy = form.resume_url === '/api/resume' || form.resume_url?.startsWith('/api/resume');

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
        <label>Resume (via proxy)<input value={form.resume_url} onChange={(e) => set('resume_url', e.target.value)} placeholder="/api/resume (otomatis setelah upload)" /></label>
      </div>
      <div className="admin-grid2">
        <label>Upload foto baru<input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0], 'photo')} /></label>
        <label>Upload resume (PDF)<input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0], 'resume')} /></label>
      </div>
      {form.photo_url && isSafeUrl(form.photo_url) && <img src={form.photo_url} alt="Preview" className="admin-preview" referrerPolicy="no-referrer" />}
      {resumeIsProxy && <div className="admin-notice">Resume akan diakses via <code>/api/resume</code> — tidak mengekspos <code>supabase.co / project ref</code>. Test: <a href="/api/resume" target="_blank" rel="noopener noreferrer">buka /api/resume</a></div>}
      {form.resume_url && !resumeIsProxy && form.resume_url.startsWith('http') && <div className="admin-error">Resume masih pakai URL supabase langsung ({form.resume_url.slice(0,40)}...). Upload ulang agar jadi <code>/api/resume</code> dan jalankan <code>storage_policies.sql</code> agar bucket jadi private.</div>}
      <button className="admin-btn primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Profile'}</button>
    </form>
  );
};

export default ProfileEditor;
