import React from 'react';
import { FileText, Download, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const FpoOrders = () => {
  const contracts = [
    { contractId: 'FPO-ORD-8821', corporateBuyer: 'Sahyadri Agro Mega Food Park', commodity: 'Red Onion Export Graded', volume: '400 MT', totalValue: '₹1,04,00,000', status: 'In Transit', escrow: 'Funded (100%)' },
    { contractId: 'FPO-ORD-8804', corporateBuyer: 'MahaAgro Food Processing Ltd', commodity: 'Soybean (Yellow)', volume: '250 MT', totalValue: '₹1,23,75,000', status: 'Delivered', escrow: 'Released' },
    { contractId: 'FPO-ORD-8790', corporateBuyer: 'Reliance Retail Agri Sourcing', commodity: 'Tomato Hybrid', volume: '150 MT', totalValue: '₹23,25,000', status: 'Delivered', escrow: 'Released' }
  ];

  const columns = [
    {
      label: 'Contract ID',
      key: 'contractId',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Institutional Buyer',
      key: 'corporateBuyer',
      render: (val) => <span style={{ fontWeight: 700 }}>{val}</span>
    },
    {
      label: 'Commodity & Volume',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.volume}</div>
        </div>
      )
    },
    {
      label: 'Contract Value',
      key: 'totalValue',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{val}</span>
    },
    {
      label: 'Escrow Status',
      key: 'escrow',
      render: (val) => <span className="ks-badge ks-badge--success"><ShieldCheck size={12} /> {val}</span>
    },
    {
      label: 'Fulfillment Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Action',
      key: 'action',
      render: () => (
        <Button variant="secondary" size="sm" icon={Download}>
          Agreement
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            FPO Supply Contracts & Institutional Orders
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            B2B trade contracts, digital warehouse receipts, and automated escrow disbursements.
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={contracts}
          emptyMessage="No institutional supply contracts yet."
        />
      </Card>
    </div>
  );
};

export default FpoOrders;
