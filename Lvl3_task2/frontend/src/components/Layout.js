import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../utils/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    projectsAPI.getAll().then(r => setProjects(r.data.slice(0, 8))).catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Project<span>Flow</span></div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main</div>
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <span>⊞</span> Dashboard
          </Link>
          <Link to="/my-tasks" className={`nav-link ${location.pathname === '/my-tasks' ? 'active' : ''}`}>
            <span>✓</span> My Tasks
          </Link>
        </nav>

        <div className="sidebar-projects">
          <div className="nav-label" style={{ padding: '8px 8px 6px', color: 'var(--text2)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Space Mono, monospace' }}>
            Projects
          </div>
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className={`nav-link ${location.pathname === `/projects/${p.id}` ? 'active' : ''}`}
            >
              <div className="nav-dot" style={{ background: p.color || '#6366f1' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.avatar || '👤'}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
              title="Logout"
            >⏻</button>
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
