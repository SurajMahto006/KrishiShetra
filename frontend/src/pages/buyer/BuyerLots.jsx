import React from 'react';
import { Layers, Bookmark, Trash2, ShoppingCart } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

export const BuyerLots = () => {
  const savedLots = [
    { id: 'LOT-NIP-101', seller: 'Sahyadri FPO Consortium', commodity: 'Red Onion Garwa', quantity: '150 MT', price: '₹24,500 / MT', location: 'Niphad, Nashik' },
    { id: 'LOT-OZ-104', seller: 'Kisan Vikas Producer Co.', commodity: 'Soybean (Yellow)', quantity: '80 MT', price: '₹48,900 / MT', location: 'Ozar, Maharashtra' }
  ];

  const columns = [
    {
      label: 'Lot Reference',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Producer / Seller',
      key: 'seller',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Commodity',
      key: 'commodity',
      render: (val) => <span style={{ fontWeight: 700 }}>{val}</span>
    },
    {
      label: 'Volume',
      key: 'quantity',
      render: (val) => <span>{val}</span>
    },
    {
      label: 'Asking Rate',
      key: 'price',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{val}</span>
    },
    {
      label: 'Action',
      key: 'action',
      render: () => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" size="sm" icon={ShoppingCart}>
            Offer
          </Button>
          <Button variant="danger" size="sm" icon={Trash2}>
            Remove
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Saved & Shortlisted Produce Lots
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Bookmark farmgate harvest lots for bulk negotiation and direct trade bidding.
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={savedLots}
          emptyMessage="No saved lots. Explore the marketplace to shortlist produce."
        />
      </Card>
    </div>
  );
};

export default BuyerLots;
