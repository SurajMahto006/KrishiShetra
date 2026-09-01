import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import buyerService from '../../services/buyerService';

export const BuyerRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Post Requirement Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReq, setNewReq] = useState({
    cropName: '',
    variety: '',
    quantity: '',
    quantityUnit: 'ton',
    targetPrice: '',
    deliveryLocation: '',
    message: ''
  });

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buyerService.getMyRequirements();
      if (res?.success) {
        setRequirements(res.inquiries || res.data || []);
      } else {
        setError(res?.message || 'Unable to fetch your sourcing requirements.');
      }
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError('Network error while connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    if (!newReq.cropName || !newReq.quantity) return;

    setIsSubmitting(true);
    try {
      const res = await buyerService.postRequirement({
        cropName: newReq.cropName.trim(),
        variety: newReq.variety.trim(),
        requestedQuantity: Number(newReq.quantity),
        quantityUnit: newReq.quantityUnit,
        targetPrice: Number(newReq.targetPrice) || undefined,
        message: newReq.message ? `${newReq.message} (Delivery: ${newReq.deliveryLocation})` : `Procurement demand for ${newReq.quantity} ${newReq.quantityUnit} of ${newReq.cropName} at ${newReq.deliveryLocation}`
      });

      if (res.success) {
        setIsModalOpen(false);
        setNewReq({ cropName: '', variety: '', quantity: '', quantityUnit: 'ton', targetPrice: '', deliveryLocation: '', message: '' });
        loadRequirements();
        alert('Procurement requirement broadcasted successfully!');
      } else {
        alert(res.message || 'Failed to submit requirement.');
      }
    } catch (err) {
      alert(err.message || 'Error submitting requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequirements = requirements.filter(r =>
    (r.cropName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.message || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      label: 'Requirement ID',
      key: '_id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '12px' }}>{val ? String(val).substring(0, 8).toUpperCase() : '—'}</span>
    },
    {
      label: 'Commodity & Variety',
      key: 'cropName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.variety || 'Standard Specification'}</div>
        </div>
      )
    },
    {
      label: 'Required Volume',
      key: 'requestedQuantity',
      render: (val, row) => (
        <span style={{ fontWeight: 700 }}>
          {val || row.quantity} {row.quantityUnit || 'Quintal'}
        </span>
      )
    },
    {
      label: 'Target Budget',
      key: 'targetPrice',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--ks-sage-dark)' }}>
          {val ? `₹${val.toLocaleString()} / Unit` : 'Open for Quotation'}
        </span>
      )
    },
    {
      label: 'Broadcast Status',
      key: 'status',
      render: (val) => <StatusBadge status={val || 'Active'} />
    },
    {
      label: 'Created Date',
      key: 'createdAt',
      render: (val) => (
        <span style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Procurement Demands & Sourcing Requirements
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Broadcast required volumes and delivery schedules to receive direct producer quotations.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Create Sourcing Requirement
        </Button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadRequirements}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
          <input
            type="text"
            className="ks-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search requirements by commodity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <Skeleton height={220} />
        ) : requirements.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No procurement requirements broadcasted"
            description="Post your crop specifications, volume requirements, and destination to get matched with suppliers."
            actionLabel="Post First Requirement"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredRequirements}
            emptyMessage="No requirements matching search."
          />
        )}
      </Card>

      {/* Create Requirement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Sourcing Requirement"
        subtitle="Share target volume and timeline to receive direct supplier offers"
      >
        <form onSubmit={handleCreateRequirement}>
          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Commodity / Crop Required *</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Red Onion, Yellow Soybean, Wheat"
                value={newReq.cropName}
                onChange={(e) => setNewReq({ ...newReq, cropName: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Variety / Quality Spec</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Garwa 55mm+, Cleaned Grade A"
                value={newReq.variety}
                onChange={(e) => setNewReq({ ...newReq, variety: e.target.value })}
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
                value={newReq.quantity}
                onChange={(e) => setNewReq({ ...newReq, quantity: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Quantity Unit</label>
              <select
                className="ks-select"
                value={newReq.quantityUnit}
                onChange={(e) => setNewReq({ ...newReq, quantityUnit: e.target.value })}
              >
                <option value="ton">Tons (MT)</option>
                <option value="quintal">Quintals (100 kg)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Target Price (₹ per unit)</label>
              <input
                type="number"
                className="ks-input"
                placeholder="e.g. 2400"
                value={newReq.targetPrice}
                onChange={(e) => setNewReq({ ...newReq, targetPrice: e.target.value })}
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Delivery Mandi / City Destination</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Navi Mumbai APMC, Pune Godown"
                value={newReq.deliveryLocation}
                onChange={(e) => setNewReq({ ...newReq, deliveryLocation: e.target.value })}
              />
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-label">Procurement Terms & Instructions</label>
            <textarea
              className="ks-input"
              rows={3}
              placeholder="e.g. Immediate delivery required, moisture under 10%, payment on delivery."
              value={newReq.message}
              onChange={(e) => setNewReq({ ...newReq, message: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Broadcast Demand
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BuyerRequirements;
