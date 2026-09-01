import React from 'react';

export const StatCard = ({
  label,
  value,
  trend,
  trendPositive = true,
  icon: Icon,
  variant = 'sage', // 'sage' | 'amber' | 'terracotta' | 'blue'
  subtext,
  onClick,
  className = ''
}) => {
  const iconClass = {
    sage: 'ks-stat-icon--sage',
    amber: 'ks-stat-icon--amber',
    terracotta: 'ks-stat-icon--terracotta',
    blue: 'ks-stat-icon--blue'
  }[variant] || 'ks-stat-icon--sage';

  return (
    <div
      className={`ks-stat-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
            {value}
          </h2>
          {trend && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: trendPositive ? 'var(--status-success-text)' : 'var(--status-error-text)' }}>
              {trendPositive ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
        {subtext && (
          <p style={{ fontSize: '12px', color: 'var(--ks-text-muted)', marginTop: 4 }}>
            {subtext}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`ks-stat-icon ${iconClass}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
