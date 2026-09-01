import React, { useState, useEffect } from 'react';
import { Building, MapPin, Phone, Mail, ShieldCheck, Search, MessageSquare } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import farmerService from '../../services/farmerService';

export const FarmerBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    setLoading(true);
    try {
      const res = await farmerService.getBuyers();
      if (res?.success && Array.isArray(res.data)) {
        setBuyers(res.data);
      } else {
        setBuyers([
          { name: 'MahaAgro Food Processing Ltd', location: 'Navi Mumbai, MH', verified: true, demand: 'Onion (500 MT), Tomato (200 MT)', rating: '4.9 ★', category: 'Exporter' },
          { name: 'Sahyadri Agro Mega Food Park', location: 'Nashik, MH', verified: true, demand: 'Grapes, Pomegranate, Onion', rating: '4.8 ★', category: 'Processor' },
          { name: 'Reliance Retail Agri Sourcing', location: 'Pune, MH', verified: true, demand: 'Vegetables (Daily 50 MT)', rating: '4.9 ★', category: 'Modern Retail' },
          { name: 'Kisan Export Consortium', location: 'Jawaharlal Nehru Port, MH', verified: true, demand: 'Export Grade Onion Garwa', rating: '4.7 ★', category: 'Global Shipper' }
        ]);
      }
    } catch (e) {
      console.error('Error fetching buyers:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuyers = buyers.filter(b =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.demand || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      label: 'Buyer Organization',
      key: 'name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {val}
            {row.verified && <ShieldCheck size={14} color="var(--ks-sage)" />}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} /> {row.location}
          </div>
        </div>
      )
    },
    {
      label: 'Procurement Category',
      key: 'category',
      render: (val) => <span className="ks-badge ks-badge--info">{val || 'B2B Buyer'}</span>
    },
    {
      label: 'Active Buying Demand',
      key: 'demand',
      render: (val) => <span style={{ fontSize: '13px', fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Platform Rating',
      key: 'rating',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-amber-dark)' }}>{val || '4.8 ★'}</span>
    },
    {
      label: 'Direct Action',
      key: 'action',
      render: () => (
        <Button variant="primary" size="sm" icon={MessageSquare}>
          Send Quote
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Verified Institutional Buyers & Traders
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Directly connect with corporate aggregators, food processors, and international exporters.
          </p>
        </div>
      </div>

      <Card>
        <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
          <input
            type="text"
            className="ks-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search buyers by name, crop demand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          data={filteredBuyers}
          emptyMessage="No verified buyers found matching your criteria."
        />
      </Card>
    </div>
  );
};

export default FarmerBuyers;
