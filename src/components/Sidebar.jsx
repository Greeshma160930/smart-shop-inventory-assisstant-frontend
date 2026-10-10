import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Bell,
  Settings,
  User,
  LogOut,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axiosClient.get('/alerts/count');
        setUnreadAlerts(res.data.unreadCount || 0);
      } catch (err) {
        // silent fail
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/sales', label: 'Sales', icon: ShoppingCart },
    { to: '/inventory', label: 'Inventory', icon: Boxes },
    { to: '/ai-prediction', label: 'AI Prediction', icon: TrendingUp },
    { to: '/restocking', label: 'Restocking', icon: RefreshCw },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Store size={22} />
        </div>
        <div className="sidebar-brand-text">
          <h2>Smart Shop</h2>
          <span>Inventory Assistant</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Shop Owner'}</div>
            <div className="sidebar-shop-name">{user?.shopName || 'Smart Store'}</div>
          </div>
        </div>
        <button
          className="btn-icon"
          onClick={handleLogout}
          title="Sign out"
          style={{ border: 'none', background: 'transparent', color: '#94A3B8' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
