import React, { useState, useEffect } from 'react';
import { Truck, Package, Satellite, Users, Wallet, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import transporterService from '../../services/transporterService';

export const TransporterDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loads, setLoads] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    loadTransporterData();
  }, []);

  const loadTransporterData = async () => {
    setLoading(true);
    try {
      const [loadsRes, tripsRes] = await Promise.all([
        transporterService.getAvailableLoads(),
        transporterService.getActiveTrips()
      ]);

      if (loadsRes?.success && Array.isArray(loadsRes.data)) {
        setLoads(loadsRes.data);
      } else {
        setLoads([
          { id: 'LOAD-401', origin: 'Lasalgaon Mandi, Nashik', destination: 'Vashi APMC, Navi Mumbai', commodity: 'Onion Garwa (28 MT)', truckRequired: '32ft Multi-Axle', payout: '₹42,000', distance: '195 km', pickupDate: 'Tomorrow, 9:00 AM' },
          { id: 'LOAD-402', origin: 'Pimpalgaon Yard, MH', destination: 'Azadpur Mandi, Delhi', commodity: 'Tomato Hybrid (22 MT)', truckRequired: 'Reefer Insulated', payout: '₹1,18,000', distance: '1,240 km', pickupDate: 'Today Evening' },
          { id: 'LOAD-403', origin: 'Indore Central Yard, MP', destination: 'JNPT Port, Mumbai', commodity: 'Wheat Export (35 MT)', truckRequired: 'Open Trailer', payout: '₹68,000', distance: '580 km', pickupDate: '31 Aug' }
        ]);
      }

      if (tripsRes?.success && Array.isArray(tripsRes.data)) {
        setTrips(tripsRes.data);
      } else {
        setTrips([
          { id: 'TRP-882', truck: 'MH-15-EG-8842', driver: 'Suresh More', route: 'Nashik ➔ JNPT Port', status: 'In Transit', currentSpeed: '58 km/h', temp: '22°C' },
          { id: 'TRP-880', truck: 'MH-12-Q-4410', driver: 'Kailash Jadhav', route: 'Pimpalgaon ➔ Pune', status: 'In Transit', currentSpeed: '62 km/h', temp: '14°C' }
        ]);
      }
    } catch (e) {
      console.error('Error fetching transporter dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadColumns = [
    {
      label: 'Route Corridor',
      key: 'origin',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{row.origin} ➔ {row.destination}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{row.distance} · Loading: {row.pickupDate}</div>
        </div>
      )
    },
    {
      label: 'Produce & Specs',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>Truck: {row.truckRequired}</div>
        </div>
      )
    },
    {
      label: 'Freight Payout',
      key: 'payout',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{val}</span>
    },
    {
      label: 'Action',
      key: 'action',
      render: () => (
        <Link to="/transporter/loads">
          <Button variant="primary" size="sm">
            Accept / Bid
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Transporter Logistics & Fleet Radar
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Kisan Express Transporters · VAHAN Verified Carrier (Gold Tier ✓)
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Active Fleet"
          value="18 Trucks"
          subtext="14 On Duty · 4 Available"
          variant="sage"
          icon={Truck}
        />
        <StatCard
          label="Active Trips Live"
          value="6 En Route"
          subtext="AIS-140 GPS Synchronized"
          variant="blue"
          icon={Satellite}
        />
        <StatCard
          label="Available Loads"
          value="12 Requests"
          subtext="High-value mandi corridors"
          variant="amber"
          icon={Package}
        />
        <StatCard
          label="Net Earnings (Aug)"
          value="₹4,82,000"
          subtext="Instant FASTag & fuel settlements"
          variant="sage"
          icon={Wallet}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <Card
          title="High-Value Available Agri Produce Loads"
          subtitle="Direct pickup requests posted by verified FPOs & traders across India"
          action={
            <Link to="/transporter/loads" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-sage-dark)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View Load Board <ArrowRight size={14} />
            </Link>
          }
        >
          <Table
            columns={loadColumns}
            data={loads}
            emptyMessage="No available loads at this moment."
          />
        </Card>

        <Card title="Live Fleet Telemetry Status" subtitle="AIS-140 GPS & cargo sensor readouts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trips.map((trip) => (
              <div key={trip.id} style={{ padding: '12px 14px', background: 'var(--ks-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ks-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--ks-evergreen)', fontSize: '13px' }}>{trip.truck}</span>
                  <StatusBadge status={trip.status} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{trip.route}</div>
                <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)', marginTop: '2px' }}>
                  Driver: {trip.driver} · Speed: <strong style={{ color: 'var(--ks-charcoal)' }}>{trip.currentSpeed}</strong> · Reefer: <strong style={{ color: 'var(--ks-sage-dark)' }}>{trip.temp}</strong>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransporterDashboard;
