import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  AlertCircle,
  RefreshCw,
  Search,
  Ban
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import buyerService from '../../services/buyerService';

export const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Order for Details View
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter !== 'ALL' ? { status: statusFilter.toLowerCase() } : {};
      const res = await buyerService.getOrders(params);
      if (res?.success) {
        setOrders(res.orders || res.data || []);
      } else {
        setError(res?.message || 'Unable to load your procurement orders.');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Network error while loading orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please specify cancellation reason:');
    if (!reason) return;

    try {
      const res = await buyerService.cancelOrder(orderId, reason);
      if (res?.success) {
        setSelectedOrder(null);
        loadOrders();
        alert('Order cancellation processed.');
      } else {
        alert(res?.message || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Error cancelling order.');
    }
  };

  const filteredOrders = orders.filter(o =>
    (o.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.cropName || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.farmerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      label: 'Order ID',
      key: 'orderId',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Commodity & Quantity',
      key: 'cropName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>
            {row.quantity} {row.quantityUnit || 'Quintal'} · {row.variety || 'Standard'}
          </div>
        </div>
      )
    },
    {
      label: 'Producer / Seller',
      key: 'farmerName',
      render: (val) => (
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          {val || 'Verified Producer'} <ShieldCheck size={13} color="var(--ks-sage)" />
        </div>
      )
    },
    {
      label: 'Total Value',
      key: 'totalAmount',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>
            ₹{(val || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ks-text-muted)' }}>
            ₹{(row.agreedPrice || 0).toLocaleString()} / {row.priceUnit || 'Quintal'}
          </div>
        </div>
      )
    },
    {
      label: 'Escrow Payment',
      key: 'paymentStatus',
      render: (val) => <StatusBadge status={val || 'Escrow Locked'} />
    },
    {
      label: 'Fulfillment Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Action',
      key: 'action',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          onClick={() => setSelectedOrder(row)}
        >
          View Contract
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Procurement Orders & Contract Fulfillment
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Executed agricultural trade contracts with escrow security and real-time delivery timelines.
          </p>
        </div>
        <Link to="/buyer/marketplace">
          <Button variant="primary" icon={ShieldCheck}>
            Procure Produce
          </Button>
        </Link>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadOrders}>
            Retry
          </Button>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--ks-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'CONFIRMED', 'IN PROGRESS', 'COMPLETED', 'CANCELLED'].map((tab) => (
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
              placeholder="Search by Order ID or crop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Skeleton height={240} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No procurement orders found"
            description={statusFilter === 'ALL' ? "Orders created from accepted offers or direct buys will appear here." : `No ${statusFilter.toLowerCase()} orders found.`}
            actionLabel="Explore Marketplace"
            onAction={() => window.location.href = '/buyer/marketplace'}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredOrders}
            emptyMessage="No orders found."
          />
        )}
      </Card>

      {/* Order Contract Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Contract: ${selectedOrder.orderId}`}
          subtitle={`Commodity: ${selectedOrder.cropName} · Status: ${selectedOrder.status}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Price & Quantity Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Total Contract Amount</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
                  ₹{(selectedOrder.totalAmount || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ks-sage-dark)', marginTop: 2 }}>
                  ₹{(selectedOrder.agreedPrice || 0).toLocaleString()} / {selectedOrder.priceUnit || 'Quintal'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Contract Volume</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
                  {selectedOrder.quantity} {selectedOrder.quantityUnit || 'Quintal'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)', marginTop: 2 }}>
                  Escrow: <strong style={{ color: 'var(--status-success-text)' }}>{selectedOrder.paymentStatus || 'Protected'}</strong>
                </div>
              </div>
            </div>

            {/* Seller & Delivery Specs */}
            <div className="grid-2" style={{ fontSize: '13.5px' }}>
              <div>
                <div style={{ color: 'var(--ks-text-muted)', fontSize: '12px' }}>PRODUCER / SELLER</div>
                <div style={{ fontWeight: 700, color: 'var(--ks-charcoal)', marginTop: 2 }}>
                  {selectedOrder.farmerName || 'Verified Producer'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--ks-text-muted)', fontSize: '12px' }}>DELIVERY DESTINATION</div>
                <div style={{ fontWeight: 600, color: 'var(--ks-charcoal)', marginTop: 2 }}>
                  {selectedOrder.deliveryAddress?.street ? `${selectedOrder.deliveryAddress.street}, ${selectedOrder.deliveryAddress.city} (${selectedOrder.deliveryAddress.pincode})` : 'Destination provided upon dispatch'}
                </div>
              </div>
            </div>

            {/* Timeline Progress */}
            <div style={{ padding: '14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ks-evergreen)', marginBottom: '10px' }}>
                Contract Fulfillment Stages
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', position: 'relative' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ks-sage)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 11, fontWeight: 700 }}>✓</div>
                  <span>Order Placed</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: selectedOrder.status !== 'pending' ? 'var(--ks-sage)' : 'var(--ks-border-light)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 11, fontWeight: 700 }}>2</div>
                  <span>Confirmed</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: (selectedOrder.status === 'in progress' || selectedOrder.status === 'completed') ? 'var(--ks-sage)' : 'var(--ks-border-light)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 11, fontWeight: 700 }}>3</div>
                  <span>Dispatched</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: selectedOrder.status === 'completed' ? 'var(--ks-sage)' : 'var(--ks-border-light)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 11, fontWeight: 700 }}>4</div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: 10 }}>
              {(selectedOrder.status || '').toLowerCase() === 'pending' && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={Ban}
                  onClick={() => handleCancelOrder(selectedOrder.orderId || selectedOrder._id)}
                >
                  Cancel Order
                </Button>
              )}
              <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Link to="/buyer/logistics">
                  <Button variant="primary" icon={Truck}>
                    Book Transport
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BuyerOrders;
