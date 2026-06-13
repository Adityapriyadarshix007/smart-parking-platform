const cron = require('node-cron');
const Booking = require('../models/Booking.model');

const sendReminders = () => {
  cron.schedule('0 */1 * * *', async () => {
    console.log('Sending booking reminders...');
    
    try {
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      const upcomingBookings = await Booking.find({
        startTime: { $lte: oneHourFromNow, $gt: new Date() },
        status: 'confirmed'
      }).populate('userId slotId');
      
      console.log(`Found ${upcomingBookings.length} upcoming bookings for reminders`);
      // Here you would send actual notifications/emails
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  });
};

module.exports = sendReminders;
