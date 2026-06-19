import { useEffect, useState } from 'react';
import { auditService } from '../services/transactionService';
import { formatDateTime } from '../utils/dateUtils';
import { ScrollText } from 'lucide-react';

const ACTION_ICONS = {
  USER_REGISTERED: '👤',
  USER_LOGIN: '🔐',
  TRANSACTION_INITIATED: '💸',
  TRANSACTION_FLAGGED: '⚠',
  TRANSACTION_BLOCKED: '🚫',
  TRANSACTION_APPROVED: '✅',
  TRANSACTION_REVIEWED: '🔍',
  AI_INVESTIGATION_REQUESTED: '🤖',
  AUDIT_LOG_VIEWED: '📋',
};

const SEVERITY_CLASSES = {
  info: 'badge-approved',
  warning: 'badge-flagged',
  critical: 'badge-blocked',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0 });
  const [filters, setFilters] = useState({ severity: '' });

  useEffect(() => {
    setLoading(true);
    auditService.getAll({ severity: filters.severity || undefined })
      .then(res => {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Complete immutable record of all system actions and compliance events</p>
      </div>

      {/* Filter */}
      <div className="card mb-6" style={{ padding: '14px 20px', marginBottom: 20 }}>
        <div className="flex items-center gap-4">
          <ScrollText size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Severity:</span>
          {['', 'info', 'warning', 'critical'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filters.severity === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilters({ severity: s })}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {pagination.total} events
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /><p>Loading audit trail...</p></div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Severity</th>
                  <th>Transaction</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '1.2rem' }}>{ACTION_ICONS[log.action] || '📌'}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {log.actor?.name || 'System'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {log.actor?.email}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${log.actorRole === 'admin' ? 'badge-blocked' : log.actorRole === 'officer' ? 'badge-flagged' : 'badge-approved'}`}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td>
                      <code className="mono" style={{ fontSize: '0.75rem', background: 'var(--bg-input)', padding: '3px 8px', borderRadius: 5 }}>
                        {log.action}
                      </code>
                    </td>
                    <td>
                      <span className={`badge ${SEVERITY_CLASSES[log.severity]}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td>
                      {log.targetTransaction ? (
                        <code className="mono" style={{ fontSize: '0.72rem' }}>
                          {log.targetTransaction._id?.slice(-8).toUpperCase()}
                        </code>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
