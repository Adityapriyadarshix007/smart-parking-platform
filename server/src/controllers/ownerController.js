const ParkingSlot = require('../models/ParkingSlot.model');
const Booking = require('../models/Booking.model');
const Owner = require('../models/Owner.model');

const getMySlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

const updateSlot = async (req, res) => {
  try {
    let slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    if (slot.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    if (slot.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await slot.deleteOne();
    
    await Owner.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { totalListings: -1 } }
    );
    
    res.status(200).json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    const slotIds = slots.map(slot => slot._id);
    
    // ✅ Get bookings with slotSnapshot and slotId populated
    const bookings = await Booking.find({ 
      slotId: { $in: slotIds } 
    })
    .populate('userId', 'name email phone')
    .populate('slotId', 'title location pricing isActive availableSlots totalSlots')
    .sort({ createdAt: -1 });
    
    // ✅ Ensure slotSnapshot is included (it's already in the schema)
    // For older bookings without slotSnapshot, we'll add a fallback in frontend
    
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ message: error.message });
  }
};

const getEarnings = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ ownerId: req.user.id });
    const slotIds = slots.map(slot => slot._id);
    
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
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments({ ownerId: req.user.id });
    const totalBookings = await Booking.countDocuments({ 
      slotId: { $in: (await ParkingSlot.find({ ownerId: req.user.id })).map(s => s._id) }
    });
    
    res.status(200).json({ success: true, data: { totalSlots, totalBookings } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getMySlots, 
  createSlot, 
  updateSlot, 
  deleteSlot, 
  getOwnerBookings, 
  getEarnings, 
  getDashboardStats 
};
