import React, { useState } from 'react';
import { Package, Search, Filter, MapPin, Truck, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

export const TransporterLoads = () => {
  const [search, setSearch] = useState('');

  const loads = [
    { id: 'LOAD-401', origin: 'Lasalgaon Mandi, Nashik', destination: 'Vashi APMC, Navi Mumbai', fpo: 'Sahyadri FPO Consortium', commodity: 'Onion Garwa (28 MT)', truckRequired: '32ft Multi-Axle', temp: 'Normal Ventilated', payout: '₹42,000', distance: '195 km', pickupDate: 'Tomorrow, 9:00 AM' },
    { id: 'LOAD-402', origin: 'Pimpalgaon Yard, MH', destination: 'Azadpur Mandi, Delhi', fpo: 'MahaAgro Food Processing', commodity: 'Tomato Hybrid (22 MT)', truckRequired: 'Reefer Insulated', temp: '14°C Required', payout: '₹1,18,000', distance: '1,240 km', pickupDate: 'Today Evening' },
    { id: 'LOAD-403', origin: 'Indore Central Yard, MP', destination: 'JNPT Port, Mumbai', fpo: 'Malwa Agro Producer Co.', commodity: 'Wheat Export (35 MT)', truckRequired: 'Open Trailer', temp: 'Dry', payout: '₹68,000', distance: '580 km', pickupDate: '31 Aug' },
    { id: 'LOAD-404', origin: 'Dindori Cold Hub, MH', destination: 'Bengaluru APMC, KA', fpo: 'Kisan Vikas Consortium', commodity: 'Pomegranate Bhagwa (18 MT)', truckRequired: 'Cold-Chain Reefer', temp: '4°C APEDA Standard', payout: '₹95,000', distance: '980 km', pickupDate: '01 Sep' }
  ];

  const columns = [
    {
      label: 'Load ID',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Origin & Destination',
      key: 'origin',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.origin} ➔ {row.destination}</div>
          <div style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>FPO: {row.fpo} · {row.distance}</div>
        </div>
      )
    },
    {
      label: 'Produce & Specs',
      key: 'commodity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>{row.truckRequired} · {row.temp}</div>
        </div>
      )
    },
    {
      label: 'Guaranteed Payout',
      key: 'payout',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)', fontSize: '15px' }}>{val}</span>
    },
    {
      label: 'Pickup Window',
      key: 'pickupDate',
      render: (val) => <span style={{ fontSize: '12.5px' }}>{val}</span>
    },
    {
      label: 'Action',
      key: 'action',
      render: (_, row) => (
        <Button variant="primary" size="sm" icon={Check} onClick={() => alert(`Load ${row.id} accepted! Assigned to fleet.`)}>
          Accept Load
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Available Agri Produce Freight Load Board
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Direct freight loads posted by verified FPOs & Traders across India with guaranteed payment protection.
          </p>
        </div>
      </div>

      <Card>
        <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
          <input
            type="text"
            className="ks-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search loads by origin, destination, commodity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          data={loads}
          emptyMessage="No available loads found."
        />
      </Card>
    </div>
  );
};

export default TransporterLoads;
