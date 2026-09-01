/**
 * KRISHISHETRA CENTRAL API CLIENT
 * Connects React frontend seamlessly with existing Render / local backend.
 */

const PROD_API_URL = 'https://krishishetra-1.onrender.com/api';
const DEV_API_URL = '/api';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? DEV_API_URL : PROD_API_URL);

class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  getAuthHeader() {
    const token = localStorage.getItem('krishi_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        localStorage.removeItem('krishi_token');
        localStorage.removeItem('krishi_user');
        localStorage.removeItem('krishi_user_role');
        localStorage.removeItem('krishi_is_logged_in');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return { success: false, status: 401, message: 'Session expired. Please log in again.' };
      }

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || `Request failed with status ${response.status}`,
          data
        };
      }

      return {
        success: true,
        status: response.status,
        ...data
      };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        status: 0,
        message: error.message || 'Network error occurred. Please check your connection.'
      };
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiService();
export default api;
