import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  ShoppingCart,
  Eye,
  MapPin,
  ShieldCheck,
  Tag,
  Clock,
  RotateCcw,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import buyerService from '../../services/buyerService';

export const BuyerMarketplace = () => {
  const [lots, setLots] = useState([]);
  const [savedLotIds, setSavedLotIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filters & Search
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [detailedLot, setDetailedLot] = useState(null);
  const [selectedLotForOffer, setSelectedLotForOffer] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  useEffect(() => {
    loadMarketplace();
    loadSavedLots();
  }, [gradeFilter, stateFilter, sortBy]);

  const loadMarketplace = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        cropName: search || undefined,
        qualityGrade: gradeFilter || undefined,
        state: stateFilter || undefined,
        sort: sortBy || 'newest',
        limit: 24
      };

      const res = await buyerService.getMarketLots(params);
      if (res?.success) {
        setLots(res.lots || res.data || []);
      } else {
        setError(res?.message || 'Unable to load marketplace produce lots.');
      }
    } catch (err) {
      console.error('Marketplace fetch error:', err);
      setError('Network error while connecting to KrishiShetra Marketplace.');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedLots = async () => {
    try {
      const res = await buyerService.getSavedLots();
      if (res?.success && Array.isArray(res.savedLots)) {
        const idSet = new Set(res.savedLots.map(item => item.lotId || item._id));
        setSavedLotIds(idSet);
      }
    } catch (e) {
      console.warn('Could not fetch saved lots:', e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMarketplace();
  };

  const handleToggleSave = async (lot) => {
    const lotId = lot.lotId || lot._id;
    const isSaved = savedLotIds.has(lotId);

    try {
      if (isSaved) {
        await buyerService.removeSavedLot(lotId);
        setSavedLotIds(prev => {
          const next = new Set(prev);
          next.delete(lotId);
          return next;
        });
      } else {
        await buyerService.saveLot(lotId);
        setSavedLotIds(prev => new Set(prev).add(lotId));
      }
    } catch (err) {
      alert('Unable to update saved lots. Please try again.');
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
        setDetailedLot(null);
        setOfferPrice('');
        setOfferQty('');
        setOfferMessage('');
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

  const tableColumns = [
    {
      label: 'Produce & Specs',
      key: 'cropName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>
            {row.variety ? `${row.variety} · ` : ''}
            <span style={{ fontWeight: 600, color: 'var(--ks-sage-dark)' }}>Grade {row.qualityGrade || 'A'}</span>
          </div>
        </div>
      )
    },
    {
      label: 'Seller Organization',
      key: 'farmerName',
      render: (val) => (
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          {val || 'Verified Producer'} <ShieldCheck size={13} color="var(--ks-sage)" />
        </div>
      )
    },
    {
      label: 'Location',
      key: 'location',
      render: (_, row) => (
        <div style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} color="var(--ks-sage)" />
          <span>{row.district ? `${row.district}, ${row.state}` : 'Maharashtra'}</span>
        </div>
      )
    },
    {
      label: 'Volume',
      key: 'quantity',
      render: (val, row) => <span style={{ fontWeight: 700 }}>{val} {row.quantityUnit || 'Quintal'}</span>
    },
    {
      label: 'Asking Price',
      key: 'askingPrice',
      render: (val, row) => (
        <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>
          ₹{(val || 0).toLocaleString()} / {row.priceUnit || 'Quintal'}
        </span>
      )
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => setDetailedLot(row)}
          >
            Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => {
              setSelectedLotForOffer(row);
              setOfferPrice(row.askingPrice || '');
              setOfferQty(row.quantity || '');
            }}
          >
            Offer
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Agricultural Marketplace & Produce Discovery
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Direct farmgate and FPO harvest lots with transparent assay specs and escrow-protected procurement.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: '#FFFFFF', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-light)' }}>
          <button
            className={`ks-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
            style={{ width: '32px', height: '32px', background: viewMode === 'grid' ? 'var(--ks-surface-pale-sage)' : 'transparent', color: viewMode === 'grid' ? 'var(--ks-evergreen)' : 'var(--ks-text-muted)' }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`ks-icon-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
            style={{ width: '32px', height: '32px', background: viewMode === 'table' ? 'var(--ks-surface-pale-sage)' : 'transparent', color: viewMode === 'table' ? 'var(--ks-evergreen)' : 'var(--ks-text-muted)' }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              type="text"
              className="ks-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by crop (e.g. Onion, Soybean, Wheat)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="ks-select"
            style={{ width: '150px' }}
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="">All Quality Grades</option>
            <option value="A">Grade A (Premium)</option>
            <option value="B">Grade B (Standard)</option>
            <option value="C">Grade C (Processing)</option>
          </select>

          <select
            className="ks-select"
            style={{ width: '160px' }}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Punjab">Punjab</option>
          </select>

          <select
            className="ks-select"
            style={{ width: '170px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Newly Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <Button type="submit" variant="primary" icon={Search}>
            Search
          </Button>

          {(search || gradeFilter || stateFilter || sortBy !== 'newest') && (
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={() => {
                setSearch('');
                setGradeFilter('');
                setStateFilter('');
                setSortBy('newest');
              }}
            >
              Reset
            </Button>
          )}
        </form>
      </Card>

      {/* Error Banner */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={loadMarketplace}>
            Retry
          </Button>
        </div>
      )}

      {/* Content Rendering */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <Card key={n}>
              <Skeleton height={180} />
            </Card>
          ))}
        </div>
      ) : lots.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No produce lots found"
          description="Try broadening your search keywords or resetting your state and quality filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setGradeFilter('');
            setStateFilter('');
            setSortBy('newest');
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          {lots.map((lot) => {
            const lotId = lot.lotId || lot._id;
            const isSaved = savedLotIds.has(lotId);

            return (
              <Card key={lotId} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Top Bar: Grade & Save */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="ks-badge ks-badge--success" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                      Grade {lot.qualityGrade || 'A'}
                    </span>
                    <button
                      onClick={() => handleToggleSave(lot)}
                      title={isSaved ? 'Remove from Saved' : 'Save Lot'}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isSaved ? 'var(--ks-sage)' : 'var(--ks-text-muted)' }}
                    >
                      <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Crop Title */}
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ks-evergreen)', marginBottom: '4px' }}>
                    {lot.cropName}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--ks-text-muted)', marginBottom: '12px' }}>
                    {lot.variety ? `${lot.variety} · ` : ''}
                    Seller: <strong style={{ color: 'var(--ks-charcoal)' }}>{lot.farmerName || 'Verified Producer'}</strong>
                  </div>

                  {/* Price & Quantity Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Asking Rate
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ks-sage-dark)' }}>
                        ₹{(lot.askingPrice || 0).toLocaleString()}
                        <span style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--ks-text-muted)' }}> / {lot.priceUnit || 'Qtl'}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Available
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
                        {lot.quantity} <span style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--ks-text-muted)' }}>{lot.quantityUnit || 'Qtl'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Storage */}
                  <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    <MapPin size={13} color="var(--ks-sage)" />
                    <span>{lot.district ? `${lot.district}, ${lot.state}` : 'Maharashtra'}</span>
                    {lot.storageType && <span>· {lot.storageType}</span>}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--ks-border-subtle)', paddingTop: '14px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    style={{ flex: 1 }}
                    onClick={() => setDetailedLot(lot)}
                  >
                    Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ShoppingCart}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setSelectedLotForOffer(lot);
                      setOfferPrice(lot.askingPrice || '');
                      setOfferQty(lot.quantity || '');
                    }}
                  >
                    Make Offer
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Table columns={tableColumns} data={lots} emptyMessage="No lots matching query." />
        </Card>
      )}

      {/* Lot Details Modal */}
      {detailedLot && (
        <Modal
          isOpen={!!detailedLot}
          onClose={() => setDetailedLot(null)}
          title={`${detailedLot.cropName} (${detailedLot.variety || 'Standard'})`}
          subtitle={`Lot Reference: ${detailedLot.lotId || detailedLot._id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Asking Reserve Price</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ks-sage-dark)' }}>
                  ₹{(detailedLot.askingPrice || 0).toLocaleString()} / {detailedLot.priceUnit || 'Quintal'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Available Quantity</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
                  {detailedLot.quantity} {detailedLot.quantityUnit || 'Quintal'}
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ fontSize: '13.5px' }}>
              <div>
                <span style={{ color: 'var(--ks-text-muted)' }}>Quality Grade:</span>{' '}
                <strong style={{ color: 'var(--ks-evergreen)' }}>Grade {detailedLot.qualityGrade || 'A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--ks-text-muted)' }}>Storage Type:</span>{' '}
                <strong>{detailedLot.storageType || 'Warehouse Packhouse'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--ks-text-muted)' }}>Origin Location:</span>{' '}
                <strong>{detailedLot.district ? `${detailedLot.district}, ${detailedLot.state}` : 'Maharashtra'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--ks-text-muted)' }}>Seller:</span>{' '}
                <strong>{detailedLot.farmerName || 'Verified Producer'}</strong>
              </div>
            </div>

            {detailedLot.qualityNotes && (
              <div style={{ padding: '12px 14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)', marginBottom: 2 }}>Assay & Quality Notes</div>
                <div style={{ color: 'var(--ks-charcoal)' }}>{detailedLot.qualityNotes}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button
                variant="secondary"
                icon={Bookmark}
                onClick={() => handleToggleSave(detailedLot)}
              >
                {savedLotIds.has(detailedLot.lotId || detailedLot._id) ? 'Saved ✓' : 'Save to Shortlist'}
              </Button>
              <Button
                variant="primary"
                icon={ShoppingCart}
                onClick={() => {
                  setSelectedLotForOffer(detailedLot);
                  setOfferPrice(detailedLot.askingPrice || '');
                  setOfferQty(detailedLot.quantity || '');
                }}
              >
                Make Digital Offer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Make Offer Modal */}
      {selectedLotForOffer && (
        <Modal
          isOpen={!!selectedLotForOffer}
          onClose={() => setSelectedLotForOffer(null)}
          title={`Submit Procurement Offer: ${selectedLotForOffer.cropName}`}
          subtitle={`Seller: ${selectedLotForOffer.farmerName || 'Verified Producer'} · Asking: ₹${(selectedLotForOffer.askingPrice || 0).toLocaleString()} / ${selectedLotForOffer.priceUnit || 'Quintal'}`}
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
              <label className="ks-label">Procurement Terms & Notes</label>
              <textarea
                className="ks-input"
                rows={2}
                placeholder="e.g. Prompt payment on weighbridge delivery confirmation."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
              />
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--ks-surface-pale-sage-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-sage)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>Estimated Trade Commitment:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ks-evergreen)' }}>
                ₹{((Number(offerQty) || 0) * (Number(offerPrice) || 0)).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setSelectedLotForOffer(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingOffer}>
                Submit Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BuyerMarketplace;
