import api from './api';

export const farmerService = {
  // Lots
  getLots: () => api.get('/lots/my-lots'),
  createLot: (lotData) => api.post('/lots', lotData),
  getLotById: (id) => api.get(`/lots/${id}`),

  // Market Prices & Trends
  getMarketPrices: () => api.get('/market/prices'),
  getMarketCommodities: () => api.get('/market/commodities'),
  getMarketTrends: (commodity) => api.get(`/market/trends?commodity=${encodeURIComponent(commodity || '')}`),

  // Orders
  getOrders: () => api.get('/orders'),

  // Buyers Directory & Inquiries
  getBuyers: () => api.get('/inquiries/buyers'),
  getInquiries: () => api.get('/inquiries'),
  respondToInquiry: (id, response) => api.post(`/inquiries/${id}/respond`, response),

  // AI Forecast & Intelligence
  getAiForecast: () => api.get('/market/forecast')
};

export default farmerService;
