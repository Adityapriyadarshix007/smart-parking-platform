const cron = require('node-cron');
const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');

const generateDailyReport = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Generating daily report...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      const dailyBookings = await Booking.find({
        createdAt: { $gte: yesterday, $lte: today },
      });
      
      const totalRevenue = dailyBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      
      console.log(`Daily Report: ${dailyBookings.length} bookings, ₹${totalRevenue} revenue`);
      // Save report to database or send email
    } catch (error) {
      console.error('Error generating report:', error);
    }
  });
};

module.exports = generateDailyReport;
