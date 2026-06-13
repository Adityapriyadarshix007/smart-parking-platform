// Centralized API configuration
const getApiUrl = () => {
  // Production: Use live backend
  if (process.env.NODE_ENV === 'production') {
    return 'https://smart-parking-backend-tefg.onrender.com';
  }
  // Development: Use localhost
  return process.env.REACT_APP_API_URL || 'https://smart-parking-backend-tefg.onrender.com';
};

export const API_BASE_URL = getApiUrl();
export const API_URL = API_BASE_URL;
