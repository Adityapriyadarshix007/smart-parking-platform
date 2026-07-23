import axios from 'axios';

// Get the base URL - works for both development and production
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://smart-parking-backend-tefg.onrender.com/api/v1';
  }
  return 'http://localhost:5001/api/v1';
};

const API_URL = getBaseUrl();

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add token to every request
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found for admin request');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Enhanced error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Admin API Error:', error.message);
    
    if (error.response?.status === 403) {
      console.error('❌ Access denied - User is not an admin');
      // Show a user-friendly message
      return Promise.reject({
        ...error,
        userMessage: 'You do not have admin access. Please contact the administrator.'
      });
    } else if (error.response?.status === 401) {
      console.error('❌ Unauthorized - Token expired or invalid');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject({
        ...error,
        userMessage: 'Your session has expired. Please login again.'
      });
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - Server may be down');
      return Promise.reject({
        ...error,
        userMessage: 'Server is not responding. Please try again later.'
      });
    } else if (error.response?.status === 500) {
      console.error('❌ Server error:', error.response?.data);
      return Promise.reject({
        ...error,
        userMessage: 'Server error. Please try again later.'
      });
    }
    
    return Promise.reject(error);
  }
);

// Admin API methods
export const adminApiService = {
  getStats: async () => {
    try {
      const response = await adminApi.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error.message);
      throw error;
    }
  },

  getBookings: async () => {
    try {
      const response = await adminApi.get('/admin/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
      throw error;
    }
  },

  getParkingSlots: async () => {
    try {
      const response = await adminApi.get('/admin/parking/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching parking slots:', error.message);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const response = await adminApi.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
  },

  toggleSlotStatus: async (slotId) => {
    try {
      const response = await adminApi.put(`/admin/parking/${slotId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling slot status:', error.message);
      throw error;
    }
  },

  deleteSlot: async (slotId) => {
    try {
      const response = await adminApi.delete(`/admin/parking/${slotId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting slot:', error.message);
      throw error;
    }
  },

  getPendingListings: async () => {
    try {
      const response = await adminApi.get('/admin/pending-listings');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending listings:', error.message);
      throw error;
    }
  },

  verifyListing: async (listingId) => {
    try {
      const response = await adminApi.put(`/admin/listings/${listingId}/verify`);
      return response.data;
    } catch (error) {
      console.error('Error verifying listing:', error.message);
      throw error;
    }
  },
};

export default adminApiService;
