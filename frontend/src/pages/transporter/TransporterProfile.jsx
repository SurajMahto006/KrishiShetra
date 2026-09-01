import React from 'react';
import { UserCheck, ShieldCheck, Award, FileText, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';

export const TransporterProfile = () => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Carrier KYC & Compliance Certifications
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Official government validations and agricultural cold-chain handling badges.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        <Card title="Carrier Credentials & Business Identity" subtitle="Kisan Express Transporters Pvt Ltd">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', fontSize: '13.5px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>GST Identification Number</div>
              <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>27AABCK8842K1Z9 (Verified)</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>VAHAN Fleet Registry</div>
              <div style={{ fontWeight: 700 }}>MH-15-COMM-449102</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Carrier Platform Tier</div>
              <div style={{ fontWeight: 700, color: 'var(--ks-amber-dark)' }}>Gold Verified Carrier ✓</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Operating Headquarters</div>
              <div style={{ fontWeight: 600 }}>Niphad Bypass, Nashik, Maharashtra</div>
            </div>
          </div>
        </Card>

        <Card title="Cold-Chain Certifications" subtitle="Authorized for APEDA perishable exports">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { cert: 'APEDA Cold Chain Certified', desc: 'Conforms to pre-cooling & cold reefer standards', date: 'Valid until 2028' },
              { cert: 'FSSAI Food Safety Transport License', desc: 'Hygienic produce transit protocol', date: 'Valid until 2027' },
              { cert: 'AIS-140 Live Telemetry Integration', desc: 'MoRTH compliant continuous tracking', date: 'Active' }
            ].map((c, idx) => (
              <div key={idx} style={{ padding: '12px 14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13.5px' }}>
                  <ShieldCheck size={15} color="var(--ks-sage)" /> {c.cert}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)', marginTop: 2 }}>{c.desc}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ks-sage-dark)', marginTop: 4 }}>✓ {c.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransporterProfile;
