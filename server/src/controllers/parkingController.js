const ParkingSlot = require('../models/ParkingSlot.model');
const Booking = require('../models/Booking.model');

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get nearby parking slots based on user location (ONLY VERIFIED SLOTS)
const getNearbyParking = async (req, res) => {
  try {
    const { lat, lng, radius = 10, vehicleType, page = 1, limit = 50 } = req.query;
    
    console.log('Search params:', { lat, lng, radius, vehicleType });
    
    // ONLY SHOW VERIFIED AND ACTIVE SLOTS TO USERS
    let query = {
      isActive: true,
      isVerified: true,      // MUST BE VERIFIED BY ADMIN
      status: 'active',      // MUST BE ACTIVE
      availableSlots: { $gt: 0 }
    };
    
    if (vehicleType && vehicleType !== 'undefined' && vehicleType !== 'all') {
      query.vehicleTypes = vehicleType;
    }
    
    let parkingSlots = [];
    
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);
      
      const allSlots = await ParkingSlot.find(query)
        .populate('ownerId', 'name email phone')
        .lean();
      
      parkingSlots = allSlots
        .filter(slot => {
          if (!slot.location || !slot.location.coordinates) return false;
          const slotLat = slot.location.coordinates[1];
          const slotLng = slot.location.coordinates[0];
          const distance = calculateDistance(centerLat, centerLng, slotLat, slotLng);
          return distance <= radiusKm;
        })
        .map(slot => {
          const slotLat = slot.location.coordinates[1];
          const slotLng = slot.location.coordinates[0];
          const distance = calculateDistance(centerLat, centerLng, slotLat, slotLng);
          return {
            ...slot,
            distance: distance.toFixed(1)
          };
        })
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      
      console.log(`Found ${parkingSlots.length} verified slots within ${radiusKm}km`);
    } else {
      parkingSlots = await ParkingSlot.find(query)
        .populate('ownerId', 'name email phone')
        .limit(50)
        .lean();
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedSlots = parkingSlots.slice(skip, skip + parseInt(limit));
    const total = parkingSlots.length;
    
    res.status(200).json({
      success: true,
      count: paginatedSlots.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: paginatedSlots
    });
  } catch (error) {
    console.error('Search error details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching parking slots',
      error: error.message,
      data: []
    });
  }
};

// Get single parking slot (ONLY IF VERIFIED)
const getParkingSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id)
      .populate('ownerId', 'name email phone');
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }
    
    if (!slot.isVerified || !slot.isActive) {
      return res.status(403).json({ success: false, message: 'Parking slot not available' });
    }
    
    res.status(200).json({ success: true, data: slot });
  } catch (error) {
    console.error('Get slot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check availability
const checkAvailability = async (req, res) => {
  try {
    const { slotId, startTime, endTime } = req.query;
    
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    const conflictingBookings = await Booking.countDocuments({
      slotId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
        { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } }
      ]
    });
    
    const isAvailable = conflictingBookings < slot.totalSlots;
    const availableCount = slot.totalSlots - conflictingBookings;
    
    res.status(200).json({ 
      success: true, 
      available: isAvailable,
      availableSlots: availableCount,
      totalSlots: slot.totalSlots
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all parking slots (Admin only - includes unverified)
const getAllParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error('Get all slots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getNearbyParking, 
  getParkingSlot, 
  checkAvailability,
  getAllParkingSlots 
};
