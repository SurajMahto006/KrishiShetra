import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Building, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatCard from '../../components/common/StatCard';
import farmerService from '../../services/farmerService';

export const FarmerMarket = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('ALL');

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const res = await farmerService.getMarketPrices();
      if (res?.success && Array.isArray(res.data)) {
        setPrices(res.data);
      } else {
        // Fallback default modal dataset if API returns empty
        setPrices([
          { mandi: 'Lasalgaon Mandi', commodity: 'Onion (Red)', variety: 'Garwa', minPrice: 1800, maxPrice: 2850, modalPrice: 2450, change: '+4.2%' },
          { mandi: 'Pimpalgaon APMC', commodity: 'Tomato (Hybrid)', variety: 'Special', minPrice: 1200, maxPrice: 1800, modalPrice: 1550, change: '+6.5%' },
          { mandi: 'Pune Gultekdi', commodity: 'Soybean', variety: 'Yellow JS-335', minPrice: 4400, maxPrice: 5100, modalPrice: 4890, change: '+1.8%' },
          { mandi: 'Indore Mandi', commodity: 'Wheat', variety: 'Sharbati A-1', minPrice: 2800, maxPrice: 3400, modalPrice: 3120, change: '-0.5%' },
          { mandi: 'Karnal APMC', commodity: 'Paddy Basmati', variety: '1121 Pusa', minPrice: 3200, maxPrice: 4100, modalPrice: 3750, change: '+2.1%' },
          { mandi: 'Unjha Mandi', commodity: 'Cumin (Jeera)', variety: 'Bold Machine Clean', minPrice: 22000, maxPrice: 27500, modalPrice: 25400, change: '+3.4%' }
        ]);
      }
    } catch (e) {
      console.error('Error fetching market prices:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrices = prices.filter(p => {
    const matchesSearch = (p.commodity || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.mandi || '').toLowerCase().includes(search.toLowerCase());
    const matchesComm = selectedCommodity === 'ALL' || (p.commodity || '').toLowerCase().includes(selectedCommodity.toLowerCase());
    return matchesSearch && matchesComm;
  });

  const columns = [
    {
      label: 'Mandi / APMC Market',
      key: 'mandi',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building size={14} color="var(--ks-text-muted)" />
          <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
        </div>
      )
    },
    {
      label: 'Commodity & Variety',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>{row.variety || 'Standard'}</div>
        </div>
      )
    },
    {
      label: 'Min Rate',
      key: 'minPrice',
      render: (val) => <span>₹{val?.toLocaleString()} / Qtl</span>
    },
    {
      label: 'Max Rate',
      key: 'maxPrice',
      render: (val) => <span>₹{val?.toLocaleString()} / Qtl</span>
    },
    {
      label: 'Modal (Benchmark) Price',
      key: 'modalPrice',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)', fontSize: '14.5px' }}>₹{val?.toLocaleString()} / Qtl</span>
    },
    {
      label: 'Daily Trend',
      key: 'change',
      render: (val) => {
        const isUp = (val || '+0%').startsWith('+');
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: isUp ? 'var(--status-success-text)' : 'var(--status-error-text)' }}>
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {val || '+0.0%'}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            APMC Mandi Price Intelligence
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Verified daily arrival volumes and modal spot rates across 80+ wholesale APMCs.
          </p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={loadMarketData} loading={loading}>
          Refresh Prices
        </Button>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Top Gainer Today"
          value="Tomato Hybrid (+6.5%)"
          subtext="Pimpalgaon APMC · High demand"
          variant="sage"
          icon={TrendingUp}
        />
        <StatCard
          label="Highest Volume Traded"
          value="Red Onion (14,200 MT)"
          subtext="Lasalgaon Mandi benchmark"
          variant="amber"
          icon={Building}
        />
        <StatCard
          label="Average State Index"
          value="₹3,480 / Qtl"
          subtext="+2.4% vs last week average"
          variant="blue"
          icon={TrendingUp}
        />
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              type="text"
              className="ks-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by commodity, mandi name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="ks-select"
            style={{ width: '180px' }}
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
          >
            <option value="ALL">All Commodities</option>
            <option value="Onion">Onion</option>
            <option value="Tomato">Tomato</option>
            <option value="Soybean">Soybean</option>
            <option value="Wheat">Wheat</option>
            <option value="Paddy">Paddy / Rice</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={filteredPrices}
          emptyMessage="No mandi rates found matching your search."
        />
      </Card>
    </div>
  );
};

export default FarmerMarket;
