const setupSocketIO = (server) => {
  const socketIO = require('socket.io');
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });
  
  return io;
};

module.exports = setupSocketIO;
