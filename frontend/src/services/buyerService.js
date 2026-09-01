import api from './api';

export const buyerService = {
  // 1. Marketplace & Produce Discovery
  getMarketLots: (params = {}) => api.get('/buyer/market/lots', { params }),
  getLotDetails: (lotId) => api.get(`/buyer/market/lots/${lotId}`),

  // 2. Saved Lots / Shortlist
  getSavedLots: () => api.get('/buyer/saved-lots'),
  saveLot: (lotId) => api.post(`/buyer/saved-lots/${lotId}`),
  removeSavedLot: (lotId) => api.delete(`/buyer/saved-lots/${lotId}`),

  // 3. Offers & Negotiations
  getOffers: (params = {}) => api.get('/offers/my', { params }),
  createOffer: (offerData) => api.post('/offers', offerData),
  cancelOffer: (offerId) => api.put(`/offers/${offerId}/cancel`),

  // 4. Procurement Orders
  getOrders: (params = {}) => api.get('/orders/my', { params }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  cancelOrder: (orderId, reason) => api.put(`/orders/${orderId}/cancel`, { reason }),

  // 5. Procurement Requirements / Inquiries
  getMyRequirements: () => api.get('/inquiries/my'),
  postRequirement: (reqData) => api.post('/inquiries', reqData),
  getInquiryDetails: (id) => api.get(`/inquiries/${id}`),

  // 6. Logistics Requests
  getLogisticsRequests: () => api.get('/transport/requests/buyer'),
  createLogisticsRequest: (data) => api.post('/transport/requests', data),
  cancelLogisticsRequest: (requestId, reason) => api.put(`/transport/requests/${requestId}/cancel`, { reason }),

  // 7. Buyer Profile & Verification
  getProfile: () => api.get('/buyer/profile'),
  updateProfile: (profileData) => api.put('/buyer/profile', profileData)
};

export default buyerService;
