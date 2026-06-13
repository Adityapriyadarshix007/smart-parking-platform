const bookingSocketEvents = (io, socket) => {
  socket.on('booking-status-update', (data) => {
    io.to(`booking-${data.bookingId}`).emit('status-changed', data);
  });
  
  socket.on('new-booking', (bookingData) => {
    io.emit('booking-created', bookingData);
  });
};

module.exports = bookingSocketEvents;
