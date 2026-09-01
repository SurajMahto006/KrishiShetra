import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Download,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import buyerService from '../../services/buyerService';

export const BuyerPayments = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaymentLedger();
  }, []);

  const loadPaymentLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buyerService.getOrders();
      if (res?.success) {
        setOrders(res.orders || res.data || []);
      } else {
        setError(res?.message || 'Unable to load payment history.');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Network error while loading payment records.');
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics from actual orders
  const totalVolume = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const escrowLocked = orders
    .filter(o => (o.status || '').toLowerCase() !== 'completed' && (o.status || '').toLowerCase() !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const completedVolume = orders
    .filter(o => (o.status || '').toLowerCase() === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const columns = [
    {
      label: 'Transaction Ref',
      key: 'orderId',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--ks-evergreen)' }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>Seller: {row.farmerName || 'Verified Producer'}</div>
        </div>
      )
    },
    {
      label: 'Procured Commodity',
      key: 'cropName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>{row.quantity} {row.quantityUnit || 'Quintal'}</div>
        </div>
      )
    },
    {
      label: 'Trade Amount',
      key: 'totalAmount',
      render: (val) => (
        <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>
          ₹{(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      label: 'Payment Protection',
      key: 'paymentStatus',
      render: (val, row) => (
        <span className="ks-badge ks-badge--success" style={{ fontSize: '11px' }}>
          <ShieldCheck size={11} /> {val || row.paymentMethod || 'Escrow Secured'}
        </span>
      )
    },
    {
      label: 'Execution Date',
      key: 'createdAt',
      render: (val) => (
        <span style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    },
    {
      label: 'Order Status',
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
            Financial Ledger & Escrow Settlement
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Track electronic trade escrow allocations, completed disbursements, and GST procurement settlements.
          </p>
        </div>
        <Link to="/buyer/orders">
          <Button variant="secondary" icon={ShieldCheck}>
            View Orders
          </Button>
        </Link>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadPaymentLedger}>
            Retry
          </Button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Total Trade Commitments"
          value={loading ? '—' : `₹${totalVolume.toLocaleString()}`}
          subtext="Cumulative procurement volume"
          variant="sage"
          icon={DollarSign}
        />
        <StatCard
          label="Currently in Escrow Lock"
          value={loading ? '—' : `₹${escrowLocked.toLocaleString()}`}
          subtext="Protected until delivery & assay approval"
          variant="amber"
          icon={ShieldCheck}
        />
        <StatCard
          label="Settled & Disbursed"
          value={loading ? '—' : `₹${completedVolume.toLocaleString()}`}
          subtext="100% on-time weighbridge clearance"
          variant="blue"
          icon={CreditCard}
        />
      </div>

      {/* Transactions Table */}
      <Card title="Trade Escrow & Payment History" subtitle="Verified financial transactions tied to procurement orders">
        {loading ? (
          <Skeleton height={220} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payment records found"
            description="When you execute procurement orders, escrow lock and disbursement details will appear here."
            actionLabel="Explore Marketplace"
            onAction={() => navigate('/buyer/marketplace')}
          />
        ) : (
          <Table
            columns={columns}
            data={orders}
            emptyMessage="No financial records found."
          />
        )}
      </Card>
    </div>
  );
};

export default BuyerPayments;
