#!/usr/bin/env node

/**
 * MGNREGA ETL Service - Main Entry Point
 * Fetches data from data.gov.in API and loads into PostgreSQL database
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { fetchWithRetry } = require('./data-fetcher');
const { transformRecords, getSummaryStats } = require('./data-transformer');
const { createPool, loadRecords, ensureDistricts, testConnection, getDatabaseStats, closePool } = require('./data-loader');

// Configuration from environment variables
const config = {
  api: {
    endpoint: process.env.GOV_API_ENDPOINT,
    apiKey: process.env.GOV_API_KEY,
    stateFilter: process.env.STATE_FILTER || '',
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.API_MAX_RETRIES || '3', 10),
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'mgnrega',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_POOL_MAX || '5', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Global variables
let pool = null;
let startTime = null;

/**
 * Main ETL process
 */
async function main() {
  startTime = Date.now();

  log('info', '='.repeat(80));
  log('info', 'MGNREGA ETL Service Starting');
  log('info', `Timestamp: ${new Date().toISOString()}`);
  log('info', `State Filter: ${config.api.stateFilter}`);
  log('info', '='.repeat(80));

  try {
    // Validate configuration
    validateConfiguration();

    // Step 1: Initialize database connection
    log('info', '\n[Step 1/5] Initializing database connection...');
    pool = createPool(config.database);

    const dbConnected = await testConnection(pool);
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    log('info', '✓ Database connection established');

    // Step 2: Fetch data from API
    log('info', '\n[Step 2/5] Fetching data from government API...');
    const fetchResult = await fetchWithRetry(
      {
        apiEndpoint: config.api.endpoint,
        apiKey: config.api.apiKey,
        stateFilter: config.api.stateFilter,
        timeout: config.api.timeout,
      },
      config.api.maxRetries,
      1000 // Initial retry delay
    );

    if (!fetchResult.success || fetchResult.recordCount === 0) {
      throw new Error('No data fetched from API');
    }
    log('info', `✓ Fetched ${fetchResult.recordCount} records from API`);

    // Step 3: Transform data
    log('info', '\n[Step 3/5] Transforming and validating data...');
    const transformResult = transformRecords(fetchResult.records);

    if (transformResult.errorCount > 0) {
      log('warn', `⚠ ${transformResult.errorCount} records failed validation and were skipped`);
    }

    if (transformResult.transformedCount === 0) {
      throw new Error('No valid records after transformation');
    }

    log('info', `✓ Transformed ${transformResult.transformedCount} valid records`);

    // Log summary statistics
    const stats = getSummaryStats(transformResult.records);
    log('info', `  - Unique districts: ${stats.uniqueDistricts}`);
    log('info', `  - Total records: ${stats.totalRecords}`);

    // Step 4: Ensure districts exist
    log('info', '\n[Step 4/5] Ensuring districts exist in database...');
    const districtResult = await ensureDistricts(pool, transformResult.records);
    log('info', `✓ Ensured ${districtResult.totalDistricts} districts exist (${districtResult.addedCount} new)`);

    // Step 5: Load data into database
    log('info', '\n[Step 5/5] Loading data into database...');
    const loadResult = await loadRecords(pool, transformResult.records);

    if (loadResult.errorCount > 0) {
      log('warn', `⚠ ${loadResult.errorCount} records failed to load`);
    }

    log('info', `✓ Loaded ${loadResult.insertedCount + loadResult.updatedCount} records`);
    log('info', `  - Inserted: ${loadResult.insertedCount}`);
    log('info', `  - Updated: ${loadResult.updatedCount}`);

    // Get final database statistics
    const dbStats = await getDatabaseStats(pool);
    if (dbStats) {
      log('info', '\nDatabase Statistics:');
      log('info', `  - Total records: ${dbStats.totalRecords}`);
      log('info', `  - Total districts: ${dbStats.totalDistricts}`);
      log('info', `  - Last update: ${dbStats.lastUpdate}`);
    }

    // Calculate execution time
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log('info', '\n' + '='.repeat(80));
    log('info', '✓ ETL Process Completed Successfully');
    log('info', `Execution time: ${duration} seconds`);
    log('info', '='.repeat(80));

    // Exit with success code
    await cleanup();
    process.exit(0);

  } catch (error) {
    // Log error details
    log('error', '\n' + '='.repeat(80));
    log('error', '✗ ETL Process Failed');
    log('error', `Error: ${error.message}`);
    if (error.stack) {
      log('error', `Stack trace:\n${error.stack}`);
    }
    log('error', '='.repeat(80));

    // Exit with error code
    await cleanup();
    process.exit(1);
  }
}

/**
 * Validate configuration
 */
function validateConfiguration() {
  const errors = [];

  // Validate API configuration
  if (!config.api.endpoint) {
    errors.push('GOV_API_ENDPOINT environment variable is required');
  }
  if (!config.api.apiKey) {
    errors.push('GOV_API_KEY environment variable is required');
  }

  // Validate database configuration
  if (!config.database.user) {
    errors.push('DB_USER environment variable is required');
  }
  if (!config.database.password) {
    errors.push('DB_PASSWORD environment variable is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  log('info', '✓ Configuration validated');
}

/**
 * Cleanup resources
 */
async function cleanup() {
  if (pool) {
    try {
      await closePool(pool);
    } catch (error) {
      log('error', `Error during cleanup: ${error.message}`);
    }
  }
}

/**
 * Log message with timestamp
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Message to log
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  // Console output
  if (level === 'error') {
    console.error(`${prefix} ${message}`);
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Handle uncaught errors
 */
process.on('uncaughtException', async (error) => {
  log('error', `Uncaught exception: ${error.message}`);
  log('error', error.stack);
  await cleanup();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  log('error', `Unhandled rejection at: ${promise}, reason: ${reason}`);
  await cleanup();
  process.exit(1);
});

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', async () => {
  log('info', '\nReceived SIGINT, shutting down gracefully...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('info', '\nReceived SIGTERM, shutting down gracefully...');
  await cleanup();
  process.exit(0);
});

// Run the ETL process
if (require.main === module) {
  const cron = require('node-cron');
  
  // Check if running in cron mode (default for production)
  const CRON_MODE = process.env.CRON_MODE !== 'false';
  
  if (CRON_MODE) {
    console.log('⏰ ETL Service starting in CRON mode...');
    console.log('📅 Schedule: Every 12 hours (2:00 AM and 2:00 PM)');
    
    // Schedule ETL to run every 12 hours (2 AM and 2 PM)
    cron.schedule('0 2,14 * * *', async () => {
      console.log('\n' + '='.repeat(80));
      console.log('🔄 [CRON] Starting scheduled ETL refresh...');
      console.log(`📅 Triggered at: ${new Date().toISOString()}`);
      console.log('='.repeat(80) + '\n');
      
      try {
        await main();
        console.log('\n✅ [CRON] Scheduled ETL refresh completed successfully\n');
      } catch (error) {
        console.error('\n❌ [CRON] Scheduled ETL refresh failed:', error.message);
        console.error('Stack trace:', error.stack);
        console.error('⚠️  Will retry on next scheduled run\n');
      }
    });
    
    // Run ETL once immediately on startup
    console.log('🚀 Running initial ETL load on startup...');
    main().then(() => {
      console.log('\n✅ Initial ETL load completed');
      console.log('⏰ Service will now wait for scheduled runs at 2:00 AM and 2:00 PM');
      console.log('📊 Next run: Check cron schedule above\n');
    }).catch((error) => {
      console.error('\n❌ Initial ETL load failed:', error.message);
      console.error('⚠️  Service will continue and retry on next scheduled run\n');
    });
    
    // Keep process running for cron jobs
    console.log('🔄 ETL Service is running in background...');
    console.log('💡 Press Ctrl+C to stop\n');
  } else {
    // One-time execution mode
    console.log('🚀 ETL Service running in ONE-TIME mode...');
    main();
  }
}

module.exports = { main };
