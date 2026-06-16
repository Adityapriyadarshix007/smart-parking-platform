const cron = require('node-cron');
const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');

// ✅ Process expired bookings (database stores UTC)
const processExpiredBookings = async () => {
  try {
    const nowUTC = new Date();
    
    console.log(`🕐 Current UTC time for expiry check: ${nowUTC.toISOString()}`);
    
    // Find expired bookings (endTime is in the past and status is confirmed or active)
    const expiredBookings = await Booking.find({
      endTime: { $lt: nowUTC },
      status: { $in: ['confirmed', 'active'] }
    });
    
    if (expiredBookings.length === 0) {
      return { processed: 0, restored: 0, errors: 0 };
    }
    
    console.log(`📊 Found ${expiredBookings.length} expired bookings`);
    
    let restoredCount = 0;
    let errorCount = 0;
    
    for (const booking of expiredBookings) {
      try {
        booking.status = 'expired';
        booking.completedAt = nowUTC;
        await booking.save();
        console.log(`✅ Marked booking ${booking.receiptNumber} as expired`);
        
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
    
    return { processed: expiredBookings.length, restored: restoredCount, errors: errorCount };
    
  } catch (error) {
    console.error('❌ Error expiring bookings:', error);
    throw error;
  }
};

const expireBookings = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('🕐 Running booking expiration check at UTC:', new Date().toISOString());
    await processExpiredBookings();
  });
  
  console.log('🔄 Running initial booking expiration check on startup...');
  setTimeout(async () => {
    try {
      const result = await processExpiredBookings();
      if (result.processed > 0) {
        console.log(`✅ Startup: Processed ${result.processed} expired bookings, restored ${result.restored} slots`);
      } else {
        console.log('✅ Startup: No expired bookings found');
      }
    } catch (err) {
      console.error('❌ Initial expiry check error:', err);
    }
  }, 3000);
};

module.exports = expireBookings;
