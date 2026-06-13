const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const { 
  getNearbyParking, 
  getParkingSlot, 
  checkAvailability,
  getAllParkingSlots 
} = require('../../controllers/parkingController');

// Public routes
router.get('/nearby', getNearbyParking);
router.get('/availability', checkAvailability);
router.get('/:id', getParkingSlot);

// Protected routes (admin only)
router.get('/admin/all', protect, authorize('admin'), getAllParkingSlots);

// Owner routes
router.post('/', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const ParkingSlot = require('../../models/ParkingSlot.model');
    const slot = await ParkingSlot.create({
      ...req.body,
      ownerId: req.user.id,
      availableSlots: req.body.totalSlots
    });
    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
