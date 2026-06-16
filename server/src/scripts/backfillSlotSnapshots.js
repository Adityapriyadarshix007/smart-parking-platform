const mongoose = require('mongoose');
const Booking = require('../models/Booking.model');
const ParkingSlot = require('../models/ParkingSlot.model');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_connection_string';

async function backfillSlotSnapshots() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all bookings without slotSnapshot or with empty title
    const bookings = await Booking.find({
      $or: [
        { 'slotSnapshot.title': { $exists: false } },
        { 'slotSnapshot.title': '' },
        { 'slotSnapshot.title': null }
      ]
    }).populate('slotId');

    console.log(`📊 Found ${bookings.length} bookings missing slotSnapshot`);

    let updatedCount = 0;
    let failedCount = 0;

    for (const booking of bookings) {
      try {
        // If slotId is populated and exists
        if (booking.slotId && booking.slotId.title) {
          const slot = booking.slotId;
          
          // Create snapshot from current slot data
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

          booking.slotSnapshot = slotSnapshot;
          await booking.save();
          updatedCount++;
          console.log(`✅ Updated booking ${booking._id} with snapshot for "${slot.title}"`);
        } else {
          console.log(`⚠️ Skipping booking ${booking._id} - slotId ${booking.slotId} not found in database`);
          failedCount++;
        }
      } catch (err) {
        console.error(`❌ Failed to update booking ${booking._id}:`, err.message);
        failedCount++;
      }
    }

    console.log(`\n🎉 Backfill complete!`);
    console.log(`   ✅ Updated: ${updatedCount} bookings`);
    console.log(`   ❌ Failed: ${failedCount} bookings`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

backfillSlotSnapshots();
