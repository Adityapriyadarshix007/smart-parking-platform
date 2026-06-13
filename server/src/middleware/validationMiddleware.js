const validateBooking = (req, res, next) => {
  const { startTime, endTime, vehicleNumber, vehicleType, slotId } = req.body;
  
  if (!startTime || !endTime || !vehicleNumber || !vehicleType || !slotId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  if (new Date(startTime) < new Date()) {
    return res.status(400).json({ message: 'Start time cannot be in the past' });
  }
  
  if (new Date(endTime) <= new Date(startTime)) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }
  
  next();
};

const validateParkingSlot = (req, res, next) => {
  const { title, location, totalSlots, pricing } = req.body;
  
  if (!title || !location || !location.coordinates || !location.address) {
    return res.status(400).json({ message: 'Missing required parking slot fields' });
  }
  
  if (!totalSlots || totalSlots < 1) {
    return res.status(400).json({ message: 'Total slots must be at least 1' });
  }
  
  if (!pricing || !pricing.hourly) {
    return res.status(400).json({ message: 'Pricing information required' });
  }
  
  next();
};

module.exports = { validateBooking, validateParkingSlot };
