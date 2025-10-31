/**
 * Health Check API Route Handler
 * Endpoint: GET /api/health
 * Returns system health status and database connectivity
 */

const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * GET /api/health
 * Returns system health status
 * 
 * Response format:
 * {
 *   "status": "healthy",
 *   "timestamp": "2024-10-23T10:30:00Z",
 *   "database": "connected",
 *   "lastEtlRun": "2024-10-23T02:15:00Z",
 *   "uptime": 3600
 * }
 */
router.get('/', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
  
  try {
    // Test database connectivity
    const dbTest = await db.query('SELECT NOW() as current_time');
    healthCheck.database = 'connected';
    healthCheck.databaseTime = dbTest.rows[0].current_time;
    
    // Get last ETL run time from the most recent record
    const lastEtlQuery = `
      SELECT MAX(last_updated) as last_etl_run
      FROM monthly_performance
    `;
    
    const etlResult = await db.query(lastEtlQuery);
    
    if (etlResult.rows[0].last_etl_run) {
      healthCheck.lastEtlRun = etlResult.rows[0].last_etl_run;
      
      // Calculate time since last ETL run
      const lastRun = new Date(etlResult.rows[0].last_etl_run);
      const now = new Date();
      const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);
      
      healthCheck.hoursSinceLastEtl = Math.round(hoursSinceLastRun * 10) / 10;
      
      // Warn if data is stale (more than 48 hours old)
      if (hoursSinceLastRun > 48) {
        healthCheck.status = 'degraded';
        healthCheck.warning = 'ETL data is stale (last run > 48 hours ago)';
      }
    } else {
      healthCheck.lastEtlRun = null;
      healthCheck.status = 'degraded';
      healthCheck.warning = 'No ETL data found in database';
    }
    
    // Get database pool statistics
    const poolStats = db.getPoolStats();
    healthCheck.database_pool = {
      total: poolStats.totalCount,
      idle: poolStats.idleCount,
      waiting: poolStats.waitingCount,
    };
    
    // Return appropriate status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    // Database connection failed
    healthCheck.status = 'unhealthy';
    healthCheck.database = 'disconnected';
    healthCheck.error = error.message;
    
    res.status(503).json(healthCheck);
  }
});

module.exports = router;
