import React from 'react';
import { Sprout, AlertCircle } from 'lucide-react';

export const AuthLayout = ({
  title,
  subtitle,
  error,
  children,
  footer,
  maxWidth = '460px'
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--ks-bg-ivory)',
        padding: '24px 16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--ks-border-light)',
          padding: '32px 28px'
        }}
      >
        {/* Canonical Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              background: 'linear-gradient(135deg, #8FCB9B 0%, #5B9A72 50%, #12372A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(18, 55, 42, 0.22)'
            }}
          >
            <Sprout size={24} strokeWidth={2.4} />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '23px',
              fontWeight: 700,
              color: 'var(--ks-evergreen)',
              margin: 0,
              lineHeight: 1.2
            }}
          >
            {title || 'KrishiShetra'}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--ks-text-muted)',
                marginTop: '5px',
                marginBottom: 0,
                lineHeight: 1.4
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Inline Error Banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              color: 'var(--status-error-text)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '18px',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        {children}

        {/* Footer Navigation */}
        {footer && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '20px',
              fontSize: '13px',
              color: 'var(--ks-text-muted)',
              borderTop: '1px solid var(--ks-border-subtle)',
              paddingTop: '14px'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
