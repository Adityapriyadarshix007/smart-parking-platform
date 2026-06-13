const ParkingSlot = require('../models/ParkingSlot.model');

const getLocationSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter required' });
    }
    
    const slots = await ParkingSlot.find({
      'location.address': { $regex: query, $options: 'i' },
      isActive: true
    }).limit(10);
    
    const suggestions = slots.map(slot => ({
      address: slot.location.address,
      city: slot.location.city,
      coordinates: slot.location.coordinates
    }));
    
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }
    
    const nearbySlots = await ParkingSlot.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 500
        }
      }
    }).limit(5);
    
    res.status(200).json({ success: true, data: nearbySlots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLocationSuggestions, getReverseGeocode };
