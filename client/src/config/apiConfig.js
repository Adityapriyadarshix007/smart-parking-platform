// Centralized API configuration
const getApiUrl = () => {
  // Production: Use live backend
  if (process.env.NODE_ENV === 'production') {
    return 'https://smart-parking-backend-tefg.onrender.com/api/v1';
  }
  
  // Development: Use localhost on port 5001
  return 'http://localhost:5001/api/v1';
};

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://smart-parking-backend-tefg.onrender.com';
  }
  return 'http://localhost:5001';
};

const getSocketUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://smart-parking-backend-tefg.onrender.com';
  }
  return 'http://localhost:5001';
};

const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://smart-parking-platform-nine.vercel.app';
  }
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiUrl();
export const BASE_URL = getBaseUrl();
export const API_URL = API_BASE_URL;
export const SOCKET_URL = getSocketUrl();
export const FRONTEND_URL = getFrontendUrl();

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '8901631209-8vg2le8m50ade206aoup0ni47pti4r8v.apps.googleusercontent.com';

// Google Maps Configuration
export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

// Razorpay Configuration
export const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_SoJcSoBvNFxUU0';

// App Configuration
export const APP_NAME = 'SmartPark';
export const APP_VERSION = '1.0.0';

const config = {
  API_BASE_URL,
  BASE_URL,
  API_URL,
  SOCKET_URL,
  FRONTEND_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_MAPS_API_KEY,
  RAZORPAY_KEY_ID,
  APP_NAME,
  APP_VERSION,
};

export default config;
