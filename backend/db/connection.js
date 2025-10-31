/**
 * Database Connection Utility Module
 * Provides connection pooling and error handling for PostgreSQL database
 */

const { Pool } = require('pg');

// Configuration from environment variables
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'mgnrega',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX || '10', 10), // Maximum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10), // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10), // Return error after 2 seconds if connection cannot be established
};

// Validate required configuration
if (!config.user || !config.password) {
  throw new Error('Database credentials (DB_USER and DB_PASSWORD) must be provided in environment variables');
}

// Create connection pool
const pool = new Pool(config);

// Connection error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  // Don't exit the process, just log the error
});

// Connection event logging (optional, for debugging)
pool.on('connect', (client) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('New database client connected');
  }
});

pool.on('remove', (client) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Database client removed from pool');
  }
});

/**
 * Execute a query with automatic retry logic
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<Object>} Query result
 */
async function query(text, params = [], retries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const start = Date.now();
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.warn(`Slow query detected (${duration}ms):`, text);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = isRetryableError(error);
      
      if (!isRetryable || attempt === retries) {
        // Log the error
        console.error(`Database query failed (attempt ${attempt}/${retries}):`, {
          error: error.message,
          code: error.code,
          query: text,
        });
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.warn(`Retrying query after ${delay}ms (attempt ${attempt}/${retries})`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Get a client from the pool for transaction handling
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  try {
    const client = await pool.connect();
    
    // Add query method with retry logic to client
    const originalQuery = client.query.bind(client);
    client.query = async (text, params) => {
      try {
        return await originalQuery(text, params);
      } catch (error) {
        console.error('Client query error:', error.message);
        throw error;
      }
    };
    
    return client;
  } catch (error) {
    console.error('Failed to get database client:', error.message);
    throw error;
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
}

/**
 * Close all connections in the pool
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
    throw error;
  }
}

/**
 * Get pool statistics
 * @returns {Object} Pool statistics
 */
function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Check if an error is retryable
 * @param {Error} error - Database error
 * @returns {boolean} True if error is retryable
 */
function isRetryableError(error) {
  // PostgreSQL error codes that are retryable
  const retryableCodes = [
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '57P03', // cannot_connect_now
    '53300', // too_many_connections
    '40001', // serialization_failure
    '40P01', // deadlock_detected
  ];
  
  return retryableCodes.includes(error.code);
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connections...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connections...');
  await closePool();
  process.exit(0);
});

module.exports = {
  query,
  getClient,
  testConnection,
  closePool,
  getPoolStats,
  pool, // Export pool for advanced use cases
};
