import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-grid" />
        <div className="auth-logo">Project<span>Flow</span></div>
        <div className="auth-tagline">Ship projects. Hit deadlines.</div>
        <div className="auth-features">
          {[
            ['📋', 'Kanban boards with drag & drop'],
            ['👥', 'Invite team members to projects'],
            ['📅', 'Deadline tracking & alerts'],
            ['📊', 'Progress analytics at a glance'],
          ].map(([icon, text]) => (
            <div className="auth-feature" key={text}>
              <div className="auth-feature-icon">{icon}</div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p>Sign in to your workspace</p>

          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          <div className="auth-link">
            No account? <Link to="/register">Create one free</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
