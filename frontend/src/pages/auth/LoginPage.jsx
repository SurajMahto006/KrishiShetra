import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(email, password);
    if (res.success) {
      const userRole = res.role || 'farmer';
      navigate(`/${userRole}/dashboard`);
    } else {
      setError(res.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ks-bg-ivory)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--ks-border-light)', padding: '36px 32px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #8FCB9B 0%, #5B9A72 50%, #12372A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', margin: '0 auto 14px', boxShadow: '0 4px 14px rgba(18, 55, 42, 0.25)' }}>
            <Sprout size={26} strokeWidth={2.4} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--ks-evergreen)' }}>
            Welcome to KrishiShetra
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--ks-text-muted)', marginTop: '4px' }}>
            Unified Agricultural Tech Platform & Marketplace
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '20px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="ks-form-group">
            <label className="ks-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
              <input
                id="email"
                type="email"
                className="ks-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
              <input
                id="password"
                type="password"
                className="ks-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', fontSize: '12.5px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ks-text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a href="#" style={{ color: 'var(--ks-sage)', fontWeight: 600 }}>Forgot password?</a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
            style={{ width: '100%' }}
          >
            Sign In to Workspace
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--ks-text-muted)', borderTop: '1px solid var(--ks-border-subtle)', paddingTop: '18px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--ks-sage)', fontWeight: 700 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
