import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('campusnexus_token'));

  // Initialize user from token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campusnexus_token');
      if (storedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('campusnexus_token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const register = useCallback(async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser, otpRequired, email } = response.data;

    if (otpRequired) {
      // OTP required — don't log in yet, return info for OTP screen
      return { otpRequired: true, email };
    }

    // No OTP required — log in directly
    localStorage.setItem('campusnexus_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    toast.success(`Welcome to CampusNexus, ${newUser.name.split(' ')[0]}!`);
    return { otpRequired: false };
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('campusnexus_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    toast.success(`Welcome, ${newUser.name.split(' ')[0]}!`);
    return newUser;
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData, otpRequired, email: respEmail, purpose } = response.data;

    if (otpRequired) {
      return { otpRequired: true, email: respEmail || email, purpose };
    }

    localStorage.setItem('campusnexus_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
    return { otpRequired: false };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('campusnexus_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  const value = {
    user, token, loading,
    login, register, logout, updateUser, verifyOtp,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFaculty: user?.role === 'faculty',
    isStudent: user?.role === 'student',
    isAdminOrFaculty: ['admin', 'faculty'].includes(user?.role)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
