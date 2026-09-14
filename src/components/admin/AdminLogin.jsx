import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import '../../styles/Admin.css';

const AdminLogin = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    navigate('/admin', { replace: true });
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.message || 'Login gagal. Periksa email/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-wrap">
      <form className="admin-card admin-login" onSubmit={onSubmit}>
        <h1>CMS Login</h1>
        <p className="admin-muted">Satu akun admin (email + password Supabase Auth).</p>
        {!isSupabaseConfigured && (
          <p className="admin-error">
            Supabase belum dikonfigurasi. Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dulu.
          </p>
        )}
        {error && <p className="admin-error">{error}</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        <button className="admin-btn primary" type="submit" disabled={loading}>
          {loading ? 'Masuk...' : 'Masuk Dashboard'}
        </button>
        <Link className="admin-muted" to="/">← Kembali ke portfolio</Link>
      </form>
    </div>
  );
};

export default AdminLogin;
