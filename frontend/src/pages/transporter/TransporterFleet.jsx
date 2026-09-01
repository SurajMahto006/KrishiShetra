import React from 'react';
import { Truck, Plus, ShieldCheck, Download } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const TransporterFleet = () => {
  const fleet = [
    { id: 'VEH-01', regNo: 'MH-15-EG-8842', type: '32ft Multi-Axle Reefer', capacity: '28 MT', permit: 'All India National Permit', fitnessValid: 'Valid (Nov 2027)', gpsStatus: 'Live (AIS-140)', status: 'On Duty' },
    { id: 'VEH-02', regNo: 'MH-12-Q-4410', type: 'Containerized Reefer', capacity: '22 MT', permit: 'National Goods Permit', fitnessValid: 'Valid (Aug 2027)', gpsStatus: 'Live (AIS-140)', status: 'On Duty' },
    { id: 'VEH-03', regNo: 'MH-15-DT-9912', type: 'Open Heavy Duty Body', capacity: '35 MT', permit: 'Maharashtra State Permit', fitnessValid: 'Valid (Mar 2028)', gpsStatus: 'Live (AIS-140)', status: 'Available' },
    { id: 'VEH-04', regNo: 'MH-14-AZ-2234', type: 'Taurus Multi-Axle', capacity: '25 MT', permit: 'All India Permit', fitnessValid: 'Valid (Jan 2028)', gpsStatus: 'Live (AIS-140)', status: 'Available' }
  ];

  const columns = [
    {
      label: 'Vehicle Reg. No.',
      key: 'regNo',
      render: (val) => (
        <div style={{ fontWeight: 800, color: 'var(--ks-evergreen)' }}>
          {val}
        </div>
      )
    },
    {
      label: 'Vehicle Specifications',
      key: 'type',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>Payload: <strong style={{ color: 'var(--ks-sage-dark)' }}>{row.capacity}</strong></div>
        </div>
      )
    },
    {
      label: 'National Permit & Fitness',
      key: 'permit',
      render: (val, row) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--status-success-text)' }}>✓ {row.fitnessValid}</div>
        </div>
      )
    },
    {
      label: 'AIS-140 Telemetry',
      key: 'gpsStatus',
      render: (val) => <span className="ks-badge ks-badge--info">{val}</span>
    },
    {
      label: 'Operational Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Fleet Registry & VAHAN Compliance
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Certified agricultural multi-axle and temperature-controlled reefer fleet.
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Add New Vehicle
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={fleet}
          emptyMessage="No vehicles registered in fleet."
        />
      </Card>
    </div>
  );
};

export default TransporterFleet;
