const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  googleVerify,
  googleVerifySimple,
  googleVerifyManual,
  forgotPassword,
  resetPassword,
  updateProfile 
} = require('../../controllers/authController');
const { protect } = require('../../middleware/authMiddleware');

// Health check endpoints (no authentication required)
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.get('/health/ping', (req, res) => {
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Public routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.post('/google/verify', googleVerify);
router.post('/google/verify-simple', googleVerifySimple);
router.post('/google/verify-manual', googleVerifyManual);

// Password routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
