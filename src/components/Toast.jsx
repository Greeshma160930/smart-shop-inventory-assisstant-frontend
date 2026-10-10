import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />;
      case 'error': return <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />;
      case 'warning': return <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />;
      default: return null;
    }
  };

  return (
    <div className={`toast ${type}`}>
      {getIcon()}
      <span style={{ flex: 1, fontSize: '0.85rem' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
