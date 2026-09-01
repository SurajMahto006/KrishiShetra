import React from 'react';
import { PackageSearch } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = PackageSearch,
  title = 'No records available',
  description = 'There are currently no items to display in this view.',
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`ks-empty-state ${className}`}>
      <Icon className="ks-empty-icon" />
      <h4 className="ks-empty-title">{title}</h4>
      <p className="ks-empty-desc">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
