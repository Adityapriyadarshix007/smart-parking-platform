const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: String,
  gstNumber: String,
  totalEarnings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  totalListings: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Owner', ownerSchema);
