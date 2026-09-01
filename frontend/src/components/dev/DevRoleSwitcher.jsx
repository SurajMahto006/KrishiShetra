import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LogOut, ChevronUp, ChevronDown, UserCheck } from 'lucide-react';
import { useAuth, DEV_TEST_USERS } from '../../context/AuthContext';

export const DevRoleSwitcher = () => {
  if (!import.meta.env.DEV) return null;

  const { isDevSession, role, switchDevRole, logout } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  if (!isDevSession) return null;

  const roles = [
    { id: 'farmer', label: 'Farmer', path: '/farmer/dashboard' },
    { id: 'fpo', label: 'FPO', path: '/fpo/dashboard' },
    { id: 'buyer', label: 'Buyer', path: '/buyer/dashboard' },
    { id: 'transporter', label: 'Transporter', path: '/transporter/dashboard' },
    { id: 'admin', label: 'Admin', path: '/admin/dashboard' }
  ];

  const currentRole = (role || 'farmer').toLowerCase();

  const handleRoleChange = (newRoleId) => {
    if (newRoleId === currentRole) return;
    switchDevRole(newRoleId);
    navigate(`/${newRoleId}/dashboard`, { replace: true });
  };

  const handleDevLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      aria-label="Development Role Switcher"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: '#111827',
        color: '#F9FAFB',
        borderRadius: '12px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35), 0 4px 10px rgba(0, 0, 0, 0.2)',
        border: '1px solid #374151',
        padding: isMinimized ? '8px 12px' : '14px 16px',
        fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)',
        width: isMinimized ? 'auto' : '280px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header / Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          cursor: isMinimized ? 'pointer' : 'default'
        }}
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'inline-block'
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#FBBF24'
            }}
          >
            DEVELOPMENT MODE
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          title={isMinimized ? 'Expand Switcher' : 'Minimize Switcher'}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Content */}
      {!isMinimized && (
        <div style={{ marginTop: '10px' }}>
          <div
            style={{
              fontSize: '12px',
              color: '#D1D5DB',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Working as:</span>
            <span
              style={{
                color: '#34D399',
                fontWeight: 700,
                textTransform: 'capitalize',
                background: 'rgba(52, 211, 153, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {currentRole}
            </span>
          </div>

          {/* Test Role Quick Select Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              marginBottom: '12px'
            }}
          >
            {roles.map((item) => {
              const isActive = currentRole === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRoleChange(item.id)}
                  style={{
                    padding: '7px 6px',
                    fontSize: '11px',
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: '6px',
                    border: isActive ? '1.5px solid #10B981' : '1px solid #374151',
                    background: isActive ? '#065F46' : '#1F2937',
                    color: isActive ? '#FFFFFF' : '#D1D5DB',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#1F2937';
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleDevLogout}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 10px',
                fontSize: '11.5px',
                color: '#F87171',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
            >
              <LogOut size={13} /> Exit Dev Session
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DevRoleSwitcher;
