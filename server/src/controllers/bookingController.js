const mongoose = require('mongoose');
const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const User = require('../models/User.model');

// ✅ Helper: Convert to IST (UTC + 5:30)
const convertToIST = (date) => {
  if (!date) return date;
  const d = new Date(date);
  d.setHours(d.getHours() + 5);
  d.setMinutes(d.getMinutes() + 30);
  return d;
};

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

    // ✅ Convert to IST before processing
    const startIST = convertToIST(new Date(startTime));
    const endIST = convertToIST(new Date(endTime));

    console.log(`🕐 Start (IST): ${startIST}`);
    console.log(`🕐 End (IST): ${endIST}`);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if slot exists
      const slot = await ParkingSlot.findById(slotId).session(session);
      if (!slot) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Parking slot not found'
        });
      }

      // Check if slot is active
      if (!slot.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Parking slot is currently inactive'
        });
      }

      // ✅ Count booked spots using IST times
      const bookedCount = await Booking.countDocuments({
        slotId,
        status: { $in: ['confirmed', 'active'] },
        $or: [
          { startTime: { $lt: endIST, $gte: startIST } },
          { endTime: { $gt: startIST, $lte: endIST } }
        ]
      }).session(session);

      // ✅ Calculate available spots for this time
      const availableSpotsForTime = slot.totalSlots - bookedCount;
      
      console.log(`📊 Slot: ${slot.title}`);
      console.log(`   Total spots: ${slot.totalSlots}`);
      console.log(`   Already booked for this time: ${bookedCount}`);
      console.log(`   Available spots for this time: ${availableSpotsForTime}`);

      // ✅ Check if any spots are available for this time
      if (availableSpotsForTime <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `All ${slot.totalSlots} spots are already booked for this time. Please choose a different time.`,
          totalSpots: slot.totalSlots,
          bookedSpots: bookedCount,
          availableSpots: 0
        });
      }

      // ✅ Also check overall available slots (for other time slots)
      if (slot.availableSlots <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'No parking spots available at this location overall'
        });
      }

      // ✅ Create slot snapshot
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

      // ✅ Decrease available slots count
      const updatedSlot = await ParkingSlot.findByIdAndUpdate(
        slotId,
        { $inc: { availableSlots: -1 } },
        { new: true, session }
      );

      console.log(`✅ Available slots decreased to: ${updatedSlot.availableSlots}/${updatedSlot.totalSlots}`);

      // ✅ Store IST times in database
      const booking = new Booking({
        userId: req.user.id,
        slotId,
        slotSnapshot,
        vehicleNumber: vehicleNumber.toUpperCase(),
        vehicleType,
        startTime: startIST,  // ✅ Store as IST
        endTime: endIST,      // ✅ Store as IST
        totalPrice,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: `PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      });

      await booking.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      console.log('✅ Booking saved with ID:', booking._id);
      console.log(`✅ Stored times (IST): ${booking.startTime} to ${booking.endTime}`);

      const populatedBooking = await Booking.findById(booking._id)
        .populate('userId', 'name email')
        .populate('slotId', 'title location pricing availableSlots totalSlots');

      res.status(201).json({
        success: true,
        data: populatedBooking,
        message: 'Booking created successfully',
        availableSpotsRemaining: availableSpotsForTime - 1
      });

    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

// @desc    Check slot availability for a time range
// @route   POST /api/v1/bookings/check-availability
// @access  Private
const checkAvailability = async (req, res) => {
  try {
    const { slotId, startTime, endTime } = req.body;

    console.log('🔍 Checking availability for slot:', slotId);
    console.log('   Time range:', startTime, '-', endTime);

    // ✅ Convert to IST for comparison
    const startIST = convertToIST(new Date(startTime));
    const endIST = convertToIST(new Date(endTime));

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    // ✅ Count booked spots using IST times
    const bookedCount = await Booking.countDocuments({
      slotId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startTime: { $lt: endIST, $gte: startIST } },
        { endTime: { $gt: startIST, $lte: endIST } }
      ]
    });

    // ✅ Calculate available spots for this specific time
    const availableSpotsForTime = slot.totalSlots - bookedCount;
    
    console.log(`📊 ${slot.title}:`);
    console.log(`   Total spots: ${slot.totalSlots}`);
    console.log(`   Booked for this time: ${bookedCount}`);
    console.log(`   Available for this time: ${availableSpotsForTime}`);

    // Check if any spots are available for this time
    if (availableSpotsForTime <= 0) {
      return res.json({
        success: true,
        available: false,
        message: `All ${slot.totalSlots} spots are already booked for this time. Please choose a different time.`,
        availableSlots: 0,
        totalSlots: slot.totalSlots,
        bookedSpots: bookedCount,
        availableSpotsForTime: 0
      });
    }

    // Also check overall available slots
    if (slot.availableSlots <= 0) {
      return res.json({
        success: true,
        available: false,
        message: 'No parking spots available at this location overall',
        availableSlots: 0,
        totalSlots: slot.totalSlots,
        bookedSpots: bookedCount,
        availableSpotsForTime: 0
      });
    }

    res.json({
      success: true,
      available: true,
      message: `${availableSpotsForTime} spot(s) available for this time`,
      availableSlots: slot.availableSlots,
      totalSlots: slot.totalSlots,
      bookedSpots: bookedCount,
      availableSpotsForTime: availableSpotsForTime
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: error.message
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

    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    // ✅ Check using IST
    const nowIST = convertToIST(new Date());
    if (new Date(booking.startTime) < nowIST) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already started'
      });
    }

    // Restore available slots
    await ParkingSlot.findByIdAndUpdate(
      booking.slotId,
      { $inc: { availableSlots: 1 } },
      { new: true }
    );
    console.log(`✅ Restored available slot for cancelled booking`);

    booking.status = 'cancelled';
    booking.cancelledAt = convertToIST(new Date());
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

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
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

module.exports = {
  createBooking,
  confirmBooking,
  getUserBookings,
  getBookingByReceipt,
  cancelBooking,
  checkAvailability
};