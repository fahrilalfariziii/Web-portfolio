import React, { useEffect, useState } from 'react';
import { adminList, adminCreate, adminUpdate, adminDelete } from '../../lib/apiClient';
import { isSafeUrl } from '../../utils/url';

const blank = { type: 'works', title: '', company: '', date_text: '', bullets: '', link_url: '', sort_order: 0 };

const ExperienceEditor = () => {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('notice');

  const load = async () => {
    try {
      const data = await adminList('experiences');
      setRows(data);
    } catch (e) { setMsg(e.message); setMsgType('error'); }
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.link_url && !isSafeUrl(form.link_url)) { setMsg('Link URL harus https/http'); setMsgType('error'); return; }
    const bullets = form.bullets.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 20);
    const payload = {
      type: form.type,
      title: form.title.trim(),
      company: form.company.trim(),
      date_text: form.date_text.trim(),
      bullets,
      link_url: form.link_url || '',
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (editingId) await adminUpdate('experiences', editingId, payload);
      else await adminCreate('experiences', payload);
      setMsg('Tersimpan.'); setMsgType('notice');
      setForm(blank);
      setEditingId(null);
      load();
    } catch (err) { setMsg(`Gagal: ${err.message}`); setMsgType('error'); }
  };

  const onEdit = (r) => {
    setEditingId(r.id);
    setForm({
      type: r.type, title: r.title, company: r.company, date_text: r.date_text,
      bullets: (r.bullets || []).join('\n'), link_url: r.link_url || '', sort_order: r.sort_order ?? 0,
    });
  };

  const shown = filter === 'all' ? rows : rows.filter((r) => r.type === filter);

  return (
    <div>
      {msg && <p className={msgType==='error'?'admin-error':'admin-notice'}>{msg}</p>}
      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-grid3">
          <label>Tipe<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="works">works</option>
            <option value="professional">professional</option>
          </select></label>
          <label>Judul/Posisi<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={80} /></label>
          <label>Perusahaan<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required maxLength={80} /></label>
        </div>
        <div className="admin-grid3">
          <label>Periode<input value={form.date_text} onChange={(e) => setForm({ ...form, date_text: e.target.value })} placeholder="Aug - Sep 2024" maxLength={40} /></label>
          <label>Link (opsional)<input type="url" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." /></label>
          <label>Urutan<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></label>
        </div>
        <label>Poin-poin (satu baris = satu bullet, max 20)<textarea rows={4} value={form.bullets} onChange={(e) => setForm({ ...form, bullets: e.target.value })} maxLength={2000} /></label>
        <div className="admin-row">
          <button className="admin-btn primary" type="submit">{editingId ? 'Update' : 'Tambah'}</button>
          {editingId && <button type="button" className="admin-btn" onClick={() => { setEditingId(null); setForm(blank); }}>Batal</button>}
        </div>
      </form>
      <div className="admin-row" style={{ margin: '12px 0' }}>
        {['all', 'works', 'professional'].map((t) => (
          <button key={t} className={`admin-btn small ${filter === t ? 'primary' : ''}`} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>
      <div className="admin-list">
        {shown.map((r) => (
          <div key={r.id} className="admin-item">
            <div><strong>[{r.type}] {r.title}</strong><div className="admin-muted">{r.company} • {r.date_text}</div></div>
            <div className="admin-row">
              <button className="admin-btn small" onClick={() => onEdit(r)}>Edit</button>
              <button className="admin-btn small danger" onClick={async () => { if (confirm('Hapus pengalaman ini?')) { try { await adminDelete('experiences', r.id); load(); } catch(e){setMsg(e.message); setMsgType('error');} } }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceEditor;
