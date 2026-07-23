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

// ============================================
// CORS CONFIGURATION
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5001',
      'https://smart-parking-platform-nine.vercel.app',
      'https://smart-parking-backend-tefg.onrender.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"]
};

// Socket.io with CORS
const io = socketIo(server, {
  cors: corsOptions
});

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

// General rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/' || req.path === '/api/v1/health';
  }
});

// Strict rate limiter for booking and message endpoints - 30 requests per minute
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Admin rate limiter - 50 requests per 15 minutes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many admin requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/v1/bookings', strictLimiter);
app.use('/api/v1/messages', strictLimiter);
app.use('/api/v1/admin', adminLimiter);

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Make io accessible to routes
app.set('io', io);

// ============================================
// MONGODB CONNECTION WITH RETRY LOGIC
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-parking';

console.log('🔄 Connecting to MongoDB...');
console.log('📝 Using URI:', MONGODB_URI.replace(/\/\/.*@/, '//****:****@'));

const connectWithRetry = () => {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
    family: 4 // Use IPv4
  })
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    console.log(`📌 Connection State: ${mongoose.connection.readyState}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('🔍 Please check:');
    console.error('  1. Your IP is whitelisted in MongoDB Atlas');
    console.error('  2. Your username and password are correct');
    console.error('  3. Your cluster is active and not paused');
    console.error('  4. Check the connection string in .env file');
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Initial connection attempt
connectWithRetry();

// Monitor MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔴 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🟢 MongoDB reconnected');
});

mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connected');
});

// ============================================
// IMPORT ALL ROUTES - FIXED PATHS
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
// REGISTER ALL ROUTES
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
  const mongoStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage().rss / 1024 / 1024 + ' MB',
    port: process.env.PORT || 5001,
    mongodb: {
      status: statusMap[mongoStatus] || 'Unknown',
      readyState: mongoStatus
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.json({ 
    message: 'Smart Parking API is Running!', 
    version: '1.0.0',
    port: process.env.PORT || 5001,
    environment: process.env.NODE_ENV || 'development',
    mongodb: statusMap[mongoStatus] || 'Unknown'
  });
});

// ============================================
// SOCKET.IO CONNECTION
// ============================================
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Socket ${socket.id} joined user room: ${userId}`);
  });
  
  socket.on('join-booking', (bookingId) => {
    socket.join(`booking-${bookingId}`);
    console.log(`Socket ${socket.id} joined booking ${bookingId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ============================================
// BOOKING EXPIRY JOB
// ============================================
try {
  const expireBookings = require('./src/jobs/expireBookings');
  // Initialize booking expiry job (runs every 30 minutes)
  expireBookings();
  console.log('✅ Booking expiry job initialized');
} catch (error) {
  console.log('⚠️ Booking expiry job not found or failed to initialize');
}

// ============================================
// GLOBAL ERROR HANDLERS
// ============================================

// Catch 404 for undefined routes - MUST BE BEFORE ERROR HANDLER
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// UNCAUGHT EXCEPTION HANDLERS
// ============================================
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit, just log to keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log to keep server running
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = () => {
  console.log('👋 Received shutdown signal. Closing server gracefully...');
  server.close(() => {
    console.log('💤 Server closed. Closing MongoDB connection...');
    mongoose.connection.close(false, () => {
      console.log('💤 MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============================================
// START SERVER ON PORT 5001
// ============================================
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api/v1`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Use this URL for login: http://localhost:${PORT}/api/v1/auth/login`);
});

module.exports = { app, server };
