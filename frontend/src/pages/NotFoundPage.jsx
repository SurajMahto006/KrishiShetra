import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ks-bg-ivory)', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '440px', background: '#FFFFFF', padding: '40px 32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--ks-border-light)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #8FCB9B 0%, #5B9A72 50%, #12372A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', margin: '0 auto 16px' }}>
          <Sprout size={26} strokeWidth={2.4} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ks-evergreen)', marginBottom: '8px' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)', marginBottom: '24px' }}>
          The workspace page or link you requested does not exist or has been moved.
        </p>
        <Link to="/login">
          <Button variant="primary" icon={ArrowLeft}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
