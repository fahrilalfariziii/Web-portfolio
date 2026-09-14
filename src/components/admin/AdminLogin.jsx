import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    // Basic client-side validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Format email tidak valid');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      await signIn(trimmedEmail, password);
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
        <p className="admin-muted">Satu akun admin (email + password Supabase Auth via server).</p>
        {error && <p className="admin-error">{error}</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" maxLength={80} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" minLength={6} maxLength={128} />
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
