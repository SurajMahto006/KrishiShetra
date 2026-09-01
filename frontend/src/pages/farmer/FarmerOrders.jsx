import React, { useState, useEffect } from 'react';
import { FileText, Truck, ShieldCheck, Download, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import farmerService from '../../services/farmerService';

export const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await farmerService.getOrders();
      if (res?.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([
          { orderId: 'ORD-98421', buyer: 'Sahyadri Agro Mega Food Park', commodity: 'Red Onion', quantity: '100 Qtl', amount: 245000, status: 'In Transit', date: '28 Aug 2026' },
          { orderId: 'ORD-98110', buyer: 'MahaAgro Food Processing Ltd', commodity: 'Soybean (Yellow)', quantity: '80 Qtl', amount: 391200, status: 'Delivered', date: '22 Aug 2026' },
          { orderId: 'ORD-97855', buyer: 'Reliance Retail Agri Sourcing', commodity: 'Tomato Hybrid', quantity: '50 Qtl', amount: 77500, status: 'Delivered', date: '15 Aug 2026' }
        ]);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      label: 'Order ID',
      key: 'orderId',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val || '#ORD-882'}</span>
    },
    {
      label: 'Buyer Name',
      key: 'buyer',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Produce & Qty',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.quantity}</div>
        </div>
      )
    },
    {
      label: 'Order Value',
      key: 'amount',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>₹{val?.toLocaleString()}</span>
    },
    {
      label: 'Order Date',
      key: 'date',
      render: (val) => <span style={{ fontSize: '12.5px', color: 'var(--ks-text-muted)' }}>{val}</span>
    },
    {
      label: 'Fulfillment Status',
      key: 'status',
      render: (val) => <StatusBadge status={val || 'Active'} />
    },
    {
      label: 'Actions',
      key: 'action',
      render: () => (
        <Button variant="secondary" size="sm" icon={Download}>
          Invoice
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Orders & Trade Settlements
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Track dispatch verification, escrow payment releases, and GST e-way bills.
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={orders}
          emptyMessage="No trade orders placed yet."
        />
      </Card>
    </div>
  );
};

export default FarmerOrders;
