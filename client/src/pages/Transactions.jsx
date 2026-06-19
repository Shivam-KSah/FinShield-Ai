import { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import TransactionTable from '../components/TransactionTable';
import { Filter } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getAll({
        status: filters.status || undefined,
        page: filters.page,
        limit: 20,
      });
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, [filters]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'approved', label: '✅ Approved' },
    { value: 'flagged', label: '⚠ Flagged' },
    { value: 'blocked', label: '🚫 Blocked' },
    { value: 'pending', label: '⏳ Pending' },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Transactions</h1>
        <p>Your complete transaction history with risk scoring</p>
      </div>

      {/* Filters */}
      <div className="card mb-6" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="flex items-center gap-4">
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by:</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                className={`btn btn-sm ${filters.status === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilters({ status: opt.value, page: 1 })}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {pagination.total} records
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading transactions...</p>
          </div>
        ) : (
          <TransactionTable transactions={transactions} />
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4" style={{ marginTop: 20 }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`btn btn-sm ${filters.page === p ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilters({ ...filters, page: p })}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
