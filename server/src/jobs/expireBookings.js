const cron = require('node-cron');
const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');

const expireBookings = () => {
  // ✅ FIX: Run every 5 minutes for faster testing (instead of 30 minutes)
  cron.schedule('*/5 * * * *', async () => {
    console.log('🕐 Running booking expiration check at:', new Date().toISOString());
    
    try {
      const now = new Date();
      
      // Find expired bookings (endTime is in the past and status is confirmed or active)
      const expiredBookings = await Booking.find({
        endTime: { $lt: now },
        status: { $in: ['confirmed', 'active'] }
      });
      
      if (expiredBookings.length === 0) {
        console.log('✅ No expired bookings found');
        return;
      }
      
      console.log(`📊 Found ${expiredBookings.length} expired bookings`);
      
      let restoredCount = 0;
      let errorCount = 0;
      
      for (const booking of expiredBookings) {
        try {
          // Update booking status to expired
          booking.status = 'expired';
          booking.completedAt = now;
          await booking.save();
          console.log(`✅ Marked booking ${booking._id} as expired`);
          
          // ✅ RESTORE AVAILABLE SLOTS for expired booking
          if (booking.slotId) {
            const slot = await ParkingSlot.findById(booking.slotId);
            if (slot) {
              const newAvailableCount = Math.min(slot.totalSlots, slot.availableSlots + 1);
              await ParkingSlot.findByIdAndUpdate(booking.slotId, {
                availableSlots: newAvailableCount
              });
              restoredCount++;
              console.log(`✅ Restored 1 slot for "${slot.title}". Now: ${newAvailableCount}/${slot.totalSlots}`);
            } else {
              console.log(`⚠️ Slot not found for booking ${booking._id} (slotId: ${booking.slotId})`);
              errorCount++;
            }
          } else {
            console.log(`⚠️ Booking ${booking._id} has no slotId`);
            errorCount++;
          }
        } catch (bookingError) {
          console.error(`❌ Error processing booking ${booking._id}:`, bookingError);
          errorCount++;
        }
      }
      
      console.log(`✅ Processed ${restoredCount} slots restored, ${errorCount} errors out of ${expiredBookings.length} expired bookings`);
      
    } catch (error) {
      console.error('❌ Error expiring bookings:', error);
    }
  });
  
  // ✅ Run immediately on startup to catch any missed expired bookings
  console.log('🔄 Running initial booking expiration check on startup...');
  setTimeout(async () => {
    try {
      const now = new Date();
      const expiredBookings = await Booking.find({
        endTime: { $lt: now },
        status: { $in: ['confirmed', 'active'] }
      });
      
      if (expiredBookings.length > 0) {
        console.log(`📊 Found ${expiredBookings.length} expired bookings on startup`);
        // The cron job will handle these, but we could process them here too
      }
    } catch (err) {
      console.error('Initial expiry check error:', err);
    }
  }, 5000);
};

module.exports = expireBookings;