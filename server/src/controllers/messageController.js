const Message = require('../models/Message.model');
const User = require('../models/User.model');
const { createNotification } = require('./notificationController');

// Submit contact message
const submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    console.log('Submitting message from:', email);
    
    // Find user if exists (for logged-in users)
    let user = null;
    let userId = null;
    
    if (req.user) {
      user = req.user;
      userId = req.user.id;
      console.log('User is logged in:', user.email);
    } else {
      user = await User.findOne({ email });
      if (user) {
        userId = user._id;
        console.log('Found existing user:', user.email);
      }
    }
    
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
      status: 'unread',
      userId: userId,
      userRead: true // User has read their own message
    });
    
    console.log('Message created with ID:', newMessage._id);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      data: newMessage
    });
  } catch (error) {
    console.error('Submit message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's own messages (for regular users)
const getUserMessages = async (req, res) => {
  try {
    console.log('Fetching messages for user:', req.user.email, 'ID:', req.user.id);
    
    // Find messages by email OR userId
    const messages = await Message.find({ 
      $or: [
        { email: req.user.email },
        { userId: req.user.id }
      ]
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${messages.length} messages for user ${req.user.email}`);
    
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single message for user
const getUserMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    // Check if message belongs to user
    if (message.email !== req.user.email && message.userId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error('Get user message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages (Admin only)
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    console.log(`Found ${messages.length} total messages`);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single message (Admin only)
const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }
    
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reply to message (Admin only) - WITH SOCKET.IO EVENT FIXED
const replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    message.adminReply = reply;
    message.status = 'replied';
    message.repliedAt = new Date();
    message.userRead = false; // User hasn't read this reply yet
    await message.save();
    
    console.log(`Reply sent to message ${message._id} for user ${message.email}`);
    
    // ✅ EMIT SOCKET EVENT FOR REAL-TIME NOTIFICATION (INSIDE FUNCTION)
    const io = req.app.get('io');
    if (io) {
      // Emit to user's specific room
      if (message.userId) {
        io.to(`user-${message.userId}`).emit('new-message-reply', {
          userId: message.userId,
          messageId: message._id,
          subject: message.subject
        });
        console.log(`Socket emitted to user-${message.userId}`);
      }
      // Also emit to admin room for admin panel updates
      io.emit('message-reply-sent', {
        messageId: message._id,
        userEmail: message.email
      });
    } else {
      console.log('Socket.io not available');
    }
    
    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark message as read by user
const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    // Check if message belongs to user
    if (message.email !== req.user.email && message.userId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    message.userRead = true;
    await message.save();
    
    res.status(200).json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete message (Admin only)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    console.log(`Message ${message._id} deleted`);
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitMessage,
  getUserMessages,
  getUserMessage,
  getAllMessages,
  getMessage,
  replyToMessage,
  markMessageAsRead,
  deleteMessage
};