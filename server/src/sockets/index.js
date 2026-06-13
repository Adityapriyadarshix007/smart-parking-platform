const setupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('join-booking', (bookingId) => {
      socket.join(`booking-${bookingId}`);
      console.log(`Socket ${socket.id} joined booking ${bookingId}`);
    });
    
    socket.on('leave-booking', (bookingId) => {
      socket.leave(`booking-${bookingId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = setupSockets;
