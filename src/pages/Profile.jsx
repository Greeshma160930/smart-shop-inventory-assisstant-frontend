import React, { useState, useEffect } from 'react';
import { User, Store, Mail, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/profile');
        setName(res.data.name || '');
        setShopName(res.data.shopName || '');
        setEmail(res.data.email || '');
        setRole(res.data.role || 'ROLE_USER');
      } catch (err) {
        // Fallback to auth context
        if (user) {
          setName(user.name || '');
          setShopName(user.shopName || '');
          setEmail(user.email || '');
          setRole(user.role || 'ROLE_USER');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !shopName.trim()) {
      setToast({ message: 'Name and Shop name cannot be blank.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const res = await axiosClient.put('/profile', {
        name: name.trim(),
        shopName: shopName.trim(),
      });
      updateUser({ name: res.data.name, shopName: res.data.shopName });
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading profile details..." />;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="toolbar-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Shop Owner Profile</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Manage your personal profile and registered business name.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="card-title">{name}</h3>
              <p className="card-subtitle">{shopName}</p>
            </div>
          </div>
          <span
            style={{
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {role.replace('ROLE_', '')}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Registered Shop / Kirana Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-Only)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                value={email}
                disabled
                style={{ backgroundColor: '#F8FAFC', color: 'var(--text-muted)' }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Primary email used for account authentication and password recovery.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ marginTop: '0.75rem' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
