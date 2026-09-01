import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DevAuthSelector = () => {
  // Only render in Vite development mode
  if (!import.meta.env.DEV) return null;

  const { loginAsDevRole } = useAuth();
  const navigate = useNavigate();

  const testRoles = [
    { id: 'farmer', label: 'Farmer', badge: 'Producer', icon: '🌾' },
    { id: 'fpo', label: 'FPO', badge: 'Aggregation', icon: '🏢' },
    { id: 'buyer', label: 'Buyer', badge: 'Procurement', icon: '💼' },
    { id: 'transporter', label: 'Transporter', badge: 'Logistics', icon: '🚚' },
    { id: 'admin', label: 'Admin', badge: 'System Ops', icon: '⚡' }
  ];

  const handleSelectRole = (roleId) => {
    loginAsDevRole(roleId);
    navigate(`/${roleId}/dashboard`, { replace: true });
  };

  return (
    <div
      style={{
        marginTop: '20px',
        padding: '16px',
        background: '#FEFCE8',
        border: '1.5px dashed #F59E0B',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
      }}
    >
      {/* Dev Header Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              background: '#F59E0B',
              color: '#FFFFFF',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <Terminal size={11} /> DEV ONLY
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E' }}>
            Contributor Test Login
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 500 }}>
          No OTP Required
        </span>
      </div>

      <p
        style={{
          fontSize: '11.5px',
          color: '#78350F',
          margin: '0 0 10px 0',
          lineHeight: 1.4
        }}
      >
        Select a test identity to bypass OTP and directly inspect or develop role-specific UI pages:
      </p>

      {/* Role Selection Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '6px'
        }}
      >
        {testRoles.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectRole(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 4px',
              background: '#FFFFFF',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#B45309';
              e.currentTarget.style.background = '#FFFBEB';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#FCD34D';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '16px', marginBottom: '2px' }}>{item.icon}</span>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#1E293B',
                textAlign: 'center'
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontSize: '9.5px',
                color: '#64748B',
                textAlign: 'center'
              }}
            >
              {item.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DevAuthSelector;
