import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthLayout = ({
  activeTab = 'login', // 'login' | 'register'
  title,
  subtitle,
  error,
  children,
  footer,
  maxWidth = '475px'
}) => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const langNames = {
    en: 'English',
    hi: 'हिन्दी',
    mr: 'मराठी'
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--ks-bg-ivory)',
        overflowX: 'hidden'
      }}
    >
      {/* ── Left Hero Panel (Desktop & Laptop) ── */}
      <aside
        className="auth-hero-panel"
        style={{
          flex: '1 1 45%',
          minWidth: '380px',
          maxWidth: '560px',
          background: 'linear-gradient(160deg, #12372A 0%, #1A4D3B 55%, #0B221A 100%)',
          color: '#FFFFFF',
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Ambient Decorative Circles */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(143,203,155,0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '-15%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,154,114,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Brand Logo */}
        <div style={{ zIndex: 2 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: '#FFFFFF'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8FCB9B 0%, #5B9A72 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#12372A',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              <Sprout size={22} strokeWidth={2.6} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#FFFFFF'
              }}
            >
              KrishiShetra
            </span>
          </Link>
        </div>

        {/* Hero Narrative & Metrics */}
        <div style={{ zIndex: 2, margin: '40px 0' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.2vw, 38px)',
              fontWeight: 700,
              lineHeight: 1.18,
              color: '#FFFFFF',
              marginBottom: '16px'
            }}
          >
            Sell smarter.<br />
            Discover better{' '}
            <em style={{ color: '#8FCB9B', fontStyle: 'italic' }}>markets.</em>
          </h1>
          <p
            style={{
              fontSize: '14.5px',
              color: 'rgba(255, 255, 255, 0.78)',
              lineHeight: 1.55,
              maxWidth: '420px',
              marginBottom: '32px'
            }}
          >
            India's unified agricultural intelligence and direct sourcing platform connecting farmers, FPOs, buyers, and transporters with verified trust.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8FCB9B', display: 'inline-block' }} />
              <span>50,000+ Active Verified Farmers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8FCB9B', display: 'inline-block' }} />
              <span>120+ APMC Mandis Real-Time Pricing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8FCB9B', display: 'inline-block' }} />
              <span>100% Escrow-Protected Trade Contracts</span>
            </div>
          </div>
        </div>

        {/* Hero Footer Note */}
        <div style={{ zIndex: 2, fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
          © {new Date().getFullYear()} KrishiShetra. All rights reserved.
        </div>
      </aside>

      {/* ── Right Content Panel ── */}
      <main
        style={{
          flex: '1 1 55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 20px',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        {/* Top Bar: Language Selector */}
        <div
          style={{
            width: '100%',
            maxWidth,
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '12px'
          }}
        >
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                border: '1px solid var(--ks-border-light)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 12px',
                fontSize: '12.5px',
                color: 'var(--ks-charcoal)',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Globe size={14} color="var(--ks-sage)" />
              <span>{langNames[lang]}</span>
              <span style={{ fontSize: '9px', opacity: 0.6 }}>▼</span>
            </button>

            {showLangMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '34px',
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid var(--ks-border-light)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '4px',
                  zIndex: 100,
                  minWidth: '120px'
                }}
              >
                {Object.entries(langNames).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setLang(key);
                      setShowLangMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 10px',
                      fontSize: '12px',
                      border: 'none',
                      background: lang === key ? 'var(--ks-surface-pale-sage-light)' : 'transparent',
                      color: lang === key ? 'var(--ks-evergreen)' : 'var(--ks-charcoal)',
                      fontWeight: lang === key ? 700 : 500,
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Central Auth Card */}
        <div
          style={{
            width: '100%',
            maxWidth,
            background: '#FFFFFF',
            borderRadius: '18px',
            boxShadow: '0 12px 36px rgba(18, 55, 42, 0.07), 0 2px 8px rgba(18, 55, 42, 0.03)',
            border: '1px solid var(--ks-border-light)',
            padding: '28px 28px',
            margin: 'auto 0'
          }}
        >
          {/* Header Title */}
          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--ks-evergreen)',
                margin: '0 0 4px 0',
                lineHeight: 1.2
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--ks-text-muted)',
                  margin: 0,
                  lineHeight: 1.4
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Segmented Auth Tabs [ Log In | Register ] */}
          <div
            style={{
              display: 'flex',
              background: '#F5F8F6',
              border: '1.5px solid #DCE6DF',
              borderRadius: '9px',
              padding: '3px',
              marginBottom: '16px',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                flex: 1,
                padding: '7px 12px',
                border: 'none',
                borderRadius: '6px',
                background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'login' ? '#12372A' : '#6F7F75',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'login' ? '0 2px 6px rgba(18, 55, 42, 0.08)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: 'var(--font-body)'
              }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                flex: 1,
                padding: '7px 12px',
                border: 'none',
                borderRadius: '6px',
                background: activeTab === 'register' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'register' ? '#12372A' : '#6F7F75',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'register' ? '0 2px 6px rgba(18, 55, 42, 0.08)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: 'var(--font-body)'
              }}
            >
              Register
            </button>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                background: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                color: 'var(--status-error-text)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                marginBottom: '14px',
                lineHeight: 1.4
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Body */}
          {children}

          {/* Footer Link */}
          {footer && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '16px',
                fontSize: '13px',
                color: 'var(--ks-text-muted)'
              }}
            >
              {footer}
            </div>
          )}
        </div>

        {/* Mobile/Bottom Disclaimer */}
        <div style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--ks-text-muted)', textAlign: 'center' }}>
          By continuing, you agree to KrishiShetra's Terms of Service and Privacy Policy.
        </div>
      </main>

      {/* Responsive Style to hide Left Hero Panel on small screens */}
      <style>{`
        @media (max-width: 900px) {
          .auth-hero-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
