import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axiosClient.get('/alerts/count');
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        // ignore
      }
    };
    fetchUnread();
  }, [location.pathname]);

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/products': return 'Product Catalog';
      case '/sales': return 'Sales Transactions';
      case '/inventory': return 'Inventory & Stock Logs';
      case '/ai-prediction': return 'AI Demand Forecasting';
      case '/restocking': return 'Restocking Recommendations';
      case '/reports': return 'Business Reports & Analytics';
      case '/alerts': return 'Stock Alerts';
      case '/settings': return 'Store Settings';
      case '/profile': return 'User Profile';
      default: return 'Smart Shop Assistant';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="btn-icon mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-page-title">
          <h1>{getPageTitle(location.pathname)}</h1>
        </div>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <Link to="/alerts" className="nav-action-btn" title="View Alerts">
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="nav-badge-count">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Pill & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="nav-action-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ overflow: 'hidden', padding: 0 }}
            title="Account Menu"
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                width: '200px',
                zIndex: 100,
                padding: '0.5rem 0',
              }}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                }}
                onClick={() => setShowProfileMenu(false)}
              >
                <User size={16} /> Profile
              </Link>
              <Link
                to="/settings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                }}
                onClick={() => setShowProfileMenu(false)}
              >
                <Settings size={16} /> Settings
              </Link>
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.35rem' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--danger)',
                    border: 'none',
                    background: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
