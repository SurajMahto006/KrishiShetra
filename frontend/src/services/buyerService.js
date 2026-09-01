import api from './api';

export const buyerService = {
  // Marketplace & Lots Discovery
  getMarketLots: (params) => api.get('/buyer/market', { params }),
  getSavedLots: () => api.get('/buyer/saved-lots'),
  saveLot: (lotId) => api.post('/buyer/saved-lots', { lotId }),
  removeSavedLot: (lotId) => api.delete(`/buyer/saved-lots/${lotId}`),

  // Offers & Procurement Negotiations
  getOffers: () => api.get('/offers'),
  createOffer: (offerData) => api.post('/offers', offerData),

  // Orders
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),

  // Inquiries / Demands
  postRequirement: (reqData) => api.post('/inquiries', reqData),
  getMyRequirements: () => api.get('/inquiries/my-inquiries')
};

export default buyerService;
