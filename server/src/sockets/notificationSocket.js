const notificationSocket = (io, socket) => {
  socket.on('join-notifications', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined notifications room`);
  });
  
  socket.on('mark-notification-read', async (notificationId) => {
    socket.emit('notification-marked', notificationId);
  });
};

module.exports = notificationSocket;
