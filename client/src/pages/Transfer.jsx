import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import RiskBadge from '../components/RiskBadge';
import { Send, AlertTriangle, Shield, ArrowRight } from 'lucide-react';

const RISK_RULES_PREVIEW = [
  { threshold: 50000, label: 'High amount (>₹50K)', score: 30 },
  { threshold: 100000, label: 'Extreme amount (>₹1L)', score: 50 },
];

export default function Transfer() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    receiverEmail: '', amount: '', description: '', location: 'India',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess(null);
  };

  const estimatedRisk = () => {
    const amt = Number(form.amount);
    if (!amt) return 0;
    let score = 0;
    if (amt > 100000) score += 50;
    else if (amt > 50000) score += 30;
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) score += 10;
    if (score > 0) score += 5; // round amount likely
    return Math.min(score, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    if (!form.receiverEmail || !form.amount) return;
    if (Number(form.amount) > user.balance) {
      setError('Insufficient balance.');
      return;
    }
    setLoading(true);
    try {
      const res = await transactionService.transfer({
        ...form,
        amount: Number(form.amount),
        deviceId: navigator.userAgent.slice(0, 50),
      });
      setSuccess(res.data);
      setForm({ receiverEmail: '', amount: '', description: '', location: 'India' });
      // Refresh balance
      if (res.data.transaction?.status !== 'blocked') {
        updateUser({ ...user, balance: user.balance - Number(form.amount) });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  const preview = estimatedRisk();
  const amt = Number(form.amount);

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Send Money</h1>
        <p>Transfer funds with real-time fraud risk assessment</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Transfer form */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 24 }}>Transfer Details</h3>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          {success && (
            <div className={`alert ${success.transaction?.status === 'blocked' ? 'alert-error' : success.transaction?.status === 'flagged' ? 'alert-warning' : 'alert-success'}`}>
              {success.transaction?.status === 'blocked' ? '🚫' : success.transaction?.status === 'flagged' ? '⚠' : '✅'}
              {' '}{success.message}
              <div style={{ marginTop: 8 }}>
                <RiskBadge score={success.transaction?.riskScore} status={success.transaction?.status} />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="receiver-email">Recipient Email</label>
              <input
                id="receiver-email" className="form-input"
                type="email" name="receiverEmail"
                placeholder="recipient@example.com"
                value={form.receiverEmail} onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="transfer-amount">
                Amount (₹)
                {user?.balance && (
                  <span style={{ color: 'var(--accent-cyan)', marginLeft: 8, fontWeight: 500 }}>
                    Available: ₹{user.balance.toLocaleString('en-IN')}
                  </span>
                )}
              </label>
              <input
                id="transfer-amount" className="form-input"
                type="number" name="amount"
                placeholder="e.g. 25000"
                value={form.amount} onChange={handleChange}
                min={1} required
                style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}
              />
            </div>

            {/* Live risk preview */}
            {amt > 0 && (
              <div style={{
                padding: '14px 16px',
                background: preview >= 70 ? 'var(--risk-critical-bg)' : preview >= 30 ? 'var(--risk-medium-bg)' : 'var(--risk-low-bg)',
                border: `1px solid ${preview >= 70 ? 'rgba(239,68,68,0.3)' : preview >= 30 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                borderRadius: 10,
                marginBottom: 20,
              }}>
                <div className="flex justify-between items-center mb-4" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Estimated Risk Score
                  </span>
                  <RiskBadge score={preview} />
                </div>
                <div className="risk-bar">
                  <div className="risk-bar-fill" style={{
                    width: `${preview}%`,
                    background: preview >= 70 ? 'var(--risk-critical)' : preview >= 30 ? 'var(--risk-medium)' : 'var(--risk-low)',
                  }} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="transfer-description">Description</label>
              <input
                id="transfer-description" className="form-input"
                type="text" name="description"
                placeholder="Rent, Invoice #1234, etc."
                value={form.description} onChange={handleChange}
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="transfer-location">Location</label>
              <select
                id="transfer-location" className="form-select"
                name="location" value={form.location} onChange={handleChange}
              >
                {['India', 'USA', 'UK', 'UAE', 'Singapore', 'Other'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary btn-lg"
              type="submit" id="btn-transfer"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Send size={18} />}
              {loading ? 'Processing...' : 'Send Transfer'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Risk rules card */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4" style={{ marginBottom: 16 }}>
              <Shield size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Fraud Detection Rules</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Amount > ₹1,00,000', score: '+50', active: amt > 100000 },
                { label: 'Amount > ₹50,000', score: '+30', active: amt > 50000 && amt <= 100000 },
                { label: 'Transfer 00:00–05:00', score: '+10', active: new Date().getHours() < 5 },
                { label: '>3 transfers / 10 min', score: '+25', active: false },
                { label: 'New device detected', score: '+15', active: false },
                { label: 'Round amount (₹10K+)', score: '+5', active: amt >= 10000 && amt % 10000 === 0 },
              ].map(rule => (
                <div key={rule.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', borderRadius: 8,
                  background: rule.active ? 'rgba(245,158,11,0.08)' : 'var(--bg-input)',
                  border: `1px solid ${rule.active ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
                  transition: 'var(--transition)',
                }}>
                  <span style={{ fontSize: '0.8rem', color: rule.active ? 'var(--risk-medium)' : 'var(--text-muted)' }}>
                    {rule.active ? '⚠ ' : ''}{rule.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                    color: rule.active ? 'var(--risk-medium)' : 'var(--text-muted)',
                  }}>
                    {rule.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Account info */}
          <div className="card">
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <AlertTriangle size={16} style={{ color: 'var(--risk-medium)' }} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Important</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Transactions with risk score ≥ 30 are flagged for compliance review.
              Scores ≥ 70 are blocked and funds are held pending officer review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
