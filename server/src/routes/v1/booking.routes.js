const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { 
  createBooking, 
  confirmBooking,
  getUserBookings, 
  getBookingByReceipt,
  cancelBooking,
  checkAvailability  // ✅ Add this
} = require('../../controllers/bookingController');

// Create booking
router.post('/', protect, createBooking);

// Confirm booking after payment
router.put('/confirm', protect, confirmBooking);

// Get user bookings
router.get('/my-bookings', protect, getUserBookings);

// Get booking by receipt number
router.get('/receipt/:receiptNumber', protect, getBookingByReceipt);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

// ✅ Check availability before booking
router.post('/check-availability', protect, checkAvailability);

module.exports = router;
