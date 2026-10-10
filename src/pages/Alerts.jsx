import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  CheckCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient, { getErrorMessage } from '../api/axiosClient';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const [res, countRes] = await Promise.all([
        axiosClient.get('/alerts', {
          params: { unreadOnly, page, size: 15 },
        }),
        axiosClient.get('/alerts/count'),
      ]);
      setAlerts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setUnreadCount(countRes.data.unreadCount || 0);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Failed to fetch alerts.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [unreadOnly, page]);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosClient.put(`/alerts/${id}/read`);
      setToast({ message: 'Alert marked as read.', type: 'success' });
      fetchAlerts();
    } catch (err) {
      setToast({ message: 'Action failed.', type: 'error' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosClient.put('/alerts/read-all');
      setToast({ message: 'All alerts marked as read.', type: 'success' });
      fetchAlerts();
    } catch (err) {
      setToast({ message: 'Action failed.', type: 'error' });
    }
  };

  const columns = [
    {
      key: 'type',
      header: 'Severity',
      render: (a) => {
        const isOut = a.type === 'OUT_OF_STOCK';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {isOut ? (
              <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            )}
            <span
              className={`status-pill ${isOut ? 'out-of-stock' : 'low-stock'}`}
              style={{ fontWeight: 700 }}
            >
              {a.type.replace('_', ' ')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'message',
      header: 'Alert Message',
      render: (a) => (
        <div>
          <span style={{ fontWeight: a.isRead ? 400 : 700, color: 'var(--text-main)' }}>
            {a.message}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Product: {a.product?.name} ({a.product?.sku})
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Triggered At',
      render: (a) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {a.createdAt ? a.createdAt.replace('T', ' ').substring(0, 16) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <span
          style={{
            fontSize: '0.78rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: a.isRead ? '#F1F5F9' : '#FEF3C7',
            color: a.isRead ? '#64748B' : '#B45309',
            fontWeight: 600,
          }}
        >
          {a.isRead ? 'Read' : 'Unread'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (a) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          {!a.isRead && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleMarkAsRead(a.id)}
              title="Mark as Read"
            >
              <CheckCircle size={14} /> Mark Read
            </button>
          )}
          <Link to="/restocking" className="btn btn-primary btn-sm" title="Go to Restocking">
            Restock <ArrowRight size={14} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header Toolbar */}
      <div className="toolbar-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Stock Alerts & Threshold Warnings</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Automated alerts when inventory dips below minimum safety thresholds or depletes completely.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
              <CheckCheck size={16} /> Mark All Read
            </button>
          )}
          <button className="btn btn-secondary" onClick={fetchAlerts} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              className={`btn ${!unreadOnly ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => {
                setUnreadOnly(false);
                setPage(0);
              }}
            >
              All Alerts
            </button>
            <button
              className={`btn ${unreadOnly ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => {
                setUnreadOnly(true);
                setPage(0);
              }}
            >
              Unread Alerts ({unreadCount})
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {alerts.length} of {totalElements} alerts
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="card">
        <DataTable
          columns={columns}
          data={alerts}
          loading={loading}
          emptyTitle="No alerts"
          emptyDescription="No stock alerts match the selected criteria. All items are in safe stock."
          pagination={{
            page,
            totalPages,
            totalElements,
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      </div>
    </div>
  );
};

export default Alerts;
