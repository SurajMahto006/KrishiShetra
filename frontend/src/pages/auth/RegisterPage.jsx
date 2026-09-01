import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Tractor, Users, Store, Truck } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'farmer', label: 'Farmer', icon: Tractor },
    { id: 'fpo', label: 'FPO', icon: Users },
    { id: 'buyer', label: 'Buyer', icon: Store },
    { id: 'transporter', label: 'Transporter', icon: Truck }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (roleId) => {
    setFormData({ ...formData, role: roleId });
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
        Log In
      </Link>
    </>
  );

  return (
    <AuthLayout
      activeTab="register"
      title="Create an Account"
      subtitle="Join KrishiShetra's agricultural trade & logistics network"
      error={error}
      footer={footer}
      maxWidth="475px"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Role Selector Pills */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#12372A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
            I am a...
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = formData.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    padding: '6px 2px',
                    background: isSelected ? '#E5F0E7' : '#FFFFFF',
                    border: isSelected ? '1.5px solid #5B9A72' : '1.5px solid #DCE6DF',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(91, 154, 114, 0.15)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: isSelected ? '#5B9A72' : 'rgba(91, 154, 114, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#FFFFFF' : '#2D5A3D'
                    }}
                  >
                    <Icon size={13} strokeWidth={2.4} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? '#12372A' : '#17221D' }}>
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Col Grid: Name and Mobile Number */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div className="ks-form-group" style={{ marginBottom: 0 }}>
            <label className="ks-label" htmlFor="reg-name" style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--ks-text-muted)' }} />
              <input
                id="reg-name"
                type="text"
                name="name"
                className="ks-input"
                style={{ paddingLeft: '32px', height: '38px', fontSize: '13px' }}
                placeholder="Ramesh Patil"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="ks-form-group" style={{ marginBottom: 0 }}>
            <label className="ks-label" htmlFor="reg-phone" style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
              Mobile
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--ks-text-muted)' }} />
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                className="ks-input"
                style={{ paddingLeft: '32px', height: '38px', fontSize: '13px' }}
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div className="ks-form-group" style={{ marginBottom: '8px' }}>
          <label className="ks-label" htmlFor="reg-email" style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              id="reg-email"
              type="email"
              name="email"
              className="ks-input"
              style={{ paddingLeft: '32px', height: '38px', fontSize: '13px' }}
              placeholder="farmer@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </div>

        {/* 2-Col Grid: Password & Confirm Password */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          <div className="ks-form-group" style={{ marginBottom: 0 }}>
            <label className="ks-label" htmlFor="reg-pass" style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--ks-text-muted)' }} />
              <input
                id="reg-pass"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="ks-input"
                style={{ paddingLeft: '32px', paddingRight: '28px', height: '38px', fontSize: '13px' }}
                placeholder="Min 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ks-text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="ks-form-group" style={{ marginBottom: 0 }}>
            <label className="ks-label" htmlFor="reg-confirm" style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--ks-text-muted)' }} />
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="ks-input"
                style={{ paddingLeft: '32px', height: '38px', fontSize: '13px' }}
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
          {loading ? 'Creating Account...' : 'Register & Join Network'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
