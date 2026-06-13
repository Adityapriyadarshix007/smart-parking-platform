const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  submitMessage,
  getUserMessages,
  getUserMessage,
  getAllMessages,
  getMessage,
  replyToMessage,
  deleteMessage,
  markMessageAsRead
} = require('../../controllers/messageController');

// Public - Submit contact message (with optional auth)
router.post('/contact', protect, submitMessage);

// User routes (require authentication)
router.get('/my-messages', protect, getUserMessages);
router.get('/my-messages/:id', protect, getUserMessage);
router.put('/mark-read/:id', protect, markMessageAsRead);

// Admin only routes
router.get('/admin/messages', protect, authorize('admin'), getAllMessages);
router.get('/admin/messages/:id', protect, authorize('admin'), getMessage);
router.put('/admin/messages/:id/reply', protect, authorize('admin'), replyToMessage);
router.delete('/admin/messages/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;
