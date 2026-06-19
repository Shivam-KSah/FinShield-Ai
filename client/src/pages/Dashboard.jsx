import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import { TransactionVolumeChart, RiskDistributionChart } from '../components/Charts';
import RiskBadge from '../components/RiskBadge';
import { formatDistanceToNow } from '../utils/dateUtils';
import { Wallet, TrendingUp, AlertTriangle, ShieldX, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      transactionService.getStats(),
      transactionService.getAll({ limit: 5 }),
    ])
      .then(([statsRes, txRes]) => {
        setStats(statsRes.data.stats);
        setRecent(txRes.data.transactions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Balance', value: `₹${(stats?.balance || 0).toLocaleString('en-IN')}`,
      icon: <Wallet size={20} />, iconBg: 'rgba(59,130,246,0.15)', iconColor: 'var(--accent-blue)',
      show: user?.role === 'customer',
    },
    {
      label: 'Total Transactions', value: stats?.total || 0,
      icon: <Activity size={20} />, iconBg: 'rgba(6,182,212,0.15)', iconColor: 'var(--accent-cyan)',
      show: true,
    },
    {
      label: 'Flagged', value: stats?.flagged || 0,
      icon: <AlertTriangle size={20} />, iconBg: 'rgba(245,158,11,0.15)', iconColor: 'var(--risk-medium)',
      show: true,
    },
    {
      label: 'Blocked', value: stats?.blocked || 0,
      icon: <ShieldX size={20} />, iconBg: 'rgba(239,68,68,0.15)', iconColor: 'var(--risk-critical)',
      show: true,
    },
    {
      label: 'Avg. Risk Score', value: `${stats?.avgRisk || 0}/100`,
      icon: <TrendingUp size={20} />, iconBg: 'rgba(139,92,246,0.15)', iconColor: 'var(--accent-purple)',
      show: true,
    },
  ].filter(c => c.show);

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name} — here's your financial intelligence overview</p>
      </div>

      {/* Stat Cards */}
      <div className="card-grid" style={{ gridTemplateColumns: `repeat(${Math.min(statCards.length, 4)}, 1fr)` }}>
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.iconBg, color: card.iconColor }}>
              {card.icon}
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="card-grid card-grid-2">
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Transaction Volume</h3>
            <p style={{ fontSize: '0.8rem' }}>Last 7 days</p>
          </div>
          <TransactionVolumeChart data={stats?.dailyVolume || []} />
        </div>
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Risk Distribution</h3>
            <p style={{ fontSize: '0.8rem' }}>All transactions by risk level</p>
          </div>
          <RiskDistributionChart data={stats?.riskDistribution || []} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Recent Transactions</h3>
          <a href="/transactions" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
            View all →
          </a>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p>No transactions yet. Make your first transfer!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recent.map(tx => (
              <div key={tx._id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 4px', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {tx.sender?.name} → {tx.receiver?.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(tx.createdAt)} · {tx.description}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{tx.amount?.toLocaleString('en-IN')}
                </div>
                <RiskBadge score={tx.riskScore} status={tx.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
