import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/common/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const res = await login(email.trim(), password);
    if (res.success) {
      const userRole = (res.role || 'farmer').toLowerCase();
      navigate(`/${userRole}/dashboard`, { replace: true });
    } else {
      setError(res.message || 'Invalid email or password. Please verify your credentials.');
    }
  };

  const footer = (
    <>
      Don't have an account?{' '}
      <Link to="/register" style={{ color: 'var(--ks-sage)', fontWeight: 700 }}>
        Create an account
      </Link>
    </>
  );

  return (
    <AuthLayout
      title="Welcome to KrishiShetra"
      subtitle="Sign in to continue to your agricultural workspace."
      error={error}
      footer={footer}
      maxWidth="440px"
    >
      <form onSubmit={handleSubmit}>
        <div className="ks-form-group">
          <label className="ks-label" htmlFor="login-email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
            <input
              id="login-email"
              type="email"
              className="ks-input"
              style={{ paddingLeft: '38px' }}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </div>

        <div className="ks-form-group">
          <label className="ks-label" htmlFor="login-password">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
            <input
              id="login-password"
              type="password"
              className="ks-input"
              style={{ paddingLeft: '38px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', fontSize: '12.5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ks-text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked disabled={loading} /> Remember me
          </label>
          <a href="#" style={{ color: 'var(--ks-sage)', fontWeight: 600 }}>Forgot password?</a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          icon={ArrowRight}
          iconPosition="right"
          style={{ width: '100%' }}
        >
          {loading ? 'Signing in...' : 'Sign In to Workspace'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
