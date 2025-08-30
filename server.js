console.log('Attempting to start server...');

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Add this import

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

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Health check endpoint (IMPORTANT for Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running healthy!',
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production (if serving frontend from backend)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // Test route for development
  app.get('/', (req, res) => {
    res.send('API is running...');
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
    const server = app.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`👤 User API: http://localhost:${PORT}/api/users`);
      console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
      console.log(`❤️ Health check: http://localhost:${PORT}/health`);
    });

    // Better error handling for server
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Trying another port...`);
        app.listen(0); // Let Railway assign a port
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