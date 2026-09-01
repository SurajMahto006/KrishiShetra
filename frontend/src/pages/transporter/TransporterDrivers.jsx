import React from 'react';
import { Users, Plus, ShieldCheck, Phone } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const TransporterDrivers = () => {
  const drivers = [
    { id: 'DRV-101', name: 'Suresh More', phone: '+91 98220 99881', dlNo: 'MH-15-2015-884210', experience: '12 Years (Reefer Expert)', vehicleAssigned: 'MH-15-EG-8842', safetyScore: '98/100', status: 'On Duty' },
    { id: 'DRV-102', name: 'Kailash Jadhav', phone: '+91 94231 44552', dlNo: 'MH-12-2018-334109', experience: '8 Years (Long Haul)', vehicleAssigned: 'MH-12-Q-4410', safetyScore: '96/100', status: 'On Duty' },
    { id: 'DRV-103', name: 'Dnyaneshwar Shinde', phone: '+91 97650 11223', dlNo: 'MH-15-2019-774512', experience: '6 Years', vehicleAssigned: 'MH-15-DT-9912', safetyScore: '99/100', status: 'Available' }
  ];

  const columns = [
    {
      label: 'Driver Name',
      key: 'name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ks-evergreen)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {val} <ShieldCheck size={14} color="var(--ks-sage)" />
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>{row.phone}</div>
        </div>
      )
    },
    {
      label: 'Sarathi DL Verification',
      key: 'dlNo',
      render: (val) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12.5px' }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--status-success-text)' }}>✓ Verified Heavy Commercial</div>
        </div>
      )
    },
    {
      label: 'Assigned Vehicle',
      key: 'vehicleAssigned',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Safety Score',
      key: 'safetyScore',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--ks-sage-dark)' }}>{val}</span>
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
            Driver Roster & Sarathi Verification
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            MoRTH Sarathi validated commercial drivers with cold-chain cargo handling certifications.
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Onboard Driver
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={drivers}
          emptyMessage="No drivers enrolled."
        />
      </Card>
    </div>
  );
};

export default TransporterDrivers;
