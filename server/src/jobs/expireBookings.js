const cron = require('node-cron');
const Booking = require('../models/Booking.model');

const expireBookings = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running booking expiration check...');
    
    try {
      const now = new Date();
      const expiredBookings = await Booking.updateMany(
        {
          endTime: { $lt: now },
          status: { $in: ['confirmed', 'active'] }
        },
        { status: 'expired' }
      );
      
      if (expiredBookings.modifiedCount > 0) {
        console.log(`Expired ${expiredBookings.modifiedCount} bookings`);
      }
    } catch (error) {
      console.error('Error expiring bookings:', error);
    }
  });
};

module.exports = expireBookings;
