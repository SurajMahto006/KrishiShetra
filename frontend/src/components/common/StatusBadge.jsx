import React from 'react';

export const StatusBadge = ({
  status = 'active',
  label,
  size = 'md',
  className = ''
}) => {
  const normalized = (status || '').toLowerCase();

  let variant = 'info';
  if (['active', 'completed', 'delivered', 'accepted', 'success', 'verified', 'on duty', 'live'].includes(normalized)) {
    variant = 'success';
  } else if (['pending', 'in transit', 'negotiation', 'review', 'dispatched', 'warning'].includes(normalized)) {
    variant = 'warning';
  } else if (['rejected', 'cancelled', 'expired', 'failed', 'danger', 'inactive'].includes(normalized)) {
    variant = 'danger';
  }

  const badgeClass = {
    success: 'ks-badge--success',
    warning: 'ks-badge--warning',
    info: 'ks-badge--info',
    danger: 'ks-badge--danger'
  }[variant];

  return (
    <span className={`ks-badge ${badgeClass} ${className}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {label || status}
    </span>
  );
};

export default StatusBadge;
