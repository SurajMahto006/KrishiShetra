import api from './api';

export const fpoService = {
  // FPO Dashboard Stats
  getOverview: () => api.get('/farmer/dashboard-stats'),
  
  // Aggregated Lots & Members
  getAggregatedLots: () => api.get('/lots'),
  createAggregatedLot: (data) => api.post('/lots', data),
  getMembers: () => api.get('/farmer/farmers-list'),
  
  // Market Demands & Inquiries
  getMarketDemands: () => api.get('/inquiries'),
  getOrders: () => api.get('/orders'),

  // Price Intelligence
  getPriceIntelligence: () => api.get('/market/prices')
};

export default fpoService;
