import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shopName: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.shopName.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData.name.trim(), formData.email.trim(), formData.password, formData.shopName.trim());
      setToast({ message: 'Account registered successfully! Redirecting to sign in...', type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      let msg = 'Registration failed. Please try again.';
      if (!err.response) {
        msg = 'Cannot connect to the backend server (http://localhost:8080). Please ensure Spring Boot is running.';
      } else if (err.response.status === 409) {
        msg = err.response.data?.message || 'An account with this email address already exists. Please sign in or use a different email.';
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
          <h1>Built for Modern Retailers</h1>
          <p>
            Join shop owners using predictive stock alerts, AI-driven demand analytics, and unified inventory tracking to grow their retail business.
          </p>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
          &copy; {new Date().getFullYear()} Smart Shop Inventory Assistant. All rights reserved.
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: '440px' }}>
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Set up your shop profile and start managing inventory</p>
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
              <label className="form-label" htmlFor="register-name">
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email Address <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-shopName">
                Shop / Business Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="register-shopName"
                type="text"
                className="form-input"
                placeholder="Enter your shop name"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                autoComplete="organization"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="register-password">
                  Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="new-password"
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
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Must be at least 6 characters
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-confirmPassword">
                  Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="register-confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.75rem' }}
              disabled={submitting}
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
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
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
