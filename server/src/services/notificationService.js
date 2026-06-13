const Notification = require('../models/Notification.model');

const createNotification = async (userId, title, message, type = 'info') => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
    });
    
    // Emit socket event if io available
    if (global.io) {
      global.io.to(`user-${userId}`).emit('new-notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const getUserNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

module.exports = { createNotification, getUserNotifications, markAsRead };
