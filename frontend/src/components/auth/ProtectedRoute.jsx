import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppShell from '../layout/AppShell';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ks-bg-ivory)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--ks-sage)', borderRightColor: 'transparent', borderRadius: '50%', animation: 'ksSpin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--ks-evergreen)', fontWeight: 600 }}>Loading KrishiShetra...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine current active user role safely
  const currentRole = (
    role ||
    user?.role ||
    localStorage.getItem('krishi_user_role') ||
    'buyer'
  ).toLowerCase();

  // If specific roles are required, check role access
  if (allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    const hasRole = normalizedAllowed.includes(currentRole);

    if (!hasRole) {
      // User is attempting to access a route belonging to another role workspace
      return <Navigate to={`/${currentRole}/dashboard`} replace />;
    }
  }

  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
