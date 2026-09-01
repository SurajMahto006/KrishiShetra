import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Trash2,
  ShoppingCart,
  Eye,
  MapPin,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Package
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import buyerService from '../../services/buyerService';

export const BuyerLots = () => {
  const [savedLots, setSavedLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Offer Modal State
  const [selectedLotForOffer, setSelectedLotForOffer] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  useEffect(() => {
    loadSavedLots();
  }, []);

  const loadSavedLots = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buyerService.getSavedLots();
      if (res?.success) {
        setSavedLots(res.savedLots || res.data || []);
      } else {
        setError(res?.message || 'Unable to load your saved produce lots.');
      }
    } catch (err) {
      console.error('Error fetching saved lots:', err);
      setError('Network error while loading saved lots.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (lotId) => {
    try {
      const res = await buyerService.removeSavedLot(lotId);
      if (res?.success) {
        setSavedLots(prev => prev.filter(item => (item.lotId || item._id) !== lotId));
      }
    } catch (err) {
      alert('Failed to remove saved lot.');
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

  const columns = [
    {
      label: 'Lot Reference',
      key: 'lotId',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{row.cropName}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>ID: {val || row._id}</div>
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
      label: 'Origin Location',
      key: 'district',
      render: (val, row) => (
        <div style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} color="var(--ks-sage)" />
          <span>{val ? `${val}, ${row.state}` : 'Maharashtra'}</span>
        </div>
      )
    },
    {
      label: 'Available Volume',
      key: 'quantity',
      render: (val, row) => <span style={{ fontWeight: 700 }}>{val} {row.quantityUnit || 'Quintal'}</span>
    },
    {
      label: 'Asking Rate',
      key: 'askingPrice',
      render: (val, row) => (
        <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>
          ₹{(val || 0).toLocaleString()} / {row.priceUnit || 'Quintal'}
        </span>
      )
    },
    {
      label: 'Actions',
      key: 'action',
      render: (_, row) => {
        const id = row.lotId || row._id;
        return (
          <div style={{ display: 'flex', gap: 8 }}>
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
              Make Offer
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleRemoveSaved(id)}
              title="Remove from saved"
            >
              Remove
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Saved & Shortlisted Produce Lots
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Bookmark farmgate harvest lots to monitor price changes and initiate bulk negotiations.
          </p>
        </div>
        <Link to="/buyer/marketplace">
          <Button variant="secondary" icon={Package}>
            Browse Marketplace
          </Button>
        </Link>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadSavedLots}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        {loading ? (
          <Skeleton height={220} />
        ) : savedLots.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved produce lots"
            description="Save lots you are interested in from the Marketplace to compare prices and make bulk offers."
            actionLabel="Explore Marketplace"
            onAction={() => window.location.href = '/buyer/marketplace'}
          />
        ) : (
          <Table
            columns={columns}
            data={savedLots}
            emptyMessage="No saved lots."
          />
        )}
      </Card>

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
              <label className="ks-label">Procurement Terms / Notes</label>
              <textarea
                className="ks-input"
                rows={2}
                placeholder="e.g. Ready for prompt pickup with weighbridge settlement."
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

export default BuyerLots;
