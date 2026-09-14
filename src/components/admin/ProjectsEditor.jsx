import React, { useEffect, useState } from 'react';
import { adminList, adminCreate, adminUpdate, adminDelete } from '../../lib/apiClient';
import { isSafeUrl } from '../../utils/url';

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
  const [msgType, setMsgType] = useState('notice');

  const load = async () => {
    try { const data = await adminList('projects'); setRows(data); } catch(e){setMsg(e.message); setMsgType('error');}
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.web_url && !isSafeUrl(form.web_url)) { setMsg('Web URL harus https/http'); setMsgType('error'); return; }
    if (form.repo_url && !isSafeUrl(form.repo_url)) { setMsg('Repo URL harus https/http'); setMsgType('error'); return; }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      technologies: form.technologies.split(',').map((s) => s.trim()).filter(Boolean).slice(0,12),
      category: form.category,
      year_text: form.year_text.trim(),
      web_url: form.web_url || '',
      repo_url: form.repo_url || '',
      sort_order: Number(form.sort_order) || 0,
      is_visible: Boolean(form.is_visible),
    };
    if (payload.title.length < 2 || payload.title.length > 80) { setMsg('Judul 2-80 karakter'); setMsgType('error'); return; }
    try {
      if (editingId) await adminUpdate('projects', editingId, payload);
      else await adminCreate('projects', payload);
      setMsg('Tersimpan.'); setMsgType('notice');
      setForm(blank);
      setEditingId(null);
      load();
    } catch (err) { setMsg(`Gagal: ${err.message}`); setMsgType('error'); }
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
      {msg && <p className={msgType==='error'?'admin-error':'admin-notice'}>{msg}</p>}
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Judul<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={80} /></label>
        <label>Deskripsi<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} /></label>
        <label>Teknologi (pisahkan koma, max 12)<input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="Python, TensorFlow, FastAPI" /></label>
        <div className="admin-grid3">
          <label>Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select></label>
          <label>Tahun/teks<input value={form.year_text} onChange={(e) => setForm({ ...form, year_text: e.target.value })} placeholder="Fahril Sidik Alfarizi, 2026" maxLength={60} /></label>
          <label>Urutan<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></label>
        </div>
        <div className="admin-grid2">
          <label>Web URL<input type="url" value={form.web_url} onChange={(e) => setForm({ ...form, web_url: e.target.value })} placeholder="https://..." /></label>
          <label>Repo URL<input type="url" value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} placeholder="https://..." /></label>
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
              <button className="admin-btn small danger" onClick={async () => { if (confirm('Hapus project ini?')) { try{await adminDelete('projects', r.id); load();}catch(e){setMsg(e.message); setMsgType('error');} } }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsEditor;
