console.log('Attempting to start server...');

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// CORS Middleware - Configure for both development and production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:5173',
  credentials: true
}));

// Other middleware
app.use(express.json());

// Health check endpoint (IMPORTANT for Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running healthy!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint - shows API information
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running!',
    endpoints: {
      health: '/health',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      test: '/test'
    },
    documentation: 'Use the endpoints above to interact with the API'
  });
});

// DEBUG: Test if basic server works first
console.log('Testing basic server functionality...');
app.get('/test', (req, res) => {
  res.send('Basic server test OK');
});

// DEBUG: Load routes with logging to identify the problematic one
try {
  console.log('Loading user routes...');
  app.use('/api/users', require('./routes/userRoutes'));
  console.log('✅ User routes loaded successfully');
} catch (error) {
  console.error('❌ ERROR loading user routes:', error.message);
  process.exit(1);
}

try {
  console.log('Loading product routes...');
  app.use('/api/products', require('./routes/productRoutes'));
  console.log('✅ Product routes loaded successfully');
} catch (error) {
  console.error('❌ ERROR loading product routes:', error.message);
  process.exit(1);
}

try {
  console.log('Loading order routes...');
  app.use('/api/orders', require('./routes/orderRoutes'));
  console.log('✅ Order routes loaded successfully');
} catch (error) {
  console.error('❌ ERROR loading order routes:', error.message);
  process.exit(1);
}

// Serve static files in production (if serving frontend from backend)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Get port from environment variable (Railway provides this)
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log('Environment loaded, attempting MongoDB connection...');

// Enhanced MongoDB connection with better error handling
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`👤 User API: http://localhost:${PORT}/api/users`);
      console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
      console.log(`📋 Orders API: http://localhost:${PORT}/api/orders`);
      console.log(`❤️ Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Test route: http://localhost:${PORT}/test`);
      console.log(`🏠 Root endpoint: http://localhost:${PORT}/`);
    });

    // Better error handling for server
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Trying another port...`);
        app.listen(0);
      }
    });
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('Please check your MONGO_URI in the environment variables');
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});