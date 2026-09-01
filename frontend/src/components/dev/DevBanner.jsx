import React from 'react';
import { ShieldAlert, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DevBanner = () => {
  // Only render in Vite development mode when in a dev session
  if (!import.meta.env.DEV) return null;

  const { isDevSession, role } = useAuth();
  if (!isDevSession) return null;

  const roleLabels = {
    farmer: 'Farmer',
    fpo: 'FPO',
    buyer: 'Buyer',
    transporter: 'Transporter',
    admin: 'Admin'
  };

  const currentRoleLabel = roleLabels[(role || 'farmer').toLowerCase()] || role;

  return (
    <div
      role="status"
      aria-label="Development Mode Banner"
      style={{
        background: 'linear-gradient(90deg, #92400E 0%, #B45309 50%, #78350F 100%)',
        color: '#FEF3C7',
        padding: '6px 16px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
        zIndex: 1200,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            background: '#FDE68A',
            color: '#78350F',
            padding: '1px 7px',
            borderRadius: '4px',
            fontSize: '10.5px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Terminal size={11} /> Development Mode
        </span>
        <span style={{ color: '#FFFFFF' }}>
          Test User &bull; <strong>Role: {currentRoleLabel}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', opacity: 0.9 }}>
        <ShieldAlert size={13} color="#FDE68A" />
        <span style={{ display: 'none', '@media (min-width: 600px)': { display: 'inline' } }}>
          Local Contributor Auth &bull; Protected UI Inspection
        </span>
      </div>
    </div>
  );
};

export default DevBanner;
