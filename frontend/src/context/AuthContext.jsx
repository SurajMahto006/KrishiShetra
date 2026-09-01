import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Synchronous initialization from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('krishi_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('krishi_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem('krishi_user_role');
    if (storedRole) return storedRole.toLowerCase();
    try {
      const stored = localStorage.getItem('krishi_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role) return parsed.role.toLowerCase();
      }
    } catch {}
    return 'farmer';
  });

  const [isInitializing, setIsInitializing] = useState(() => !!localStorage.getItem('krishi_token'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verify auth session on initial startup if token exists
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const storedToken = localStorage.getItem('krishi_token');
      if (!storedToken) {
        if (isMounted) setIsInitializing(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (isMounted && res?.success && res.user) {
          const verifiedUser = res.user;
          const verifiedRole = (verifiedUser.role || 'farmer').toLowerCase();

          localStorage.setItem('krishi_user', JSON.stringify(verifiedUser));
          localStorage.setItem('krishi_user_role', verifiedRole);
          localStorage.setItem('krishi_is_logged_in', 'true');

          setUser(verifiedUser);
          setRole(verifiedRole);
        }
      } catch (e) {
        console.warn('[AuthContext] Session check completed, using local state.');
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    verifySession();
    return () => { isMounted = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.success && res.token) {
        const authToken = res.token;
        const authUser = res.user || {
          id: res.id || email,
          name: res.name || email.split('@')[0],
          email,
          role: res.role || 'farmer'
        };
        const userRole = (authUser.role || res.role || 'farmer').toLowerCase();

        // 1. Synchronously update localStorage
        localStorage.setItem('krishi_token', authToken);
        localStorage.setItem('krishi_user', JSON.stringify(authUser));
        localStorage.setItem('krishi_user_role', userRole);
        if (authUser.name) localStorage.setItem('krishi_user_name', authUser.name);
        if (authUser.email) localStorage.setItem('krishi_user_email', authUser.email);
        localStorage.setItem('krishi_is_logged_in', 'true');

        // 2. Synchronously update in-memory state
        setToken(authToken);
        setUser(authUser);
        setRole(userRole);

        return { success: true, role: userRole };
      }

      return {
        success: false,
        message: res.message || 'Invalid email or password. Please try again.'
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Network error during login. Please check server connection.'
      };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.success) {
        if (res.token) {
          const authToken = res.token;
          const authUser = res.user || formData;
          const userRole = (authUser.role || formData.role || 'farmer').toLowerCase();

          localStorage.setItem('krishi_token', authToken);
          localStorage.setItem('krishi_user', JSON.stringify(authUser));
          localStorage.setItem('krishi_user_role', userRole);
          if (authUser.name) localStorage.setItem('krishi_user_name', authUser.name);
          if (authUser.email) localStorage.setItem('krishi_user_email', authUser.email);
          localStorage.setItem('krishi_is_logged_in', 'true');

          setToken(authToken);
          setUser(authUser);
          setRole(userRole);

          return { success: true, role: userRole };
        }
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    // 1. Wipe all authentication artifacts
    localStorage.removeItem('krishi_token');
    localStorage.removeItem('krishi_user');
    localStorage.removeItem('krishi_user_role');
    localStorage.removeItem('krishi_user_name');
    localStorage.removeItem('krishi_user_email');
    localStorage.removeItem('krishi_is_logged_in');

    // 2. Reset memory state
    setToken(null);
    setUser(null);
    setRole('farmer');
  }, []);

  const value = {
    token,
    user,
    role,
    isAuthenticated: !!token,
    loading: isInitializing || isSubmitting,
    login,
    register,
    logout
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
