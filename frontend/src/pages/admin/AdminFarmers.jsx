import React from 'react';
import { UserCheck, ShieldCheck, MapPin, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const AdminFarmers = () => {
  const farmers = [
    { id: 'FMR-1001', name: 'Ramesh Patil', landRecord7_12: 'Verified (Survey #142/2A)', aadhaar: 'XXXX-XXXX-4812 (Verified)', village: 'Pimpalgaon, Niphad', crops: 'Onion Garwa (4.5 Acres)', status: 'Verified' },
    { id: 'FMR-1002', name: 'Sunil Shinde', landRecord7_12: 'Verified (Survey #88/1B)', aadhaar: 'XXXX-XXXX-9914 (Verified)', village: 'Ozar, Nashik', crops: 'Soybean (6.0 Acres)', status: 'Verified' },
    { id: 'FMR-1003', name: 'Babu Rao Shelke', landRecord7_12: 'Document Uploaded', aadhaar: 'XXXX-XXXX-3341', village: 'Dindori, Nashik', crops: 'Grapes (3.0 Acres)', status: 'Pending Review' }
  ];

  const columns = [
    {
      label: 'Farmer ID',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Farmer Name & Village',
      key: 'name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}><MapPin size={11} style={{ display: 'inline' }} /> {row.village}</div>
        </div>
      )
    },
    {
      label: 'Land Record (7/12 & 8A)',
      key: 'landRecord7_12',
      render: (val) => <span style={{ fontWeight: 600, fontSize: '12.5px' }}>{val}</span>
    },
    {
      label: 'Aadhaar / e-KYC',
      key: 'aadhaar',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>{val}</span>
    },
    {
      label: 'Cultivated Produce',
      key: 'crops',
      render: (val) => <span className="ks-badge ks-badge--info">{val}</span>
    },
    {
      label: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Action',
      key: 'action',
      render: (_, row) => (
        row.status === 'Pending Review' ? (
          <Button variant="primary" size="sm" icon={Check}>
            Verify
          </Button>
        ) : (
          <Button variant="secondary" size="sm">
            Records
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            Farmer Verification & Land Record Audits
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Digitized Maharashtra Bhulekh 7/12 and Aadhaar biometric KYC validations.
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={farmers}
          emptyMessage="No farmer records found."
        />
      </Card>
    </div>
  );
};

export default AdminFarmers;
