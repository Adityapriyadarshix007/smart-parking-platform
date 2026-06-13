const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { createOrder, verifyPayment, getRazorpayKey } = require('../../controllers/paymentController');

// Create order
router.post('/create-order', protect, createOrder);

// Verify payment
router.post('/verify-payment', protect, verifyPayment);

// Get Razorpay key
router.get('/get-key', protect, getRazorpayKey);

module.exports = router;
