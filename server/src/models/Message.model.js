const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    lowercase: true,
    index: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide subject'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide message'],
    trim: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread',
    index: true
  },
  adminReply: {
    type: String,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  userRead: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound index for faster user queries
messageSchema.index({ email: 1, userId: 1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ userId: 1, userRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
