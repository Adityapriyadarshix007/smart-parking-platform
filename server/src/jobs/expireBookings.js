const cron = require('node-cron');
const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');

// ✅ Helper: Get current time in IST (UTC + 5:30)
const getISTNow = () => {
  const now = new Date();
  now.setHours(now.getHours() + 5);
  now.setMinutes(now.getMinutes() + 30);
  return now;
};

// ✅ Process expired bookings using IST
const processExpiredBookings = async () => {
  try {
    const nowIST = getISTNow();
    
    console.log(`🕐 Current IST time for expiry check: ${nowIST.toISOString()}`);
    console.log(`🕐 Current IST time: ${nowIST.toString()}`);
    
    // Find expired bookings (endTime is in the past and status is confirmed or active)
    const expiredBookings = await Booking.find({
      endTime: { $lt: nowIST },
      status: { $in: ['confirmed', 'active'] }
    });
    
    if (expiredBookings.length === 0) {
      console.log('✅ No expired bookings found');
      return { processed: 0, restored: 0, errors: 0 };
    }
    
    console.log(`📊 Found ${expiredBookings.length} expired bookings`);
    
    let restoredCount = 0;
    let errorCount = 0;
    
    for (const booking of expiredBookings) {
      try {
        // Update booking status to expired
        booking.status = 'expired';
        booking.completedAt = nowIST;
        await booking.save();
        console.log(`✅ Marked booking ${booking.receiptNumber} as expired`);
        
        // ✅ Restore available slots
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
  // ✅ Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🕐 Running booking expiration check at IST:', getISTNow().toString());
    await processExpiredBookings();
  });
  
  // ✅ Run immediately on startup
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
