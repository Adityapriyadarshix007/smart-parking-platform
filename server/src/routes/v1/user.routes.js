const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { getProfile, updateProfile, addVehicle, getVehicles } = require('../../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/vehicles', protect, addVehicle);
router.get('/vehicles', protect, getVehicles);

module.exports = router;
