import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Base URL for static files (uploads, avatars, certificates)
export const STATIC_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusnexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campusnexus_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Network error. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
