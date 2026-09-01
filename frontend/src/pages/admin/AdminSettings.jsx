import React, { useState } from 'react';
import { Settings, Save, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    platformFeePct: '0.75',
    escrowAutoReleaseHrs: '24',
    maxLotSizeMT: '1000',
    brevoSenderEmail: 'alerts@krishishetra.com',
    enableSmsAlerts: true,
    enableAis140Sync: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('System settings successfully saved and applied globally.');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            System Configuration & Platform Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Configure trade settlement parameters, notification webhooks, and security policies.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ maxWidth: '640px' }}>
          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Platform Transaction Fee (%)</label>
              <input
                type="number"
                step="0.01"
                className="ks-input"
                value={settings.platformFeePct}
                onChange={(e) => setSettings({ ...settings, platformFeePct: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Escrow Auto-Release (Hours after delivery)</label>
              <input
                type="number"
                className="ks-input"
                value={settings.escrowAutoReleaseHrs}
                onChange={(e) => setSettings({ ...settings, escrowAutoReleaseHrs: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-label">Brevo Verified Sender Email</label>
            <input
              type="email"
              className="ks-input"
              value={settings.brevoSenderEmail}
              onChange={(e) => setSettings({ ...settings, brevoSenderEmail: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.enableSmsAlerts}
                onChange={(e) => setSettings({ ...settings, enableSmsAlerts: e.target.checked })}
              />
              <span>Enable real-time SMS delivery notifications for farmers & drivers</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.enableAis140Sync}
                onChange={(e) => setSettings({ ...settings, enableAis140Sync: e.target.checked })}
              />
              <span>Enable automatic AIS-140 GPS fleet polling every 60 seconds</span>
            </label>
          </div>

          <Button type="submit" variant="primary" icon={Save}>
            Save System Settings
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminSettings;
