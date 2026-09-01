import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Layers, MapPin, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import farmerService from '../../services/farmerService';

export const FarmerLots = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLot, setSelectedLot] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newLot, setNewLot] = useState({
    commodity: '',
    variety: '',
    quantity: '',
    unit: 'Quintal',
    expectedPrice: '',
    location: '',
    qualityGrade: 'Grade A'
  });

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    setLoading(true);
    try {
      const res = await farmerService.getLots();
      if (res?.success && Array.isArray(res.data)) {
        setLots(res.data);
      }
    } catch (e) {
      console.error('Error fetching lots:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      const res = await farmerService.createLot(newLot);
      if (res.success) {
        setIsCreateOpen(false);
        loadLots();
      }
    } catch (e) {
      alert(e.message || 'Error creating lot');
    }
  };

  const filteredLots = lots.filter(lot =>
    (lot.commodity || '').toLowerCase().includes(search.toLowerCase()) ||
    (lot.variety || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      label: 'Lot ID',
      key: '_id',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--ks-text-muted)', fontSize: '12px' }}>#{val?.slice(-6) || 'LOT-882'}</span>
    },
    {
      label: 'Produce Name',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.variety || 'General'}</div>
        </div>
      )
    },
    {
      label: 'Quantity & Unit',
      key: 'quantity',
      render: (val, row) => <span style={{ fontWeight: 600 }}>{val} {row.unit || 'Qtl'}</span>
    },
    {
      label: 'Expected Price',
      key: 'expectedPrice',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-sage-dark)' }}>₹{val?.toLocaleString()}</span>
    },
    {
      label: 'Pickup Location',
      key: 'location',
      render: (val) => (
        <span style={{ fontSize: '12.5px', color: 'var(--ks-charcoal)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={13} color="var(--ks-text-muted)" /> {val || 'Farmgate'}
        </span>
      )
    },
    {
      label: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val || 'Active'} />
    },
    {
      label: 'Action',
      key: 'action',
      render: (_, row) => (
        <Button variant="secondary" size="sm" icon={Eye} onClick={() => setSelectedLot(row)}>
          Details
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Produce Lots Inventory
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Manage, update, and track status of your active agricultural produce lots.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
          Create New Lot
        </Button>
      </div>

      <Card>
        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              type="text"
              className="ks-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search lots by crop name, variety..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select className="ks-select" style={{ width: '160px' }}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredLots}
          emptyMessage="No produce lots found matching your filter criteria."
        />
      </Card>

      {/* Detail Modal */}
      {selectedLot && (
        <Modal
          isOpen={!!selectedLot}
          onClose={() => setSelectedLot(null)}
          title={`Lot Details: ${selectedLot.commodity}`}
          subtitle={`Grade: ${selectedLot.qualityGrade || 'Grade A'} · Lot #${selectedLot._id?.slice(-6)}`}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13.5px' }}>
            <div>
              <div style={{ color: 'var(--ks-text-muted)', fontSize: '12px' }}>Commodity</div>
              <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{selectedLot.commodity}</div>
            </div>
            <div>
              <div style={{ color: 'var(--ks-text-muted)', fontSize: '12px' }}>Variety</div>
              <div style={{ fontWeight: 700 }}>{selectedLot.variety || 'Standard'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--ks-text-muted)', fontSize: '12px' }}>Quantity Available</div>
              <div style={{ fontWeight: 700 }}>{selectedLot.quantity} {selectedLot.unit || 'Quintal'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--ks-text-muted)', fontSize: '12px' }}>Expected Rate</div>
              <div style={{ fontWeight: 700, color: 'var(--ks-sage-dark)' }}>₹{selectedLot.expectedPrice} / unit</div>
            </div>
            <div>
              <div style={{ color: 'var(--ks-text-muted)', fontSize: '12px' }}>Pickup Location</div>
              <div style={{ fontWeight: 600 }}>{selectedLot.location}</div>
            </div>
            <div>
              <div style={{ color: 'var(--ks-text-muted)', fontSize: '12px' }}>Current Status</div>
              <StatusBadge status={selectedLot.status || 'Active'} />
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Agricultural Produce Lot"
        subtitle="Publish your harvest directly to verified regional buyers"
      >
        <form onSubmit={handleCreateLot}>
          <div className="grid-2">
            <div className="ks-form-group">
              <label className="ks-label">Commodity</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Wheat"
                value={newLot.commodity}
                onChange={(e) => setNewLot({ ...newLot, commodity: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Variety</label>
              <input
                type="text"
                className="ks-input"
                placeholder="e.g. Sharbati"
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
                value={newLot.quantity}
                onChange={(e) => setNewLot({ ...newLot, quantity: e.target.value })}
                required
              />
            </div>
            <div className="ks-form-group">
              <label className="ks-label">Price (₹/Qtl)</label>
              <input
                type="number"
                className="ks-input"
                value={newLot.expectedPrice}
                onChange={(e) => setNewLot({ ...newLot, expectedPrice: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="ks-form-group">
            <label className="ks-label">Location</label>
            <input
              type="text"
              className="ks-input"
              placeholder="e.g. Nashik, Maharashtra"
              value={newLot.location}
              onChange={(e) => setNewLot({ ...newLot, location: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Lot</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FarmerLots;
