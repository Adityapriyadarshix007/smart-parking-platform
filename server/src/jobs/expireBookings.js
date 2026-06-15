const cron = require('node-cron');
const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');

const expireBookings = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('🕐 Running booking expiration check...');
    
    try {
      const now = new Date();
      
      // Find expired bookings
      const expiredBookings = await Booking.find({
        endTime: { $lt: now },
        status: { $in: ['confirmed', 'active'] }
      });
      
      if (expiredBookings.length === 0) {
        return;
      }
      
      console.log(`📊 Found ${expiredBookings.length} expired bookings`);
      
      for (const booking of expiredBookings) {
        // Update booking status to expired
        booking.status = 'expired';
        booking.completedAt = now;
        await booking.save();
        
        // ✅ RESTORE AVAILABLE SLOTS for expired booking
        const slot = await ParkingSlot.findById(booking.slotId);
        if (slot) {
          const newAvailableCount = Math.min(slot.totalSlots, slot.availableSlots + 1);
          await ParkingSlot.findByIdAndUpdate(booking.slotId, {
            availableSlots: newAvailableCount
          });
          console.log(`✅ Restored 1 slot for "${slot.title}". Now: ${newAvailableCount}/${slot.totalSlots}`);
        }
      }
      
      console.log(`✅ Processed ${expiredBookings.length} expired bookings`);
      
    } catch (error) {
      console.error('❌ Error expiring bookings:', error);
    }
  });
};

module.exports = expireBookings;