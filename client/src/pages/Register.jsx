import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, UserPlus, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'customer', label: 'Customer', desc: 'Transfer funds, view history, track risk scores' },
    { key: 'officer', label: 'Compliance Officer', desc: 'Review flagged transactions, run AI investigations' },
    { key: 'admin', label: 'Administrator', desc: 'Full system access, audit logs, all permissions' },
  ];

  return (
    <div className="auth-bg">
      <div className="auth-container">

        {/* ── LEFT: Form ── */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <Shield size={20} />
            </div>
            <span className="auth-brand-name">FinShield-AI</span>
          </div>

          <h1 className="auth-headline">Create your<br />account</h1>
          <p className="auth-subtitle">Get started with enterprise fraud detection.</p>

          {error && (
            <div className="auth-alert auth-alert-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                className="form-input"
                type="text"
                name="name"
                placeholder="John Smith"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                className="form-input"
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="officer">Compliance Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button
              className="btn-auth-primary"
              type="submit"
              id="btn-register"
              disabled={loading}
            >
              {loading ? (
                <><span className="auth-spinner" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        {/* ── RIGHT: Brand ── */}
        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="auth-visual">
              <div className="auth-shield-graphic">
                <Shield size={64} strokeWidth={1.5} />
              </div>
            </div>

            <div className="auth-right-tag">Choose your role</div>
            <h2 className="auth-right-headline">
              The right access<br />for every team.
            </h2>
            <p className="auth-right-desc">
              Each role gives you the tools you need — from transacting to investigating fraud.
            </p>

            <div className="auth-right-features">
              {roles.map(r => (
                <div
                  key={r.key}
                  className="auth-right-feature"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 14px',
                    background: form.role === r.key ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    border: form.role === r.key ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.15s',
                    gap: 4,
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>{r.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', lineHeight: 1.4 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
