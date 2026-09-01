import React from 'react';
import { BarChart2, Download, TrendingUp, DollarSign } from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';

export const AdminReports = () => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Ecosystem Analytics & Compliance Reports
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Consolidated mandi arrival turnover, price stabilization indices, and audit trails.
          </p>
        </div>
        <Button variant="primary" icon={Download}>
          Export Monthly Regulatory Report (PDF)
        </Button>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Total Trade Value (Aug 2026)"
          value="₹3.14 Cr"
          subtext="+22.5% Month-over-Month"
          variant="sage"
          icon={DollarSign}
        />
        <StatCard
          label="Escrow Dispute Rate"
          value="0.04%"
          subtext="Industry leading zero-loss metric"
          variant="blue"
          icon={BarChart2}
        />
        <StatCard
          label="APMC Mandis Onboarded"
          value="84 Terminals"
          subtext="Active price feed streams"
          variant="amber"
          icon={TrendingUp}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card title="Commodity Volume Breakdown" subtitle="Top traded agricultural commodities across platform">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { crop: 'Red Onion (Garwa)', share: '38% of Total Volume', val: '4,200 MT' },
              { crop: 'Soybean (Yellow)', share: '28% of Total Volume', val: '3,100 MT' },
              { crop: 'Wheat (Sharbati & Lokwan)', share: '20% of Total Volume', val: '2,200 MT' },
              { crop: 'Tomato & Vegetables', share: '14% of Total Volume', val: '1,550 MT' }
            ].map((c, idx) => (
              <div key={idx} style={{ padding: '12px 14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13.5px' }}>{c.crop}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{c.share}</div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{c.val}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Grievance Redressal & Support Audit" subtitle="Resolution performance for farmer and buyer tickets">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { category: 'Weighbridge Assay Calibration', status: 'Resolved in 2.4 hrs', count: '14 Tickets' },
              { category: 'Cold Chain Temp Deviation Flag', status: 'Resolved in 45 mins', count: '3 Tickets' },
              { category: 'Escrow Release Authorization', status: 'Instant automated', count: '88 Transactions' }
            ].map((g, idx) => (
              <div key={idx} style={{ padding: '12px 14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)' }}>
                <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13.5px' }}>{g.category}</div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)', marginTop: 2 }}>{g.status} · <strong>{g.count}</strong></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
