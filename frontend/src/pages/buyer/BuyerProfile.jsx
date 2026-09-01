import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  ShieldCheck,
  Save,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import { useAuth } from '../../context/AuthContext';
import buyerService from '../../services/buyerService';

export const BuyerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [profile, setProfile] = useState({
    businessName: '',
    businessType: 'Wholesaler',
    gstin: '',
    pan: '',
    contactPerson: '',
    phone: '',
    alternatePhone: '',
    address: {
      street: '',
      city: '',
      district: '',
      state: 'Maharashtra',
      pincode: ''
    },
    procurementInterests: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buyerService.getProfile();
      if (res?.success && res.data) {
        const d = res.data;
        setProfile({
          businessName: d.businessName || '',
          businessType: d.businessType || 'Wholesaler',
          gstin: d.gstin || '',
          pan: d.pan || '',
          contactPerson: d.contactPerson || user?.name || '',
          phone: d.phone || '',
          alternatePhone: d.alternatePhone || '',
          address: {
            street: d.address?.street || '',
            city: d.address?.city || '',
            district: d.address?.district || '',
            state: d.address?.state || 'Maharashtra',
            pincode: d.address?.pincode || ''
          },
          procurementInterests: Array.isArray(d.procurementInterests) ? d.procurementInterests.join(', ') : (d.procurementInterests || '')
        });
      } else {
        // Pre-fill with existing user auth info
        setProfile(prev => ({
          ...prev,
          contactPerson: user?.name || '',
          businessName: user?.name ? `${user.name} Procurement Hub` : ''
        }));
      }
    } catch (err) {
      console.warn('Profile not initialized yet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg('');

    try {
      const interestsArray = profile.procurementInterests
        ? profile.procurementInterests.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        ...profile,
        procurementInterests: interestsArray
      };

      const res = await buyerService.updateProfile(payload);
      if (res?.success) {
        setSuccessMsg('Buyer organization profile successfully updated!');
      } else {
        setError(res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Buyer Organization & Verification Profile
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Maintain company tax credentials, primary procurement hubs, and delivery addresses.
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', color: 'var(--status-success-text)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13.5px', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13.5px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Card>
          <Skeleton height={320} />
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSaveProfile} style={{ maxWidth: '800px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ks-evergreen)', marginBottom: '16px', borderBottom: '1px solid var(--ks-border-subtle)', paddingBottom: '8px' }}>
              Business Identity & Taxation
            </h3>

            <div className="grid-2">
              <div className="ks-form-group">
                <label className="ks-label">Business / Corporate Name *</label>
                <input
                  type="text"
                  className="ks-input"
                  placeholder="e.g. Sahyadri Agri Procurement Ltd"
                  value={profile.businessName}
                  onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="ks-form-group">
                <label className="ks-label">Business Type</label>
                <select
                  className="ks-select"
                  value={profile.businessType}
                  onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                >
                  <option value="Wholesaler">Wholesaler / Mandi Trader</option>
                  <option value="Processor">Agro Processing Unit / Mill</option>
                  <option value="Exporter">Perishable Produce Exporter</option>
                  <option value="Retailer">Supermarket / Retail Chain</option>
                  <option value="Institutional">Institutional Canteen / Catering</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="ks-form-group">
                <label className="ks-label">GST Identification Number (GSTIN)</label>
                <input
                  type="text"
                  className="ks-input"
                  placeholder="e.g. 27AAACL1234F1ZV"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="ks-form-group">
                <label className="ks-label">Company PAN</label>
                <input
                  type="text"
                  className="ks-input"
                  placeholder="e.g. AAACL1234F"
                  value={profile.pan}
                  onChange={(e) => setProfile({ ...profile, pan: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ks-evergreen)', margin: '24px 0 16px', borderBottom: '1px solid var(--ks-border-subtle)', paddingBottom: '8px' }}>
              Primary Contact & Communications
            </h3>

            <div className="grid-2">
              <div className="ks-form-group">
                <label className="ks-label">Contact Person Name *</label>
                <input
                  type="text"
                  className="ks-input"
                  placeholder="e.g. Vikram Deshmukh"
                  value={profile.contactPerson}
                  onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                  required
                />
              </div>
              <div className="ks-form-group">
                <label className="ks-label">Primary Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  className="ks-input"
                  placeholder="e.g. 9822011442"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ks-evergreen)', margin: '24px 0 16px', borderBottom: '1px solid var(--ks-border-subtle)', paddingBottom: '8px' }}>
              Registered Delivery & Billing Address
            </h3>

            <div className="ks-form-group">
              <label className="ks-label">Warehouse / Office Street Address</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Plot 14, APMC Commercial Complex"
                value={profile.address.street}
                onChange={(e) => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })}
              />
            </div>

            <div className="grid-3">
              <div className="ks-form-group">
                <label className="ks-label">City / Mandi Hub</label>
                <input
                  type="text"
                  className="ks-input"
                  placeholder="e.g. Navi Mumbai"
                  value={profile.address.city}
                  onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
                />
              </div>
              <div className="ks-form-group">
                <label className="ks-label">State</label>
                <input
                  type="text"
                  className="ks-input"
                  value={profile.address.state}
                  onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })}
                />
              </div>
              <div className="ks-form-group">
                <label className="ks-label">Pincode</label>
                <input
                  type="text"
                  className="ks-input"
                  placeholder="e.g. 400703"
                  maxLength={6}
                  value={profile.address.pincode}
                  onChange={(e) => setProfile({ ...profile, address: { ...profile.address, pincode: e.target.value } })}
                />
              </div>
            </div>

            <div className="ks-form-group" style={{ marginTop: '14px' }}>
              <label className="ks-label">Primary Procurement Crops of Interest (comma-separated)</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Red Onion, Soybean, Wheat, Tomato, Grapes"
                value={profile.procurementInterests}
                onChange={(e) => setProfile({ ...profile, procurementInterests: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <Button type="submit" variant="primary" icon={Save} loading={saving}>
                Save Organization Profile
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default BuyerProfile;
