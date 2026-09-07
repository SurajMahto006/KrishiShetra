/**
 * KRISHISHETRA — CENTRAL AUTHENTICATION & SESSION CONTROLLER
 * Single source of truth for user tokens, roles, profile caching,
 * role-based redirection, and route guarding.
 */

const Auth = {
  TOKEN_KEY: 'krishi_token',
  USER_KEY: 'krishi_user',
  ROLE_KEY: 'krishi_user_role',
  NAME_KEY: 'krishi_user_name',
  EMAIL_KEY: 'krishi_user_email',
  LOGGED_IN_KEY: 'krishi_is_logged_in',
  DEV_SESSION_KEY: 'krishishetra_dev_session',

  /**
   * Check if running in a local development environment
   */
  isLocalEnv() {
    if (typeof window === 'undefined' || !window.location) return false;
    const h = window.location.hostname || '';
    const p = window.location.protocol || '';
    return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.') || h === '' || p === 'file:';
  },

  /**
   * Retrieve JWT from localStorage
   */
  getToken() {
    try {
      const t = localStorage.getItem(this.TOKEN_KEY);
      if (!t || t === 'null' || t === 'undefined' || !t.trim()) {
        return null;
      }
      return t.trim();
    } catch (_) {
      return null;
    }
  },

  /**
   * Save JWT token
   */
  setToken(token) {
    if (token && typeof token === 'string' && token !== 'null' && token !== 'undefined') {
      try {
        localStorage.setItem(this.TOKEN_KEY, token.trim());
      } catch (_) {}
    }
  },

  /**
   * Remove token from storage
   */
  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  },

  /**
   * Retrieve cached user object
   */
  getUser() {
    try {
      if (this.isLocalEnv()) {
        const dev = localStorage.getItem(this.DEV_SESSION_KEY);
        if (dev) return JSON.parse(dev);
      }
      const u = localStorage.getItem(this.USER_KEY);
      if (u) return JSON.parse(u);
      return null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Save user details and synchronize convenience keys
   */
  setUser(user) {
    if (!user) return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (user.role) {
      localStorage.setItem(this.ROLE_KEY, String(user.role).toLowerCase().trim());
    }
    if (user.name) {
      localStorage.setItem(this.NAME_KEY, user.name);
    }
    if (user.email) {
      localStorage.setItem(this.EMAIL_KEY, user.email);
    }
    if (user.phone) {
      localStorage.setItem('krishi_user_phone', user.phone);
    }
    localStorage.setItem(this.LOGGED_IN_KEY, 'true');
  },

  /**
   * Set isolated local developer session (local dev only)
   */
  setDevSession(role) {
    if (!this.isLocalEnv()) return null;
    const r = (role || 'farmer').toLowerCase().trim();
    const devUser = {
      id: `dev_${r}_id`,
      role: r,
      name: `Development ${r.charAt(0).toUpperCase() + r.slice(1)}`,
      email: `dev.${r}@krishishetra.local`,
      isDev: true
    };
    localStorage.setItem(this.TOKEN_KEY, `dev_${r}_token`);
    localStorage.setItem(this.DEV_SESSION_KEY, JSON.stringify(devUser));
    localStorage.setItem(this.USER_KEY, JSON.stringify(devUser));
    localStorage.setItem(this.ROLE_KEY, r);
    localStorage.setItem(this.NAME_KEY, devUser.name);
    localStorage.setItem(this.EMAIL_KEY, devUser.email);
    localStorage.setItem(this.LOGGED_IN_KEY, 'true');
    return devUser;
  },

  /**
   * Check if user has an active token in localStorage or active dev session
   */
  isLoggedIn() {
    if (this.isLocalEnv() && localStorage.getItem(this.DEV_SESSION_KEY)) {
      return true;
    }
    const token = this.getToken();
    if (token) return true;
    return localStorage.getItem(this.LOGGED_IN_KEY) === 'true' && !!localStorage.getItem(this.USER_KEY);
  },

  /**
   * Alias for isLoggedIn() for full backward compatibility across all modules
   */
  isAuthenticated() {
    return this.isLoggedIn();
  },

  /**
   * Get current user role
   */
  getRole() {
    if (this.isLocalEnv()) {
      try {
        const dev = localStorage.getItem(this.DEV_SESSION_KEY);
        if (dev) {
          const parsed = JSON.parse(dev);
          if (parsed.role) return String(parsed.role).toLowerCase().trim();
        }
      } catch (e) {}
    }
    const user = this.getUser();
    if (user && user.role) {
      return String(user.role).toLowerCase().trim();
    }
    const storedRole = localStorage.getItem(this.ROLE_KEY);
    if (storedRole) return String(storedRole).toLowerCase().trim();

    return 'farmer';
  },

  /**
   * Clear all session data
   */
  clearSession() {
    if (this.isLocalEnv()) {
      localStorage.removeItem(this.DEV_SESSION_KEY);
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.NAME_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.LOGGED_IN_KEY);
    localStorage.removeItem('krishi_user_phone');
  },

  /**
   * Perform logout and redirect to login
   */
  logout() {
    this.clearSession();
    const path = window.location.pathname.toLowerCase();
    const loginTarget = path.includes('/transporter/') || path.includes('/admin/') ? '../login.html' : 'login.html';
    window.location.href = loginTarget;
  },

  /**
   * Route user to their role-specific dashboard
   */
  redirectUserByRole(user) {
    const u = user || this.getUser();
    const role = (u && u.role ? String(u.role) : this.getRole()).toLowerCase().trim();

    const path = (window.location.pathname || '').toLowerCase();
    const isSubdir = path.includes('/transporter/') || path.includes('/admin/');
    const prefix = isSubdir ? '../' : '';

    let target = `${prefix}dashboard.html`;
    switch (role) {
      case 'buyer':
        target = `${prefix}buyer.html`;
        break;
      case 'transporter':
        target = `${prefix}transporter/dashboard.html`;
        break;
      case 'fpo':
        target = `${prefix}fpo-dashboard.html`;
        break;
      case 'admin':
        target = `${prefix}admin/dashboard.html`;
        break;
      case 'farmer':
      default:
        target = `${prefix}dashboard.html`;
        break;
    }

    // Guard against redirect loops: If current URL path already points to target page, do nothing
    const currentBase = path.split('/').filter(Boolean).pop() || 'index.html';
    const cleanCurrent = currentBase.replace(/\.html$/, '');
    const targetBase = target.split('/').filter(Boolean).pop() || '';
    const cleanTarget = targetBase.replace(/\.html$/, '');

    if (cleanCurrent === cleanTarget) {
      return;
    }

    window.location.href = target;
  },

  /**
   * Get canonical target URL for Home/Logo navigation based on authentication status.
   * If logged in, returns user's specific dashboard URL.
   * If logged out, returns the public landing page.
   */
  getAuthenticatedHome() {
    const path = window.location.pathname.toLowerCase();
    const isSubdir = path.includes('/transporter/') || path.includes('/admin/');
    const prefix = isSubdir ? '../' : '';

    if (!this.isLoggedIn()) {
      return `${prefix}index.html`;
    }

    const role = this.getRole();
    switch (role) {
      case 'buyer':
        return `${prefix}buyer.html`;
      case 'transporter':
        return `${prefix}transporter/dashboard.html`;
      case 'fpo':
        return `${prefix}fpo-dashboard.html`;
      case 'admin':
        return `${prefix}admin/dashboard.html`;
      case 'farmer':
      default:
        return `${prefix}dashboard.html`;
    }
  },

  /**
   * Require user to be logged in. Redirect to login.html if not.
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      const path = (window.location.pathname || '').toLowerCase();
      if (path.endsWith('login.html') || path.endsWith('register.html') || path.endsWith('index.html') || path === '/' || path === '') {
        return false;
      }
      const loginTarget = path.includes('/transporter/') || path.includes('/admin/') ? '../login.html' : 'login.html';
      window.location.href = loginTarget;
      return false;
    }
    return true;
  },

  /**
   * Require user to possess specific role. If wrong role, redirect to appropriate dashboard.
   * Note: admin is permitted on all dashboards.
   */
  requireRole(expectedRole) {
    if (!this.requireAuth()) return false;

    const currentRole = this.getRole();
    if (currentRole === 'admin') return true;

    const normalizedExpected = (expectedRole || '').toLowerCase().trim();
    if (currentRole !== normalizedExpected) {
      // In local development mode with an active dev session:
      // Adapt the dev session to expected role to prevent redirect loops between farmer and buyer portals
      if (this.isLocalEnv() && localStorage.getItem(this.DEV_SESSION_KEY)) {
        this.setDevSession(normalizedExpected);
        return true;
      }

      console.warn(`[PageGuard] Role mismatch. Expected: '${normalizedExpected}', Current: '${currentRole}'. Redirecting...`);
      this.redirectUserByRole();
      return false;
    }
    return true;
  },



  /**
   * Verify token with backend /api/auth/me
   */
  async verifyAuth() {
    if (this.isLocalEnv() && localStorage.getItem(this.DEV_SESSION_KEY)) {
      const devUser = this.getUser();
      if (devUser) return devUser;
    }

    const token = this.getToken();
    if (!token) {
      if (!this.isLocalEnv() || !localStorage.getItem(this.DEV_SESSION_KEY)) {
        this.clearSession();
      }
      return null;
    }

    try {
      if (window.api && window.api.auth && typeof window.api.auth.getMe === 'function') {
        const res = await window.api.auth.getMe();
        const userData = res && (res.user || (res.data && res.data.user));
        if (res && res.success && userData) {
          this.setUser(userData);
          return userData;
        }
        if (res && (res.status === 401 || res.status === 403)) {
          if (!this.isLocalEnv() || !localStorage.getItem(this.DEV_SESSION_KEY)) {
            this.clearSession();
          }
          return null;
        }
        // If temporary server/network issue or non-401/403 status, retain existing valid cached user
        const cached = this.getUser();
        if (cached) return cached;
      } else {
        const isLocal = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const apiBase = (typeof window !== 'undefined' && window.API_BASE_URL)
          ? window.API_BASE_URL.replace(/\/+$/, '')
          : (typeof window !== 'undefined' && window.location && window.location.origin
              ? (isLocal && window.location.port !== '5000' ? 'http://localhost:5000/api' : `${window.location.origin}/api`)
              : 'http://localhost:5000/api');

        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data && data.success && data.user) {
          this.setUser(data.user);
          return data.user;
        }
        if (res.status === 401 || res.status === 403) {
          if (!this.isLocalEnv() || !localStorage.getItem(this.DEV_SESSION_KEY)) {
            this.clearSession();
          }
          return null;
        }
        const cached = this.getUser();
        if (cached) return cached;
      }
      return this.getUser();
    } catch (err) {
      console.warn('[Auth Verification Network Notice]:', err.message);
      // Return cached user so temporary network/cold-start latency does not log the user out
      return this.getUser();
    }
  },

  /**
   * Update profile convenience wrapper
   */
  async updateProfile(profileData) {
    if (!this.requireAuth()) return { success: false, message: 'Not logged in' };
    if (window.api && window.api.auth) {
      const res = await window.api.auth.updateProfile(profileData);
      if (res.success && res.user) {
        this.setUser(res.user);
      }
      return res;
    }
    return { success: false, message: 'API client not loaded' };
  },

  /**
   * Change password convenience wrapper
   */
  async changePassword(currentPassword, newPassword) {
    if (!this.requireAuth()) return { success: false, message: 'Not logged in' };
    if (window.api && window.api.auth) {
      return await window.api.auth.changePassword(currentPassword, newPassword);
    }
    return { success: false, message: 'API client not loaded' };
  }
};

window.Auth = Auth;
