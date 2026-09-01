import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Farmer Workspace
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerLots from './pages/farmer/FarmerLots';
import FarmerMarket from './pages/farmer/FarmerMarket';
import FarmerForecast from './pages/farmer/FarmerForecast';
import FarmerBuyers from './pages/farmer/FarmerBuyers';
import FarmerOrders from './pages/farmer/FarmerOrders';

// FPO Workspace
import FpoDashboard from './pages/fpo/FpoDashboard';
import FpoMembers from './pages/fpo/FpoMembers';
import FpoLots from './pages/fpo/FpoLots';
import FpoMarket from './pages/fpo/FpoMarket';
import FpoOrders from './pages/fpo/FpoOrders';

// Buyer Workspace
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerMarketplace from './pages/buyer/BuyerMarketplace';
import BuyerLots from './pages/buyer/BuyerLots';
import BuyerOffers from './pages/buyer/BuyerOffers';
import BuyerOrders from './pages/buyer/BuyerOrders';
import BuyerLogistics from './pages/buyer/BuyerLogistics';
import BuyerPayments from './pages/buyer/BuyerPayments';
import BuyerRequirements from './pages/buyer/BuyerRequirements';
import BuyerProfile from './pages/buyer/BuyerProfile';

// Transporter Workspace
import TransporterDashboard from './pages/transporter/TransporterDashboard';
import TransporterLoads from './pages/transporter/TransporterLoads';
import TransporterTrips from './pages/transporter/TransporterTrips';
import TransporterFleet from './pages/transporter/TransporterFleet';
import TransporterDrivers from './pages/transporter/TransporterDrivers';
import TransporterEarnings from './pages/transporter/TransporterEarnings';
import TransporterProfile from './pages/transporter/TransporterProfile';

// Admin Workspace
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFarmers from './pages/admin/AdminFarmers';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Not Found
import NotFoundPage from './pages/NotFoundPage';

// Dynamic Role Redirection Component
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ks-bg-ivory)' }}>
        <p style={{ color: 'var(--ks-evergreen)', fontWeight: 600 }}>Loading KrishiShetra...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (role || 'farmer').toLowerCase();
  return <Navigate to={`/${userRole}/dashboard`} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Farmer Workspace Routes */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/lots"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <FarmerLots />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/market"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <FarmerMarket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/forecast"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <FarmerForecast />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/buyers"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <FarmerBuyers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <FarmerOrders />
              </ProtectedRoute>
            }
          />

          {/* FPO Workspace Routes */}
          <Route
            path="/fpo/dashboard"
            element={
              <ProtectedRoute allowedRoles={['fpo', 'admin']}>
                <FpoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/members"
            element={
              <ProtectedRoute allowedRoles={['fpo', 'admin']}>
                <FpoMembers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/lots"
            element={
              <ProtectedRoute allowedRoles={['fpo', 'admin']}>
                <FpoLots />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/market"
            element={
              <ProtectedRoute allowedRoles={['fpo', 'admin']}>
                <FpoMarket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/orders"
            element={
              <ProtectedRoute allowedRoles={['fpo', 'admin']}>
                <FpoOrders />
              </ProtectedRoute>
            }
          />

          {/* Buyer Workspace Routes */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/marketplace"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerMarketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/requirements"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerRequirements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/lots"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerLots />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/offers"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerOffers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/logistics"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerLogistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/payments"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/profile"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerProfile />
              </ProtectedRoute>
            }
          />

          {/* Transporter Workspace Routes */}
          <Route
            path="/transporter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['transporter', 'admin']}>
                <TransporterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/loads"
            element={
              <ProtectedRoute allowedRoles={['transporter', 'admin']}>
                <TransporterLoads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/trips"
            element={
              <ProtectedRoute allowedRoles={['transporter', 'admin']}>
                <TransporterTrips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/fleet"
            element={
              <ProtectedRoute allowedRoles={['transporter', 'admin']}>
                <TransporterFleet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/drivers"
            element={
              <ProtectedRoute allowedRoles={['transporter', 'admin']}>
                <TransporterDrivers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/earnings"
            element={
              <ProtectedRoute allowedRoles={['transporter', 'admin']}>
                <TransporterEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/profile"
            element={
              <ProtectedRoute allowedRoles={['transporter', 'admin']}>
                <TransporterProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Workspace Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/farmers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminFarmers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
