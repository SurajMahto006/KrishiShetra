import React from 'react';
import { Users, UserCheck, TrendingUp, ShieldCheck, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const AdminDashboard = () => {
  const recentUsers = [
    { name: 'Ramesh Patil', email: 'ramesh.patil@agri.in', role: 'Farmer', state: 'Maharashtra', kyc: 'Verified', date: '28 Aug 2026' },
    { name: 'Sahyadri Agro FPC Ltd', email: 'contact@sahyadriagro.org', role: 'FPO', state: 'Maharashtra', kyc: 'Verified', date: '26 Aug 2026' },
    { name: 'MahaAgro Sourcing Ltd', email: 'procurement@mahaagro.com', role: 'Buyer', state: 'Maharashtra', kyc: 'Verified', date: '24 Aug 2026' },
    { name: 'Kisan Express Logistics', email: 'ops@kisanexpress.in', role: 'Transporter', state: 'Maharashtra', kyc: 'Verified', date: '20 Aug 2026' }
  ];

  const columns = [
    {
      label: 'User Name / Organization',
      key: 'name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>{row.email}</div>
        </div>
      )
    },
    {
      label: 'Platform Role',
      key: 'role',
      render: (val) => <span className="ks-badge ks-badge--info">{val}</span>
    },
    {
      label: 'State / Region',
      key: 'state',
      render: (val) => <span>{val}</span>
    },
    {
      label: 'KYC Status',
      key: 'kyc',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Registered On',
      key: 'date',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{val}</span>
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Platform Operations & Administration Control
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            KrishiShetra National Agri-Tech Ecosystem Governance & Security Overview
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Total Registered Users"
          value="1,248 Users"
          subtext="856 Farmers · 42 FPOs · 340 Buyers"
          variant="sage"
          icon={Users}
        />
        <StatCard
          label="Gross Trade Volume (YTD)"
          value="₹8.94 Cr"
          subtext="100% Escrow settlements"
          variant="amber"
          icon={DollarSign}
        />
        <StatCard
          label="Pending KYC Reviews"
          value="6 Accounts"
          subtext="Aadhaar / GST / VAHAN checks"
          variant="blue"
          icon={UserCheck}
        />
        <StatCard
          label="Platform Reliability"
          value="99.98%"
          subtext="Zero security incidents"
          variant="sage"
          icon={ShieldCheck}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <Card
          title="Recent Platform User Registrations"
          subtitle="Real-time intake across farmer, FPO, buyer, and transporter roles"
          action={
            <Link to="/admin/users" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage Users <ArrowRight size={14} />
            </Link>
          }
        >
          <Table
            columns={columns}
            data={recentUsers}
            emptyMessage="No recent registrations."
          />
        </Card>

        <Card title="System Integrity & Integration Status" subtitle="Direct connections to government & financial APIs">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'MoRTH VAHAN & Sarathi Telemetry', status: 'Operational', ping: '18ms' },
              { name: 'Agmarknet APMC Price Ingestion', status: 'Operational', ping: '32ms' },
              { name: 'ICICI e-Escrow Banking Gateway', status: 'Operational', ping: '24ms' },
              { name: 'Brevo Transactional Email / SMS Service', status: 'Active', ping: '45ms' }
            ].map((s, idx) => (
              <div key={idx} style={{ padding: '12px 14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13px' }}>{s.name}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>Latency: {s.ping}</div>
                </div>
                <span className="ks-badge ks-badge--success">{s.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
