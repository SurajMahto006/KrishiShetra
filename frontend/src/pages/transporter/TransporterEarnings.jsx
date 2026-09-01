import React from 'react';
import { Wallet, Download, ArrowUpRight, DollarSign, CreditCard } from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';

export const TransporterEarnings = () => {
  const payouts = [
    { id: 'PAY-4412', tripId: 'TRP-874', route: 'Nashik ➔ JNPT Port (Export Onion)', grossFreight: '₹42,000', tollFASTag: '₹1,450', netMargin: '₹40,550', date: '27 Aug 2026', status: 'Settled' },
    { id: 'PAY-4401', tripId: 'TRP-869', route: 'Pimpalgaon ➔ Delhi (Tomato Hybrid)', grossFreight: '₹1,18,000', tollFASTag: '₹4,800', netMargin: '₹1,13,200', date: '21 Aug 2026', status: 'Settled' },
    { id: 'PAY-4389', tripId: 'TRP-855', route: 'Indore ➔ Mumbai (Wheat 35 MT)', grossFreight: '₹68,000', tollFASTag: '₹2,600', netMargin: '₹65,400', date: '16 Aug 2026', status: 'Settled' }
  ];

  const columns = [
    {
      label: 'Settlement ID',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Trip Details',
      key: 'route',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>Trip: {row.tripId}</div>
        </div>
      )
    },
    {
      label: 'Gross Freight',
      key: 'grossFreight',
      render: (val) => <span style={{ fontWeight: 700 }}>{val}</span>
    },
    {
      label: 'FASTag Deductions',
      key: 'tollFASTag',
      render: (val) => <span style={{ color: 'var(--ks-text-muted)', fontSize: '12.5px' }}>{val}</span>
    },
    {
      label: 'Net Margin (Bank Payout)',
      key: 'netMargin',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)', fontSize: '15px' }}>{val}</span>
    },
    {
      label: 'Action',
      key: 'action',
      render: () => (
        <Button variant="secondary" size="sm" icon={Download}>
          Tax Invoice
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Freight Payouts & Financial Ledger
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Instant electronic proof of delivery settlements with automated FASTag accounting.
          </p>
        </div>
        <Button variant="primary" icon={ArrowUpRight} onClick={() => alert('Instant withdrawal requested to verified bank account.')}>
          Instant Bank Withdrawal
        </Button>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Available Wallet Balance"
          value="₹84,200"
          subtext="Ready for immediate IMPS/NEFT"
          variant="sage"
          icon={Wallet}
        />
        <StatCard
          label="Gross Freight This Month"
          value="₹4,82,000"
          subtext="+18.4% vs July earnings"
          variant="amber"
          icon={DollarSign}
        />
        <StatCard
          label="Settled Invoices"
          value="28 Trips"
          subtext="100% Zero-dispute clearance"
          variant="blue"
          icon={CreditCard}
        />
      </div>

      <Card>
        <Table
          columns={columns}
          data={payouts}
          emptyMessage="No freight payouts recorded."
        />
      </Card>
    </div>
  );
};

export default TransporterEarnings;
