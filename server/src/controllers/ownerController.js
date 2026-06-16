const ParkingSlot = require('../models/ParkingSlot.model');
const Booking = require('../models/Booking.model');
const Owner = require('../models/Owner.model');

const getMySlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error('Error fetching owner slots:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.create({
      ...req.body,
      ownerId: req.user.id,
      availableSlots: req.body.totalSlots
    });
    
    await Owner.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { totalListings: 1 } },
      { upsert: true }
    );
    
    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSlot = async (req, res) => {
  try {
    let slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    if (slot.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: slot });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    if (slot.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await slot.deleteOne();
    
    await Owner.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { totalListings: -1 } }
    );
    
    res.status(200).json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    const slotIds = slots.map(slot => slot._id);
    
    if (slotIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    const bookings = await Booking.find({ 
      slotId: { $in: slotIds } 
    })
    .populate('userId', 'name email phone')
    .populate('slotId', 'title location pricing isActive availableSlots totalSlots')
    .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEarnings = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    const slotIds = slots.map(slot => slot._id);
    
    if (slotIds.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: { totalEarnings: 0, totalBookings: 0 } 
      });
    }
    
    const bookings = await Booking.find({ 
      slotId: { $in: slotIds },
      status: { $in: ['confirmed', 'completed'] }
    });
    
    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    await Owner.findOneAndUpdate(
      { userId: req.user.id },
      { totalEarnings },
      { upsert: true }
    );
    
    res.status(200).json({ 
      success: true, 
      data: { totalEarnings, totalBookings: bookings.length } 
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ This is the missing endpoint - getDashboardStats
const getDashboardStats = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    const slotIds = slots.map(s => s._id);
    
    const totalSlots = slots.length;
    const activeSlots = slots.filter(s => s.isActive).length;
    const totalBookings = await Booking.countDocuments({ 
      slotId: { $in: slotIds } 
    });
    
    // Calculate total earnings
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
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getMySlots, 
  createSlot, 
  updateSlot, 
  deleteSlot, 
  getOwnerBookings, 
  getEarnings, 
  getDashboardStats  // ✅ Export the missing function
};
