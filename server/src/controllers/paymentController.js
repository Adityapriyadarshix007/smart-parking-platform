const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking.model');

// Initialize Razorpay with your keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    console.log('Creating order for amount:', amount);
    
    const options = {
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    console.log('Order created:', order.id);
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create order'
    });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, bookingId } = req.body;
    
    console.log('Verifying payment:', { order_id, payment_id, bookingId });
    
    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    
    const isAuthentic = expectedSignature === signature;
    
    if (isAuthentic) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.paymentId = payment_id;
        booking.orderId = order_id;
        await booking.save();
        console.log('Booking updated with payment:', bookingId);
      }
      
      res.status(200).json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      console.log('Payment verification failed - signature mismatch');
      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Payment verification failed'
    });
  }
};

// Get Razorpay key
const getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    console.error('Get key error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { createOrder, verifyPayment, getRazorpayKey };

// Update verifyPayment to ensure receipt is shown
// The existing verifyPayment already saves the booking with receipt
