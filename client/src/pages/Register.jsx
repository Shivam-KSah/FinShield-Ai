import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, UserPlus } from 'lucide-react';
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

  const roleDescriptions = {
    customer: 'Transfer funds, view history, track risk scores',
    officer: 'Review flagged transactions, run AI investigations',
    admin: 'Full system access, audit logs, all permissions',
  };

  return (
    <div className="auth-bg">
      <div className="auth-grid-overlay" />
      <div className="auth-container">
        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo"><Shield size={28} /></div>
            <span>FinShield-AI</span>
          </div>
          <h1 className="auth-headline">
            Join the Future of<br />
            <span className="gradient-text">Compliance</span>
          </h1>
          <p className="auth-tagline">
            Create your account and access the most advanced AI-driven fraud detection platform built for enterprise banking.
          </p>
          <div className="role-preview">
            {Object.entries(roleDescriptions).map(([role, desc]) => (
              <div key={role} className={`role-card ${form.role === role ? 'role-card--active' : ''}`}>
                <div className="role-name">{role.toUpperCase()}</div>
                <div className="role-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Start detecting fraud with AI</p>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name" className="form-input"
                  type="text" name="name"
                  placeholder="Shivam Kumar"
                  value={form.name} onChange={handleChange}
                  required minLength={2}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email" className="form-input"
                  type="email" name="email"
                  placeholder="you@finshield.com"
                  value={form.email} onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password" className="form-input"
                  type="password" name="password"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange}
                  required minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">Role</label>
                <select
                  id="reg-role" className="form-select"
                  name="role" value={form.role} onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="officer">Compliance Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                className="btn btn-primary btn-lg w-full"
                type="submit" id="btn-register"
                disabled={loading}
              >
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <UserPlus size={18} />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
