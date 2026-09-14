import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const blank = { school: '', major: '', start_year: '', end_year: '', sort_order: 0 };

const EducationEditor = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await supabase.from('education').select('*').order('sort_order');
    if (data) setRows(data);
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    const { error } = editingId
      ? await supabase.from('education').update(payload).eq('id', editingId)
      : await supabase.from('education').insert(payload);
    if (error) setMsg(`Gagal: ${error.message}`);
    else {
      setMsg('Tersimpan.');
      setForm(blank);
      setEditingId(null);
      load();
    }
  };

  const onEdit = (r) => {
    setEditingId(r.id);
    setForm({ school: r.school, major: r.major, start_year: r.start_year, end_year: r.end_year, sort_order: r.sort_order ?? 0 });
  };

  const onDelete = async (id) => {
    if (!confirm('Hapus education ini?')) return;
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (!error) load();
  };

  return (
    <div>
      {msg && <p className="admin-notice">{msg}</p>}
      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-grid2">
          <label>Sekolah/Universitas<input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} required /></label>
          <label>Jurusan<input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} required /></label>
        </div>
        <div className="admin-grid3">
          <label>Tahun mulai<input value={form.start_year} onChange={(e) => setForm({ ...form, start_year: e.target.value })} placeholder="2021" /></label>
          <label>Tahun selesai<input value={form.end_year} onChange={(e) => setForm({ ...form, end_year: e.target.value })} placeholder="2025" /></label>
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
              <button className="admin-btn small danger" onClick={() => onDelete(r.id)}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationEditor;
