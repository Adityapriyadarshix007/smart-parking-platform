const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');

// Create booking - Saves snapshot of the slot
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
    
    // ✅ Create snapshot of the slot at booking time
    const slotSnapshot = {
      title: slot.title || 'Parking Space',
      location: {
        address: slot.location?.address || '',
        city: slot.location?.city || '',
        state: slot.location?.state || '',
        pincode: slot.location?.pincode || '',
        landmark: slot.location?.landmark || ''
      },
      pricing: {
        hourly: slot.pricing?.hourly || 0,
        daily: slot.pricing?.daily || 0,
        monthly: slot.pricing?.monthly || 0
      },
      slotType: slot.slotType || 'open',
      vehicleTypes: slot.vehicleTypes || [],
      isDeleted: false
    };
    
    const booking = await Booking.create({
      userId: req.user.id,
      slotId,
      slotSnapshot,  // ✅ Store the snapshot
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
    
    // Decrease available slots (only if slot still exists)
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

// Get user bookings - Uses snapshot if slot is deleted
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    // Format bookings - use snapshot if slot is deleted
    const formattedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Check if slot exists by trying to fetch it (optional - we already have snapshot)
      // If snapshot exists, we use it as fallback
      if (bookingObj.slotSnapshot && bookingObj.slotSnapshot.title) {
        bookingObj.slotDisplay = bookingObj.slotSnapshot;
        bookingObj.slotDeleted = false; // Snapshot is always available
      } else {
        bookingObj.slotDisplay = { title: 'Parking Space (Details Unavailable)' };
        bookingObj.slotDeleted = true;
      }
      
      return {
        ...bookingObj,
        receiptNumber: bookingObj.receiptNumber || `SPRK${bookingObj._id.slice(-8).toUpperCase()}`
      };
    });
    
    res.status(200).json({ success: true, data: formattedBookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single booking by receipt number
const getBookingByReceipt = async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    const booking = await Booking.findOne({ receiptNumber })
      .populate('userId', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    const bookingObj = booking.toObject();
    if (bookingObj.slotSnapshot && bookingObj.slotSnapshot.title) {
      bookingObj.slotDisplay = bookingObj.slotSnapshot;
    } else {
      bookingObj.slotDisplay = { title: 'Parking Space (Details Unavailable)' };
    }
    
    res.status(200).json({ success: true, data: bookingObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel booking
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
    
    const wasConfirmed = booking.status === 'confirmed';
    
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();
    
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