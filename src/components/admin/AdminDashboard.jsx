import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileEditor from './ProfileEditor';
import EducationEditor from './EducationEditor';
import ExperienceEditor from './ExperienceEditor';
import SkillsEditor from './SkillsEditor';
import ProjectsEditor from './ProjectsEditor';
import SettingsEditor from './SettingsEditor';
import '../../styles/Admin.css';

const TABS = [
  { id: 'profile', label: 'Profile', icon: '👤', desc: 'Foto, bio & sosial' },
  { id: 'education', label: 'Education', icon: '🎓', desc: 'Riwayat pendidikan' },
  { id: 'experience', label: 'Experience', icon: '💼', desc: 'Works & professional' },
  { id: 'skills', label: 'Skills', icon: '⚡', desc: 'Logo & level' },
  { id: 'projects', label: 'Projects', icon: '🚀', desc: 'Portfolio karya' },
  { id: 'settings', label: 'Settings', icon: '⚙️', desc: 'Form & footer' },
];

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];
  const initials = (user?.email || 'A').slice(0, 2).toUpperCase();

  return (
    <div className="admin-shell">
      {/* Overlay mobile */}
      <div
        className={`admin-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="admin-sidebar-head">
          <div className="admin-brand">
            <div className="admin-brand-mark">CMS</div>
            <div className="admin-brand-text">
              <strong>Portfolio CMS</strong>
              <span>Kelola landing page</span>
            </div>
          </div>
          <div className="admin-user-chip">
            <div className="admin-user-avatar">{initials}</div>
            <div className="admin-user-meta">
              <strong>{user?.email?.split('@')[0] || 'Admin'}</strong>
              <span title={user?.email}>{user?.email}</span>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-label">Menu</div>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`admin-nav-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => {
                setTab(t.id);
                setSidebarOpen(false);
              }}
            >
              <span className="admin-nav-icon" aria-hidden>{t.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', lineHeight: 1.1 }}>{t.label}</span>
                <span style={{ display: 'block', fontSize: 11, opacity: 0.72, fontWeight: 400, marginTop: 2 }}>{t.desc}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <Link className="admin-btn" to="/" onClick={() => setSidebarOpen(false)}>
            <span aria-hidden>↗</span> Lihat Landing
          </Link>
          <button className="admin-btn danger" onClick={signOut}>
            Logout
          </button>
          <div className="admin-muted" style={{ textAlign: 'center', fontSize: 11, marginTop: 2 }}>
            Supabase Auth • Protected
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-btn"
              aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
              onClick={() => setSidebarOpen((o) => !o)}
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <div className="admin-breadcrumb">
              <h1>{activeTab.label}</h1>
              <p>{activeTab.desc} • {TABS.length} section tersedia</p>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-kbd hide-mobile" style={{ display: 'none' }}>⌘ K</span>
            <Link className="admin-btn small" to="/">
              <span aria-hidden>👁</span> <span className="hide-mobile">Preview</span>
            </Link>
            <button className="admin-btn small danger" onClick={signOut}>Logout</button>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-card" key={tab}>
            {tab === 'profile' && <ProfileEditor />}
            {tab === 'education' && <EducationEditor />}
            {tab === 'experience' && <ExperienceEditor />}
            {tab === 'skills' && <SkillsEditor />}
            {tab === 'projects' && <ProjectsEditor />}
            {tab === 'settings' && <SettingsEditor />}
          </div>
          <p className="admin-muted" style={{ marginTop: 12, textAlign: 'center' }}>
            Perubahan tersimpan ke Supabase akan langsung tampil di landing page (realtime aktif).
          </p>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
