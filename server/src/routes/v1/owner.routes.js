const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const ParkingSlot = require('../../models/ParkingSlot.model');
const Booking = require('../../models/Booking.model');

router.use(protect);
router.use(authorize('owner', 'admin'));

// ✅ GET /stats - Dashboard statistics for owner
router.get('/stats', async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    const slotIds = slots.map(s => s._id);
    
    const totalSlots = slots.length;
    const activeSlots = slots.filter(s => s.isActive).length;
    const totalBookings = await Booking.countDocuments({ 
      slotId: { $in: slotIds } 
    });
    
    // Calculate total earnings from confirmed/completed bookings
    const bookings = await Booking.find({ 
      slotId: { $in: slotIds },
      status: { $in: ['confirmed', 'completed'] }
    });
    const totalEarnings = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    res.status(200).json({ 
      success: true, 
      data: { 
        totalSlots, 
        activeSlots,
        totalBookings,
        totalEarnings,
        availableSlots: slots.reduce((sum, s) => sum + s.availableSlots, 0),
        pendingVerification: slots.filter(s => !s.isVerified).length
      } 
    });
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get owner's parking slots
router.get('/my-slots', async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new parking slot - NEEDS ADMIN VERIFICATION
router.post('/slots', async (req, res) => {
  try {
    const { title, description, location, vehicleTypes, totalSlots, slotType, pricing } = req.body;
    
    console.log('Creating slot for owner:', req.user.id);
    console.log('Location data:', location);
    
    if (!title || !location || !location.address || !totalSlots || !pricing || !pricing.hourly) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, address, totalSlots, and hourly pricing are required' 
      });
    }
    
    // Validate coordinates
    let coordinates = location.coordinates;
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Could not detect location coordinates. Please enter a more specific address.' 
      });
    }
    
    // Validate coordinates are numbers
    if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid location coordinates. Please re-enter the address.' 
      });
    }
    
    const slot = await ParkingSlot.create({
      ownerId: req.user.id,
      title,
      description: description || '',
      location: {
        type: 'Point',
        coordinates: coordinates,
        address: location.address,
        city: location.city || 'Delhi',
        state: location.state || 'Delhi',
        landmark: location.landmark || ''
      },
      images: [],
      slotType: slotType || 'open',
      vehicleTypes: vehicleTypes || ['4-wheeler'],
      totalSlots: totalSlots,
      availableSlots: totalSlots,
      pricing: {
        hourly: pricing.hourly,
        daily: pricing.daily || pricing.hourly * 8,
        monthly: pricing.monthly || pricing.hourly * 8 * 25
      },
      isVerified: false,
      isActive: true,
      status: 'pending'
    });
    
    console.log(`✅ New parking slot created (PENDING VERIFICATION): ${slot.title} at [${coordinates}]`);
    
    res.status(201).json({ 
      success: true, 
      data: slot,
      message: 'Parking slot submitted for admin verification!'
    });
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update parking slot
router.put('/slots/:id', async (req, res) => {
  try {
    let slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    if (slot.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: slot, message: 'Slot updated successfully' });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete parking slot
router.delete('/slots/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    if (slot.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await slot.deleteOne();
    console.log(`✅ Parking slot deleted: ${slot.title}`);
    res.status(200).json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get bookings for owner's slots
router.get('/bookings', async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    const slotIds = slots.map(slot => slot._id);
    const bookings = await Booking.find({ slotId: { $in: slotIds } })
      .populate('userId', 'name email phone')
      .populate('slotId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get earnings
router.get('/earnings', async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    const slotIds = slots.map(slot => slot._id);
    const bookings = await Booking.find({ 
      slotId: { $in: slotIds },
      status: { $in: ['confirmed', 'completed'] }
    });
    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    res.status(200).json({ 
      success: true, 
      data: { totalEarnings, totalBookings: bookings.length } 
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;