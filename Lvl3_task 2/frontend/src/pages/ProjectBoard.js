import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { projectsAPI, tasksAPI } from '../utils/api';
import { format, isPast, differenceInDays, isValid } from 'date-fns';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#8888aa' },
  { id: 'in_progress', label: 'In Progress', color: '#60a5fa' },
  { id: 'review', label: 'Review', color: '#fbbf24' },
  { id: 'done', label: 'Done', color: '#4ade80' },
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assignee_id: '', deadline: '', status: 'todo' });
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  const [comment, setComment] = useState('');

  const loadProject = useCallback(async () => {
    try {
      const [projRes, tasksRes, statsRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getByProject(id),
        projectsAPI.getStats(id),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadProject(); }, [loadProject]);

  const openNewTask = (status = 'todo') => {
    setSelectedTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', assignee_id: '', deadline: '', status });
    setError('');
    setShowTaskModal(true);
  };

  const openEditTask = async (task) => {
    try {
      const res = await tasksAPI.getOne(task.id);
      setSelectedTask(res.data);
      setTaskForm({
        title: res.data.title,
        description: res.data.description || '',
        priority: res.data.priority,
        assignee_id: res.data.assignee_id || '',
        deadline: res.data.deadline ? res.data.deadline.split('T')[0] : '',
        status: res.data.status,
      });
      setError('');
      setShowTaskModal(true);
    } catch (err) {
      setError('Failed to load task');
    }
  };

  const saveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setSaving(true);
    setError('');
    try {
      if (selectedTask) {
        await tasksAPI.update(selectedTask.id, taskForm);
      } else {
        await tasksAPI.create({ ...taskForm, project_id: id });
      }
      setShowTaskModal(false);
      await loadProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await tasksAPI.delete(taskId);
    setShowTaskModal(false);
    loadProject();
  };

  const moveTask = async (task, newStatus) => {
    await tasksAPI.update(task.id, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  const addMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await projectsAPI.addMember(id, memberEmail);
      setMemberEmail('');
      setShowMemberModal(false);
      loadProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !selectedTask) return;
    try {
      const res = await tasksAPI.addComment(selectedTask.id, comment);
      setSelectedTask(prev => ({ ...prev, comments: [...(prev.comments || []), res.data] }));
      setComment('');
    } catch {}
  };

  const getDeadlineClass = (dl) => {
    if (!dl) return '';
    const d = new Date(dl);
    if (!isValid(d)) return '';
    if (isPast(d)) return 'deadline-overdue';
    const diff = differenceInDays(d, new Date());
    if (diff <= 2) return 'deadline-soon';
    return 'deadline-ok';
  };

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div></Layout>;

  const total = parseInt(stats?.total || 0);
  const done = parseInt(stats?.done || 0);
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <Layout>
      <div className="project-header">
        <div className="project-header-top">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div className="project-color-dot" style={{ background: project?.color }} />
          <div className="project-header-title">{project?.name}</div>
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
              + Member
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => openNewTask()}>
              + Task
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 8 }}>
          <div style={{ flex: 1, maxWidth: 300 }}>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: project?.color }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem', fontFamily: 'Space Mono, monospace', color: 'var(--text2)' }}>
            {COLUMNS.map(col => (
              <span key={col.id} style={{ color: col.color }}>
                {stats?.[col.id] || 0} {col.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px' }}>
        <div className="tabs">
          {['board', 'members'].map(t => (
            <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'board' && (
        <div style={{ padding: '0 32px 32px', overflowX: 'auto' }}>
          <div className="board-wrapper">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id);
              return (
                <div
                  className="kanban-col"
                  key={col.id}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData('taskId');
                    const task = tasks.find(t => t.id === taskId);
                    if (task && task.status !== col.id) moveTask(task, col.id);
                  }}
                >
                  <div className="kanban-col-header">
                    <div className="kanban-col-title">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                      {col.label}
                    </div>
                    <span className="col-badge">{colTasks.length}</span>
                  </div>

                  <div className="kanban-cards">
                    {colTasks.map(task => (
                      <div
                        key={task.id}
                        className="task-card"
                        draggable
                        onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
                        onClick={() => openEditTask(task)}
                      >
                        <div className="task-card-title">{task.title}</div>
                        <div className="task-card-footer">
                          <span className={`badge badge-${task.priority}`}>
                            {task.priority}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {task.deadline && (
                              <span className={`deadline ${getDeadlineClass(task.deadline)}`}>
                                📅 {format(new Date(task.deadline), 'MMM d')}
                              </span>
                            )}
                            {task.assignee_avatar && (
                              <div className="assignee-avatar">{task.assignee_avatar}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => openNewTask(col.id)}
                      style={{
                        background: 'none', border: '1px dashed var(--border)',
                        color: 'var(--text2)', padding: '8px', borderRadius: 8,
                        cursor: 'pointer', fontSize: '0.82rem', width: '100%',
                        transition: 'all 0.15s', marginTop: 4
                      }}
                      onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
                    >
                      + Add task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div style={{ padding: '20px 32px' }}>
          <div style={{ maxWidth: 480 }}>
            <div className="members-list">
              {[{ id: project?.owner_id, name: project?.owner_name, avatar: project?.owner_avatar, role: 'owner' },
                ...(project?.members?.filter(m => m.id !== project?.owner_id) || [])
              ].map(m => m && (
                <div className="member-item" key={m.id}>
                  <div className="assignee-avatar" style={{ width: 32, height: 32, fontSize: '1rem' }}>{m.avatar || '👤'}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{m.email}</div>
                  </div>
                  <div className="member-role">{m.role}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
              + Invite Member
            </button>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTaskModal(false)}>
          <div className="modal modal-wide">
            <div className="modal-header">
              <h3>{selectedTask ? 'Edit Task' : 'New Task'}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedTask && (
                  <button className="btn btn-danger btn-sm" onClick={() => deleteTask(selectedTask.id)}>
                    Delete
                  </button>
                )}
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowTaskModal(false)}>✕</button>
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={saveTask}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Title *</label>
                  <input
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    placeholder="Add details..."
                    value={taskForm.description}
                    onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assignee</label>
                  <select value={taskForm.assignee_id} onChange={e => setTaskForm({ ...taskForm, assignee_id: e.target.value })}>
                    <option value="">Unassigned</option>
                    {project?.members?.map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (selectedTask ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>

            {selectedTask && (
              <>
                <div className="divider" />
                <div style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 12, fontFamily: 'Space Mono, monospace' }}>
                  Comments ({selectedTask.comments?.length || 0})
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                  {(selectedTask.comments || []).map(c => (
                    <div className="comment" key={c.id}>
                      <div className="assignee-avatar" style={{ width: 28, height: 28 }}>{c.user_avatar || '👤'}</div>
                      <div className="comment-body">
                        <div className="comment-author">{c.user_name}</div>
                        <div className="comment-text">{c.content}</div>
                        <div className="comment-time">{format(new Date(c.created_at), 'MMM d, h:mm a')}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={addComment} style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-group"
                    style={{ flex: 1, margin: 0 }}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">Post</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMemberModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Invite Member</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={addMember}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="teammate@company.com"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
