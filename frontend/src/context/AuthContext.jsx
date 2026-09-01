import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('krishi_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('krishi_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState(() => localStorage.getItem('krishi_user_role') || 'farmer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      // Fetch user profile if token exists but user state is missing
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.success && res.data) {
        setUser(res.data);
        const userRole = (res.data.role || 'farmer').toLowerCase();
        setRole(userRole);
        localStorage.setItem('krishi_user', JSON.stringify(res.data));
        localStorage.setItem('krishi_user_role', userRole);
      }
    } catch (e) {
      console.warn('Profile fetch failed:', e);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        const authToken = res.token;
        const authUser = res.user || { email, name: res.name || email.split('@')[0], role: res.role || 'farmer' };
        const userRole = (authUser.role || 'farmer').toLowerCase();

        setToken(authToken);
        setUser(authUser);
        setRole(userRole);

        localStorage.setItem('krishi_token', authToken);
        localStorage.setItem('krishi_user', JSON.stringify(authUser));
        localStorage.setItem('krishi_user_role', userRole);
        localStorage.setItem('krishi_is_logged_in', 'true');

        return { success: true, role: userRole };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.success) {
        if (res.token) {
          const authToken = res.token;
          const authUser = res.user || formData;
          const userRole = (authUser.role || 'farmer').toLowerCase();

          setToken(authToken);
          setUser(authUser);
          setRole(userRole);

          localStorage.setItem('krishi_token', authToken);
          localStorage.setItem('krishi_user', JSON.stringify(authUser));
          localStorage.setItem('krishi_user_role', userRole);
          localStorage.setItem('krishi_is_logged_in', 'true');

          return { success: true, role: userRole };
        }
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('farmer');
    localStorage.removeItem('krishi_token');
    localStorage.removeItem('krishi_user');
    localStorage.removeItem('krishi_user_role');
    localStorage.removeItem('krishi_user_name');
    localStorage.removeItem('krishi_user_email');
    localStorage.removeItem('krishi_is_logged_in');
  };

  const value = {
    token,
    user,
    role,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
    refreshProfile: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
