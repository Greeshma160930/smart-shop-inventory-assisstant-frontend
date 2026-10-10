import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AlertBanner = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) return null;

  const topAlert = alerts[0];
  const isOut = topAlert.type === 'OUT_OF_STOCK';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: isOut ? '#FEF2F2' : '#FFFBEB',
        border: `1px solid ${isOut ? '#FCA5A5' : '#FDE68A'}`,
        color: isOut ? '#991B1B' : '#92400E',
        marginBottom: '1.5rem',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isOut ? (
          <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
        ) : (
          <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
        )}
        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {topAlert.message}
          {alerts.length > 1 && (
            <span style={{ fontWeight: 400, marginLeft: '0.5rem', opacity: 0.85 }}>
              (+{alerts.length - 1} more alert{alerts.length - 1 > 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      <Link
        to="/alerts"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: isOut ? 'var(--danger)' : '#B45309',
          textDecoration: 'underline',
          whiteSpace: 'nowrap',
        }}
      >
        View alerts <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default AlertBanner;
