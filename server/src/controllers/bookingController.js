const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');

// Create booking
const createBooking = async (req, res) => {
  try {
    const { slotId, startTime, endTime, vehicleNumber, vehicleType } = req.body;
    
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ 
        success: false,
        message: 'Parking slot not found' 
      });
    }
    
    if (slot.availableSlots < 1) {
      return res.status(400).json({ 
        success: false,
        message: 'No slots available' 
      });
    }
    
    // Calculate price
    const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
    const roundedHours = Math.ceil(hours);
    const totalPrice = roundedHours * (slot.pricing?.hourly || 30);
    
    const booking = await Booking.create({
      userId: req.user.id,
      slotId,
      startTime,
      endTime,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    res.status(201).json({ 
      success: true, 
      data: booking,
      receiptNumber: booking.receiptNumber,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Confirm booking after payment
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    await booking.save();
    
    // Decrease available slots
    const slot = await ParkingSlot.findById(booking.slotId);
    if (slot) {
      slot.availableSlots -= 1;
      await slot.save();
    }
    
    res.status(200).json({ 
      success: true, 
      data: booking,
      receiptNumber: booking.receiptNumber,
      message: 'Booking confirmed successfully' 
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('slotId')
      .sort({ createdAt: -1 });
    
    // Add receipt number to each booking
    const formattedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      receiptNumber: booking.receiptNumber || `SPRK${booking._id.toString().slice(-8).toUpperCase()}`
    }));
    
    res.status(200).json({ success: true, data: formattedBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single booking by receipt number
const getBookingByReceipt = async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    const booking = await Booking.findOne({ receiptNumber })
      .populate('slotId')
      .populate('userId', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel booking - FIXED VERSION
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }
    
    // FIX: Store original status BEFORE changing
    const wasConfirmed = booking.status === 'confirmed';
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // FIX: Increase available slots back if it was confirmed
    if (wasConfirmed) {
      const slot = await ParkingSlot.findById(booking.slotId);
      if (slot) {
        slot.availableSlots += 1;
        await slot.save();
      }
    }
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createBooking, 
  confirmBooking,
  getUserBookings, 
  getBookingByReceipt,
  cancelBooking 
};