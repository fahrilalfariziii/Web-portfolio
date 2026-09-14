import React, { useEffect, useState } from 'react';
import { adminList, adminCreate, adminUpdate, adminDelete } from '../../lib/apiClient';

const blank = { school: '', major: '', start_year: '', end_year: '', sort_order: 0 };

const EducationEditor = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('notice');

  const load = async () => {
    try {
      const data = await adminList('education');
      setRows(data);
    } catch (e) { setMsg(e.message); setMsgType('error'); }
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    if (payload.school.length > 120 || payload.major.length > 120) {
      setMsg('Sekolah/jurusan maksimal 120 karakter'); setMsgType('error'); return;
    }
    try {
      if (editingId) await adminUpdate('education', editingId, payload);
      else await adminCreate('education', payload);
      setMsg('Tersimpan.'); setMsgType('notice');
      setForm(blank);
      setEditingId(null);
      load();
    } catch (err) { setMsg(`Gagal: ${err.message}`); setMsgType('error'); }
  };

  const onEdit = (r) => {
    setEditingId(r.id);
    setForm({ school: r.school, major: r.major, start_year: r.start_year, end_year: r.end_year, sort_order: r.sort_order ?? 0 });
  };

  return (
    <div>
      {msg && <p className={msgType === 'error' ? 'admin-error' : 'admin-notice'}>{msg}</p>}
      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-grid2">
          <label>Sekolah/Universitas<input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} required maxLength={120} /></label>
          <label>Jurusan<input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} required maxLength={120} /></label>
        </div>
        <div className="admin-grid3">
          <label>Tahun mulai<input value={form.start_year} onChange={(e) => setForm({ ...form, start_year: e.target.value })} placeholder="2021" maxLength={10} /></label>
          <label>Tahun selesai<input value={form.end_year} onChange={(e) => setForm({ ...form, end_year: e.target.value })} placeholder="2025" maxLength={10} /></label>
          <label>Urutan<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></label>
        </div>
        <div className="admin-row">
          <button className="admin-btn primary" type="submit">{editingId ? 'Update' : 'Tambah'}</button>
          {editingId && <button type="button" className="admin-btn" onClick={() => { setEditingId(null); setForm(blank); }}>Batal</button>}
        </div>
      </form>
      <div className="admin-list">
        {rows.map((r) => (
          <div key={r.id} className="admin-item">
            <div><strong>{r.major}</strong><div className="admin-muted">{r.school} • {r.start_year} - {r.end_year}</div></div>
            <div className="admin-row">
              <button className="admin-btn small" onClick={() => onEdit(r)}>Edit</button>
              <button className="admin-btn small danger" onClick={async () => { if (confirm('Hapus education ini?')) { try { await adminDelete('education', r.id); load(); } catch (e) { setMsg(e.message); setMsgType('error'); } } }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationEditor;
