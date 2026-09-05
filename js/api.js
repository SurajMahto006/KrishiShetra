/**
 * KRISHISHETRA — CENTRAL API CLIENT
 * Handles JWT authentication headers, global 401 redirection,
 * error parsing, and provides structured methods for all backend endpoints.
 */

/**
 * Production and Development API Endpoints
 */
const PROD_API_URL = 'https://krishishetra-1.onrender.com/api';
const DEV_API_URL = 'http://localhost:5000/api';

/**
 * Resolves API Base URL dynamically from window.API_BASE_URL, local storage override, or environment
 */
function resolveApiBaseUrl() {
  if (typeof window !== 'undefined') {
    // 1. Explicit runtime override takes highest priority
    if (window.API_BASE_URL) {
      return window.API_BASE_URL.replace(/\/+$/, '');
    }
    // 2. Local storage override for debugging/testing
    const stored = localStorage.getItem('krishi_api_base_url');
    if (stored) {
      return stored.replace(/\/+$/, '');
    }
    // 3. Localhost development detection
    if (window.location && window.location.hostname) {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return DEV_API_URL;
      }
    }
    // 4. Default for production / hosted deployments (Render static site, Vercel, etc.)
    return PROD_API_URL;
  }
  return DEV_API_URL;
}

const API_BASE_URL = resolveApiBaseUrl();
if (typeof window !== 'undefined') {
  window.API_BASE_URL = API_BASE_URL;
}

class ApiClient {
  constructor(baseUrl = window.API_BASE_URL || API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Internal fetch wrapper with automatic JWT injection, JSON parsing & error formatting
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = window.Auth ? window.Auth.getToken() : localStorage.getItem('krishi_token');

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        const isLocalDev = window.Auth && typeof window.Auth.isLocalEnv === 'function' && window.Auth.isLocalEnv() && localStorage.getItem('krishishetra_dev_session');

        if (!isLocalDev) {
          if (window.Auth && typeof window.Auth.clearSession === 'function') {
            window.Auth.clearSession();
          } else {
            localStorage.removeItem('krishi_token');
            localStorage.removeItem('krishi_user');
            localStorage.removeItem('krishi_user_role');
            localStorage.removeItem('krishi_is_logged_in');
          }

          // Only redirect if on a protected page (not login or landing)
          const path = window.location.pathname.toLowerCase();
          if (!path.endsWith('login.html') && !path.endsWith('index.html') && !path.endsWith('/')) {
            window.location.href = path.includes('/transporter/') || path.includes('/admin/') ? '../login.html' : 'login.html';
          }
        }

        return {
          success: false,
          status: 401,
          message: 'Your session has expired. Please log in again.'
        };
      }

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: response.ok, message: text || response.statusText };
      }

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || `Request failed with status ${response.status}`,
          data: data
        };
      }

      return {
        success: true,
        status: response.status,
        ...data
      };
    } catch (err) {
      console.error(`[API Network Error] ${options.method || 'GET'} ${endpoint}:`, err);
      return {
        success: false,
        status: 0,
        message: 'Unable to connect to KrishiShetra server. Please check your network connection or try again.',
        error: err.message
      };
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, { method: 'POST', body, headers });
  }

  put(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, { method: 'PUT', body, headers });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURED API NAMESPACES (Direct mapping to actual backend routes)
// ═══════════════════════════════════════════════════════════════════════════

const client = new ApiClient();

const api = {
  client,

  // 1. Authentication & Profile (/api/auth)
  auth: {
    login: (email, password) => client.post('/auth/login', { email, password }),
    register: (userData) => client.post('/auth/register', userData),
    verifyEmailOtp: (email, otp) => client.post('/auth/verify-email', { email, otp }),
    resendOtp: (email) => client.post('/auth/resend-verification', { email }),
    forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
    verifyResetOtp: (email, otp) => client.post('/auth/verify-reset-otp', { email, otp }),
    resetPassword: (resetToken, newPassword) => client.post('/auth/reset-password', { resetToken, newPassword }),
    resendResetOtp: (email) => client.post('/auth/resend-reset-otp', { email }),
    getMe: () => client.get('/auth/me'),
    updateProfile: (profileData) => client.put('/auth/profile', profileData),
    changePassword: (currentPassword, newPassword) => client.put('/auth/change-password', { currentPassword, newPassword })
  },

  // 2. Farmer Profile (/api/farmer/profile)
  farmer: {
    getProfile: () => client.get('/farmer/profile'),
    createProfile: (profileData) => client.post('/farmer/profile', profileData),
    updateProfile: (profileData) => client.put('/farmer/profile', profileData)
  },

  // 3. Produce Lots (/api/lots)
  lots: {
    create: (lotData) => client.post('/lots', lotData),
    getMine: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/lots/my${qs ? `?${qs}` : ''}`);
    },
    getById: (lotId) => client.get(`/lots/${lotId}`),
    update: (lotId, lotData) => client.put(`/lots/${lotId}`, lotData),
    cancel: (lotId) => client.delete(`/lots/${lotId}`),
    assay: (lotId, assayData) => client.post(`/lots/${lotId}/assay`, assayData),
    aiEstimate: (scanData) => client.post('/lots/ai-estimate', scanData)
  },

  // 4. Public Marketplace (/api/market)
  market: {
    getLots: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/market/lots${qs ? `?${qs}` : ''}`);
    },
    getLot: (lotId) => client.get(`/market/lots/${lotId}`)
  },

  // 5. Inquiries & Negotiation (/api/inquiries)
  inquiries: {
    create: (inquiryData) => client.post('/inquiries', inquiryData),
    getMine: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/inquiries/my${qs ? `?${qs}` : ''}`);
    },
    getFarmer: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/inquiries/farmer${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => client.get(`/inquiries/${id}`),
    updateStatus: (id, status) => client.put(`/inquiries/${id}`, { status }),
    sendOffer: (id, offerData) => client.put(`/inquiries/${id}/offer`, offerData)
  },

  // 6. Orders & Deal Execution (/api/orders)
  orders: {
    create: (orderData) => client.post('/orders', orderData),
    getMine: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/orders/my${qs ? `?${qs}` : ''}`);
    },
    getFarmer: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/orders/farmer${qs ? `?${qs}` : ''}`);
    },
    getById: (orderId) => client.get(`/orders/${orderId}`),
    updateStatus: (orderId, status) => client.put(`/orders/${orderId}/status`, { status }),
    cancel: (orderId) => client.put(`/orders/${orderId}/cancel`, {}),
    updatePaymentStatus: (orderId, paymentStatus) => client.put(`/orders/${orderId}/payment-status`, { paymentStatus })
  },

  // 7. Transport Management (/api/transport)
  transport: {
    getProfile: () => client.get('/transport/profile'),
    createProfile: (data) => client.post('/transport/profile', data),
    updateAvailability: (isAvailable) => client.put('/transport/availability', { isAvailable }),
    createRequest: (data) => client.post('/transport/requests', data),
    getAvailable: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/transport/requests/available${qs ? `?${qs}` : ''}`);
    },
    acceptRequest: (requestId) => client.put(`/transport/requests/${requestId}/accept`, {}),
    getMyJobs: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/transport/requests/my${qs ? `?${qs}` : ''}`);
    },
    getFarmerRequests: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/transport/requests/farmer${qs ? `?${qs}` : ''}`);
    },
    getBuyerRequests: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/transport/requests/buyer${qs ? `?${qs}` : ''}`);
    },
    getById: (requestId) => client.get(`/transport/requests/${requestId}`),
    updateStatus: (requestId, status) => client.put(`/transport/requests/${requestId}/status`, { status }),
    cancel: (requestId) => client.put(`/transport/requests/${requestId}/cancel`, {})
  },

  // 8. Notifications (/api/notifications)
  notifications: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/notifications${qs ? `?${qs}` : ''}`);
    },
    getUnreadCount: () => client.get('/notifications/unread-count'),
    markRead: (id) => client.put(`/notifications/${id}/read`, {}),
    markAllRead: () => client.put('/notifications/read-all', {}),
    delete: (id) => client.delete(`/notifications/${id}`)
  },

  // 9. Activity Logs (/api/activity)
  activity: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/activity${qs ? `?${qs}` : ''}`);
    }
  },

  // 10. Storage & Warehouse Discovery (/api/storage)
  storage: {
    getNearby: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/storage/nearby${qs ? `?${qs}` : ''}`);
    },
    search: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/storage/search${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => client.get(`/storage/${id}`),
    getOptionsForCrop: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/storage/options-for-crop${qs ? `?${qs}` : ''}`);
    },
    createRequest: (data) => client.post('/storage/requests', data),
    getMyRequests: () => client.get('/storage/requests/my'),
    getRequestById: (id) => client.get(`/storage/requests/${id}`),
    updateRequestStatus: (id, status, notes = '') => client.patch(`/storage/requests/${id}/status`, { status, notes }),
    // Admin
    adminGetAll: () => client.get('/storage/admin/all'),
    adminCreateFacility: (data) => client.post('/storage/facilities', data),
    adminUpdateFacility: (id, data) => client.put(`/storage/facilities/${id}`, data)
  },

  // 11. AI Decision Engine (/api/decision)
  decision: {
    evaluateSellVsStore: (data) => client.post('/decision/sell-vs-store', data)
  },

  // 12. Pledge Financing / e-NWR (/api/storage/pledge-financing)
  pledgeFinancing: {
    createRequest: (data) => client.post('/storage/pledge-financing/request', data),
    getMyRequests: () => client.get('/storage/pledge-financing/my')
  }
};

window.API_BASE_URL = API_BASE_URL;
window.api = api;
