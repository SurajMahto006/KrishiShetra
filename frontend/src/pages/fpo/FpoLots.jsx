import React, { useState } from 'react';
import { Layers, Plus, Search, Filter, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const FpoLots = () => {
  const [search, setSearch] = useState('');

  const bulkLots = [
    { id: 'BLK-901', crop: 'Soybean (Yellow)', quality: 'Grade A Export Assay', pooledQty: '450 MT', farmers: 38, location: 'Niphad Central Godown', price: '₹4,950 / Qtl', status: 'Active' },
    { id: 'BLK-902', crop: 'Red Onion Garwa', quality: '55mm+ Export Graded', pooledQty: '600 MT', farmers: 52, location: 'Pimpalgaon Yard', price: '₹2,600 / Qtl', status: 'Active' },
    { id: 'BLK-903', crop: 'Wheat Sharbati', quality: 'High Gluten 13%', pooledQty: '300 MT', farmers: 24, location: 'Dindori Hub', price: '₹3,200 / Qtl', status: 'Sold' },
    { id: 'BLK-904', crop: 'Pomegranate Bhagwa', quality: 'Export Grade 250g+', pooledQty: '120 MT', farmers: 18, location: 'Nashik Cold Chain Park', price: '₹12,500 / Qtl', status: 'Negotiation' }
  ];

  const filteredLots = bulkLots.filter(l =>
    l.crop.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      label: 'Bulk Lot ID',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Crop & Assay Spec',
      key: 'crop',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.quality}</div>
        </div>
      )
    },
    {
      label: 'Pooled Quantity',
      key: 'pooledQty',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-sage-dark)' }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>{row.farmers} Contributing Farmers</div>
        </div>
      )
    },
    {
      label: 'Base Reserve Price',
      key: 'price',
      render: (val) => <span style={{ fontWeight: 800 }}>{val}</span>
    },
    {
      label: 'Aggregation Warehouse',
      key: 'location',
      render: (val) => <span style={{ fontSize: '13px' }}>{val}</span>
    },
    {
      label: 'Marketplace Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            FPO Aggregated Produce Lots
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Consolidated farmer harvest ready for corporate contracts and direct mandi tenders.
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Pool & Create Bulk Lot
        </Button>
      </div>

      <Card>
        <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
          <input
            type="text"
            className="ks-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search bulk lots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          data={filteredLots}
          emptyMessage="No bulk lots listed."
        />
      </Card>
    </div>
  );
};

export default FpoLots;
