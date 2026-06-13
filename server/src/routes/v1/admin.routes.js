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
  verifyListing,
  getPendingListings
} = require('../../controllers/adminController');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Parking management - FULL ADMIN CONTROL
router.get('/parking/all', getAllParkingSlots);
router.put('/parking/:id', updateParkingSlot);
router.delete('/parking/:id', deleteParkingSlot);
router.put('/parking/:id/toggle-status', toggleParkingSlotStatus);

// Listing management
router.get('/pending-listings', getPendingListings);
router.put('/listings/:id/verify', verifyListing);

module.exports = router;
