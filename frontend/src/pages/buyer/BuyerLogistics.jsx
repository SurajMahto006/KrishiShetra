import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Satellite,
  Thermometer,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
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

export const BuyerLogistics = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    deliveryLocation: '',
    commodity: '',
    estimatedQuantity: '',
    quantityUnit: 'ton',
    vehicleType: '32ft Multi-Axle Reefer',
    expectedDate: ''
  });

  useEffect(() => {
    loadLogistics();
  }, []);

  const loadLogistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buyerService.getLogisticsRequests();
      if (res?.success) {
        setRequests(res.requests || res.data || []);
      } else {
        setError(res?.message || 'Unable to load transport records.');
      }
    } catch (err) {
      console.error('Error fetching logistics:', err);
      setError('Network error while loading logistics requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formData.pickupLocation || !formData.deliveryLocation || !formData.estimatedQuantity) return;

    setIsSubmitting(true);
    try {
      const res = await buyerService.createLogisticsRequest({
        pickupLocation: formData.pickupLocation,
        deliveryLocation: formData.deliveryLocation,
        commodity: formData.commodity,
        estimatedQuantity: Number(formData.estimatedQuantity),
        quantityUnit: formData.quantityUnit,
        vehicleType: formData.vehicleType,
        expectedDate: formData.expectedDate
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          pickupLocation: '',
          deliveryLocation: '',
          commodity: '',
          estimatedQuantity: '',
          quantityUnit: 'ton',
          vehicleType: '32ft Multi-Axle Reefer',
          expectedDate: ''
        });
        loadLogistics();
        alert('Logistics freight request broadcasted to verified transporters!');
      } else {
        alert(res.message || 'Failed to submit transport request.');
      }
    } catch (err) {
      alert(err.message || 'Error creating transport request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    const reason = prompt('Please specify cancellation reason:');
    if (!reason) return;

    try {
      const res = await buyerService.cancelLogisticsRequest(requestId, reason);
      if (res?.success) {
        loadLogistics();
        alert('Transport request cancelled.');
      } else {
        alert(res?.message || 'Failed to cancel transport request.');
      }
    } catch (err) {
      alert('Error cancelling transport request.');
    }
  };

  const columns = [
    {
      label: 'Job Reference',
      key: 'requestId',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{row.commodity || 'Agri Produce'}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>Ref: {val ? String(val).substring(0, 8).toUpperCase() : row._id ? String(row._id).substring(0, 8).toUpperCase() : '—'}</div>
        </div>
      )
    },
    {
      label: 'Route Corridor',
      key: 'pickupLocation',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>
            <MapPin size={12} color="var(--ks-sage)" style={{ display: 'inline', marginRight: 2 }} />
            {row.pickupLocation} ➔ {row.deliveryLocation}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>
            Vehicle: {row.vehicleType || 'Standard Truck'}
          </div>
        </div>
      )
    },
    {
      label: 'Payload',
      key: 'estimatedQuantity',
      render: (val, row) => (
        <span style={{ fontWeight: 700 }}>
          {val} {row.quantityUnit || 'Ton'}
        </span>
      )
    },
    {
      label: 'Assigned Transporter',
      key: 'transporter',
      render: (val) => (
        <div style={{ fontSize: '13px' }}>
          {val?.name ? (
            <span style={{ fontWeight: 600, color: 'var(--ks-charcoal)' }}>{val.name}</span>
          ) : (
            <span style={{ color: 'var(--ks-text-muted)', fontStyle: 'italic' }}>Awaiting Carrier Bid</span>
          )}
        </div>
      )
    },
    {
      label: 'Transit Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (_, row) => {
        const status = (row.status || '').toLowerCase();
        const id = row.requestId || row._id;

        if (status === 'pending' || status === 'available') {
          return (
            <Button
              variant="danger"
              size="sm"
              icon={Ban}
              onClick={() => handleCancelRequest(id)}
            >
              Cancel
            </Button>
          );
        }

        return <span style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Active</span>;
      }
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Logistics Radar & Freight Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Book VAHAN-verified carriers, track cold-chain transit, and manage agricultural freight dispatches.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Book Freight / Transport
        </Button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadLogistics}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        {loading ? (
          <Skeleton height={240} />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No transport requests found"
            description="Book transport for your farmgate lots or procurement orders to dispatch goods seamlessly."
            actionLabel="Request Transport"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <Table
            columns={columns}
            data={requests}
            emptyMessage="No transport requests."
          />
        )}
      </Card>

      {/* Book Transport Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book Freight Transport for Produce"
        subtitle="Broadcast required corridor, vehicle type, and schedule to verified carriers"
      >
        <form onSubmit={handleCreateRequest}>
          <div className="ks-form-group">
            <label className="ks-label">Commodity / Produce *</label>
            <input
              type="text"
              className="ks-input"
              placeholder="e.g. Red Onion Garwa, Hybrid Tomato"
              value={formData.commodity}
              onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Pickup Location (Farm / Mandi Yard) *</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Niphad Godown, Nashik"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Delivery Destination (APMC / Warehouse) *</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Vashi APMC Terminal, Navi Mumbai"
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Estimated Payload Weight *</label>
              <input
                type="number"
                className="ks-input"
                placeholder="e.g. 25"
                value={formData.estimatedQuantity}
                onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Payload Unit</label>
              <select
                className="ks-select"
                value={formData.quantityUnit}
                onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
              >
                <option value="ton">Tons (MT)</option>
                <option value="quintal">Quintals (100 kg)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Vehicle Type Required</label>
              <select
                className="ks-select"
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              >
                <option value="32ft Multi-Axle Reefer">32ft Multi-Axle Reefer (Cold-Chain)</option>
                <option value="Containerized Reefer">Containerized Reefer (Controlled Temp)</option>
                <option value="Open Heavy Duty Body">Open Heavy Duty Body (Dry Cargo)</option>
                <option value="Taurus 25 MT">Taurus 25 MT</option>
                <option value="Eicher 14ft / 17ft">Eicher 14ft / 17ft (Local Distribution)</option>
              </select>
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Required Loading Date</label>
              <input
                type="date"
                className="ks-input"
                value={formData.expectedDate}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Broadcast Freight Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BuyerLogistics;
