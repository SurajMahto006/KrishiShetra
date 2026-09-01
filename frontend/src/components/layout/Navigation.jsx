import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Sparkles,
  Building2,
  FileText,
  Users,
  Layers,
  Truck,
  ShieldCheck,
  Wallet,
  UserCheck,
  BarChart2,
  Settings,
  CreditCard
} from 'lucide-react';

const NAV_CONFIG = {
  farmer: [
    { label: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'My Lots', path: '/farmer/lots', icon: Package },
    { label: 'Market Prices', path: '/farmer/market', icon: TrendingUp },
    { label: 'AI Advisory', path: '/farmer/forecast', icon: Sparkles },
    { label: 'Buyers', path: '/farmer/buyers', icon: Building2 },
    { label: 'Orders', path: '/farmer/orders', icon: FileText }
  ],
  fpo: [
    { label: 'Operations', path: '/fpo/dashboard', icon: LayoutDashboard },
    { label: 'Members', path: '/fpo/members', icon: Users },
    { label: 'Aggregated Lots', path: '/fpo/lots', icon: Layers },
    { label: 'Market Intel', path: '/fpo/market', icon: TrendingUp },
    { label: 'Orders', path: '/fpo/orders', icon: FileText }
  ],
  buyer: [
    { label: 'Sourcing Hub', path: '/buyer/dashboard', icon: LayoutDashboard },
    { label: 'Marketplace', path: '/buyer/marketplace', icon: Package },
    { label: 'Saved Lots', path: '/buyer/lots', icon: Layers },
    { label: 'Offers', path: '/buyer/offers', icon: FileText },
    { label: 'Orders', path: '/buyer/orders', icon: ShieldCheck },
    { label: 'Logistics', path: '/buyer/logistics', icon: Truck },
    { label: 'Payments', path: '/buyer/payments', icon: CreditCard }
  ],
  transporter: [
    { label: 'Dashboard', path: '/transporter/dashboard', icon: LayoutDashboard },
    { label: 'Available Loads', path: '/transporter/loads', icon: Package },
    { label: 'Active Trips', path: '/transporter/trips', icon: Truck },
    { label: 'Fleet', path: '/transporter/fleet', icon: ShieldCheck },
    { label: 'Drivers', path: '/transporter/drivers', icon: Users },
    { label: 'Earnings', path: '/transporter/earnings', icon: Wallet },
    { label: 'KYC & Profile', path: '/transporter/profile', icon: UserCheck }
  ],
  admin: [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Farmers', path: '/admin/farmers', icon: UserCheck },
    { label: 'Reports', path: '/admin/reports', icon: BarChart2 },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ]
};

export const Navigation = ({ role = 'farmer' }) => {
  const currentNav = NAV_CONFIG[role.toLowerCase()] || NAV_CONFIG.farmer;

  return (
    <nav className="ks-nav">
      {currentNav.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `ks-nav__link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navigation;
