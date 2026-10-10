import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', growth, footerText }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{title}</span>
        <div className={`stat-card-icon ${color}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {(growth !== undefined || footerText) && (
        <div className="stat-card-footer">
          {growth !== undefined && growth !== null && (
            <span className={growth >= 0 ? 'stat-trend-up' : 'stat-trend-down'}>
              {growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(growth).toFixed(1)}%
            </span>
          )}
          {footerText && <span>{footerText}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
