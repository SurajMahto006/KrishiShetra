import React from 'react';
import { CreditCard, Download, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';

export const BuyerPayments = () => {
  const transactions = [
    { id: 'TXN-77401', orderId: 'ORD-98421', description: 'Escrow Lock: 100 MT Onion Garwa', amount: '₹24,50,000', type: 'Escrow Locked', date: '28 Aug 2026', status: 'Completed' },
    { id: 'TXN-77392', orderId: 'ORD-98110', description: 'Escrow Released to MahaAgro FPO', amount: '₹39,12,000', type: 'Payout Released', date: '22 Aug 2026', status: 'Completed' },
    { id: 'TXN-77280', orderId: 'ORD-97855', description: 'Escrow Released to Reliance Sourcing', amount: '₹7,75,000', type: 'Payout Released', date: '15 Aug 2026', status: 'Completed' }
  ];

  const columns = [
    {
      label: 'Transaction ID',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Linked Order',
      key: 'orderId',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Description',
      key: 'description',
      render: (val) => <span>{val}</span>
    },
    {
      label: 'Amount',
      key: 'amount',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{val}</span>
    },
    {
      label: 'Type',
      key: 'type',
      render: (val) => <span className="ks-badge ks-badge--info">{val}</span>
    },
    {
      label: 'Date',
      key: 'date',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{val}</span>
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Financial Ledger & Escrow Account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            ICICI e-Escrow trade protection, GST compliant tax invoices, and release history.
          </p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Available Escrow Balance"
          value="₹14,50,000"
          subtext="Ready for instant trade commitments"
          variant="sage"
          icon={CreditCard}
        />
        <StatCard
          label="Currently Locked in Transit"
          value="₹24,50,000"
          subtext="Released upon weighbridge confirmation"
          variant="amber"
          icon={ShieldCheck}
        />
        <StatCard
          label="Total Procured (FY 26-27)"
          value="₹71,37,000"
          subtext="100% On-time settlements"
          variant="blue"
          icon={CreditCard}
        />
      </div>

      <Card>
        <Table
          columns={columns}
          data={transactions}
          emptyMessage="No financial transaction records found."
        />
      </Card>
    </div>
  );
};

export default BuyerPayments;
