const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const User = require('../models/User.model');

// @desc    Create a new booking
// @route   POST /api/v1/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      slotId,
      startTime,
      endTime,
      vehicleNumber,
      vehicleType,
      totalPrice
    } = req.body;

    console.log('📝 Creating booking for slot:', slotId);
    console.log('👤 User ID:', req.user.id);

    // Check if slot exists
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    // Check if slot is active
    if (!slot.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Parking slot is currently inactive'
      });
    }

    // ✅ CRITICAL: Check if there are available slots
    if (slot.availableSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available slots at this parking location. Please try another time or location.'
      });
    }

    // Check for overlapping bookings for the same slot
    const overlappingBooking = await Booking.findOne({
      slotId,
      status: { $in: ['confirmed', 'active', 'pending'] },
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }

    // ✅ Create a permanent snapshot of the slot at booking time
    const slotSnapshot = {
      title: slot.title || 'Parking Space',
      location: {
        address: slot.location?.address || '',
        city: slot.location?.city || '',
        state: slot.location?.state || '',
        pincode: slot.location?.pincode || '',
        landmark: slot.location?.landmark || '',
        coordinates: {
          lat: slot.location?.coordinates?.[1] || 0,
          lng: slot.location?.coordinates?.[0] || 0
        }
      },
      pricing: {
        hourly: slot.pricing?.hourly || 0,
        daily: slot.pricing?.daily || 0,
        monthly: slot.pricing?.monthly || 0
      },
      slotType: slot.slotType || 'standard',
      vehicleTypes: slot.vehicleTypes || ['2-wheeler', '4-wheeler'],
      isDeleted: false
    };

    console.log('✅ Created slot snapshot:', slotSnapshot.title);

    // ✅ Decrease available slots count
    const updatedSlot = await ParkingSlot.findByIdAndUpdate(
      slotId,
      { $inc: { availableSlots: -1 } },  // Decrement by 1
      { new: true }  // Return updated document
    );

    console.log(`✅ Available slots decreased to: ${updatedSlot.availableSlots}`);

    // Create booking with snapshot
    const booking = new Booking({
      userId: req.user.id,
      slotId,
      slotSnapshot,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalPrice,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentId: `PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    });

    await booking.save();
    console.log('✅ Booking saved with ID:', booking._id);

    // Populate user and slot info for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('slotId', 'title location pricing availableSlots totalSlots');

    res.status(201).json({
      success: true,
      data: populatedBooking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

// @desc    Cancel a booking and restore available slots
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if booking can be cancelled (only confirmed/active bookings)
    if (booking.status !== 'confirmed' && booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    // Check if start time is in the future
    if (new Date(booking.startTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already started'
      });
    }

    // ✅ Restore available slots when booking is cancelled
    const slot = await ParkingSlot.findById(booking.slotId);
    if (slot) {
      await ParkingSlot.findByIdAndUpdate(
        booking.slotId,
        { $inc: { availableSlots: 1 } },  // Increment by 1
        { new: true }
      );
      console.log(`✅ Restored available slot for cancelled booking`);
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';

    await booking.save();

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm booking after payment
// @route   PUT /api/v1/bookings/confirm
// @access  Private
const confirmBooking = async (req, res) => {
  try {
    const { bookingId, paymentId, orderId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // ✅ Double-check slot availability before confirming
    const slot = await ParkingSlot.findById(booking.slotId);
    if (slot && slot.availableSlots <= 0 && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Slot no longer available. Please choose another slot.'
      });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentId;
    booking.orderId = orderId;

    await booking.save();

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('slotId', 'title location pricing isActive availableSlots totalSlots')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get booking by receipt number
// @route   GET /api/v1/bookings/receipt/:receiptNumber
// @access  Private
const getBookingByReceipt = async (req, res) => {
  try {
    const booking = await Booking.findOne({ receiptNumber: req.params.receiptNumber })
      .populate('slotId', 'title location pricing')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user or user is admin
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking by receipt error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check slot availability for a time range
// @route   POST /api/v1/bookings/check-availability
// @access  Private
const checkAvailability = async (req, res) => {
  try {
    const { slotId, startTime, endTime } = req.body;

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    // Check if there are available slots
    if (slot.availableSlots <= 0) {
      return res.json({
        success: true,
        available: false,
        message: 'No parking spots available at this location',
        availableSlots: 0
      });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      slotId,
      status: { $in: ['confirmed', 'active', 'pending'] },
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } }
      ]
    });

    res.json({
      success: true,
      available: !overlappingBooking,
      message: overlappingBooking ? 'This time slot is already booked' : 'Slot available',
      availableSlots: slot.availableSlots
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBooking,
  confirmBooking,
  getUserBookings,
  getBookingByReceipt,
  cancelBooking,
  checkAvailability
};