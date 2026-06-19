import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, List, AlertTriangle,
  ScrollText, LogOut, Shield, ChevronRight
} from 'lucide-react';
import './Navbar.css';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', roles: ['customer', 'officer', 'admin'] },
  { to: '/transfer', icon: <ArrowLeftRight size={18} />, label: 'Transfer', roles: ['customer', 'officer', 'admin'] },
  { to: '/transactions', icon: <List size={18} />, label: 'Transactions', roles: ['customer', 'officer', 'admin'] },
  { to: '/flagged', icon: <AlertTriangle size={18} />, label: 'Flagged', roles: ['officer', 'admin'] },
  { to: '/audit', icon: <ScrollText size={18} />, label: 'Audit Logs', roles: ['admin'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = {
    customer: '#3b82f6',
    officer: '#f59e0b',
    admin: '#ef4444',
  };

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Shield size={22} />
        </div>
        <div>
          <div className="logo-title">FinShield</div>
          <div className="logo-sub">AI</div>
        </div>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${roleColor[user?.role]}, ${roleColor[user?.role]}88)` }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role" style={{ color: roleColor[user?.role] }}>
            {user?.role?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Balance (customer only) */}
      {user?.role === 'customer' && (
        <div className="sidebar-balance">
          <div className="balance-label">Available Balance</div>
          <div className="balance-amount">
            ₹{(user?.balance || 0).toLocaleString('en-IN')}
          </div>
        </div>
      )}

      <div className="sidebar-divider" />

      {/* Nav links */}
      <ul className="sidebar-nav">
        {navItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <ChevronRight size={14} className="nav-chevron" />
              </NavLink>
            </li>
          ))}
      </ul>

      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        <button className="logout-btn" onClick={handleLogout} id="btn-logout">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <div className="sidebar-version">FinShield-AI v1.0.0</div>
      </div>
    </nav>
  );
}
