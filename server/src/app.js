const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', require('./routes/v1/auth.routes'));
app.use('/api/v1/user', require('./routes/v1/user.routes'));
app.use('/api/v1/parking', require('./routes/v1/parking.routes'));
app.use('/api/v1/bookings', require('./routes/v1/booking.routes'));
app.use('/api/v1/owner', require('./routes/v1/owner.routes'));
app.use('/api/v1/admin', require('./routes/v1/admin.routes'));

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;