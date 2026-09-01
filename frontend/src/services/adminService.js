import api from './api';

export const adminService = {
  // Stats & Overview
  getOverview: () => api.get('/admin/overview'),
  
  // Users Management
  getUsers: () => api.get('/admin/users'),
  verifyUser: (userId, status) => api.patch(`/admin/users/${userId}/verify`, { status }),

  // Farmers
  getFarmers: () => api.get('/admin/farmers'),

  // Reports & Audits
  getReports: () => api.get('/admin/reports'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings)
};

export default adminService;
