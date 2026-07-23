const mongoose = require('mongoose');
const User = require('./User.model');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot'
  },
  slotSnapshot: {
    title: String,
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    pricing: {
      hourly: Number,
      daily: Number,
      monthly: Number
    },
    slotType: String,
    vehicleTypes: [String],
    isDeleted: Boolean
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['4-wheeler', '2-wheeler'],
    default: '4-wheeler'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  paymentId: String,
  orderId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'expired'],
    default: 'pending'
  },
  receiptNumber: String,
  cancelledAt: Date,
  cancellationReason: String,
  refundAmount: Number,
  completedAt: Date,
  paymentDate: Date
}, {
  timestamps: true
});

// Ensure User model is registered before creating indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ slotId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1 });
bookingSchema.index({ endTime: 1 });

// Pre-save hook to generate receipt number
bookingSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const date = new Date();
    const dateStr = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.receiptNumber = `SPRK${dateStr}${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
