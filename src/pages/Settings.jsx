import React, { useState } from 'react';
import { Settings as SettingsIcon, Lock, DollarSign, BellRing, Save } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import Toast from '../components/Toast';

const Settings = () => {
  const [defaultMinStock, setDefaultMinStock] = useState(() => localStorage.getItem('smartshop_default_min_stock') || '10');
  const [currencySymbol, setCurrencySymbol] = useState('₹ (INR - Indian Rupee)');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSaveDefaults = (e) => {
    e.preventDefault();
    localStorage.setItem('smartshop_default_min_stock', defaultMinStock);
    setToast({ message: 'Store preferences saved successfully!', type: 'success' });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      setToast({ message: 'Please enter both current and new password.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match.', type: 'error' });
      return;
    }

    setSubmittingPassword(true);
    try {
      await axiosClient.put('/profile/password', {
        oldPassword,
        newPassword,
      });
      setToast({ message: 'Password changed successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to change password. Verify your current password.',
        type: 'error',
      });
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="toolbar-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Store Settings</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Configure default operational thresholds and security preferences.
          </p>
        </div>
      </div>

      {/* Store Operational Defaults */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <SettingsIcon size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 className="card-title">Inventory Configuration</h3>
              <p className="card-subtitle">Global defaults applied to new products</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveDefaults}>
          <div className="form-group">
            <label className="form-label">Default Minimum Stock Level</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={defaultMinStock}
              onChange={(e) => setDefaultMinStock(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              New items added to the inventory catalog will default to this safety threshold.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Operating Currency</label>
            <input
              type="text"
              className="form-input"
              value={currencySymbol}
              disabled
              style={{ backgroundColor: '#F8FAFC' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Fixed to Indian Rupee (₹) with Lakhs & Crores formatting (e.g. ₹1,25,000.00).
            </span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            <Save size={16} /> Save Preferences
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Lock size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 className="card-title">Security & Password</h3>
              <p className="card-subtitle">Update your account login credentials</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label className="form-label">Current Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submittingPassword}
            style={{ marginTop: '0.5rem' }}
          >
            {submittingPassword ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
