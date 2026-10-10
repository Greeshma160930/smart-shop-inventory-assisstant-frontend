import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      let msg = 'Sign in failed. Please try again.';
      if (!err.response) {
        msg = 'Cannot connect to the backend server (http://localhost:8080). Please ensure Spring Boot is running.';
      } else if (err.response.status === 401) {
        msg = err.response.data?.message || 'Incorrect email or password. Please check your credentials.';
      } else if (err.response.status === 503) {
        msg = err.response.data?.message || 'Database service unavailable. Please check the Aiven Cloud MySQL connection.';
      } else if (err.response.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Left Branding Section - Clean, Dark Navy with Restrained Accent */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="sidebar-logo-icon" style={{ width: '42px', height: '42px' }}>
            <Store size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>Smart Shop</h2>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Inventory Assistant</span>
          </div>
        </div>

        <div className="auth-hero">
          <h1>Intelligent Inventory & Demand Prediction</h1>
          <p>
            Streamline your retail operations with real-time stock auditing, sales analytics, and automated restocking insights tailored for small businesses.
          </p>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
          &copy; {new Date().getFullYear()} Smart Shop Inventory Assistant. All rights reserved.
        </div>
      </div>

      {/* Right Login Form - Clean, Professional White Section */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your shop management dashboard</p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                border: '1px solid #FECACA',
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.75rem' }}
              disabled={submitting}
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
