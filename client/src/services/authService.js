// client/src/services/authService.js
// Hardcoded base URL to avoid any Vercel cache issues
const BASE_URL = 'https://smart-parking-backend-tefg.onrender.com';

const authService = {
  register: async (userData) => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  getMe: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  googleVerify: async (credential) => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    return response.json();
  },
  
  forgotPassword: async (email) => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },
  
  resetPassword: async (token, password) => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return response.json();
  }
};

export default authService;