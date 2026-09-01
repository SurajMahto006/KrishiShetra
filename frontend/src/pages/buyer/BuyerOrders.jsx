import React from 'react';
import { ShieldCheck, Download, Truck, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const BuyerOrders = () => {
  const orders = [
    { orderId: 'ORD-98421', seller: 'Sahyadri FPO Consortium', commodity: 'Red Onion Garwa', qty: '100 MT', amount: '₹24,50,000', status: 'In Transit', escrowStatus: 'Locked in Escrow' },
    { orderId: 'ORD-98110', seller: 'MahaAgro Food Processing Ltd', commodity: 'Soybean (Yellow)', qty: '80 MT', amount: '₹39,12,000', status: 'Delivered', escrowStatus: 'Disbursed' }
  ];

  const columns = [
    {
      label: 'Order ID',
      key: 'orderId',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'FPO / Supplier',
      key: 'seller',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Commodity',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.qty}</div>
        </div>
      )
    },
    {
      label: 'Order Amount',
      key: 'amount',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{val}</span>
    },
    {
      label: 'Escrow Protection',
      key: 'escrowStatus',
      render: (val) => <span className="ks-badge ks-badge--success"><ShieldCheck size={12} /> {val}</span>
    },
    {
      label: 'Fulfillment Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Actions',
      key: 'action',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="secondary" size="sm" icon={Download}>
            Invoice
          </Button>
          {row.status === 'In Transit' && (
            <Button variant="primary" size="sm" icon={CheckCircle}>
              Approve Delivery
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Procurement Orders & Escrow Settlements
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Executed trade orders, quality inspection certificates, and escrow release controls.
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={orders}
          emptyMessage="No executed procurement orders."
        />
      </Card>
    </div>
  );
};

export default BuyerOrders;
