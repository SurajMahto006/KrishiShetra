import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const variantClass = {
    primary: 'ks-btn--primary',
    secondary: 'ks-btn--secondary',
    danger: 'ks-btn--danger',
    ghost: 'ks-btn--ghost'
  }[variant] || 'ks-btn--primary';

  const sizeClass = {
    sm: 'ks-btn--sm',
    md: '',
    lg: 'ks-btn--lg'
  }[size] || '';

  return (
    <button
      type={type}
      className={`ks-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="ks-spinner" style={{ width: 16, height: 16, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'ksSpin 0.75s linear infinite' }} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
        </>
      )}
    </button>
  );
};

export default Button;
