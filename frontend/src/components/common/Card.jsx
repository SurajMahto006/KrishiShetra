import React from 'react';

export const Card = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  style = {},
  ...props
}) => {
  return (
    <div className={`ks-card ${className}`} style={style} {...props}>
      {(title || subtitle || action) && (
        <div className={`ks-card__header ${headerClassName}`}>
          <div>
            {title && <h3 className="ks-card__title">{title}</h3>}
            {subtitle && <p style={{ fontSize: '13px', color: 'var(--ks-text-muted)', marginTop: 2 }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
};

export default Card;
