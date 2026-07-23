// client/src/services/authService.js
import { BASE_URL } from '../config/apiConfig';

const API_URL = `${BASE_URL}/api/v1`;

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      
      if (data.success) {
        const token = data.data?.token || data.token;
        const user = data.data?.user || data.user;
        const refreshToken = data.data?.refreshToken || data.refreshToken;
        
        if (token) localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        const token = data.data?.token || data.token;
        const user = data.data?.user || data.user;
        const refreshToken = data.data?.refreshToken || data.refreshToken;
        
        if (token) localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Get current user profile
  getMe: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No token found' };
      }
      
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Google OAuth verification (primary method)
  googleVerify: async (credential) => {
    try {
      const response = await fetch(`${API_URL}/auth/google/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await response.json();
      
      if (data.success) {
        const token = data.data?.token || data.token;
        const user = data.data?.user || data.user;
        const refreshToken = data.data?.refreshToken || data.refreshToken;
        
        if (token) localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      console.error('Google verify error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Google verification simple (fallback method using fetch)
  googleVerifySimple: async (credential) => {
    try {
      const response = await fetch(`${API_URL}/auth/google/verify-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await response.json();
      
      if (data.success) {
        const token = data.data?.token || data.token;
        const user = data.data?.user || data.user;
        const refreshToken = data.data?.refreshToken || data.refreshToken;
        
        if (token) localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      console.error('Google verify simple error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Google verification manual (JWT decode fallback)
  googleVerifyManual: async (credential) => {
    try {
      const response = await fetch(`${API_URL}/auth/google/verify-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await response.json();
      
      if (data.success) {
        const token = data.data?.token || data.token;
        const user = data.data?.user || data.user;
        const refreshToken = data.data?.refreshToken || data.refreshToken;
        
        if (token) localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      console.error('Google verify manual error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Google login (alternative method)
  googleLogin: async (idToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
      });
      const data = await response.json();
      
      if (data.success) {
        const token = data.data?.token || data.token;
        const user = data.data?.user || data.user;
        const refreshToken = data.data?.refreshToken || data.refreshToken;
        
        if (token) localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  
  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  // Get stored user
  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  
  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return { success: false, message: 'No refresh token' };
      }
      
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      const data = await response.json();
      
      if (data.success && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
};

export default authService;
