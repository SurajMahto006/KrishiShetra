import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import buyerService from '../../services/buyerService';

export const BuyerOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals & Action States
  const [selectedOfferForOrder, setSelectedOfferForOrder] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    district: '',
    state: 'Maharashtra',
    pincode: ''
  });
  const [isExecutingOrder, setIsExecutingOrder] = useState(false);

  useEffect(() => {
    loadOffers();
  }, [statusFilter]);

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter !== 'ALL' ? { status: statusFilter.toLowerCase() } : {};
      const res = await buyerService.getOffers(params);
      if (res?.success) {
        setOffers(res.offers || res.data || []);
      } else {
        setError(res?.message || 'Unable to load procurement offers.');
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Network error while loading offers.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to retract/cancel this offer?')) return;
    try {
      const res = await buyerService.cancelOffer(offerId);
      if (res?.success) {
        loadOffers();
      } else {
        alert(res?.message || 'Failed to cancel offer.');
      }
    } catch (err) {
      alert('Error cancelling offer.');
    }
  };

  const handleExecuteOrderFromOffer = async (e) => {
    e.preventDefault();
    if (!selectedOfferForOrder) return;

    setIsExecutingOrder(true);
    try {
      const res = await buyerService.createOrder({
        lotId: selectedOfferForOrder.lotId,
        cropName: selectedOfferForOrder.cropName,
        variety: selectedOfferForOrder.variety,
        quantity: selectedOfferForOrder.quantity,
        quantityUnit: selectedOfferForOrder.quantityUnit || 'quintal',
        agreedPrice: selectedOfferForOrder.offeredPrice,
        priceUnit: selectedOfferForOrder.priceUnit || 'quintal',
        totalAmount: (selectedOfferForOrder.quantity || 0) * (selectedOfferForOrder.offeredPrice || 0),
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          district: deliveryAddress.district || deliveryAddress.city,
          state: deliveryAddress.state,
          pincode: deliveryAddress.pincode
        },
        paymentMethod: 'escrow'
      });

      if (res.success) {
        setSelectedOfferForOrder(null);
        alert('Procurement order generated and locked into trade escrow!');
        window.location.href = '/buyer/orders';
      } else {
        alert(res.message || 'Failed to execute order.');
      }
    } catch (err) {
      alert(err.message || 'Error creating order.');
    } finally {
      setIsExecutingOrder(false);
    }
  };

  const filteredOffers = offers.filter(o =>
    (o.cropName || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.lotId || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      label: 'Offer ID / Reference',
      key: 'offerId',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{row.cropName}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>ID: {val ? String(val).substring(0, 8).toUpperCase() : '—'}</div>
        </div>
      )
    },
    {
      label: 'Offered Volume',
      key: 'quantity',
      render: (val, row) => (
        <span style={{ fontWeight: 700 }}>
          {val} {row.quantityUnit || 'Quintal'}
        </span>
      )
    },
    {
      label: 'Offered Price',
      key: 'offeredPrice',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>
            ₹{(val || 0).toLocaleString()} / {row.priceUnit || 'Quintal'}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>
            Total: ₹{((val || 0) * (row.quantity || 0)).toLocaleString()}
          </div>
        </div>
      )
    },
    {
      label: 'Submission Date',
      key: 'createdAt',
      render: (val) => (
        <span style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    },
    {
      label: 'Negotiation Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (_, row) => {
        const status = (row.status || '').toLowerCase();
        const id = row.offerId || row._id;

        if (status === 'accepted') {
          return (
            <Button
              variant="primary"
              size="sm"
              icon={ShoppingBag}
              onClick={() => setSelectedOfferForOrder(row)}
            >
              Execute Order
            </Button>
          );
        }

        if (status === 'pending') {
          return (
            <Button
              variant="danger"
              size="sm"
              icon={Ban}
              onClick={() => handleCancelOffer(id)}
            >
              Cancel Offer
            </Button>
          );
        }

        return <span style={{ fontSize: '12.5px', color: 'var(--ks-text-muted)' }}>Closed</span>;
      }
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Procurement Offers & Bid Negotiations
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Track direct counter-offers and finalize accepted terms into guaranteed trade contracts.
          </p>
        </div>
        <Link to="/buyer/marketplace">
          <Button variant="primary" icon={ShoppingBag}>
            Make New Offer
          </Button>
        </Link>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadOffers}>
            Retry
          </Button>
        </div>
      )}

      {/* Tabs & Search Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--ks-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: statusFilter === tab ? 700 : 500,
                  background: statusFilter === tab ? '#FFFFFF' : 'transparent',
                  color: statusFilter === tab ? 'var(--ks-evergreen)' : 'var(--ks-text-muted)',
                  boxShadow: statusFilter === tab ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              type="text"
              className="ks-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search offers by crop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Skeleton height={240} />
        ) : filteredOffers.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No procurement offers found"
            description={statusFilter === 'ALL' ? "Offers you submit on marketplace lots will appear here with live seller response status." : `No ${statusFilter.toLowerCase()} offers found.`}
            actionLabel="Browse Marketplace"
            onAction={() => window.location.href = '/buyer/marketplace'}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredOffers}
            emptyMessage="No offers found."
          />
        )}
      </Card>

      {/* Execute Order from Accepted Offer Modal */}
      {selectedOfferForOrder && (
        <Modal
          isOpen={!!selectedOfferForOrder}
          onClose={() => setSelectedOfferForOrder(null)}
          title={`Execute Procurement Order: ${selectedOfferForOrder.cropName}`}
          subtitle={`Agreed Volume: ${selectedOfferForOrder.quantity} ${selectedOfferForOrder.quantityUnit || 'Quintal'} · Agreed Rate: ₹${selectedOfferForOrder.offeredPrice?.toLocaleString()} / Unit`}
        >
          <form onSubmit={handleExecuteOrderFromOffer}>
            <div style={{ padding: '12px 14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Total Contract Settlement Value:</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
                ₹{((selectedOfferForOrder.quantity || 0) * (selectedOfferForOrder.offeredPrice || 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--ks-sage-dark)', marginTop: '2px' }}>
                ✓ Protected under KrishiShetra electronic trade escrow.
              </div>
            </div>

            <div className="ks-form-group">
              <label className="ks-label">Delivery Warehouse Street Address *</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Plot 42, Vashi APMC Terminal"
                value={deliveryAddress.street}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="ks-form-group">
                <label className="ks-label">City / Mandi Hub *</label>
                <input
                  type="text"
                  className="ks-input"
                  placeholder="e.g. Navi Mumbai"
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                  required
                />
              </div>
              <div className="ks-form-group">
                <label className="ks-label">Pincode (6 digits) *</label>
                <input
                  type="text"
                  className="ks-input"
                  placeholder="e.g. 400703"
                  maxLength={6}
                  value={deliveryAddress.pincode}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setSelectedOfferForOrder(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isExecutingOrder}>
                Confirm & Lock Escrow
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BuyerOffers;
