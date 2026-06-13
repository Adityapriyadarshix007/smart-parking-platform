const emitToUser = (io, userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data);
};

const emitToBooking = (io, bookingId, event, data) => {
  io.to(`booking-${bookingId}`).emit(event, data);
};

const joinUserRoom = (socket, userId) => {
  socket.join(`user-${userId}`);
};

const joinBookingRoom = (socket, bookingId) => {
  socket.join(`booking-${bookingId}`);
};

module.exports = { emitToUser, emitToBooking, joinUserRoom, joinBookingRoom };
