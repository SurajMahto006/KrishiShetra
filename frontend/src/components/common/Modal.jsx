import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '560px',
  footer
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 55, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'ksModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--ks-border-light)' }}>
          <div>
            {title && <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ks-evergreen)' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '13px', color: 'var(--ks-text-muted)', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', color: 'var(--ks-text-muted)', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--ks-border-light)', background: 'var(--ks-surface-elevated)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
