import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, LogIn, Lock } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-grid-overlay" />
      <div className="auth-container">
        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <Shield size={28} />
            </div>
            <span>FinShield-AI</span>
          </div>
          <h1 className="auth-headline">
            Enterprise-Grade<br />
            <span className="gradient-text">Fraud Detection</span>
          </h1>
          <p className="auth-tagline">
            AI-powered transaction risk scoring, real-time anomaly detection, and compliance workflow for modern financial institutions.
          </p>
          <div className="auth-features">
            {[
              'Risk Scoring Engine',
              'Gemini AI Investigator',
              'Role-Based Compliance',
              'Real-time Audit Logs',
            ].map(f => (
              <div key={f} className="auth-feature">
                <span className="feature-dot" />
                {f}
              </div>
            ))}
          </div>

          <div className="auth-trust">
            <div className="auth-trust-label">Compliance Standards</div>
            <div className="auth-trust-items">
              {['ISO 27001', 'SOC 2 Type II', 'PCI DSS'].map(s => (
                <div key={s} className="auth-trust-item">
                  <span className="auth-trust-dot" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to your FinShield account</p>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    className="form-input"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg w-full"
                type="submit"
                id="btn-login"
                disabled={loading}
              >
                {loading
                  ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  : <LogIn size={18} />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-switch">
              Don&apos;t have an account? <Link to="/register">Create one</Link>
            </p>

            <div className="auth-secure-note">
              <Lock size={11} />
              Secured with 256-bit TLS encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
