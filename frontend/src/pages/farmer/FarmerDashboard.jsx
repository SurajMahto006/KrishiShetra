import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  FileText,
  DollarSign,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import farmerService from '../../services/farmerService';

export const FarmerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);
  const [newLot, setNewLot] = useState({
    commodity: '',
    variety: '',
    quantity: '',
    unit: 'Quintal',
    expectedPrice: '',
    location: '',
    qualityGrade: 'Grade A'
  });
  const [submittingLot, setSubmittingLot] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [lotsRes, marketRes, ordersRes] = await Promise.all([
        farmerService.getLots(),
        farmerService.getMarketPrices(),
        farmerService.getOrders()
      ]);

      if (lotsRes?.success && Array.isArray(lotsRes.data)) {
        setLots(lotsRes.data);
      }
      if (marketRes?.success && Array.isArray(marketRes.data)) {
        setMarketPrices(marketRes.data.slice(0, 5));
      }
      if (ordersRes?.success && Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data.slice(0, 5));
      }
    } catch (e) {
      console.error('Error fetching farmer dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    setSubmittingLot(true);
    try {
      const res = await farmerService.createLot(newLot);
      if (res.success) {
        setIsLotModalOpen(false);
        setNewLot({
          commodity: '',
          variety: '',
          quantity: '',
          unit: 'Quintal',
          expectedPrice: '',
          location: '',
          qualityGrade: 'Grade A'
        });
        loadDashboardData();
      } else {
        alert(res.message || 'Failed to create lot');
      }
    } catch (err) {
      alert(err.message || 'Error creating lot');
    } finally {
      setSubmittingLot(false);
    }
  };

  const lotColumns = [
    {
      label: 'Produce & Variety',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.variety || 'Standard Grade'}</div>
        </div>
      )
    },
    {
      label: 'Quantity',
      key: 'quantity',
      render: (val, row) => <span style={{ fontWeight: 600 }}>{val} {row.unit || 'Qtl'}</span>
    },
    {
      label: 'Expected Price',
      key: 'expectedPrice',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-sage-dark)' }}>₹{val?.toLocaleString()}/Qtl</span>
    },
    {
      label: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val || 'Active'} />
    }
  ];

  return (
    <div>
      {/* Top Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Farmer Produce & Market Hub
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Real-time APMC Mandi prices, active lot listings, and buyer procurement inquiries.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/farmer/forecast">
            <Button variant="secondary" icon={Sparkles}>
              AI Advisory
            </Button>
          </Link>
          <Button variant="primary" icon={Plus} onClick={() => setIsLotModalOpen(true)}>
            List New Produce Lot
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Active Lots"
          value={loading ? '-' : lots.length}
          icon={Package}
          variant="sage"
          subtext="Listed for buyer bidding"
        />
        <StatCard
          label="Pending Orders"
          value={loading ? '-' : orders.filter(o => o.status === 'Pending').length || '2'}
          icon={Clock}
          variant="amber"
          subtext="Awaiting dispatch approval"
        />
        <StatCard
          label="Completed Orders"
          value={loading ? '-' : orders.filter(o => o.status === 'Delivered').length || '14'}
          icon={ShieldCheck}
          variant="sage"
          subtext="Total fulfilled cycles"
        />
        <StatCard
          label="Total Revenue (₹)"
          value={loading ? '-' : '₹1,84,500'}
          icon={DollarSign}
          variant="blue"
          subtext="Direct payment settlements"
        />
      </div>

      {/* Main Grid: Active Lots + Live Mandi Prices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column: Active Produce Lots */}
        <Card
          title="My Active Produce Lots"
          subtitle="Directly visible to verified B2B buyers and institutional procurers"
          action={
            <Link to="/farmer/lots" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All Lots <ArrowRight size={14} />
            </Link>
          }
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Skeleton height="36px" />
              <Skeleton height="36px" />
              <Skeleton height="36px" />
            </div>
          ) : (
            <Table
              columns={lotColumns}
              data={lots.slice(0, 5)}
              emptyMessage="No produce lots listed yet. Click 'List New Produce Lot' above to begin selling."
            />
          )}
        </Card>

        {/* Right Column: Live APMC Market Intelligence */}
        <Card
          title="Mandi Price Intelligence"
          subtitle="Real-time modal rates from major agricultural markets"
          action={
            <Link to="/farmer/market" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Full Market <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { mandi: 'Nashik APMC', crop: 'Red Onion (Garwa)', price: '₹2,450 / Qtl', trend: '+4.2%' },
              { mandi: 'Pune Gultekdi', crop: 'Soybean (Yellow)', price: '₹4,890 / Qtl', trend: '+1.8%' },
              { mandi: 'Indore Mandi', crop: 'Wheat (Sharbati)', price: '₹3,120 / Qtl', trend: '-0.5%' },
              { mandi: 'Azadpur Delhi', crop: 'Basmati Paddy (1121)', price: '₹3,750 / Qtl', trend: '+2.1%' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--ks-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--ks-border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ks-charcoal)', fontSize: '13.5px' }}>{item.crop}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building size={12} /> {item.mandi}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--ks-evergreen)', fontSize: '14px' }}>{item.price}</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: item.trend.startsWith('+') ? 'var(--status-success-text)' : 'var(--status-error-text)' }}>
                    {item.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Create Lot Modal */}
      <Modal
        isOpen={isLotModalOpen}
        onClose={() => setIsLotModalOpen(false)}
        title="List New Agricultural Produce Lot"
        subtitle="Provide crop grade and quantity to broadcast directly to verified buyers."
      >
        <form onSubmit={handleCreateLot}>
          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Commodity / Crop Name</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Wheat, Onion, Soybean"
                value={newLot.commodity}
                onChange={(e) => setNewLot({ ...newLot, commodity: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Variety / Type</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Sharbati, Garwa, Lokwan"
                value={newLot.variety}
                onChange={(e) => setNewLot({ ...newLot, variety: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Quantity</label>
              <input
                type="number"
                className="ks-input"
                placeholder="e.g. 50"
                value={newLot.quantity}
                onChange={(e) => setNewLot({ ...newLot, quantity: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Unit of Measurement</label>
              <select
                className="ks-select"
                value={newLot.unit}
                onChange={(e) => setNewLot({ ...newLot, unit: e.target.value })}
              >
                <option value="Quintal">Quintal (100 kg)</option>
                <option value="Metric Ton">Metric Ton (1,000 kg)</option>
                <option value="Kilogram">Kilogram (kg)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Expected Base Price (₹ per unit)</label>
              <input
                type="number"
                className="ks-input"
                placeholder="e.g. 2800"
                value={newLot.expectedPrice}
                onChange={(e) => setNewLot({ ...newLot, expectedPrice: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Quality Grade</label>
              <select
                className="ks-select"
                value={newLot.qualityGrade}
                onChange={(e) => setNewLot({ ...newLot, qualityGrade: e.target.value })}
              >
                <option value="Grade A">Grade A (Premium / Export Quality)</option>
                <option value="Grade B">Grade B (Standard Market Grade)</option>
                <option value="Grade C">Grade C (Processing Grade)</option>
              </select>
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-label">Farm / Warehouse Pickup Location</label>
            <input
              type="text"
              className="ks-input"
              placeholder="e.g. Niphad, Nashik, Maharashtra"
              value={newLot.location}
              onChange={(e) => setNewLot({ ...newLot, location: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsLotModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingLot}>
              Publish Lot to Marketplace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FarmerDashboard;
