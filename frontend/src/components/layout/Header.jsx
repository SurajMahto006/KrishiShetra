import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Bell, Globe, LogOut, ChevronDown, User, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navigation from './Navigation';

const ROLE_BADGE_CONFIG = {
  farmer: 'Farmer',
  fpo: 'FPO Hub',
  buyer: 'Buyer Hub',
  transporter: 'Transporter Hub',
  admin: 'Admin Hub'
};

export const Header = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const profileRef = useRef(null);
  const langRef = useRef(null);

  const roleLabel = ROLE_BADGE_CONFIG[(role || 'farmer').toLowerCase()] || 'Farmer';

  // Close mobile drawer on route changes
  useEffect(() => {
    setShowMobileNav(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'KS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="ks-header">
      <div className="app-container ks-header__inner">
        {/* Brand Logo */}
        <Link to={`/${role || 'farmer'}/dashboard`} className="ks-brand">
          <div className="ks-brand__logo-icon">
            <Sprout size={22} strokeWidth={2.4} />
          </div>
          <span className="ks-brand__text">
            KrishiShetra
            <span className="ks-brand__badge">{roleLabel}</span>
          </span>
        </Link>

        {/* Dynamic Desktop Navigation */}
        <Navigation role={role} />

        {/* Header Right Actions */}
        <div className="ks-header__actions">
          {/* Language Switcher */}
          <div style={{ position: 'relative' }} ref={langRef}>
            <button
              className="ks-icon-btn"
              title="Change Language"
              onClick={() => setShowLangMenu(!showLangMenu)}
              aria-label="Language selection"
            >
              <Globe size={18} />
            </button>
            {showLangMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '140px',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--ks-border-light)',
                  padding: '6px',
                  zIndex: 1100
                }}
              >
                {[
                  { code: 'EN', label: 'English' },
                  { code: 'HI', label: 'हिन्दी (Hindi)' },
                  { code: 'MR', label: 'मराठी (Marathi)' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: selectedLang === lang.code ? 'var(--ks-sage-dark)' : 'var(--ks-charcoal)',
                      fontWeight: selectedLang === lang.code ? 700 : 500,
                      borderRadius: 'var(--radius-xs)',
                      background: selectedLang === lang.code ? 'var(--ks-surface-pale-sage)' : 'transparent'
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Icon */}
          <button className="ks-icon-btn" title="Notifications" aria-label="Notifications">
            <Bell size={18} />
            <span className="ks-badge-dot" />
          </button>

          {/* User Profile Menu with Unified Logout */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              className="ks-user-menu"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="User account menu"
            >
              <div className="ks-avatar">
                {getInitials(user?.name || user?.email)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'My Account'}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--ks-text-on-dark-sub)' }} />
            </button>

            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '240px',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--ks-border-light)',
                  padding: '8px',
                  zIndex: 1100
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--ks-border-subtle)', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '14px' }}>
                    {user?.name || 'Krishi User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email || 'user@krishishetra.com'}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span className="ks-badge ks-badge--success" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      <Shield size={10} /> Verified {roleLabel}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/${role || 'farmer'}/profile`}
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    fontSize: '13px',
                    color: 'var(--ks-charcoal)',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ks-surface-pale-sage-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={15} color="var(--ks-text-muted)" /> Profile & Settings
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    fontSize: '13px',
                    color: 'var(--ks-terracotta)',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-xs)',
                    marginTop: '4px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ks-surface-terracotta)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} color="var(--ks-terracotta)" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="ks-icon-btn mobile-only-toggle"
            onClick={() => setShowMobileNav(!showMobileNav)}
            aria-label="Toggle navigation menu"
            style={{ display: 'none' }}
          >
            {showMobileNav ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {showMobileNav && (
        <div
          style={{
            background: 'var(--ks-evergreen-dark)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            <Navigation role={role} />
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(201, 109, 91, 0.15)',
              border: '1px solid rgba(201, 109, 91, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#FFA89B',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
