import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const SettingsEditor = () => {
  const [form, setForm] = useState({ formspree_id: '', footer_text: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (data) setForm({ formspree_id: data.formspree_id || '', footer_text: data.footer_text || '' });
    })();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setMsg('');
    const { data: existing } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
    const { error } = existing?.id
      ? await supabase.from('site_settings').update(form).eq('id', existing.id)
      : await supabase.from('site_settings').insert({ ...form, id: 1 });
    setMsg(error ? `Gagal: ${error.message}` : 'Settings tersimpan.');
  };

  return (
    <form className="admin-form" onSubmit={onSave}>
      {msg && <p className="admin-notice">{msg}</p>}
      <label>Formspree ID (bagian setelah /f/)<input value={form.formspree_id} onChange={(e) => setForm({ ...form, formspree_id: e.target.value })} placeholder="xeopjjeg" /></label>
      <label>Footer text<input value={form.footer_text} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} /></label>
      <button className="admin-btn primary" type="submit">Simpan Settings</button>
    </form>
  );
};

export default SettingsEditor;
