import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import FlaggedTransactions from './pages/FlaggedTransactions';
import AuditLogs from './pages/AuditLogs';

// Protected route wrapper
function ProtectedRoute({ children, requiredRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p>Loading FinShield...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚫</div>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <p style={{ fontSize: '0.8rem', marginTop: 8 }}>
          Required role: {requiredRoles.join(' or ')}
        </p>
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content page-enter">{children}</main>
    </div>
  );
}

// Public route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/flagged" element={<ProtectedRoute requiredRoles={['officer', 'admin']}><FlaggedTransactions /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute requiredRoles={['admin']}><AuditLogs /></ProtectedRoute>} />
      <Route path="*" element={
        <div className="loading-container" style={{ minHeight: '100vh' }}>
          <div style={{ fontSize: '4rem' }}>404</div>
          <h2>Page Not Found</h2>
          <a href="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Dashboard</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
