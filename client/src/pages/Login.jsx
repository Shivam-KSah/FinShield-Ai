import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';
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
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">

        {/* ── LEFT: Form ── */}
        <div className="auth-left">
          {/* Logo */}
          <div className="auth-brand">
            <div className="auth-logo">
              <Shield size={20} />
            </div>
            <span className="auth-brand-name">FinShield-AI</span>
          </div>

          <h1 className="auth-headline">Log in to your<br />account</h1>
          <p className="auth-subtitle">Welcome back. Enter your credentials to continue.</p>

          {error && (
            <div className="auth-alert auth-alert-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
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
              <div className="input-wrapper">
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
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              className="btn-auth-primary"
              type="submit"
              id="btn-login"
              disabled={loading}
            >
              {loading ? (
                <><span className="auth-spinner" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>

          <div className="auth-secure">
            <Lock size={10} />
            256-bit TLS encryption &nbsp;·&nbsp; SOC 2 certified
          </div>
        </div>

        {/* ── RIGHT: Brand ── */}
        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="auth-visual">
              <div className="auth-shield-graphic">
                <Shield size={64} strokeWidth={1.5} />
              </div>
            </div>

            <div className="auth-right-tag">Enterprise Fraud Detection</div>
            <h2 className="auth-right-headline">
              Stop fraud before<br />it happens.
            </h2>
            <p className="auth-right-desc">
              AI-powered risk scoring and real-time transaction monitoring
              built for modern financial institutions.
            </p>

            <div className="auth-right-features">
              {[
                'Real-time risk scoring on every transaction',
                'Gemini AI fraud investigation reports',
                'Role-based compliance workflow',
                'Full audit trail & system logs',
              ].map(f => (
                <div key={f} className="auth-right-feature">
                  <span className="auth-right-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
