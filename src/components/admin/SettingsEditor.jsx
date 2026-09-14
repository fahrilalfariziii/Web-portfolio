import React, { useEffect, useState } from 'react';
import { adminGetSingle, adminUpsertSingle } from '../../lib/apiClient';

const SettingsEditor = () => {
  const [form, setForm] = useState({ formspree_id: '', footer_text: '' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('notice');

  useEffect(() => {
    (async () => {
      try {
        const data = await adminGetSingle('site_settings');
        if (data) setForm({ formspree_id: data.formspree_id || '', footer_text: data.footer_text || '' });
      } catch (e) { setMsg(`Gagal memuat: ${e.message}`); setMsgType('error'); }
    })();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.formspree_id && !/^[a-zA-Z0-9_-]{6,20}$/.test(form.formspree_id)) { setMsg('Formspree ID tidak valid'); setMsgType('error'); return; }
    if (form.footer_text.length > 120) { setMsg('Footer text max 120 karakter'); setMsgType('error'); return; }
    try {
      await adminUpsertSingle('site_settings', form);
      setMsg('Settings tersimpan.'); setMsgType('notice');
    } catch (err) { setMsg(`Gagal: ${err.message}`); setMsgType('error'); }
  };

  return (
    <form className="admin-form" onSubmit={onSave}>
      {msg && <p className={msgType==='error'?'admin-error':'admin-notice'}>{msg}</p>}
      <label>Formspree ID (bagian setelah /f/)<input value={form.formspree_id} onChange={(e) => setForm({ ...form, formspree_id: e.target.value })} placeholder="xeopjjeg" pattern="[a-zA-Z0-9_-]{6,20}" /></label>
      <label>Footer text<input value={form.footer_text} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} maxLength={120} /></label>
      <button className="admin-btn primary" type="submit">Simpan Settings</button>
    </form>
  );
};

export default SettingsEditor;
