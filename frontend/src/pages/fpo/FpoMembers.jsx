import React, { useState } from 'react';
import { Users, Search, Plus, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

export const FpoMembers = () => {
  const [search, setSearch] = useState('');

  const members = [
    { id: 'MEM-001', name: 'Ramesh Patil', village: 'Pimpalgaon, Niphad', phone: '+91 98220 11442', landAcre: '4.5 Acres', primaryCrop: 'Onion & Grapes', kyc: 'Verified' },
    { id: 'MEM-002', name: 'Sunil Shinde', village: 'Ozar, Nashik', phone: '+91 94231 88721', landAcre: '6.0 Acres', primaryCrop: 'Soybean & Wheat', kyc: 'Verified' },
    { id: 'MEM-003', name: 'Ganesh Gaikwad', village: 'Saikheda, Niphad', phone: '+91 97654 32109', landAcre: '3.2 Acres', primaryCrop: 'Tomato & Vegetables', kyc: 'Verified' },
    { id: 'MEM-004', name: 'Ananda Jadhav', village: 'Dindori, Nashik', phone: '+91 98811 22334', landAcre: '8.0 Acres', primaryCrop: 'Pomegranate & Onion', kyc: 'Verified' },
    { id: 'MEM-005', name: 'Balu Barde', village: 'Lasalgaon, Chandwad', phone: '+91 99700 44556', landAcre: '5.5 Acres', primaryCrop: 'Red Onion Garwa', kyc: 'Verified' }
  ];

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.village.toLowerCase().includes(search.toLowerCase()) ||
    m.primaryCrop.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      label: 'Member ID',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Farmer Name',
      key: 'name',
      render: (val) => (
        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          {val} <ShieldCheck size={14} color="var(--ks-sage)" />
        </div>
      )
    },
    {
      label: 'Village Cluster',
      key: 'village',
      render: (val) => (
        <span style={{ fontSize: '12.5px', color: 'var(--ks-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} /> {val}
        </span>
      )
    },
    {
      label: 'Contact',
      key: 'phone',
      render: (val) => <span style={{ fontSize: '12.5px' }}>{val}</span>
    },
    {
      label: 'Landholding',
      key: 'landAcre',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      label: 'Crops Pooled',
      key: 'primaryCrop',
      render: (val) => <span className="ks-badge ks-badge--info">{val}</span>
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            FPO Member Registry & Farmer Directory
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            KYC-verified farmer shareholders, pooled acreage, and seasonal aggregation quotas.
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Enroll New Farmer
        </Button>
      </div>

      <Card>
        <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
          <input
            type="text"
            className="ks-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search members by name, village, crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          data={filteredMembers}
          emptyMessage="No registered farmer members found."
        />
      </Card>
    </div>
  );
};

export default FpoMembers;
