import { GOOGLE_CLIENT_ID, FRONTEND_URL } from '../config/apiConfig';

// Load Google API script
export const loadGoogleApi = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-js')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-js';
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.body.appendChild(script);
  });
};

// Load Google Identity Services
export const loadGoogleIdentity = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-identity')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-identity';
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.body.appendChild(script);
  });
};

// Initialize Google Sign-In
export const initGoogleSignIn = async () => {
  try {
    await loadGoogleIdentity();
    return true;
  } catch (error) {
    console.error('Google Sign-In initialization error:', error);
    throw error;
  }
};

// Sign in with Google using the new Identity Services
export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    try {
      // Use the Google Identity Services
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            resolve({
              success: true,
              user: {
                token: response.credential
              }
            });
          } else {
            reject(new Error('No credential received'));
          }
        },
        cancel_on_tap_outside: false,
        auto_select: false
      });

      // Trigger the One Tap UI
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          reject(new Error('Google login was cancelled or skipped'));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Alternative: Sign in with Google using popup
export const signInWithGooglePopup = () => {
  return new Promise((resolve, reject) => {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            resolve({
              success: true,
              user: {
                token: response.credential
              }
            });
          } else {
            reject(new Error('No credential received'));
          }
        },
        cancel_on_tap_outside: false
      });

      window.google.accounts.id.prompt();
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  loadGoogleApi,
  loadGoogleIdentity,
  initGoogleSignIn,
  signInWithGoogle,
  signInWithGooglePopup,
};
