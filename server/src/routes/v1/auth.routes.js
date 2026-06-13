const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  googleVerify,
  forgotPassword,
  resetPassword,
  updateProfile 
} = require('../../controllers/authController');
const { protect } = require('../../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google/verify', googleVerify);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
