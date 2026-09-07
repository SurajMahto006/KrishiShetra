/**
 * KRISHISHETRA — CENTRAL API CLIENT
 * Handles JWT authentication headers, global 401 redirection,
 * error parsing, and provides structured methods for all backend endpoints.
 */

/**
 * Production and Development API Endpoints
 */
const PROD_API_URL = (typeof window !== 'undefined' && window.location && window.location.origin) ? `${window.location.origin}/api` : 'https://krishishetra-1.onrender.com/api';
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
    // 3. Localhost & local file:// development detection
    if (window.location) {
      if (window.location.protocol === 'file:') {
        return DEV_API_URL;
      }
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        // If served from Express backend on port 5000, use same-origin /api
        if (window.location.port === '5000' && window.location.origin) {
          return `${window.location.origin}/api`;
        }
        return DEV_API_URL;
      }
      // In production / hosted environments (Render, etc.), frontend is served by Express: use same-origin /api
      if (window.location.origin) {
        return `${window.location.origin}/api`;
      }
    }
    // 4. Default fallback
    return DEV_API_URL;
  }
  return DEV_API_URL;
}

const API_BASE_URL = resolveApiBaseUrl();
if (typeof window !== 'undefined') {
  window.API_BASE_URL = API_BASE_URL;
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SANITIZER & DATA SCRUBBER (Zero credentials/PII leakage)
// ═══════════════════════════════════════════════════════════════════════════

const KrishiSanitizer = {
  SENSITIVE_KEYS: new Set([
    'password', 'newpassword', 'currentpassword', 'token', 'jwt',
    'authorization', 'apikey', 'api-key', 'secret', 'bankaccount',
    'bankaccountnumber', 'accountnumber', 'aadhaar', 'aadhaarnumber',
    'otp', 'credentials', 'phone', 'contactphone'
  ]),

  sanitize(obj, depth = 0) {
    if (depth > 5 || obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.slice(0, 20).map(item => this.sanitize(item, depth + 1));
    }

    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
      const lower = key.toLowerCase().replace(/[^a-z]/g, '');
      if (this.SENSITIVE_KEYS.has(lower) || lower.includes('password') || lower.includes('token') || lower.includes('secret') || lower.includes('aadhaar') || lower.includes('key')) {
        clean[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        clean[key] = this.sanitize(val, depth + 1);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  },

  redact(obj) {
    return this.sanitize(obj);
  },

  sanitizeUrl(url) {
    try {
      const u = new URL(url, 'http://localhost');
      for (const [key] of Array.from(u.searchParams.entries())) {
        const lower = key.toLowerCase().replace(/[^a-z]/g, '');
        if (this.SENSITIVE_KEYS.has(lower) || lower.includes('token') || lower.includes('key') || lower.includes('secret') || lower.includes('password')) {
          u.searchParams.set(key, '[REDACTED]');
        }
      }
      return u.toString();
    } catch (_) {
      return String(url || '').replace(/([?&](?:token|apiKey|api_key|password|secret)=)[^&]+/gi, '$1[REDACTED]');
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL DEBUG LOGGER (Standardized [KrishiShetra] prefixes & timing)
// ═══════════════════════════════════════════════════════════════════════════

const KrishiLogger = {
  isDebug() {
    if (typeof window === 'undefined') return true;
    if (window.DEBUG_MODE !== undefined) return Boolean(window.DEBUG_MODE);
    try {
      const stored = localStorage.getItem('krishi_debug');
      if (stored !== null) return stored === 'true' || stored === '1';
    } catch (_) {}
    if (typeof window.location !== 'undefined') {
      const host = window.location.hostname || '';
      if (host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:') {
        return true;
      }
    }
    return false;
  },

  formatPrefix(namespace = 'API') {
    return `[KrishiShetra][${namespace.toUpperCase()}]`;
  },

  info(namespace, message, data = null) {
    const prefix = this.formatPrefix(namespace);
    if (data) console.info(`${prefix} ${message}`, KrishiSanitizer.sanitize(data));
    else console.info(`${prefix} ${message}`);
  },

  warn(namespace, message, data = null) {
    const prefix = this.formatPrefix(namespace);
    if (data) console.warn(`${prefix} ${message}`, KrishiSanitizer.sanitize(data));
    else console.warn(`${prefix} ${message}`);
  },

  debug(namespace, message, data = null) {
    if (!this.isDebug()) return;
    const prefix = this.formatPrefix(namespace);
    if (data) console.debug(`${prefix} ${message}`, KrishiSanitizer.sanitize(data));
    else console.debug(`${prefix} ${message}`);
  },

  request(namespace, method, endpoint, params) {
    const prefix = this.formatPrefix(namespace);
    const safeParams = KrishiSanitizer.sanitize(params);
    const timestamp = new Date().toISOString();

    if (this.isDebug() && console.groupCollapsed) {
      console.groupCollapsed(`${prefix} ▶ REQUEST: ${method} ${endpoint}`);
      console.log('Endpoint:', endpoint);
      console.log('Method:', method);
      console.log('Timestamp:', timestamp);
      if (safeParams && Object.keys(safeParams).length > 0) {
        console.log('Parameters:', safeParams);
      }
      console.groupEnd();
    } else {
      console.log(`${prefix} ▶ REQUEST: ${method} ${endpoint}`);
    }
  },

  success(namespace, method, endpoint, status, durationMs, recordsCount, source, cacheStatus) {
    const prefix = this.formatPrefix(namespace);
    const countText = recordsCount !== undefined && recordsCount !== null ? ` | Records: ${recordsCount}` : '';
    const srcText = source ? ` | Source: ${source}` : '';
    const cacheText = cacheStatus ? ` | Cache: ${cacheStatus}` : '';

    if (this.isDebug() && console.groupCollapsed) {
      console.groupCollapsed(`${prefix} ✓ SUCCESS: ${method} ${endpoint} (${status}) in ${Math.round(durationMs)}ms`);
      console.log('Endpoint:', endpoint);
      console.log('Status:', status);
      console.log('Response Time:', `${Math.round(durationMs)}ms`);
      if (recordsCount !== undefined && recordsCount !== null) console.log('Records:', recordsCount);
      if (source) console.log('Source:', source);
      if (cacheStatus) console.log('Cache Status:', cacheStatus);
      console.groupEnd();
    } else {
      console.info(`${prefix} ✓ SUCCESS: ${status} in ${Math.round(durationMs)}ms${countText}${srcText}${cacheText}`);
    }
  },

  error(namespace, method, endpoint, errorObj, durationMs, fallbackStatus) {
    const prefix = this.formatPrefix(namespace);
    const durText = durationMs !== undefined ? ` in ${Math.round(durationMs)}ms` : '';
    const fbText = fallbackStatus ? ` | Fallback: ${fallbackStatus}` : '';

    if (this.isDebug() && console.group) {
      console.group(`${prefix} ✗ ERROR: ${errorObj.type || 'ERROR'} (${errorObj.status || 0})${durText}`);
      console.error('Type:', errorObj.type);
      console.error('Status:', errorObj.status);
      console.error('Endpoint:', endpoint);
      console.error('Message:', errorObj.message || errorObj.details);
      console.error('Timestamp:', errorObj.timestamp || new Date().toISOString());
      if (fallbackStatus) console.warn('Fallback:', fallbackStatus);
      if (errorObj.rawError && errorObj.rawError.stack) {
        console.error('Stack:', errorObj.rawError.stack);
      }
      console.groupEnd();
    } else {
      console.error(`${prefix} ✗ ERROR: ${errorObj.type} (${errorObj.status}) - ${errorObj.message || errorObj.details}${durText}${fbText}`);
    }
  },

  fallback(namespace, source, cacheAge, recordsCount) {
    const prefix = this.formatPrefix(namespace);
    console.warn(`${prefix} ✓ FALLBACK: Source: ${source} | Age: ${cacheAge || 'recent'} | Records: ${recordsCount !== undefined ? recordsCount : 'available'}`);
  },

  noFallback(namespace, reason = 'EMPTY') {
    const prefix = this.formatPrefix(namespace);
    console.warn(`${prefix} ✗ NO FALLBACK: Live API: FAILED | Cache: ${reason} | Result: VERIFIED_DATA_UNAVAILABLE`);
  },

  globalError(message, source, lineno, colno, error) {
    const prefix = `[KrishiShetra][GLOBAL JS ERROR]`;
    console.group(prefix);
    console.error('Message:', message);
    console.error('Source:', source);
    console.error('Line:', lineno, 'Column:', colno);
    console.error('Timestamp:', new Date().toISOString());
    if (this.isDebug() && error && error.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  },

  unhandledPromise(reason) {
    const prefix = `[KrishiShetra][UNHANDLED PROMISE]`;
    console.group(prefix);
    console.error('Reason:', reason?.message || reason);
    console.error('Timestamp:', new Date().toISOString());
    if (this.isDebug() && reason?.stack) {
      console.error('Stack:', reason.stack);
    }
    console.groupEnd();
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STRUCTURED ERROR CLASSIFIER
// ═══════════════════════════════════════════════════════════════════════════

const KrishiError = {
  TYPES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    HTTP_ERROR: 'HTTP_ERROR',
    PARSE_ERROR: 'PARSE_ERROR',
    EMPTY_RESPONSE: 'EMPTY_RESPONSE',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  },

  USER_MESSAGES: {
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again.',
    TIMEOUT: 'The request took too long. Please try again.',
    PARSE_ERROR: 'We received an invalid response. Please try again.',
    EMPTY_RESPONSE: 'No data was returned from the service. Please try again.',
    VALIDATION_ERROR: 'Please verify the submitted details and try again.',
    AUTH_ERROR: 'Your session has expired. Please sign in again.',
    PERMISSION_ERROR: 'You do not have permission to perform this action.',
    SERVER_ERROR: 'Service is temporarily unavailable. Please try again shortly.',
    DEFAULT: 'Something went wrong while loading this information. Please try again.'
  },

  classify(arg1, arg2, endpoint = '', data = null) {
    const now = new Date().toISOString();
    let status = 0;
    let err = null;

    if (typeof arg1 === 'number') {
      status = arg1;
      err = arg2;
    } else if (arg1 && typeof arg1 === 'object') {
      err = arg1;
      status = arg1.status || (typeof arg2 === 'number' ? arg2 : 0);
      if (typeof arg2 === 'string' && !endpoint) {
        endpoint = arg2;
      }
    } else if (typeof arg1 === 'string') {
      err = new Error(arg1);
      if (typeof arg2 === 'number') status = arg2;
      else if (typeof arg2 === 'string') endpoint = arg2;
    }

    let type = this.TYPES.UNKNOWN_ERROR;
    let userMsg = this.USER_MESSAGES.DEFAULT;
    let message = err?.message || (typeof err === 'string' ? err : 'Unknown error');

    if (err && (err.name === 'AbortError' || err.code === 20 || status === 408 || message.toLowerCase().includes('timed out'))) {
      type = this.TYPES.TIMEOUT;
      userMsg = this.USER_MESSAGES.TIMEOUT;
      message = 'Request timed out';
    } else if (err && (err.name === 'SyntaxError' || message.includes('JSON') || message.includes('token <'))) {
      type = this.TYPES.PARSE_ERROR;
      userMsg = this.USER_MESSAGES.PARSE_ERROR;
      message = 'Invalid JSON response from server';
    } else if (status === 0 || (err && (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('network')))) {
      type = this.TYPES.NETWORK_ERROR;
      userMsg = this.USER_MESSAGES.NETWORK_ERROR;
      message = 'Network connection failed';
    } else if (status === 401) {
      type = this.TYPES.AUTH_ERROR;
      userMsg = this.USER_MESSAGES.AUTH_ERROR;
      message = data?.message || err?.message || 'Unauthorized or session expired';
    } else if (status === 403) {
      type = this.TYPES.PERMISSION_ERROR;
      userMsg = this.USER_MESSAGES.PERMISSION_ERROR;
      message = data?.message || err?.message || 'Access forbidden';
    } else if (status === 400 || status === 422) {
      type = this.TYPES.VALIDATION_ERROR;
      userMsg = data?.message || err?.message || this.USER_MESSAGES.VALIDATION_ERROR;
      message = data?.message || err?.message || 'Bad Request / Validation Error';
    } else if (status >= 400 && status < 500) {
      type = this.TYPES.HTTP_ERROR;
      userMsg = data?.message || (status === 404 ? 'The requested resource was not found.' : this.USER_MESSAGES.DEFAULT);
      message = data?.message || err?.message || `HTTP Client Error ${status}`;
    } else if (status >= 500) {
      type = this.TYPES.HTTP_ERROR;
      userMsg = this.USER_MESSAGES.SERVER_ERROR;
      message = data?.message || err?.message || `HTTP Server Error ${status}`;
    }

    const retryable = type === this.TYPES.NETWORK_ERROR || type === this.TYPES.TIMEOUT || status >= 500;

    return {
      type,
      status: status || (type === this.TYPES.TIMEOUT ? 408 : 0),
      endpoint,
      timestamp: now,
      message,
      details: message,
      userMessage: userMsg,
      retryable,
      data,
      rawError: err
    };
  }
};

class ApiClient {
  constructor(baseUrl = window.API_BASE_URL || API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.inFlightRequests = new Map();
  }

  static request(endpoint, options) {
    return (window.ApiClient && window.ApiClient.request && window.ApiClient !== ApiClient)
      ? window.ApiClient.request(endpoint, options)
      : (typeof client !== 'undefined' ? client.request(endpoint, options) : new ApiClient().request(endpoint, options));
  }

  /**
   * Internal fetch wrapper with automatic JWT injection, JSON parsing & error formatting
   */
  async request(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const isIdempotent = method === 'GET' || options.preventDuplicate === true;
    const inFlightKey = `${method}:${endpoint}:${JSON.stringify(options.body || '')}`;

    // Duplicate retry prevention for concurrent identical in-flight requests
    if (isIdempotent && this.inFlightRequests.has(inFlightKey)) {
      console.warn(`[KrishiShetra][API] ℹ Retry prevented because request already running: ${method} ${endpoint}`);
      return this.inFlightRequests.get(inFlightKey);
    }

    const execPromise = (async () => {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const token = window.Auth ? window.Auth.getToken() : (typeof localStorage !== 'undefined' ? localStorage.getItem('krishi_token') : null);

      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = {
        ...options,
        method,
        headers
      };

      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
      }

      const timeoutMs = options.timeout || 10000;
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      let timeoutId = null;
      if (controller) {
        config.signal = controller.signal;
        timeoutId = setTimeout(() => {
          controller.abort();
        }, timeoutMs);
      }

      const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const namespace = options.namespace || 'API';

      // Log request start
      KrishiLogger.request(namespace, method, endpoint, options.body || options.params || {});

      try {
        const response = await fetch(url, config);
        if (timeoutId) clearTimeout(timeoutId);
        const durationMs = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - startTime;

        // Handle 401 Unauthorized globally
        if (response.status === 401) {
          const isLocalDev = window.Auth && typeof window.Auth.isLocalEnv === 'function' && window.Auth.isLocalEnv() && (typeof localStorage !== 'undefined' && localStorage.getItem('krishishetra_dev_session'));

          if (!isLocalDev) {
            if (window.Auth && typeof window.Auth.clearSession === 'function') {
              window.Auth.clearSession();
            } else if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('krishi_token');
              localStorage.removeItem('krishi_user');
              localStorage.removeItem('krishi_user_role');
              localStorage.removeItem('krishi_is_logged_in');
            }

            // Only redirect if on a protected page (not login or landing)
            if (typeof window !== 'undefined' && window.location) {
              const path = window.location.pathname.toLowerCase();
              if (!path.endsWith('login.html') && !path.endsWith('index.html') && !path.endsWith('/') && !path.endsWith('register.html')) {
                window.location.href = path.includes('/transporter/') || path.includes('/admin/') ? '../login.html' : 'login.html';
              }
            }
          }

          const authErr = KrishiError.classify(401, null, endpoint, { message: 'Your session has expired. Please log in again.' });
          KrishiLogger.error(namespace, method, endpoint, authErr, durationMs);
          return {
            success: false,
            status: 401,
            error: authErr,
            type: authErr.type,
            message: authErr.userMessage
          };
        }

        let data = null;
        const contentType = (response.headers && typeof response.headers.get === 'function')
          ? response.headers.get('content-type')
          : (response.headers ? response.headers['content-type'] : 'application/json');

        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (parseErr) {
            const classified = KrishiError.classify(response.status, parseErr, endpoint);
            KrishiLogger.error(namespace, method, endpoint, classified, durationMs);
            return {
              success: false,
              status: response.status,
              error: classified,
              type: classified.type,
              message: classified.userMessage
            };
          }
        } else {
          const text = await response.text();
          data = { success: response.ok, message: text || response.statusText };
        }

        if (!response.ok) {
          const classified = KrishiError.classify(response.status, null, endpoint, data);
          KrishiLogger.error(namespace, method, endpoint, classified, durationMs);
          return {
            success: false,
            status: response.status,
            error: classified,
            type: classified.type,
            message: data?.message || classified.userMessage,
            data: data
          };
        }

        // Detect records count and data source if present
        const recordsCount = Array.isArray(data?.data) ? data.data.length : (Array.isArray(data?.records) ? data.records.length : (Array.isArray(data) ? data.length : undefined));
        const source = data?.source || (data?.data && data.data[0] && data.data[0].source) || undefined;
        const cacheStatus = data?.status === 'CACHED' ? 'CACHED' : (data?.status === 'LIVE' ? 'LIVE' : undefined);

        KrishiLogger.success(namespace, method, endpoint, response.status, durationMs, recordsCount, source, cacheStatus);

        return {
          success: true,
          status: response.status,
          ...data
        };
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        const durationMs = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - startTime;
        const classified = KrishiError.classify(0, err, endpoint);
        KrishiLogger.error(namespace, method, endpoint, classified, durationMs);

        return {
          success: false,
          status: classified.status,
          error: classified,
          type: classified.type,
          timeout: classified.type === KrishiError.TYPES.TIMEOUT,
          message: classified.userMessage
        };
      } finally {
        this.inFlightRequests.delete(inFlightKey);
      }
    })();

    if (isIdempotent) {
      this.inFlightRequests.set(inFlightKey, execPromise);
    }

    return execPromise;
  }

  get(endpoint, headers = {}, extra = {}) {
    return this.request(endpoint, { method: 'GET', headers, ...extra });
  }

  post(endpoint, body = {}, headers = {}, extra = {}) {
    return this.request(endpoint, { method: 'POST', body, headers, ...extra });
  }

  put(endpoint, body = {}, headers = {}, extra = {}) {
    return this.request(endpoint, { method: 'PUT', body, headers, ...extra });
  }

  patch(endpoint, body = {}, headers = {}, extra = {}) {
    return this.request(endpoint, { method: 'PATCH', body, headers, ...extra });
  }

  delete(endpoint, headers = {}, extra = {}) {
    return this.request(endpoint, { method: 'DELETE', headers, ...extra });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURED API NAMESPACES (Direct mapping to actual backend routes)
// ═══════════════════════════════════════════════════════════════════════════

const client = new ApiClient();

const api = {
  client,
  request: (endpoint, options) => client.request(endpoint, options),

  // 1. Authentication & Profile (/api/auth)
  auth: {
    login: (email, password) => client.post('/auth/login', { email, password }, {}, { namespace: 'AUTH' }),
    register: (userData) => client.post('/auth/register', userData, {}, { namespace: 'AUTH' }),
    verifyEmailOtp: (email, otp) => client.post('/auth/verify-email', { email, otp }, {}, { namespace: 'AUTH' }),
    resendOtp: (email) => client.post('/auth/resend-verification', { email }, {}, { namespace: 'AUTH' }),
    forgotPassword: (email) => client.post('/auth/forgot-password', { email }, {}, { namespace: 'AUTH' }),
    verifyResetOtp: (email, otp) => client.post('/auth/verify-reset-otp', { email, otp }, {}, { namespace: 'AUTH' }),
    resetPassword: (resetToken, newPassword) => client.post('/auth/reset-password', { resetToken, newPassword }, {}, { namespace: 'AUTH' }),
    resendResetOtp: (email) => client.post('/auth/resend-reset-otp', { email }, {}, { namespace: 'AUTH' }),
    getMe: () => client.get('/auth/me', {}, { namespace: 'AUTH' }),
    updateProfile: (profileData) => client.put('/auth/profile', profileData, {}, { namespace: 'AUTH' }),
    changePassword: (currentPassword, newPassword) => client.put('/auth/change-password', { currentPassword, newPassword }, {}, { namespace: 'AUTH' })
  },

  // 2. Farmer Profile (/api/farmer/profile)
  farmer: {
    getProfile: () => client.get('/farmer/profile', {}, { namespace: 'FARMER' }),
    createProfile: (profileData) => client.post('/farmer/profile', profileData, {}, { namespace: 'FARMER' }),
    updateProfile: (profileData) => client.put('/farmer/profile', profileData, {}, { namespace: 'FARMER' })
  },

  // 3. Produce Lots (/api/lots)
  lots: {
    create: (lotData) => client.post('/lots', lotData, {}, { namespace: 'LOTS' }),
    getMine: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/lots/my${qs ? `?${qs}` : ''}`, {}, { namespace: 'LOTS' });
    },
    getById: (lotId) => client.get(`/lots/${lotId}`, {}, { namespace: 'LOTS' }),
    update: (lotId, lotData) => client.put(`/lots/${lotId}`, lotData, {}, { namespace: 'LOTS' }),
    cancel: (lotId) => client.delete(`/lots/${lotId}`, {}, { namespace: 'LOTS' }),
    delete: (lotId) => client.delete(`/lots/${lotId}`, {}, { namespace: 'LOTS' }),
    getStorageOptions: (lotId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/lots/${lotId}/storage-options${qs ? `?${qs}` : ''}`, {}, { namespace: 'STORAGE' });
    },
    getSellingDecision: (lotId) => client.get(`/lots/${lotId}/selling-decision`, {}, { namespace: 'AI' })
  },

  // 4. Public Marketplace & Government Mandi Prices (/api/market & /api/mandi-prices)
  market: {
    getLots: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/market/lots${qs ? `?${qs}` : ''}`, {}, { namespace: 'MARKETPLACE' });
    },
    getLot: (lotId) => client.get(`/market/lots/${lotId}`, {}, { namespace: 'MARKETPLACE' }),
    getMandiPrices: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/market/mandi-prices${qs ? `?${qs}` : ''}`, {}, { namespace: 'MANDI' });
    }
  },

  mandi: {
    getPrices: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/mandi-prices${qs ? `?${qs}` : ''}`, {}, { namespace: 'MANDI' });
    }
  },

  // 5. Inquiries & Negotiation (/api/inquiries)
  inquiries: {
    create: (inquiryData) => client.post('/inquiries', inquiryData, {}, { namespace: 'MARKETPLACE' }),
    getMine: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/inquiries/my${qs ? `?${qs}` : ''}`, {}, { namespace: 'MARKETPLACE' });
    },
    getFarmer: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/inquiries/farmer${qs ? `?${qs}` : ''}`, {}, { namespace: 'MARKETPLACE' });
    },
    getById: (id) => client.get(`/inquiries/${id}`, {}, { namespace: 'MARKETPLACE' }),
    updateStatus: (id, status) => client.put(`/inquiries/${id}`, { status }, {}, { namespace: 'MARKETPLACE' }),
    sendOffer: (id, offerData) => client.put(`/inquiries/${id}/offer`, offerData, {}, { namespace: 'MARKETPLACE' })
  },

  // 6. Orders & Deal Execution (/api/orders)
  orders: {
    create: (orderData) => client.post('/orders', orderData, {}, { namespace: 'ORDERS' }),
    getMine: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/orders/my${qs ? `?${qs}` : ''}`, {}, { namespace: 'ORDERS' });
    },
    getFarmer: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/orders/farmer${qs ? `?${qs}` : ''}`, {}, { namespace: 'ORDERS' });
    },
    getById: (orderId) => client.get(`/orders/${orderId}`, {}, { namespace: 'ORDERS' }),
    updateStatus: (orderId, status) => client.put(`/orders/${orderId}/status`, { status }, {}, { namespace: 'ORDERS' }),
    cancel: (orderId) => client.put(`/orders/${orderId}/cancel`, {}, {}, { namespace: 'ORDERS' }),
    updatePaymentStatus: (orderId, paymentStatus) => client.put(`/orders/${orderId}/payment-status`, { paymentStatus }, {}, { namespace: 'ORDERS' })
  },

  // 7. Transport Management (/api/transport)
  transport: {
    getProfile: () => client.get('/transport/profile', {}, { namespace: 'TRANSPORT' }),
    createProfile: (data) => client.post('/transport/profile', data, {}, { namespace: 'TRANSPORT' }),
    updateAvailability: (isAvailable) => client.put('/transport/availability', { isAvailable }, {}, { namespace: 'TRANSPORT' }),
    createRequest: (data) => client.post('/transport/requests', data, {}, { namespace: 'TRANSPORT' }),
    getAvailable: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/transport/requests/available${qs ? `?${qs}` : ''}`, {}, { namespace: 'TRANSPORT' });
    },
    acceptRequest: (requestId) => client.put(`/transport/requests/${requestId}/accept`, {}, {}, { namespace: 'TRANSPORT' }),
    getMyJobs: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/transport/requests/my${qs ? `?${qs}` : ''}`, {}, { namespace: 'TRANSPORT' });
    },
    getFarmerRequests: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/transport/requests/farmer${qs ? `?${qs}` : ''}`, {}, { namespace: 'TRANSPORT' });
    },
    getBuyerRequests: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/transport/requests/buyer${qs ? `?${qs}` : ''}`, {}, { namespace: 'TRANSPORT' });
    },
    getById: (requestId) => client.get(`/transport/requests/${requestId}`, {}, { namespace: 'TRANSPORT' }),
    updateStatus: (requestId, status) => client.put(`/transport/requests/${requestId}/status`, { status }, {}, { namespace: 'TRANSPORT' }),
    cancel: (requestId) => client.put(`/transport/requests/${requestId}/cancel`, {}, {}, { namespace: 'TRANSPORT' })
  },

  // 8. Notifications (/api/notifications)
  notifications: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/notifications${qs ? `?${qs}` : ''}`, {}, { namespace: 'NOTIFICATIONS' });
    },
    getUnreadCount: () => client.get('/notifications/unread-count', {}, { namespace: 'NOTIFICATIONS' }),
    markRead: (id) => client.put(`/notifications/${id}/read`, {}, {}, { namespace: 'NOTIFICATIONS' }),
    markAllRead: () => client.put('/notifications/read-all', {}, {}, { namespace: 'NOTIFICATIONS' }),
    delete: (id) => client.delete(`/notifications/${id}`, {}, { namespace: 'NOTIFICATIONS' })
  },

  // 9. Activity Logs (/api/activity)
  activity: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/activity${qs ? `?${qs}` : ''}`, {}, { namespace: 'ACTIVITY' });
    }
  },

  // 10. Storage & Warehouse Discovery (/api/storage)
  storage: {
    getNearby: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/storage/nearby${qs ? `?${qs}` : ''}`, {}, { namespace: 'STORAGE' });
    },
    search: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/storage/search${qs ? `?${qs}` : ''}`, {}, { namespace: 'STORAGE' });
    },
    getById: (id) => client.get(`/storage/${id}`, {}, { namespace: 'STORAGE' }),
    getOptionsForCrop: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/storage/options-for-crop${qs ? `?${qs}` : ''}`, {}, { namespace: 'STORAGE' });
    },
    createRequest: (data) => client.post('/storage/requests', data, {}, { namespace: 'STORAGE' }),
    getMyRequests: () => client.get('/storage/requests/my', {}, { namespace: 'STORAGE' }),
    getRequestById: (id) => client.get(`/storage/requests/${id}`, {}, { namespace: 'STORAGE' }),
    updateRequestStatus: (id, status, notes = '') => client.patch(`/storage/requests/${id}/status`, { status, notes }, {}, { namespace: 'STORAGE' }),
    // Admin
    adminGetAll: () => client.get('/storage/admin/all', {}, { namespace: 'STORAGE' }),
    adminCreateFacility: (data) => client.post('/storage/facilities', data, {}, { namespace: 'STORAGE' }),
    adminUpdateFacility: (id, data) => client.put(`/storage/facilities/${id}`, data, {}, { namespace: 'STORAGE' })
  },

  // 11. AI Decision Engine (/api/decision)
  decision: {
    evaluateSellVsStore: (data) => client.post('/decision/sell-vs-store', data, {}, { namespace: 'AI' })
  },

  // 12. Pledge Financing / e-NWR (/api/storage/pledge-financing)
  pledgeFinancing: {
    createRequest: (data) => client.post('/storage/pledge-financing/request', data, {}, { namespace: 'STORAGE' }),
    getMyRequests: () => client.get('/storage/pledge-financing/my', {}, { namespace: 'STORAGE' })
  },

  // 13. Dispute Management (/api/disputes)
  disputes: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return client.get(`/disputes${qs ? `?${qs}` : ''}`, {}, { namespace: 'DISPUTES' });
    },
    getById: (id) => client.get(`/disputes/${id}`, {}, { namespace: 'DISPUTES' }),
    create: (data) => client.post('/disputes', data, {}, { namespace: 'DISPUTES' }),
    updateStatus: (id, status, note = '') => client.patch(`/disputes/${id}/status`, { status, note }, {}, { namespace: 'DISPUTES' }),
    resolve: (id, data) => client.post(`/disputes/${id}/resolve`, data, {}, { namespace: 'DISPUTES' })
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL USER-FACING NOTIFICATION / TOAST SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

function showGlobalToast(message, type = 'info') {
  if (typeof document === 'undefined') return;
  if (window.FarmerFlow && typeof window.FarmerFlow.showToast === 'function') {
    return window.FarmerFlow.showToast(message, type);
  }

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
    if (document.body) {
      document.body.appendChild(container);
    }
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#12372A' : type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#2563eb';
  toast.style.cssText = `pointer-events: auto; background: ${bg}; color: #FFFFFF; padding: 12px 20px; border-radius: 8px; font-size: 13.5px; font-weight: 600; box-shadow: 0 6px 20px rgba(0,0,0,0.2); opacity: 0; transform: translateY(10px); transition: all 0.3s ease; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL JAVASCRIPT RUNTIME & UNHANDLED PROMISE REJECTION LISTENERS
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.addEventListener('error', function (event) {
    const msg = event.message || 'Unknown JavaScript error';
    const src = event.filename || '';
    const line = event.lineno || 0;
    const col = event.colno || 0;

    KrishiLogger.globalError(msg, src, line, col, event.error);
  });

  window.addEventListener('unhandledrejection', function (event) {
    KrishiLogger.unhandledPromise(event.reason);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.API_BASE_URL = API_BASE_URL;
  window.ApiClient = ApiClient;
  window.api = api;
  window.KrishiError = KrishiError;
  window.KrishiLogger = KrishiLogger;
  window.KrishiSanitizer = KrishiSanitizer;
  window.showToast = window.showToast || showGlobalToast;
  window.setDebugMode = function (enabled) {
    window.DEBUG_MODE = Boolean(enabled);
    try { localStorage.setItem('krishi_debug', Boolean(enabled)); } catch (_) {}
    console.log(`[KrishiShetra] Debug mode ${Boolean(enabled) ? 'ENABLED' : 'DISABLED'}`);
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ApiClient,
    api,
    KrishiError,
    KrishiLogger,
    KrishiSanitizer,
    showGlobalToast
  };
}
