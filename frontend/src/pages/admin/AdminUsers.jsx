import React, { useState } from 'react';
import { Users, Search, ShieldCheck, Check, X, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';

export const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const users = [
    { id: 'USR-101', name: 'Ramesh Patil', email: 'ramesh.patil@agri.in', phone: '+91 98220 11442', role: 'Farmer', state: 'Maharashtra', kyc: 'Verified', status: 'Active' },
    { id: 'USR-102', name: 'Sahyadri Agro FPC Ltd', email: 'contact@sahyadriagro.org', phone: '+91 94231 88721', role: 'FPO', state: 'Maharashtra', kyc: 'Verified', status: 'Active' },
    { id: 'USR-103', name: 'MahaAgro Sourcing Ltd', email: 'procurement@mahaagro.com', phone: '+91 97654 32109', role: 'Buyer', state: 'Maharashtra', kyc: 'Verified', status: 'Active' },
    { id: 'USR-104', name: 'Kisan Express Logistics', email: 'ops@kisanexpress.in', phone: '+91 98811 22334', role: 'Transporter', state: 'Maharashtra', kyc: 'Verified', status: 'Active' },
    { id: 'USR-105', name: 'Malwa Agro Producer Co.', email: 'ops@malwaagro.org', phone: '+91 99700 44556', role: 'FPO', state: 'Madhya Pradesh', kyc: 'Pending Review', status: 'Pending' }
  ];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      label: 'User ID',
      key: 'id',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--ks-evergreen)' }}>{val}</span>
    },
    {
      label: 'Name / Organization',
      key: 'name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{val}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ks-text-muted)' }}>{row.email} · {row.phone}</div>
        </div>
      )
    },
    {
      label: 'Assigned Role',
      key: 'role',
      render: (val) => <span className="ks-badge ks-badge--info">{val}</span>
    },
    {
      label: 'State',
      key: 'state',
      render: (val) => <span>{val}</span>
    },
    {
      label: 'KYC Status',
      key: 'kyc',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Account Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Actions',
      key: 'action',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="secondary" size="sm">
            Inspect
          </Button>
          {row.status === 'Pending' && (
            <Button variant="primary" size="sm" icon={Check}>
              Approve
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '26px', color: 'var(--ks-evergreen)' }}>
            User Management & Role Access Governance
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ks-text-muted)' }}>
            Manage verified credentials, KYC verification requests, and account privileges.
          </p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ks-text-muted)' }} />
            <input
              type="text"
              className="ks-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search users by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="ks-select"
            style={{ width: '160px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="fpo">FPOs</option>
            <option value="buyer">Buyers</option>
            <option value="transporter">Transporters</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={filteredUsers}
          emptyMessage="No users found."
        />
      </Card>
    </div>
  );
};

export default AdminUsers;
