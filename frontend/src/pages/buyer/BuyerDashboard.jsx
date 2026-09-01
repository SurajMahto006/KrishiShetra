import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  FileText,
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import buyerService from '../../services/buyerService';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard Data
  const [marketLots, setMarketLots] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [logistics, setLogistics] = useState([]);

  // Modals & Action States
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [selectedLotForOffer, setSelectedLotForOffer] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const [newRequirement, setNewRequirement] = useState({
    cropName: '',
    variety: '',
    quantity: '',
    quantityUnit: 'ton',
    targetPrice: '',
    deliveryLocation: '',
    message: ''
  });
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lotsRes, offersRes, ordersRes, reqsRes, logRes] = await Promise.allSettled([
        buyerService.getMarketLots({ limit: 6 }),
        buyerService.getOffers({ limit: 5 }),
        buyerService.getOrders({ limit: 5 }),
        buyerService.getMyRequirements(),
        buyerService.getLogisticsRequests()
      ]);

      if (lotsRes.status === 'fulfilled' && lotsRes.value?.success) {
        setMarketLots(lotsRes.value.lots || lotsRes.value.data || []);
      }
      if (offersRes.status === 'fulfilled' && offersRes.value?.success) {
        setOffers(offersRes.value.offers || offersRes.value.data || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
        setOrders(ordersRes.value.orders || ordersRes.value.data || []);
      }
      if (reqsRes.status === 'fulfilled' && reqsRes.value?.success) {
        setRequirements(reqsRes.value.inquiries || reqsRes.value.data || []);
      }
      if (logRes.status === 'fulfilled' && logRes.value?.success) {
        setLogistics(logRes.value.requests || logRes.value.data || []);
      }
    } catch (err) {
      console.error('Error loading buyer dashboard data:', err);
      setError('Unable to load some sourcing data. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    if (!newRequirement.cropName || !newRequirement.quantity) return;

    setIsSubmittingReq(true);
    try {
      const res = await buyerService.postRequirement({
        cropName: newRequirement.cropName,
        variety: newRequirement.variety,
        requestedQuantity: Number(newRequirement.quantity),
        quantityUnit: newRequirement.quantityUnit,
        targetPrice: Number(newRequirement.targetPrice) || undefined,
        message: newRequirement.message || `Need ${newRequirement.quantity} ${newRequirement.quantityUnit} of ${newRequirement.cropName} at ${newRequirement.deliveryLocation}`
      });

      if (res.success) {
        setIsRequirementModalOpen(false);
        setNewRequirement({ cropName: '', variety: '', quantity: '', quantityUnit: 'ton', targetPrice: '', deliveryLocation: '', message: '' });
        loadDashboardData();
      } else {
        alert(res.message || 'Failed to post procurement requirement.');
      }
    } catch (err) {
      alert(err.message || 'Error posting requirement.');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!selectedLotForOffer || !offerPrice || !offerQty) return;

    setIsSubmittingOffer(true);
    try {
      const res = await buyerService.createOffer({
        lotId: selectedLotForOffer.lotId || selectedLotForOffer._id,
        offeredPrice: Number(offerPrice),
        priceUnit: selectedLotForOffer.priceUnit || 'quintal',
        quantity: Number(offerQty),
        quantityUnit: selectedLotForOffer.quantityUnit || 'quintal',
        message: offerMessage
      });

      if (res.success) {
        setSelectedLotForOffer(null);
        setOfferPrice('');
        setOfferQty('');
        setOfferMessage('');
        loadDashboardData();
        alert('Procurement offer submitted directly to seller!');
      } else {
        alert(res.message || 'Failed to submit offer.');
      }
    } catch (err) {
      alert(err.message || 'Error submitting offer.');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const buyerName = user?.name || user?.email?.split('@')[0] || 'Procurement Partner';

  const lotColumns = [
    {
      label: 'Commodity & Variety',
      key: 'cropName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val || row.commodity}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>
            {row.variety ? `${row.variety} · ` : ''}
            <span style={{ fontWeight: 600, color: 'var(--ks-sage-dark)' }}>Grade {row.qualityGrade || 'A'}</span>
          </div>
        </div>
      )
    },
    {
      label: 'Origin / Location',
      key: 'location',
      render: (_, row) => (
        <div style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={13} color="var(--ks-sage)" />
          <span>{row.district ? `${row.district}, ${row.state}` : row.location || 'Maharashtra'}</span>
        </div>
      )
    },
    {
      label: 'Available Volume',
      key: 'quantity',
      render: (val, row) => (
        <span style={{ fontWeight: 700 }}>
          {val} {row.quantityUnit || row.unit || 'MT'}
        </span>
      )
    },
    {
      label: 'Asking Rate',
      key: 'askingPrice',
      render: (val, row) => (
        <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>
          ₹{(val || row.pricePerUnit || 0).toLocaleString()} / {row.priceUnit || 'Quintal'}
        </span>
      )
    },
    {
      label: 'Action',
      key: 'action',
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={ShoppingCart}
          onClick={() => {
            setSelectedLotForOffer(row);
            setOfferPrice(row.askingPrice || row.pricePerUnit || '');
            setOfferQty(row.quantity || '');
          }}
        >
          Make Offer
        </Button>
      )
    }
  ];

  const offerColumns = [
    {
      label: 'Offer ID / Commodity',
      key: 'offerId',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{row.cropName || 'Produce Lot'}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>Lot: {row.lotId || val || '—'}</div>
        </div>
      )
    },
    {
      label: 'Offered Volume',
      key: 'quantity',
      render: (val, row) => <span>{val} {row.quantityUnit || 'Quintal'}</span>
    },
    {
      label: 'Offered Price',
      key: 'offeredPrice',
      render: (val, row) => (
        <span style={{ fontWeight: 700, color: 'var(--ks-sage-dark)' }}>
          ₹{val?.toLocaleString()} / {row.priceUnit || 'Quintal'}
        </span>
      )
    },
    {
      label: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Good morning, {buyerName}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Manage agricultural sourcing, direct farmer offers, and delivery logistics from one command center.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Plus} onClick={() => setIsRequirementModalOpen(true)}>
            Post Requirement
          </Button>
          <Link to="/buyer/marketplace">
            <Button variant="primary" icon={Package}>
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadDashboardData}>
            Retry
          </Button>
        </div>
      )}

      {/* Sourcing Summary Metrics */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Open Requirements"
          value={loading ? '—' : `${requirements.length} Active`}
          subtext="Broadcasted procurement demands"
          variant="sage"
          icon={Layers}
        />
        <StatCard
          label="Available Market Lots"
          value={loading ? '—' : `${marketLots.length} Lots`}
          subtext="Assayed produce ready for trade"
          variant="amber"
          icon={Package}
        />
        <StatCard
          label="Pending Offers"
          value={loading ? '—' : `${offers.filter(o => (o.status || '').toLowerCase() === 'pending').length} In Review`}
          subtext="Awaiting seller response"
          variant="blue"
          icon={FileText}
        />
        <StatCard
          label="Active Orders"
          value={loading ? '—' : `${orders.length} Orders`}
          subtext="Executed procurement contracts"
          variant="sage"
          icon={Truck}
        />
      </div>

      {/* Main Section: Available Produce & Offers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Recommended Marketplace Lots */}
        <Card
          title="Recommended & Matching Produce Lots"
          subtitle="Farmgate and FPO harvest lots available for immediate procurement"
          action={
            <Link to="/buyer/marketplace" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All in Marketplace <ArrowRight size={14} />
            </Link>
          }
        >
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <Table
              columns={lotColumns}
              data={marketLots}
              emptyMessage="No matching produce lots currently active. Check back shortly."
            />
          )}
        </Card>

        {/* Offers Requiring Attention */}
        <Card
          title="Recent Procurement Offers"
          subtitle="Status of direct negotiations with sellers"
          action={
            <Link to="/buyer/offers" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              All Offers <ArrowRight size={14} />
            </Link>
          }
        >
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <Table
              columns={offerColumns}
              data={offers}
              emptyMessage="No active offers. Submit an offer on any marketplace lot to begin."
            />
          )}
        </Card>
      </div>

      {/* Active Orders & Logistics Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Active Orders */}
        <Card
          title="Active Procurement Orders"
          subtitle="Executed trade contracts undergoing fulfillment"
          action={
            <Link to="/buyer/orders" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Order History <ArrowRight size={14} />
            </Link>
          }
        >
          {loading ? (
            <Skeleton height={140} />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No active procurement orders"
              description="Orders created from accepted offers or direct buys will appear here."
              actionLabel="Explore Marketplace"
              onAction={() => window.location.href = '/buyer/marketplace'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map((ord, idx) => (
                <div key={ord.orderId || idx} style={{ padding: '12px 14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13.5px' }}>{ord.orderId || `ORD-${idx + 1}`}</span>
                    <StatusBadge status={ord.status} />
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ks-charcoal)', fontWeight: 600 }}>
                    {ord.cropName} · {ord.quantity} {ord.quantityUnit || 'Quintal'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)', marginTop: '2px' }}>
                    Total Value: <strong style={{ color: 'var(--ks-sage-dark)' }}>₹{(ord.totalAmount || 0).toLocaleString()}</strong> · Seller: {ord.farmerName || 'Verified Seller'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Logistics & Transit Overview */}
        <Card
          title="Transit & Logistics Overview"
          subtitle="Assigned transportation jobs and delivery tracking"
          action={
            <Link to="/buyer/logistics" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Logistics Radar <ArrowRight size={14} />
            </Link>
          }
        >
          {loading ? (
            <Skeleton height={140} />
          ) : logistics.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No active transport jobs"
              description="Book transport for your procurement orders to track deliveries live."
              actionLabel="Book Logistics"
              onAction={() => window.location.href = '/buyer/logistics'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logistics.map((log, idx) => (
                <div key={log.requestId || idx} style={{ padding: '12px 14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13px' }}>{log.pickupLocation} ➔ {log.deliveryLocation}</span>
                    <StatusBadge status={log.status} />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>
                    Payload: {log.estimatedQuantity} {log.quantityUnit || 'Quintal'} · Vehicle: {log.vehicleType || 'Commercial Freight'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Post Requirement Modal */}
      <Modal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        title="Broadcast Sourcing Requirement"
        subtitle="Specify crop, target volume, and delivery destination to receive direct supplier quotes"
      >
        <form onSubmit={handleCreateRequirement}>
          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Commodity / Crop Required *</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Red Onion, Yellow Soybean, Tomato"
                value={newRequirement.cropName}
                onChange={(e) => setNewRequirement({ ...newRequirement, cropName: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Variety / Grade Spec</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Garwa 55mm+, JS-335 Cleaned"
                value={newRequirement.variety}
                onChange={(e) => setNewRequirement({ ...newRequirement, variety: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Required Quantity *</label>
              <input
                type="number"
                className="ks-input"
                placeholder="e.g. 50"
                value={newRequirement.quantity}
                onChange={(e) => setNewRequirement({ ...newRequirement, quantity: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Quantity Unit</label>
              <select
                className="ks-select"
                value={newRequirement.quantityUnit}
                onChange={(e) => setNewRequirement({ ...newRequirement, quantityUnit: e.target.value })}
              >
                <option value="ton">Tons (MT)</option>
                <option value="quintal">Quintals (100 kg)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Target Ceiling Budget (₹ per unit)</label>
              <input
                type="number"
                className="ks-input"
                placeholder="e.g. 2500"
                value={newRequirement.targetPrice}
                onChange={(e) => setNewRequirement({ ...newRequirement, targetPrice: e.target.value })}
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Delivery Destination City / Mandi</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Navi Mumbai APMC, Pune Godown"
                value={newRequirement.deliveryLocation}
                onChange={(e) => setNewRequirement({ ...newRequirement, deliveryLocation: e.target.value })}
              />
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-label">Additional Quality / Packaging Instructions</label>
            <textarea
              className="ks-input"
              rows={3}
              placeholder="e.g. Cleaned bags, moisture under 10%, immediate delivery required"
              value={newRequirement.message}
              onChange={(e) => setNewRequirement({ ...newRequirement, message: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsRequirementModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmittingReq}>
              Broadcast Requirement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Make Offer Modal */}
      {selectedLotForOffer && (
        <Modal
          isOpen={!!selectedLotForOffer}
          onClose={() => setSelectedLotForOffer(null)}
          title={`Submit Procurement Offer: ${selectedLotForOffer.cropName || selectedLotForOffer.commodity}`}
          subtitle={`Seller: ${selectedLotForOffer.farmerName || 'Verified Producer'} · Asking: ₹${(selectedLotForOffer.askingPrice || selectedLotForOffer.pricePerUnit || 0).toLocaleString()} / ${selectedLotForOffer.priceUnit || 'Quintal'}`}
        >
          <form onSubmit={handleMakeOffer}>
            <div className="grid-2">
              <div className="ks-form-group">
                <label className="ks-label">Purchase Quantity ({selectedLotForOffer.quantityUnit || 'Quintal'}) *</label>
                <input
                  type="number"
                  className="ks-input"
                  value={offerQty}
                  onChange={(e) => setOfferQty(e.target.value)}
                  max={selectedLotForOffer.quantity}
                  required
                />
              </div>
              <div className="ks-form-group">
                <label className="ks-label">Offered Price (₹ / {selectedLotForOffer.priceUnit || 'Quintal'}) *</label>
                <input
                  type="number"
                  className="ks-input"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ks-form-group">
              <label className="ks-label">Terms / Note to Seller</label>
              <textarea
                className="ks-input"
                rows={2}
                placeholder="e.g. Ready for pickup within 48 hours with instant weighbridge settlement."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
              />
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Estimated Trade Value:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
                ₹{((Number(offerQty) || 0) * (Number(offerPrice) || 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--ks-sage-dark)', marginTop: '2px' }}>
                ✓ Protected transaction under KrishiShetra trade dispute escrow guidelines.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setSelectedLotForOffer(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingOffer}>
                Submit Digital Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BuyerDashboard;
