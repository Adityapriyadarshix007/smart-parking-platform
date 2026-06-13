// Centralized config - works for all environments
const getApiUrl = () => {
  // Production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://smart-parking-backend-tefg.onrender.com';
  }
  // Development (localhost)
  return process.env.REACT_APP_API_URL || 'http://localhost:5001';
};

export const API_URL = getApiUrl();
export const AUTH_URL = `${API_URL}/api/v1/auth`;
export const PARKING_URL = `${API_URL}/api/v1/parking`;
export const BOOKING_URL = `${API_URL}/api/v1/bookings`;
export const PAYMENT_URL = `${API_URL}/api/v1/payments`;
