import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, MapPin, Tag, ShoppingCart, Bookmark } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import buyerService from '../../services/buyerService';

export const BuyerMarketplace = () => {
  const [lots, setLots] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedLot, setSelectedLot] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidQuantity, setBidQuantity] = useState('');

  useEffect(() => {
    loadMarketLots();
  }, []);

  const loadMarketLots = async () => {
    try {
      const res = await buyerService.getMarketLots();
      if (res?.success && Array.isArray(res.data)) {
        setLots(res.data);
      } else {
        setLots([
          { _id: 'LOT-NIP-101', sellerName: 'Sahyadri FPO Consortium', commodity: 'Red Onion Garwa', variety: 'Export 55mm+', quantity: 150, unit: 'MT', pricePerUnit: 24500, location: 'Niphad, Nashik', grade: 'Grade A Export', harvestDate: 'Aug 2026', moisture: '10.5%' },
          { _id: 'LOT-OZ-104', sellerName: 'Kisan Vikas Producer Co.', commodity: 'Soybean (Yellow)', variety: 'JS-335 Cleaned', quantity: 80, unit: 'MT', pricePerUnit: 48900, location: 'Ozar, Maharashtra', grade: 'Grade A Oil Mill', harvestDate: 'Aug 2026', moisture: '9.2%' },
          { _id: 'LOT-PIN-202', sellerName: 'Ganesh Agro Farms', commodity: 'Tomato (Hybrid)', variety: 'Himsona Special', quantity: 45, unit: 'MT', pricePerUnit: 15500, location: 'Pimpalgaon, MH', grade: 'Grade A Processing', harvestDate: 'Aug 2026', moisture: 'Fresh Pick' },
          { _id: 'LOT-IND-305', sellerName: 'Malwa Agro Aggregators', commodity: 'Wheat (Sharbati)', variety: 'A-1 Premium Golden', quantity: 200, unit: 'MT', pricePerUnit: 31200, location: 'Indore Central Yard', grade: 'Grade A Milling', harvestDate: 'Jul 2026', moisture: '11.0%' }
        ]);
      }
    } catch (e) {
      console.error('Error loading market lots:', e);
    }
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    alert(`Offer submitted for ${bidQuantity} MT of ${selectedLot.commodity} at ₹${bidPrice}/MT!`);
    setSelectedLot(null);
    setBidPrice('');
    setBidQuantity('');
  };

  const filteredLots = lots.filter(l => {
    const matchesSearch = (l.commodity || '').toLowerCase().includes(search.toLowerCase()) ||
                          (l.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesCrop = selectedCrop === 'ALL' || (l.commodity || '').toLowerCase().includes(selectedCrop.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  const columns = [
    {
      label: 'Lot ID',
      key: '_id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-text-muted)', fontSize: '12px' }}>{val}</span>
    },
    {
      label: 'Commodity & Variety',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.variety} · <strong>{row.grade}</strong></div>
        </div>
      )
    },
    {
      label: 'Seller Organization',
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
      label: 'Available Volume',
      key: 'quantity',
      render: (val, row) => <span style={{ fontWeight: 700 }}>{val} {row.unit}</span>
    },
    {
      label: 'Base Rate / MT',
      key: 'pricePerUnit',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>₹{val?.toLocaleString()}</span>
    },
    {
      label: 'Actions',
      key: 'action',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" icon={Bookmark}>
            Save
          </Button>
          <Button variant="primary" size="sm" icon={ShoppingCart} onClick={() => { setSelectedLot(row); setBidPrice(row.pricePerUnit); setBidQuantity(row.quantity); }}>
            Make Offer
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Agricultural Marketplace & Lot Discovery
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Explore assayed farmgate produce and aggregated FPO harvest lots across India.
          </p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              type="text"
              className="ks-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search lots by commodity, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="ks-select"
            style={{ width: '180px' }}
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="ALL">All Commodities</option>
            <option value="Onion">Onion</option>
            <option value="Soybean">Soybean</option>
            <option value="Tomato">Tomato</option>
            <option value="Wheat">Wheat</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={filteredLots}
          emptyMessage="No matching lots in the marketplace."
        />
      </Card>

      {/* Offer Negotiation Modal */}
      {selectedLot && (
        <Modal
          isOpen={!!selectedLot}
          onClose={() => setSelectedLot(null)}
          title={`Submit Procurement Offer: ${selectedLot.commodity}`}
          subtitle={`Seller: ${selectedLot.sellerName} · Asking: ₹${selectedLot.pricePerUnit?.toLocaleString()} / MT`}
        >
          <form onSubmit={handlePlaceBid}>
            <div className="grid-2">
              <div className="ks-form-group">
                <label className="ks-label">Quantity to Purchase (MT)</label>
                <input
                  type="number"
                  className="ks-input"
                  value={bidQuantity}
                  onChange={(e) => setBidQuantity(e.target.value)}
                  max={selectedLot.quantity}
                  required
                />
              </div>
              <div className="ks-form-group">
                <label className="ks-label">Proposed Offer Rate (₹ / MT)</label>
                <input
                  type="number"
                  className="ks-input"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Estimated Total Trade Value:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
                ₹{((Number(bidQuantity) || 0) * (Number(bidPrice) || 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--ks-sage-dark)', marginTop: '2px' }}>
                ✓ Escrow protected payment release upon weighbridge & quality verification.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setSelectedLot(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Send Digital Offer</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BuyerMarketplace;
