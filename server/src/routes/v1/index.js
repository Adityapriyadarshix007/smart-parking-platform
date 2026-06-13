const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const parkingRoutes = require('./parking.routes');
const bookingRoutes = require('./booking.routes');
const ownerRoutes = require('./owner.routes');
const adminRoutes = require('./admin.routes');


router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/parking', parkingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/owner', ownerRoutes);
router.use('/admin', adminRoutes);


module.exports = router;
