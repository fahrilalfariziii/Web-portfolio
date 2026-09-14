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
  { id: 'profile', label: 'Profile' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'settings', label: 'Settings' },
];

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('profile');

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <strong>CMS Portfolio</strong>
          <div className="admin-muted">{user?.email}</div>
        </div>
        <div className="admin-row">
          <Link className="admin-btn small" to="/">Lihat Landing</Link>
          <button className="admin-btn small danger" onClick={signOut}>Logout</button>
        </div>
      </header>
      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="admin-card">
        {tab === 'profile' && <ProfileEditor />}
        {tab === 'education' && <EducationEditor />}
        {tab === 'experience' && <ExperienceEditor />}
        {tab === 'skills' && <SkillsEditor />}
        {tab === 'projects' && <ProjectsEditor />}
        {tab === 'settings' && <SettingsEditor />}
      </main>
    </div>
  );
};

export default AdminDashboard;
