const express = require('express');
const router = express.Router();

// Webhook for payment gateway (future implementation)
router.post('/payment', async (req, res) => {
  try {
    const { bookingId, status, transactionId } = req.body;
    console.log('Payment webhook received:', { bookingId, status, transactionId });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
