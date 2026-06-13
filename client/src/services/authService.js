import api from './api';

// Determine the correct API path based on what your backend expects
const API_PATH = '/api/v1';

const authService = {
  register: async (userData) => {
    const response = await api.post(`${API_PATH}/auth/register`, userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post(`${API_PATH}/auth/login`, { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get(`${API_PATH}/auth/me`);
    return response.data;
  },
  
  googleVerify: async (credential) => {
    // Use fetch directly to avoid any baseURL issues
    const response = await fetch('https://smart-parking-backend-tefg.onrender.com/api/v1/auth/google/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential })
    });
    const data = await response.json();
    console.log('Google verify response:', data);
    return data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post(`${API_PATH}/auth/forgot-password`, { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await api.post(`${API_PATH}/auth/reset-password/${token}`, { password });
    return response.data;
  }
};

export default authService;
