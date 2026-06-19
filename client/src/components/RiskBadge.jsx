export default function RiskBadge({ score, status }) {
  const getLevel = () => {
    if (status === 'blocked') return { label: 'BLOCKED', cls: 'badge-blocked', dot: '🔴' };
    if (status === 'flagged') return { label: 'FLAGGED', cls: 'badge-flagged', dot: '🟡' };
    if (status === 'approved') return { label: 'APPROVED', cls: 'badge-approved', dot: '🟢' };
    if (score >= 80) return { label: 'CRITICAL', cls: 'badge-critical', dot: '🔴' };
    if (score >= 60) return { label: 'HIGH', cls: 'badge-high', dot: '🟠' };
    if (score >= 30) return { label: 'MEDIUM', cls: 'badge-medium', dot: '🟡' };
    return { label: 'LOW', cls: 'badge-low', dot: '🟢' };
  };

  const { label, cls, dot } = getLevel();

  return (
    <span className={`badge ${cls}`}>
      <span style={{ fontSize: '0.65rem' }}>{dot}</span>
      {label}
      {score !== undefined && (
        <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
          {score}
        </span>
      )}
    </span>
  );
}
