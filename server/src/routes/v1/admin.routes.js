const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const { 
  getAllUsers, 
  getDashboardStats, 
  getAllParkingSlots,
  updateParkingSlot,
  deleteParkingSlot,
  toggleParkingSlotStatus,
  deleteUser,
  updateUserRole,
  verifyListing,
  getPendingListings,
  getAllBookings,
  updateBookingStatus
} = require('../../controllers/adminController');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:userId/role', updateUserRole);

// Parking management 
router.get('/parking/all', getAllParkingSlots);
router.put('/parking/:id', updateParkingSlot);
router.delete('/parking/:id', deleteParkingSlot);
router.put('/parking/:id/toggle-status', toggleParkingSlotStatus);

// Bookings management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Listings management
router.get('/pending-listings', getPendingListings);
router.put('/listings/:id/verify', verifyListing);

module.exports = router;
