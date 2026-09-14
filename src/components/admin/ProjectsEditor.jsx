import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['ML', 'Web', 'CV', 'NLP', 'n8n'];
const blank = {
  title: '', description: '', technologies: '', category: 'ML',
  year_text: '', web_url: '', repo_url: '', sort_order: 0, is_visible: true,
};

const ProjectsEditor = () => {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await supabase.from('projects').select('*').order('sort_order');
    if (data) setRows(data);
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const payload = {
      title: form.title,
      description: form.description,
      technologies: form.technologies.split(',').map((s) => s.trim()).filter(Boolean),
      category: form.category,
      year_text: form.year_text,
      web_url: form.web_url || '',
      repo_url: form.repo_url || '',
      sort_order: Number(form.sort_order) || 0,
      is_visible: Boolean(form.is_visible),
    };
    const { error } = editingId
      ? await supabase.from('projects').update(payload).eq('id', editingId)
      : await supabase.from('projects').insert(payload);
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
    setForm({
      title: r.title, description: r.description || '',
      technologies: (r.technologies || []).join(', '),
      category: r.category, year_text: r.year_text || '',
      web_url: r.web_url || '', repo_url: r.repo_url || '',
      sort_order: r.sort_order ?? 0, is_visible: r.is_visible !== false,
    });
  };

  const shown = filter === 'all' ? rows : rows.filter((r) => r.category === filter);

  return (
    <div>
      {msg && <p className="admin-notice">{msg}</p>}
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Judul<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label>Deskripsi<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label>Teknologi (pisahkan koma)<input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="Python, TensorFlow, FastAPI" /></label>
        <div className="admin-grid3">
          <label>Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select></label>
          <label>Tahun/teks<input value={form.year_text} onChange={(e) => setForm({ ...form, year_text: e.target.value })} placeholder="Fahril Sidik Alfarizi, 2026" /></label>
          <label>Urutan<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></label>
        </div>
        <div className="admin-grid2">
          <label>Web URL<input value={form.web_url} onChange={(e) => setForm({ ...form, web_url: e.target.value })} /></label>
          <label>Repo URL<input value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} /></label>
        </div>
        <label className="admin-check"><input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} /> Tampilkan di landing page</label>
        <div className="admin-row">
          <button className="admin-btn primary" type="submit">{editingId ? 'Update' : 'Tambah'}</button>
          {editingId && <button type="button" className="admin-btn" onClick={() => { setEditingId(null); setForm(blank); }}>Batal</button>}
        </div>
      </form>
      <div className="admin-row" style={{ margin: '12px 0' }}>
        {['all', ...CATEGORIES].map((c) => (
          <button key={c} className={`admin-btn small ${filter === c ? 'primary' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      <div className="admin-list">
        {shown.map((r) => (
          <div key={r.id} className="admin-item">
            <div>
              <strong>{r.title}</strong>
              <div className="admin-muted">[{r.category}] {(r.technologies || []).join(', ')} {r.is_visible === false ? '• hidden' : ''}</div>
            </div>
            <div className="admin-row">
              <button className="admin-btn small" onClick={() => onEdit(r)}>Edit</button>
              <button className="admin-btn small danger" onClick={async () => { if (confirm('Hapus project ini?')) { await supabase.from('projects').delete().eq('id', r.id); load(); } }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsEditor;
