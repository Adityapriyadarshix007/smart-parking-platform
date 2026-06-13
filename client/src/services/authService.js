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
  
  googleVerify: async (credential) => {
    // This will become: baseURL + '/api/v1/auth/google/verify'
    const response = await api.post('/api/v1/auth/google/verify', { credential });
    return response.data;
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
