import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DEV_SESSION_KEY = 'krishishetra_dev_session';

export const DEV_TEST_USERS = {
  farmer: {
    id: 'dev_farmer_id',
    role: 'farmer',
    name: 'Development Farmer',
    email: 'dev.farmer@krishishetra.local',
    isDev: true
  },
  fpo: {
    id: 'dev_fpo_id',
    role: 'fpo',
    name: 'Development FPO',
    email: 'dev.fpo@krishishetra.local',
    isDev: true
  },
  buyer: {
    id: 'dev_buyer_id',
    role: 'buyer',
    name: 'Development Buyer',
    email: 'dev.buyer@krishishetra.local',
    isDev: true
  },
  transporter: {
    id: 'dev_transporter_id',
    role: 'transporter',
    name: 'Development Transporter',
    email: 'dev.transporter@krishishetra.local',
    isDev: true
  },
  admin: {
    id: 'dev_admin_id',
    role: 'admin',
    name: 'Development Admin',
    email: 'dev.admin@krishishetra.local',
    isDev: true
  }
};

export const AuthProvider = ({ children }) => {
  const isDevMode = import.meta.env.DEV === true;

  // 1. Real production token
  const [token, setToken] = useState(() => localStorage.getItem('krishi_token'));

  // 2. Development-only session
  const [devSession, setDevSession] = useState(() => {
    if (!isDevMode) return null;
    try {
      const stored = localStorage.getItem(DEV_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 3. User object resolution (real user takes priority, fallback to devSession in development)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('krishi_user');
      if (stored) return JSON.parse(stored);
    } catch {}

    if (isDevMode) {
      try {
        const storedDev = localStorage.getItem(DEV_SESSION_KEY);
        if (storedDev) return JSON.parse(storedDev);
      } catch {}
    }
    return null;
  });

  // 4. Role resolution
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

    if (isDevMode) {
      try {
        const storedDev = localStorage.getItem(DEV_SESSION_KEY);
        if (storedDev) {
          const parsedDev = JSON.parse(storedDev);
          if (parsedDev.role) return parsedDev.role.toLowerCase();
        }
      } catch {}
    }

    return 'farmer';
  });

  const [isInitializing, setIsInitializing] = useState(() => !!localStorage.getItem('krishi_token'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verify real auth session on initial startup if real token exists
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

  // ── Real Production Login ──
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

        // Synchronously update localStorage
        localStorage.setItem('krishi_token', authToken);
        localStorage.setItem('krishi_user', JSON.stringify(authUser));
        localStorage.setItem('krishi_user_role', userRole);
        if (authUser.name) localStorage.setItem('krishi_user_name', authUser.name);
        if (authUser.email) localStorage.setItem('krishi_user_email', authUser.email);
        localStorage.setItem('krishi_is_logged_in', 'true');

        // Clear dev session when logging in with real credentials
        if (isDevMode) {
          localStorage.removeItem(DEV_SESSION_KEY);
          setDevSession(null);
        }

        // Synchronously update in-memory state
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
  }, [isDevMode]);

  // ── Real Production Register ──
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

          if (isDevMode) {
            localStorage.removeItem(DEV_SESSION_KEY);
            setDevSession(null);
          }

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
  }, [isDevMode]);

  // ── Development-Only Login as Test Role ──
  const loginAsDevRole = useCallback((roleKey) => {
    if (!isDevMode) {
      console.warn('[AuthContext] loginAsDevRole is strictly disabled in production builds.');
      return null;
    }

    const normalizedRole = (roleKey || 'farmer').toLowerCase();
    const testUser = DEV_TEST_USERS[normalizedRole] || {
      id: `dev_${normalizedRole}_id`,
      role: normalizedRole,
      name: `Development ${normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)}`,
      email: `dev.${normalizedRole}@krishishetra.local`,
      isDev: true
    };

    localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(testUser));
    setDevSession(testUser);
    setUser(testUser);
    setRole(testUser.role);

    return testUser;
  }, [isDevMode]);

  // ── Development-Only Role Switcher ──
  const switchDevRole = useCallback((roleKey) => {
    return loginAsDevRole(roleKey);
  }, [loginAsDevRole]);

  // ── Unified Logout ──
  const logout = useCallback(() => {
    // 1. Wipe dev session if in development mode
    if (isDevMode) {
      localStorage.removeItem(DEV_SESSION_KEY);
      setDevSession(null);
    }

    // 2. Wipe real production authentication artifacts
    localStorage.removeItem('krishi_token');
    localStorage.removeItem('krishi_user');
    localStorage.removeItem('krishi_user_role');
    localStorage.removeItem('krishi_user_name');
    localStorage.removeItem('krishi_user_email');
    localStorage.removeItem('krishi_is_logged_in');

    // 3. Reset memory state
    setToken(null);
    setUser(null);
    setRole('farmer');
  }, [isDevMode]);

  const isDevSession = isDevMode && !!devSession && !token;
  const isAuthenticated = !!token || (isDevMode && !!devSession);

  const value = {
    token,
    user,
    role,
    isAuthenticated,
    isDevSession,
    loading: isInitializing || isSubmitting,
    login,
    register,
    logout,
    loginAsDevRole,
    switchDevRole
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
