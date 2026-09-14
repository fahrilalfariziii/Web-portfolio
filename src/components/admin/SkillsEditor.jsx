import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadSkillLogo } from '../../lib/storage';

const blank = { name: '', logo_url: '', level: 70, sort_order: 0 };

const SkillsEditor = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('notice');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileRef = useRef(null);

  const notify = (text, type = 'notice') => {
    setMsg(text);
    setMsgType(type);
  };

  const load = async () => {
    const { data } = await supabase.from('skills').select('*').order('sort_order');
    if (data) setRows(data);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setPreviewError(false);
  }, [form.logo_url]);

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    notify('Mengupload logo...', 'notice');
    try {
      const url = await uploadSkillLogo(file);
      setForm((f) => ({ ...f, logo_url: url }));
      notify('Logo terupload — klik Simpan untuk menyimpan ke database.', 'notice');
    } catch (e) {
      notify(`Upload gagal: ${e.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await onUpload(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      notify('Nama skill wajib diisi.', 'error');
      return;
    }
    notify('', 'notice');
    setMsg('');
    const payload = { name: form.name.trim(), logo_url: form.logo_url || '', level: Number(form.level) || 0, sort_order: Number(form.sort_order) || 0 };
    const { error } = editingId
      ? await supabase.from('skills').update(payload).eq('id', editingId)
      : await supabase.from('skills').insert(payload);
    if (error) notify(`Gagal: ${error.message}`, 'error');
    else {
      notify(editingId ? 'Skill diperbarui. Landing akan refresh otomatis.' : 'Skill ditambahkan. Logo sudah tampil di landing jika realtime aktif.', 'notice');
      setForm(blank);
      setEditingId(null);
      setPreviewError(false);
      if (fileRef.current) fileRef.current.value = '';
      load();
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({ name: r.name, logo_url: r.logo_url || '', level: r.level, sort_order: r.sort_order ?? 0 });
    setPreviewError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(blank);
    setPreviewError(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      {msg && <p className={msgType === 'error' ? 'admin-error' : 'admin-notice'}>{msg}</p>}

      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-grid3">
          <label>Nama skill<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="React, Python, Docker ..." /></label>
          <label>Level (0-100)<input type="number" min={0} max={100} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label>
          <label>Urutan<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="0 = paling atas" /></label>
        </div>

        <label>Logo URL<input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://... atau upload di bawah" /></label>

        <div
          className={`admin-upload ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 13 }}>Upload logo</strong>
            <span className="admin-muted" style={{ fontSize: 12 }}>PNG / JPG / SVG / WebP • max 2MB • drag & drop</span>
          </div>

          <input ref={fileRef} type="file" accept="image/*,.svg" onChange={(e) => onUpload(e.target.files?.[0])} />

          {form.logo_url ? (
            <div className="admin-upload-preview">
              <div className="admin-skill-thumb" style={{ width: 52, height: 52 }}>
                {!previewError && form.logo_url ? (
                  <img src={form.logo_url} alt="preview logo" onError={() => setPreviewError(true)} />
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{(form.name || '?').slice(0,2).toUpperCase()}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.name || 'Preview logo'}</div>
                <div className="admin-muted" style={{ fontSize: 12, wordBreak: 'break-all' }}>{form.logo_url}</div>
                {previewError && <div className="admin-muted" style={{ color: '#e11d48', fontSize: 12 }}>URL tidak bisa dimuat — cek bucket public atau URL.</div>}
              </div>
              <button type="button" className="admin-btn small" onClick={() => setForm((f) => ({ ...f, logo_url: '' }))}>Hapus</button>
            </div>
          ) : (
            <div className="admin-muted" style={{ fontSize: 12 }}>Belum ada logo. Upload file atau isi URL di atas. Logo akan tampil seragam 52×52 di landing.</div>
          )}

          {uploading && <div className="admin-muted" style={{ fontSize: 12 }}>⏳ Uploading — jangan tutup halaman...</div>}
        </div>

        <div className="admin-row">
          <button className="admin-btn primary" type="submit" disabled={uploading}>{uploading ? 'Uploading...' : editingId ? 'Update Skill' : 'Tambah Skill'}</button>
          {editingId && <button type="button" className="admin-btn" onClick={cancelEdit}>Batal</button>}
          {!editingId && form.logo_url && <button type="button" className="admin-btn" onClick={() => { setForm(blank); if (fileRef.current) fileRef.current.value=''; }}>Reset</button>}
        </div>
        <div className="admin-muted" style={{ fontSize: 12 }}>Tips: setelah <strong>Simpan</strong>, buka landing <code>/</code> — logo baru langsung tampil (jika belum, refresh sekali). Pastikan bucket <code>skill-logos</code> public.</div>
      </form>

      <div className="admin-list">
        {rows.length === 0 && <div className="admin-muted" style={{ padding: '12px 0' }}>Belum ada skill di database. Tambahkan di atas.</div>}
        {rows.map((r) => (
          <div key={r.id} className="admin-item">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0, flex: 1 }}>
              <div className="admin-skill-thumb" aria-hidden>
                {r.logo_url ? <img src={r.logo_url} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display='none'; }} /> : <span style={{ fontSize: 11, fontWeight: 700 }}>{r.name.slice(0,2).toUpperCase()}</span>}
              </div>
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</strong>
                <div className="admin-muted" style={{ fontSize: 12 }}>{r.level}% • order {r.sort_order} {r.logo_url ? '• ada logo' : '• tanpa logo'}</div>
              </div>
            </div>
            <div className="admin-row">
              <button className="admin-btn small" onClick={() => startEdit(r)}>Edit</button>
              <button className="admin-btn small danger" onClick={async () => { if (confirm(`Hapus skill "${r.name}"?`)) { await supabase.from('skills').delete().eq('id', r.id); load(); } }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsEditor;
