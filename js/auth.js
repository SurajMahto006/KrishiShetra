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
    return typeof window !== 'undefined' && window.location &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  },

  /**
   * Retrieve JWT from localStorage
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  /**
   * Save JWT token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
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
      const u = localStorage.getItem(this.USER_KEY);
      if (u) return JSON.parse(u);

      if (this.isLocalEnv()) {
        const dev = localStorage.getItem(this.DEV_SESSION_KEY);
        if (dev) return JSON.parse(dev);
      }
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
      localStorage.setItem(this.ROLE_KEY, user.role.toLowerCase());
    }
    if (user.name) {
      localStorage.setItem(this.NAME_KEY, user.name);
    }
    if (user.email) {
      localStorage.setItem(this.EMAIL_KEY, user.email);
    }
    localStorage.setItem(this.LOGGED_IN_KEY, 'true');
  },

  /**
   * Check if user has an active token in localStorage or active dev session
   */
  isLoggedIn() {
    if (!!this.getToken()) return true;
    if (this.isLocalEnv()) {
      return !!localStorage.getItem(this.DEV_SESSION_KEY);
    }
    return false;
  },

  /**
   * Get current user role
   */
  getRole() {
    const user = this.getUser();
    if (user && user.role) {
      return user.role.toLowerCase();
    }
    const storedRole = localStorage.getItem(this.ROLE_KEY);
    if (storedRole) return storedRole.toLowerCase();

    if (this.isLocalEnv()) {
      try {
        const dev = localStorage.getItem(this.DEV_SESSION_KEY);
        if (dev) {
          const parsed = JSON.parse(dev);
          if (parsed.role) return parsed.role.toLowerCase();
        }
      } catch (e) {}
    }
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
    const role = (u && u.role ? u.role : this.getRole()).toLowerCase();

    const path = window.location.pathname.toLowerCase();
    const isSubdir = path.includes('/transporter/') || path.includes('/admin/');
    const prefix = isSubdir ? '../' : '';

    switch (role) {
      case 'buyer':
        window.location.href = `${prefix}buyer.html`;
        break;
      case 'transporter':
        window.location.href = `${prefix}transporter/dashboard.html`;
        break;
      case 'fpo':
        window.location.href = `${prefix}fpo-dashboard.html`;
        break;
      case 'admin':
        window.location.href = `${prefix}admin/dashboard.html`;
        break;
      case 'farmer':
      default:
        window.location.href = `${prefix}dashboard.html`;
        break;
    }
  },

  /**
   * Require user to be logged in. Redirect to login.html if not.
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      const path = window.location.pathname.toLowerCase();
      const loginTarget = path.includes('/transporter/') || path.includes('/admin/') ? '../login.html' : 'login.html';
      window.location.href = loginTarget;
      return false;
    }
    return true;
  },

  /**
   * Require user to possess specific role. If wrong role, redirect to appropriate dashboard.
   */
  requireRole(expectedRole) {
    if (!this.requireAuth()) return false;

    const currentRole = this.getRole();
    if (currentRole !== expectedRole.toLowerCase()) {
      console.warn(`[PageGuard] Role mismatch. Expected: '${expectedRole}', Current: '${currentRole}'. Redirecting...`);
      this.redirectUserByRole();
      return false;
    }
    return true;
  },

  /**
   * Verify token with backend /api/auth/me
   */
  async verifyAuth() {
    const token = this.getToken();
    if (!token) {
      this.clearSession();
      return null;
    }

    try {
      if (window.api && window.api.auth) {
        const res = await window.api.auth.getMe();
        if (res.success && res.user) {
          this.setUser(res.user);
          return res.user;
        }
      } else {
        const isLocal = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const apiBase = (typeof window !== 'undefined' && window.API_BASE_URL)
          ? window.API_BASE_URL.replace(/\/+$/, '')
          : (isLocal ? 'http://localhost:5000/api' : 'https://krishishetra-1.onrender.com/api');
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          this.setUser(data.user);
          return data.user;
        }
      }
      this.clearSession();
      return null;
    } catch (err) {
      console.error('[Auth Verification Failed]:', err.message);
      return null;
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
