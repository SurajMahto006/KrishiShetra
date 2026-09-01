import React, { useState } from 'react';
import { TrendingUp, Building, Search, ArrowUpRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import StatCard from '../../components/common/StatCard';

export const FpoMarket = () => {
  const [search, setSearch] = useState('');

  const mandiRates = [
    { mandi: 'Lasalgaon Mandi', crop: 'Red Onion (Garwa)', arrivals: '1,450 MT', minPrice: '₹1,800', maxPrice: '₹2,850', modalPrice: '₹2,450 / Qtl', trend: '+4.2%' },
    { mandi: 'Pune Gultekdi', crop: 'Soybean (Yellow)', arrivals: '820 MT', minPrice: '₹4,400', maxPrice: '₹5,100', modalPrice: '₹4,890 / Qtl', trend: '+1.8%' },
    { mandi: 'Pimpalgaon APMC', crop: 'Tomato (Hybrid)', arrivals: '650 MT', minPrice: '₹1,200', maxPrice: '₹1,800', modalPrice: '₹1,550 / Qtl', trend: '+6.5%' },
    { mandi: 'Indore Mandi', crop: 'Wheat (Sharbati)', arrivals: '2,100 MT', minPrice: '₹2,800', maxPrice: '₹3,400', modalPrice: '₹3,120 / Qtl', trend: '-0.5%' }
  ];

  const columns = [
    {
      label: 'Mandi / APMC Terminal',
      key: 'mandi',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Crop Commodity',
      key: 'crop',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Daily Arrivals',
      key: 'arrivals',
      render: (val) => <span>{val}</span>
    },
    {
      label: 'Modal Spot Rate',
      key: 'modalPrice',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{val}</span>
    },
    {
      label: 'Daily Trend',
      key: 'trend',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--status-success-text)' }}>{val}</span>
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            FPO Market Intelligence & Price Arbitrage
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Comparative spot prices across wholesale Mandis to optimize collective selling decisions.
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={mandiRates}
          emptyMessage="No market intelligence data available."
        />
      </Card>
    </div>
  );
};

export default FpoMarket;
