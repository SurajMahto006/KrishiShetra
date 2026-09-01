import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DevAuthSelector = () => {
  // STRICT SAFETY: Never render outside local Vite development
  if (!import.meta.env.DEV) return null;

  const { loginAsDevRole } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'farmer', label: 'Farmer' },
    { id: 'fpo', label: 'FPO' },
    { id: 'buyer', label: 'Buyer' },
    { id: 'transporter', label: 'Transporter' },
    { id: 'admin', label: 'Admin' }
  ];

  const handleRoleSelect = (roleId) => {
    loginAsDevRole(roleId);
    navigate(`/${roleId}/dashboard`, { replace: true });
  };

  return (
    <div
      style={{
        marginTop: '20px',
        padding: '14px 16px',
        background: 'var(--ks-bg-warm, #FAF8F5)',
        border: '1px dashed var(--ks-border-light, #DDE7D8)',
        borderRadius: '10px'
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ks-text-muted, #718E68)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>Developer Testing</span>
        <span style={{ fontSize: '10px', color: 'var(--ks-sage, #5C8374)', fontWeight: 600 }}>Local Dev Only</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px'
        }}
      >
        {roles.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleRoleSelect(item.id)}
            style={{
              padding: '6px 4px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: 'var(--ks-evergreen, #1B4D3E)',
              background: '#FFFFFF',
              border: '1px solid var(--ks-border-light, #DDE7D8)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ks-sage, #5C8374)';
              e.currentTarget.style.background = 'var(--ks-bg-ivory, #F5F9F4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--ks-border-light, #DDE7D8)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DevAuthSelector;
