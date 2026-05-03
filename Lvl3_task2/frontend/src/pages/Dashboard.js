import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { projectsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast, isValid } from 'date-fns';

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#06b6d4'];

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', deadline: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    projectsAPI.getAll()
      .then(r => setProjects(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setCreating(true);
    setError('');
    try {
      await projectsAPI.create(form);
      setShowModal(false);
      setForm({ name: '', description: '', color: '#6366f1', deadline: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const getProgress = (p) => {
    const total = parseInt(p.total_tasks);
    const done = parseInt(p.done_tasks);
    if (!total) return 0;
    return Math.round((done / total) * 100);
  };

  const totalTasks = projects.reduce((a, p) => a + parseInt(p.total_tasks || 0), 0);
  const doneTasks = projects.reduce((a, p) => a + parseInt(p.done_tasks || 0), 0);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: 4 }}>
            Welcome back, {user?.name?.split(' ')[0]} {user?.avatar}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      <div className="page-body">
        <div className="stats-row">
          {[
            { label: 'Total Projects', value: projects.length, icon: '📁' },
            { label: 'Total Tasks', value: totalTasks, icon: '📋' },
            { label: 'Completed', value: doneTasks, icon: '✅' },
            { label: 'In Progress', value: projects.filter(p => p.status === 'active').length, icon: '⚡' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚀</div>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => {
              const progress = getProgress(p);
              const dl = p.deadline ? new Date(p.deadline) : null;
              const overdue = dl && isValid(dl) && isPast(dl);

              return (
                <div
                  className="project-card"
                  key={p.id}
                  style={{ '--project-color': p.color }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <div className="project-card-header">
                    <div>
                      <div className="project-card-title">{p.name}</div>
                      {p.description && (
                        <div className="project-card-desc">{p.description}</div>
                      )}
                    </div>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: p.color, marginTop: 4
                    }} />
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="project-meta">
                    <span>{p.done_tasks}/{p.total_tasks} tasks</span>
                    <span>{progress}%</span>
                    {dl && isValid(dl) && (
                      <span style={{ marginLeft: 'auto', color: overdue ? 'var(--red)' : 'var(--text2)' }}>
                        {overdue ? '⚠ ' : '📅 '}
                        {format(dl, 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>New Project</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What's this project about?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-options">
                  {COLORS.map(c => (
                    <div
                      key={c}
                      className={`color-opt ${form.color === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
