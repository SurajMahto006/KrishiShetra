import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'farmer',
    password: ''
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await register(formData);
    if (res.success) {
      navigate(`/${formData.role}/dashboard`);
    } else {
      setError(res.message || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ks-bg-ivory)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--ks-border-light)', padding: '36px 32px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #8FCB9B 0%, #5B9A72 50%, #12372A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', margin: '0 auto 12px' }}>
            <Sprout size={26} strokeWidth={2.4} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--ks-evergreen)' }}>
            Join KrishiShetra
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ks-text-muted)', marginTop: '4px' }}>
            Direct Agricultural Market & Logistics Network
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '18px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="ks-form-group">
            <label className="ks-label">Full Name / Organization</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
              <input
                type="text"
                name="name"
                className="ks-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Suraj Mahto"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
              <input
                type="email"
                name="email"
                className="ks-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
              <input
                type="tel"
                name="phone"
                className="ks-input"
                style={{ paddingLeft: '38px' }}
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-label">Account Role & Workspace</label>
            <select
              name="role"
              className="ks-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="farmer">Farmer (Producer / Grower)</option>
              <option value="fpo">FPO (Farmer Producer Organization / Aggregator)</option>
              <option value="buyer">Buyer (Trader / Processor / Wholesaler)</option>
              <option value="transporter">Transporter (Logistics / Fleet Owner)</option>
            </select>
          </div>

          <div className="ks-form-group">
            <label className="ks-label">Create Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--ks-text-muted)' }} />
              <input
                type="password"
                name="password"
                className="ks-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
            style={{ width: '100%', marginTop: '6px' }}
          >
            Create Verified Account
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--ks-text-muted)', borderTop: '1px solid var(--ks-border-subtle)', paddingTop: '16px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--ks-sage)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
