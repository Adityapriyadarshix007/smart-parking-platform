const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please provide location coordinates'],
      validate: {
        validator: function(v) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates format'
      }
    },
    address: {
      type: String,
      required: [true, 'Please provide address']
    },
    city: {
      type: String,
      required: true
    },
    landmark: String
  },
  images: [{
    type: String,
    default: []
  }],
  slotType: {
    type: String,
    enum: ['covered', 'open', 'basement'],
    default: 'open'
  },
  vehicleTypes: [{
    type: String,
    enum: ['2-wheeler', '4-wheeler'],
    required: true
  }],
  totalSlots: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  availableSlots: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v) {
        return v <= this.totalSlots;
      },
      message: 'Available slots cannot exceed total slots'
    }
  },
  pricing: {
    hourly: {
      type: Number,
      min: 0,
      default: 30
    },
    daily: {
      type: Number,
      min: 0,
      default: 150
    },
    monthly: {
      type: Number,
      min: 0,
      default: 3000
    }
  },
  availabilitySchedule: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    startTime: String,
    endTime: String,
    isOpen: {
      type: Boolean,
      default: true
    }
  }],
  blockedDates: [{
    start: Date,
    end: Date,
    reason: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

parkingSlotSchema.index({ location: '2dsphere' });
parkingSlotSchema.index({ isActive: 1, isVerified: 1 });
parkingSlotSchema.index({ ownerId: 1 });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
