const User = require('../models/User.model');
const Vehicle = require('../models/Vehicle.model');
const Booking = require('../models/Booking.model');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, addVehicle, getVehicles };
