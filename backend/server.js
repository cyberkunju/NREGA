/**
 * MGNREGA Report Card Backend API Server
 * Express server with middleware for CORS, compression, rate limiting, and error handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const db = require('./db/connection');

// Import route handlers
const districtsRouter = require('./routes/districts');
const performanceRouter = require('./routes/performance');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// Middleware Configuration
// ============================================================================

// CORS Configuration
// Allow requests from frontend (adjust origin in production)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Compression middleware - compress all responses
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept encoding
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ` +
      `${res.statusCode} (${duration}ms)`
    );
  });
  
  next();
});

// Rate limiting middleware
// Limit each IP to 100 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
      },
    });
  },
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// ============================================================================
// Routes
// ============================================================================

// Health check endpoint (no rate limiting)
app.use('/api/health', healthRouter);

// API routes
app.use('/api/districts', districtsRouter);
app.use('/api/performance', performanceRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MGNREGA Report Card API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      districts: '/api/districts',
      performance: '/api/performance/:district_name',
      performanceAll: '/api/performance/all',
      heatmapData: '/api/performance/heatmap-data',
    },
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// ============================================================================
// Error Handling Middleware
// ============================================================================

// Global error handler
app.use((err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });
  
  // Database errors
  if (err.code && err.code.startsWith('08')) {
    return res.status(503).json({
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'Unable to connect to database. Please try again later.',
      },
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
    },
  });
});

// ============================================================================
// Server Startup
// ============================================================================

async function startServer() {
  try {
    // Test database connection before starting server
    console.log('Testing database connection...');
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`\nAPI Endpoints:`);
      console.log(`  - GET  http://localhost:${PORT}/api/health`);
      console.log(`  - GET  http://localhost:${PORT}/api/districts`);
      console.log(`  - GET  http://localhost:${PORT}/api/performance/all`);
      console.log(`  - GET  http://localhost:${PORT}/api/performance/heatmap-data`);
      console.log(`  - GET  http://localhost:${PORT}/api/performance/:district_name\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await db.closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await db.closePool();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
