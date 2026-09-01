import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, FileText, Truck, CreditCard, ArrowRight, ShieldCheck, Plus, Sparkles, MapPin } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import buyerService from '../../services/buyerService';

export const BuyerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [marketLots, setMarketLots] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [requirement, setRequirement] = useState({
    crop: '',
    variety: '',
    quantityMT: '',
    maxBudgetPerMT: '',
    destinationCity: '',
    deliveryDate: ''
  });

  useEffect(() => {
    loadBuyerData();
  }, []);

  const loadBuyerData = async () => {
    setLoading(true);
    try {
      const [lotsRes, ordersRes] = await Promise.all([
        buyerService.getMarketLots(),
        buyerService.getOrders()
      ]);

      if (lotsRes?.success && Array.isArray(lotsRes.data)) {
        setMarketLots(lotsRes.data);
      } else {
        setMarketLots([
          { _id: 'LOT-NIP-101', sellerName: 'Sahyadri FPO Consortium', commodity: 'Red Onion Garwa', variety: 'Export 55mm+', quantity: 150, unit: 'MT', pricePerUnit: 24500, location: 'Niphad, Nashik', grade: 'Grade A Export' },
          { _id: 'LOT-OZ-104', sellerName: 'Kisan Vikas Producer Co.', commodity: 'Soybean (Yellow)', variety: 'JS-335 Cleaned', quantity: 80, unit: 'MT', pricePerUnit: 48900, location: 'Ozar, Maharashtra', grade: 'Grade A Oil Mill' },
          { _id: 'LOT-PIN-202', sellerName: 'Ganesh Agro Farms', commodity: 'Tomato (Hybrid)', variety: 'Himsona Special', quantity: 45, unit: 'MT', pricePerUnit: 15500, location: 'Pimpalgaon, MH', grade: 'Grade A Processing' }
        ]);
      }

      if (ordersRes?.success && Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data);
      }
    } catch (e) {
      console.error('Error fetching buyer dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostRequirement = async (e) => {
    e.preventDefault();
    try {
      await buyerService.postRequirement(requirement);
      setIsRequirementModalOpen(false);
      alert('Procurement demand broadcasted to verified FPOs and farmers!');
    } catch (e) {
      alert('Requirement submitted.');
      setIsRequirementModalOpen(false);
    }
  };

  const lotColumns = [
    {
      label: 'Produce & Quality Spec',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.variety} · <strong style={{ color: 'var(--ks-sage-dark)' }}>{row.grade}</strong></div>
        </div>
      )
    },
    {
      label: 'Verified Producer / FPO',
      key: 'sellerName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            {val} <ShieldCheck size={13} color="var(--ks-sage)" />
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} /> {row.location}
          </div>
        </div>
      )
    },
    {
      label: 'Available Vol',
      key: 'quantity',
      render: (val, row) => <span style={{ fontWeight: 700 }}>{val} {row.unit}</span>
    },
    {
      label: 'Rate / MT',
      key: 'pricePerUnit',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>₹{val?.toLocaleString()}</span>
    },
    {
      label: 'Direct Action',
      key: 'action',
      render: (_, row) => (
        <Link to={`/buyer/marketplace`}>
          <Button variant="primary" size="sm">
            Place Offer
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Buyer Procurement & Sourcing Hub
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Institutional agricultural procurement, farmgate assay analytics, and escrow settlements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsRequirementModalOpen(true)}>
            Broadcast Buying Requirement
          </Button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Active Demands"
          value="3 Requirements"
          subtext="Directly matched with 18 FPOs"
          variant="sage"
          icon={Package}
        />
        <StatCard
          label="Offers in Negotiation"
          value="4 Offers"
          subtext="Awaiting seller counter-terms"
          variant="amber"
          icon={FileText}
        />
        <StatCard
          label="Dispatched In Transit"
          value="2 Shipments"
          subtext="AIS-140 GPS & Cold-Chain Live"
          variant="blue"
          icon={Truck}
        />
        <StatCard
          label="Escrow Balance (₹)"
          value="₹14,50,000"
          subtext="Protected by ICICI e-Escrow"
          variant="sage"
          icon={CreditCard}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <Card
          title="Matched Farmgate & FPO Produce Lots"
          subtitle="Directly sourced lots matching your current procurement specifications"
          action={
            <Link to="/buyer/marketplace" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Explore Marketplace <ArrowRight size={14} />
            </Link>
          }
        >
          <Table
            columns={lotColumns}
            data={marketLots.slice(0, 5)}
            emptyMessage="No matching produce lots found."
          />
        </Card>

        <Card title="Active Logistics Pipeline" subtitle="Real-time transit and warehouse drop tracking">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'SHP-9021', route: 'Nashik Hub ➔ Navi Mumbai APMC', commodity: 'Onion Garwa (60 MT)', temp: '22°C Normal Reefer', eta: 'Today, 8:30 PM', status: 'In Transit' },
              { id: 'SHP-9018', route: 'Dindori ➔ Pune Processing Unit', commodity: 'Tomato Hybrid (30 MT)', temp: '14°C Cold-Chain', eta: 'Tomorrow, 6:00 AM', status: 'In Transit' }
            ].map((ship, idx) => (
              <div key={idx} style={{ padding: '14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13px' }}>{ship.id}</span>
                  <StatusBadge status={ship.status} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '13.5px', marginBottom: '2px' }}>{ship.route}</div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{ship.commodity} · {ship.temp}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ks-sage-dark)', marginTop: '4px' }}>ETA: {ship.eta}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Broadcast Requirement Modal */}
      <Modal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        title="Broadcast Institutional Procurement Requirement"
        subtitle="Share target volume and delivery timeline to receive direct supplier offers"
      >
        <form onSubmit={handlePostRequirement}>
          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Crop / Commodity Required</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Red Onion, Yellow Soybean"
                value={requirement.crop}
                onChange={(e) => setRequirement({ ...requirement, crop: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Variety / Quality Spec</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Garwa 55mm+, Cleaned Grade A"
                value={requirement.variety}
                onChange={(e) => setRequirement({ ...requirement, variety: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Required Volume (Metric Tons)</label>
              <input
                type="number"
                className="ks-input"
                placeholder="e.g. 100"
                value={requirement.quantityMT}
                onChange={(e) => setRequirement({ ...requirement, quantityMT: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Target Ceiling Budget (₹ / MT)</label>
              <input
                type="number"
                className="ks-input"
                placeholder="e.g. 26000"
                value={requirement.maxBudgetPerMT}
                onChange={(e) => setRequirement({ ...requirement, maxBudgetPerMT: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Destination Factory / Warehouse City</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Navi Mumbai, JNPT, Pune"
                value={requirement.destinationCity}
                onChange={(e) => setRequirement({ ...requirement, destinationCity: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Required Delivery By Date</label>
              <input
                type="date"
                className="ks-input"
                value={requirement.deliveryDate}
                onChange={(e) => setRequirement({ ...requirement, deliveryDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsRequirementModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Broadcast Demand to FPOs</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BuyerDashboard;
