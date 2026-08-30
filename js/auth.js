/**
 * KrishiShetra Auth Configuration & Helpers
 */
const API_BASE_URL = 'http://localhost:5000/api';

const Auth = {
  getToken() {
    return localStorage.getItem('krishi_token');
  },
  setToken(token) {
    localStorage.setItem('krishi_token', token);
  },
  removeToken() {
    localStorage.removeItem('krishi_token');
  },
  getUser() {
    try {
      const u = localStorage.getItem('krishi_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem('krishi_user', JSON.stringify(user));
    if (user && user.role) {
      localStorage.setItem('krishi_user_role', user.role);
    }
    if (user && user.name) {
      localStorage.setItem('krishi_user_name', user.name);
    }
    if (user && user.email) {
      localStorage.setItem('krishi_user_email', user.email);
    }
    localStorage.setItem('krishi_is_logged_in', 'true');
  },
  logout() {
    localStorage.removeItem('krishi_token');
    localStorage.removeItem('krishi_user');
    localStorage.removeItem('krishi_user_role');
    localStorage.removeItem('krishi_user_name');
    localStorage.removeItem('krishi_user_email');
    localStorage.removeItem('krishi_is_logged_in');
    window.location.href = 'login.html';
  },
  async verifyAuth() {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return null;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        this.setUser(data.user);
        return data.user;
      } else {
        this.logout();
        return null;
      }
    } catch (err) {
      console.error('Auth verification failed', err);
      this.logout();
      return null;
    }
  }
};

window.API_BASE_URL = API_BASE_URL;
window.Auth = Auth;
