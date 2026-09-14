import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadSkillLogo } from '../../lib/storage';

const blank = { name: '', logo_url: '', level: 70, sort_order: 0 };

const SkillsEditor = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('skills').select('*').order('sort_order');
    if (data) setRows(data);
  };
  useEffect(() => { load(); }, []);

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSkillLogo(file);
      setForm((f) => ({ ...f, logo_url: url }));
      setMsg('Logo terupload, klik Simpan.');
    } catch (e) {
      setMsg(`Upload gagal: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const payload = { name: form.name, logo_url: form.logo_url || '', level: Number(form.level) || 0, sort_order: Number(form.sort_order) || 0 };
    const { error } = editingId
      ? await supabase.from('skills').update(payload).eq('id', editingId)
      : await supabase.from('skills').insert(payload);
    if (error) setMsg(`Gagal: ${error.message}`);
    else {
      setMsg('Tersimpan.');
      setForm(blank);
      setEditingId(null);
      load();
    }
  };

  return (
    <div>
      {msg && <p className="admin-notice">{msg}</p>}
      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-grid3">
          <label>Nama<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Level (0-100)<input type="number" min={0} max={100} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label>
          <label>Urutan<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></label>
        </div>
        <label>Logo URL<input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://... atau upload" /></label>
        <label>Upload logo<input type="file" accept="image/*,.svg" onChange={(e) => onUpload(e.target.files?.[0])} /></label>
        <div className="admin-row">
          <button className="admin-btn primary" type="submit" disabled={uploading}>{editingId ? 'Update' : 'Tambah'}</button>
          {editingId && <button type="button" className="admin-btn" onClick={() => { setEditingId(null); setForm(blank); }}>Batal</button>}
        </div>
      </form>
      <div className="admin-list">
        {rows.map((r) => (
          <div key={r.id} className="admin-item">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {r.logo_url && <img src={r.logo_url} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />}
              <div><strong>{r.name}</strong><div className="admin-muted">{r.level}% • order {r.sort_order}</div></div>
            </div>
            <div className="admin-row">
              <button className="admin-btn small" onClick={() => { setEditingId(r.id); setForm({ name: r.name, logo_url: r.logo_url || '', level: r.level, sort_order: r.sort_order ?? 0 }); }}>Edit</button>
              <button className="admin-btn small danger" onClick={async () => { if (confirm('Hapus skill ini?')) { await supabase.from('skills').delete().eq('id', r.id); load(); } }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsEditor;
