import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/common/Button';
import DevAuthSelector from '../../components/dev/DevAuthSelector';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      activeTab="login"
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
      error={error}
      footer={footer}
      maxWidth="475px"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Address */}
        <div className="ks-form-group" style={{ marginBottom: '12px' }}>
          <label className="ks-label" htmlFor="login-email" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
            <input
              id="login-email"
              type="email"
              className="ks-input"
              style={{ paddingLeft: '38px', height: '40px', fontSize: '13.5px' }}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="ks-form-group" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="ks-label" htmlFor="login-password" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Password
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link will be sent to your verified email.');
              }}
              style={{ fontSize: '11.5px', color: 'var(--ks-sage)', fontWeight: 600, textDecoration: 'none' }}
            >
              Forgot password?
            </a>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="ks-input"
              style={{ paddingLeft: '38px', paddingRight: '38px', height: '40px', fontSize: '13.5px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--ks-text-muted)',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '12.5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ks-text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked disabled={loading} /> Remember me on this device
          </label>
        </div>

        {/* Submit CTA */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          icon={ArrowRight}
          iconPosition="right"
          style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: 'var(--radius-full)' }}
        >
          {loading ? 'Signing in...' : 'Log In to Workspace'}
        </Button>
      </form>

      {/* Local Vite Development Role Selection */}
      {import.meta.env.DEV && <DevAuthSelector />}
    </AuthLayout>
  );
};

export default LoginPage;
