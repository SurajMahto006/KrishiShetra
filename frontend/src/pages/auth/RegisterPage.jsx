import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/common/Button';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'farmer',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    const { confirmPassword, ...registerPayload } = formData;
    const res = await register({
      ...registerPayload,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim()
    });

    if (res.success) {
      const userRole = (formData.role || 'farmer').toLowerCase();
      navigate(`/${userRole}/dashboard`, { replace: true });
    } else {
      setError(res.message || 'Registration failed. Please check your information.');
    }
  };

  const footer = (
    <>
      Already have an account?{' '}
      <Link to="/login" style={{ color: 'var(--ks-sage)', fontWeight: 700 }}>
        Sign In
      </Link>
    </>
  );

  return (
    <AuthLayout
      title="Join KrishiShetra"
      subtitle="Create your verified agricultural trade account."
      error={error}
      footer={footer}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="ks-form-group" style={{ marginBottom: '12px' }}>
          <label className="ks-label" htmlFor="register-name">Full Name / Organization Name</label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              id="register-name"
              type="text"
              name="name"
              className="ks-input"
              style={{ paddingLeft: '38px', height: '40px' }}
              placeholder="e.g. Ramesh Patil / Sahyadri Agro"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="ks-form-group" style={{ marginBottom: '12px' }}>
          <label className="ks-label" htmlFor="register-email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              id="register-email"
              type="email"
              name="email"
              className="ks-input"
              style={{ paddingLeft: '38px', height: '40px' }}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </div>

        {/* Phone Number & Role Selector in 2-Column Grid */}
        <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
          <div className="ks-form-group" style={{ marginBottom: 0 }}>
            <label className="ks-label" htmlFor="register-phone">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
              <input
                id="register-phone"
                type="tel"
                name="phone"
                className="ks-input"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="ks-form-group" style={{ marginBottom: 0 }}>
            <label className="ks-label" htmlFor="register-role">Workspace Role</label>
            <select
              id="register-role"
              name="role"
              className="ks-select"
              style={{ height: '40px', fontSize: '13px' }}
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="farmer">Farmer (Producer)</option>
              <option value="fpo">FPO (Aggregator)</option>
              <option value="buyer">Buyer (Trader / Mill)</option>
              <option value="transporter">Transporter (Fleet)</option>
            </select>
          </div>
        </div>

        {/* Password & Confirm Password in 2-Column Grid */}
        <div className="grid-2" style={{ gap: '12px', marginBottom: '18px' }}>
          <div className="ks-form-group" style={{ marginBottom: 0 }}>
            <label className="ks-label" htmlFor="register-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
              <input
                id="register-password"
                type="password"
                name="password"
                className="ks-input"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
                placeholder="Min 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          <div className="ks-form-group" style={{ marginBottom: 0 }}>
            <label className="ks-label" htmlFor="register-confirm">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
              <input
                id="register-confirm"
                type="password"
                name="confirmPassword"
                className="ks-input"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>
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
          {loading ? 'Creating Account...' : 'Create Verified Account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
