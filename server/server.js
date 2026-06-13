const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io with CORS for port 5001
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(limiter);

// Make io accessible to routes
app.set('io', io);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-parking';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Error:', err));

// ============================================
// IMPORT ALL ROUTES FIRST
// ============================================
const authRoutes = require('./src/routes/v1/auth.routes');
const userRoutes = require('./src/routes/v1/user.routes');
const parkingRoutes = require('./src/routes/v1/parking.routes');
const bookingRoutes = require('./src/routes/v1/booking.routes');
const ownerRoutes = require('./src/routes/v1/owner.routes');
const adminRoutes = require('./src/routes/v1/admin.routes');
const messageRoutes = require('./src/routes/v1/message.routes');
const paymentRoutes = require('./src/routes/v1/payment.routes');

// ============================================
// REGISTER ALL ROUTES BEFORE 404 HANDLER
// ============================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/owner', ownerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/payments', paymentRoutes);

// ============================================
// HEALTH CHECK AND TEST ROUTES
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    port: process.env.PORT || 5001
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Parking API is Running!', 
    version: '1.0.0',
    port: process.env.PORT || 5001
  });
});

// ============================================
// SOCKET.IO CONNECTION
// ============================================
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-booking', (bookingId) => {
    socket.join(`booking-${bookingId}`);
    console.log(`Socket ${socket.id} joined booking ${bookingId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// ============================================
// 404 HANDLER - MUST BE LAST
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api/v1`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});
