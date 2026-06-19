import { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import TransactionTable from '../components/TransactionTable';
import { AlertTriangle, Bot, X } from 'lucide-react';

export default function FlaggedTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiModal, setAiModal] = useState(null); // { tx, report, loading }
  const [actionLoading, setActionLoading] = useState('');

  const loadFlagged = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getFlagged();
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFlagged(); }, []);

  const handleInvestigate = async (tx) => {
    // If cached report exists, show it directly
    if (tx.aiReport) {
      setAiModal({ tx, report: tx.aiReport, loading: false });
      return;
    }
    setAiModal({ tx, report: null, loading: true });
    try {
      const res = await transactionService.investigate(tx._id);
      setAiModal({ tx, report: res.data.report, loading: false });
    } catch (err) {
      setAiModal({ tx, report: '❌ Failed to generate AI report. Check Gemini API key.', loading: false });
    }
  };

  const handleReview = async (tx, action) => {
    setActionLoading(tx._id + action);
    try {
      await transactionService.review(tx._id, { action, note: `Reviewed by officer` });
      await loadFlagged();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  // Render AI report markdown-like
  const renderReport = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', margin: '16px 0 6px', fontWeight: 700 }}>{line.slice(3)}</h2>;
      if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} style={{ color: 'var(--text-primary)', display: 'block', margin: '4px 0' }}>{line.slice(2, -2)}</strong>;
      if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: 16, marginBottom: 4, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{line.slice(2)}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{line}</p>;
    });
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Flagged Transactions</h1>
        <p>Review high-risk transactions and run AI fraud investigations</p>
      </div>

      {/* Summary */}
      <div className="card-grid card-grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Flagged (Review)', count: transactions.filter(t => t.status === 'flagged').length, color: 'var(--risk-medium)' },
          { label: 'Blocked (Hold)', count: transactions.filter(t => t.status === 'blocked').length, color: 'var(--risk-critical)' },
          { label: 'Total Under Review', count: transactions.length, color: 'var(--accent-cyan)' },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div className="stat-value" style={{ color: item.color }}>{item.count}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading flagged transactions...</p>
          </div>
        ) : (
          <TransactionTable
            transactions={transactions}
            showActions
            onInvestigate={handleInvestigate}
            onReview={handleReview}
          />
        )}
      </div>

      {/* AI Investigation Modal */}
      {aiModal && (
        <div className="modal-overlay" onClick={() => setAiModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div style={{
                  width: 36, height: 36, background: 'rgba(6,182,212,0.15)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)',
                }}>
                  <Bot size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Fraud Investigation Report</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Powered by Gemini 1.5 Flash · Ref: {aiModal.tx._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setAiModal(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Transaction summary */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20,
              padding: '14px', background: 'var(--bg-secondary)', borderRadius: 10,
            }}>
              {[
                { label: 'Amount', value: `₹${aiModal.tx.amount?.toLocaleString('en-IN')}` },
                { label: 'Risk Score', value: `${aiModal.tx.riskScore}/100` },
                { label: 'Status', value: aiModal.tx.status?.toUpperCase() },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {aiModal.loading ? (
              <div className="loading-container" style={{ padding: '40px 20px' }}>
                <div className="spinner" />
                <p>Gemini is analyzing transaction patterns...</p>
              </div>
            ) : (
              <div className="ai-report">
                <ul style={{ listStyle: 'disc', paddingLeft: 0 }}>
                  {renderReport(aiModal.report)}
                </ul>
              </div>
            )}

            {!aiModal.loading && (
              <div className="flex gap-3 mt-4" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-success"
                  onClick={() => { handleReview(aiModal.tx, 'approve'); setAiModal(null); }}
                >
                  ✓ Approve Transaction
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => { handleReview(aiModal.tx, 'block'); setAiModal(null); }}
                >
                  ✕ Block Transaction
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
