const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide vehicle number'],
    uppercase: true
  },
  vehicleType: {
    type: String,
    enum: ['2-wheeler', '4-wheeler'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentId: {
    type: String,
    default: null
  },
  orderId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate receipt number before saving
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    // Generate receipt number: SPRK + YEAR + MONTH + DAY + RANDOM
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.receiptNumber = `SPRK${year}${month}${day}${random}`;
  }
  next();
});

bookingSchema.index({ userId: 1 });
bookingSchema.index({ slotId: 1 });
bookingSchema.index({ receiptNumber: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
