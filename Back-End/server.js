require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/drivers');
const vendorRoutes = require('./routes/vendors');
const tripRoutes = require('./routes/trips');
const maintenanceRoutes = require('./routes/maintenance');
const reportRoutes = require('./routes/reports');

// Import models for socket events
const Driver = require('./models/Driver');
const Vendor = require('./models/Vendor');
const Trip = require('./models/Trip');
const CarMaintenance = require('./models/CarMaintenance');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081", 
  "http://localhost:8082",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Driver events
  socket.on('subscribe:drivers', () => {
    socket.join('drivers');
  });

  socket.on('unsubscribe:drivers', () => {
    socket.leave('drivers');
  });

  // Vendor events
  socket.on('subscribe:vendors', () => {
    socket.join('vendors');
  });

  socket.on('unsubscribe:vendors', () => {
    socket.leave('vendors');
  });

  // Trip events
  socket.on('subscribe:trips', () => {
    socket.join('trips');
  });

  socket.on('unsubscribe:trips', () => {
    socket.leave('trips');
  });

  // Maintenance events
  socket.on('subscribe:maintenance', () => {
    socket.join('maintenance');
  });

  socket.on('unsubscribe:maintenance', () => {
    socket.leave('maintenance');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to other modules
app.set('io', io);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket event emitters for real-time updates
const emitDriverUpdate = (event, data) => {
  io.to('drivers').emit(`driver:${event}`, data);
};

const emitVendorUpdate = (event, data) => {
  io.to('vendors').emit(`vendor:${event}`, data);
};

const emitTripUpdate = (event, data) => {
  io.to('trips').emit(`trip:${event}`, data);
};

const emitMaintenanceUpdate = (event, data) => {
  io.to('maintenance').emit(`maintenance:${event}`, data);
};

// Make emitters available globally
global.emitDriverUpdate = emitDriverUpdate;
global.emitVendorUpdate = emitVendorUpdate;
global.emitTripUpdate = emitTripUpdate;
global.emitMaintenanceUpdate = emitMaintenanceUpdate;

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 WebSocket: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
