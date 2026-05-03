import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { tasksAPI } from '../utils/api';
import { format, isPast, isValid } from 'date-fns';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    tasksAPI.getMyTasks()
      .then(r => setTasks(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'todo') return t.status === 'todo';
    if (filter === 'in_progress') return t.status === 'in_progress';
    if (filter === 'done') return t.status === 'done';
    if (filter === 'overdue') {
      const d = t.deadline ? new Date(t.deadline) : null;
      return d && isValid(d) && isPast(d) && t.status !== 'done';
    }
    return true;
  });

  const statusLabel = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
  const priorityMap = { low: '🟢', medium: '🟡', high: '🔴', urgent: '🚨' };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <div style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: 4 }}>
            {tasks.length} tasks assigned to you
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="filter-bar" style={{ marginBottom: 24 }}>
          {['all', 'todo', 'in_progress', 'done', 'overdue'].map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>No tasks here</h3>
            <p>Tasks assigned to you will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 800 }}>
            {filtered.map(task => {
              const dl = task.deadline ? new Date(task.deadline) : null;
              const overdue = dl && isValid(dl) && isPast(dl) && task.status !== 'done';

              return (
                <div
                  key={task.id}
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                  onClick={() => navigate(`/projects/${task.project_id}`)}
                >
                  <div style={{ fontSize: '1.1rem' }}>{priorityMap[task.priority] || '⚪'}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: '0.95rem',
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      color: task.status === 'done' ? 'var(--text2)' : 'var(--text)',
                    }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: '0.75rem', fontWeight: 600,
                        color: task.project_color || 'var(--accent)',
                      }}>
                        ● {task.project_name}
                      </span>
                      <span className={`badge badge-${task.status}`} style={{ fontSize: '0.7rem' }}>
                        {statusLabel[task.status] || task.status}
                      </span>
                    </div>
                  </div>

                  {dl && isValid(dl) && (
                    <div style={{
                      fontSize: '0.78rem',
                      fontFamily: 'Space Mono, monospace',
                      color: overdue ? 'var(--red)' : 'var(--text2)',
                      flexShrink: 0,
                    }}>
                      {overdue ? '⚠ ' : '📅 '}
                      {format(dl, 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
