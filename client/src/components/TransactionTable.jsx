import RiskBadge from './RiskBadge';
import { formatDistanceToNow } from '../utils/dateUtils';

export default function TransactionTable({ transactions = [], showActions = false, onReview, onInvestigate }) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Ref</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Time</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td>
                <code className="mono" style={{ fontSize: '0.75rem' }}>
                  {tx._id?.slice(-8).toUpperCase()}
                </code>
              </td>
              <td>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                  {tx.sender?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {tx.sender?.email}
                </div>
              </td>
              <td>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                  {tx.receiver?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {tx.receiver?.email}
                </div>
              </td>
              <td>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  ₹{tx.amount?.toLocaleString('en-IN')}
                </div>
                {tx.description && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {tx.description}
                  </div>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <RiskBadge score={tx.riskScore} />
                  <div className="risk-bar" style={{ width: 80 }}>
                    <div
                      className="risk-bar-fill"
                      style={{
                        width: `${tx.riskScore}%`,
                        background: tx.riskScore >= 80 ? 'var(--risk-critical)'
                          : tx.riskScore >= 60 ? 'var(--risk-high)'
                          : tx.riskScore >= 30 ? 'var(--risk-medium)'
                          : 'var(--risk-low)',
                      }}
                    />
                  </div>
                </div>
              </td>
              <td>
                <RiskBadge status={tx.status} />
                {tx.reviewedBy && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    by {tx.reviewedBy.name}
                  </div>
                )}
              </td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {formatDistanceToNow(tx.createdAt)}
              </td>
              {showActions && (
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-cyan btn-sm"
                      onClick={() => onInvestigate?.(tx)}
                      title="AI Investigation"
                    >
                      🤖 AI
                    </button>
                    {['flagged', 'blocked'].includes(tx.status) && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => onReview?.(tx, 'approve')}
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onReview?.(tx, 'block')}
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
