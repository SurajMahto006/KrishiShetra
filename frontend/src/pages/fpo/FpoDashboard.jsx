import React, { useState, useEffect } from 'react';
import { Users, Layers, TrendingUp, DollarSign, Plus, ArrowRight, ShieldCheck, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import fpoService from '../../services/fpoService';

export const FpoDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [aggregatedLots, setAggregatedLots] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadFpoData();
  }, []);

  const loadFpoData = async () => {
    setLoading(true);
    try {
      const [lotsRes, membersRes] = await Promise.all([
        fpoService.getAggregatedLots(),
        fpoService.getMembers()
      ]);

      if (lotsRes?.success && Array.isArray(lotsRes.data)) {
        setAggregatedLots(lotsRes.data);
      } else {
        setAggregatedLots([
          { lotId: 'FPO-BULK-101', crop: 'Soybean JS-335 (Aggregated)', volume: '450 MT', farmersCount: 38, basePrice: '₹4,950 / Qtl', status: 'Active' },
          { lotId: 'FPO-BULK-102', crop: 'Red Onion Export Lot', volume: '600 MT', farmersCount: 52, basePrice: '₹2,600 / Qtl', status: 'Active' },
          { lotId: 'FPO-BULK-103', crop: 'Sharbati Wheat Grade A', volume: '300 MT', farmersCount: 24, basePrice: '₹3,200 / Qtl', status: 'Sold' }
        ]);
      }

      if (membersRes?.success && Array.isArray(membersRes.data)) {
        setMembers(membersRes.data);
      }
    } catch (e) {
      console.error('Error fetching FPO dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const lotColumns = [
    {
      label: 'Bulk Lot Reference',
      key: 'lotId',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Aggregated Crop',
      key: 'crop',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Pooled Volume',
      key: 'volume',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-sage-dark)' }}>{val}</span>
    },
    {
      label: 'Contributing Farmers',
      key: 'farmersCount',
      render: (val) => <span>{val} Farmers</span>
    },
    {
      label: 'Target Base Price',
      key: 'basePrice',
      render: (val) => <span style={{ fontWeight: 700 }}>{val}</span>
    },
    {
      label: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            FPO Operations & Aggregation Hub
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Sahyadri Krishi Vikas Farmer Producer Company Ltd (Reg #MH-FPO-4412)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/fpo/lots">
            <Button variant="primary" icon={Plus}>
              Aggregate New Bulk Lot
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Registered Members"
          value="486 Farmers"
          subtext="Across 12 Village Clusters"
          variant="sage"
          icon={Users}
        />
        <StatCard
          label="Aggregated Volume"
          value="1,350 MT"
          subtext="Active harvest pooling"
          variant="amber"
          icon={Layers}
        />
        <StatCard
          label="Institutional Contracts"
          value="8 Active"
          subtext="Direct supply agreements"
          variant="blue"
          icon={Building}
        />
        <StatCard
          label="FPO Gross Turnover"
          value="₹3.42 Cr"
          subtext="FY 2026-27 YTD Settlement"
          variant="sage"
          icon={DollarSign}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <Card
          title="Active Aggregated Lots for Institutional Sourcing"
          subtitle="Pooled farmer produce available for bulk corporate procurement"
          action={
            <Link to="/fpo/lots" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All Lots <ArrowRight size={14} />
            </Link>
          }
        >
          <Table
            columns={lotColumns}
            data={aggregatedLots}
            emptyMessage="No aggregated lots currently active."
          />
        </Card>

        <Card title="Collection Center Activity" subtitle="Real-time intake at regional aggregation yards">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { yard: 'Niphad Collection Center', status: 'Active Intake', todayVol: '84 MT Received', crop: 'Onion Garwa' },
              { yard: 'Dindori Yard', status: 'Quality Assayed', todayVol: '42 MT Assayed', crop: 'Soybean Yellow' },
              { yard: 'Chandwad Hub', status: 'Dispatched to APEDA Port', todayVol: '60 MT Loaded', crop: 'Export Onion' }
            ].map((yard, idx) => (
              <div key={idx} style={{ padding: '12px 14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)', fontSize: '13.5px' }}>{yard.yard}</span>
                  <span className="ks-badge ks-badge--success" style={{ fontSize: '11px' }}>{yard.status}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ks-text-muted)' }}>
                  {yard.crop} · <strong style={{ color: 'var(--ks-charcoal)' }}>{yard.todayVol}</strong>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FpoDashboard;
