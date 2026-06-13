import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
  
  // HARDCODED URL - Bypasses api.js completely
  googleVerify: async (credential) => {
    const response = await fetch('https://smart-parking-backend-tefg.onrender.com/api/v1/auth/google/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential })
    });
    const data = await response.json();
    return data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await api.post(`/api/v1/auth/reset-password/${token}`, { password });
    return response.data;
  }
};

export default authService;
