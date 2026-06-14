const User = require('../models/User.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const Booking = require('../models/Booking.model');
const Message = require('../models/Message.model');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalSlots = await ParkingSlot.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalEarnings = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('slotId', 'title location')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const pendingListings = await ParkingSlot.countDocuments({ status: 'pending', isVerified: false });
    const unreadMessages = await Message.countDocuments({ status: 'unread' });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOwners,
        totalAdmins,
        totalSlots,
        totalBookings,
        totalEarnings: totalEarnings[0]?.total || 0,
        pendingListings,
        unreadMessages,
        recentBookings,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all parking slots (admin full access)
const getAllParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find()
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update any parking slot (admin)
const updateParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, pricing, totalSlots, slotType, vehicleTypes } = req.body;
    
    const slot = await ParkingSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }
    
    if (title) slot.title = title;
    if (description) slot.description = description;
    if (location) slot.location = location;
    if (pricing) slot.pricing = pricing;
    if (totalSlots) slot.totalSlots = totalSlots;
    if (slotType) slot.slotType = slotType;
    if (vehicleTypes) slot.vehicleTypes = vehicleTypes;
    
    await slot.save();
    
    res.status(200).json({ success: true, data: slot, message: 'Parking slot updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete any parking slot (admin)
const deleteParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const slot = await ParkingSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }
    
    await ParkingSlot.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Parking slot deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle parking slot active status (admin)
const toggleParkingSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const slot = await ParkingSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }
    
    slot.isActive = !slot.isActive;
    await slot.save();
    
    res.status(200).json({ 
      success: true, 
      data: slot, 
      message: `Parking slot ${slot.isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Toggle error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the last admin user' });
      }
    }
    
    if (user.role === 'owner') {
      await ParkingSlot.deleteMany({ ownerId: user._id });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Update user role (admin)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['user', 'owner', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be user, owner, or admin' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent removing last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot remove the last admin role from the only admin user' 
        });
      }
    }
    
    user.role = role;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
      message: `User role updated to ${role} successfully` 
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify pending listing (admin)
const verifyListing = async (req, res) => {
  try {
    const listing = await ParkingSlot.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    
    listing.isVerified = true;
    listing.status = 'active';
    await listing.save();
    
    res.status(200).json({ success: true, data: listing, message: 'Listing verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending listings (admin)
const getPendingListings = async (req, res) => {
  try {
    const listings = await ParkingSlot.find({ status: 'pending', isVerified: false })
      .populate('ownerId', 'name email phone');
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBookings,
  updateBookingStatus, 
  getAllUsers, 
  getDashboardStats, 
  getAllParkingSlots,
  updateParkingSlot,
  deleteParkingSlot,
  toggleParkingSlotStatus,
  deleteUser,
  updateUserRole,  // ✅ Added to exports
  verifyListing,
  getPendingListings
};
// Get all bookings (admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('slotId', 'title location pricing')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking status (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    booking.status = status;
    await booking.save();
    
    // If cancelling, increase available slots
    if (status === 'cancelled') {
      const slot = await ParkingSlot.findById(booking.slotId);
      if (slot) {
        slot.availableSlots += 1;
        await slot.save();
      }
    }
    
    res.status(200).json({ success: true, data: booking, message: 'Booking status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
