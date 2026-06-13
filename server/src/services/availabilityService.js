const ParkingSlot = require('../models/ParkingSlot.model');
const Booking = require('../models/Booking.model');

const checkAvailability = async (slotId, startTime, endTime) => {
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) return false;
  
  const conflictingBookings = await Booking.countDocuments({
    slotId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
      { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
      { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } },
    ],
  });
  
  return conflictingBookings < slot.totalSlots;
};

const getAvailableSlotsCount = async (slotId, date) => {
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) return 0;
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const bookings = await Booking.countDocuments({
    slotId,
    status: { $in: ['confirmed', 'active'] },
    startTime: { $lte: endOfDay },
    endTime: { $gte: startOfDay },
  });
  
  return slot.totalSlots - bookings;
};

module.exports = { checkAvailability, getAvailableSlotsCount };
