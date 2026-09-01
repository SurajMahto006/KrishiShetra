import React from 'react';
import { FileText, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const BuyerOffers = () => {
  const offers = [
    { id: 'OFF-891', seller: 'Sahyadri FPO Consortium', commodity: 'Red Onion Garwa', qty: '100 MT', offerPrice: '₹24,000 / MT', askingPrice: '₹24,500 / MT', status: 'Negotiation', date: '29 Aug 2026' },
    { id: 'OFF-884', seller: 'Kisan Vikas Producer Co.', commodity: 'Soybean (Yellow)', qty: '80 MT', offerPrice: '₹48,500 / MT', askingPrice: '₹48,900 / MT', status: 'Accepted', date: '26 Aug 2026' },
    { id: 'OFF-872', seller: 'Malwa Agro Aggregators', commodity: 'Wheat (Sharbati)', qty: '150 MT', offerPrice: '₹30,000 / MT', askingPrice: '₹31,200 / MT', status: 'Rejected', date: '20 Aug 2026' }
  ];

  const columns = [
    {
      label: 'Offer ID',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Seller / Producer',
      key: 'seller',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Commodity & Volume',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.qty}</div>
        </div>
      )
    },
    {
      label: 'Offer vs Asking Rate',
      key: 'offerPrice',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>Asking: {row.askingPrice}</div>
        </div>
      )
    },
    {
      label: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Actions',
      key: 'action',
      render: (_, row) => (
        row.status === 'Accepted' ? (
          <Button variant="primary" size="sm">
            Fund Escrow & Execute Order
          </Button>
        ) : (
          <Button variant="secondary" size="sm">
            Inspect Terms
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Procurement Offers & Bid Negotiations
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Direct counter-offers and price negotiations with farmers and FPO aggregation hubs.
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={offers}
          emptyMessage="No active procurement offers in negotiation."
        />
      </Card>
    </div>
  );
};

export default BuyerOffers;
