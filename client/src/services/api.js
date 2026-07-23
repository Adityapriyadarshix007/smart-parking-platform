// client/src/services/api.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';

const API_URL = `${BASE_URL}/api/v1`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          
          if (response.data.success && response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            if (response.data.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.data.refreshToken);
            }
            
            originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (email, password) => api.post('/auth/login', { email, password }),
    googleVerify: (credential) => api.post('/auth/google/verify', { credential }),
    googleLogin: (token) => api.post('/auth/google', { token }),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  },
  
  parking: {
    getAll: (params) => api.get('/parking', { params }),
    getById: (id) => api.get(`/parking/${id}`),
    create: (data) => api.post('/parking', data),
    update: (id, data) => api.put(`/parking/${id}`, data),
    delete: (id) => api.delete(`/parking/${id}`),
    getNearby: (lat, lng, radius) => api.get('/parking/nearby', { params: { lat, lng, radius } }),
  },
  
  bookings: {
    getAll: () => api.get('/bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    create: (data) => api.post('/bookings', data),
    update: (id, data) => api.put(`/bookings/${id}`, data),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    confirm: (id) => api.put(`/bookings/${id}/confirm`),
    getMyBookings: () => api.get('/bookings/my'),
  },
  
  admin: {
    getStats: () => api.get('/admin/stats'),
    getAllBookings: () => api.get('/admin/bookings'),
    getAllUsers: () => api.get('/admin/users'),
    getAllParking: () => api.get('/admin/parking/all'),
    updateParking: (id, data) => api.put(`/admin/parking/${id}`, data),
    toggleParkingStatus: (id) => api.put(`/admin/parking/${id}/toggle-status`),
    deleteParking: (id) => api.delete(`/admin/parking/${id}`),
    getRevenue: () => api.get('/admin/revenue'),
  },
  
  users: {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
  },
  
  messages: {
    getAll: () => api.get('/messages'),
    getById: (id) => api.get(`/messages/${id}`),
    send: (data) => api.post('/messages', data),
    markAsRead: (id) => api.put(`/messages/${id}/read`),
    delete: (id) => api.delete(`/messages/${id}`),
  },
};

export default api;
