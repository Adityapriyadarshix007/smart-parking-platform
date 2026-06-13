const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['message_reply', 'booking_confirmed', 'booking_cancelled', 'payment_success', 'info', 'alert'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
    default: null
  },
  relatedModel: {
    type: String,
    enum: ['Message', 'Booking', 'Payment'],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create indexes for faster queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
