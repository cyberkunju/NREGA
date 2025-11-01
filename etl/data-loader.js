/**
 * Data Loader Module
 * Handles database operations for loading transformed data
 */

const { Pool } = require('pg');

/**
 * Create database connection pool for ETL operations
 * @param {Object} config - Database configuration
 * @returns {Pool} PostgreSQL connection pool
 */
function createPool(config) {
  const pool = new Pool({
    host: config.host || 'localhost',
    port: config.port || 5432,
    database: config.database || 'mgnrega',
    user: config.user,
    password: config.password,
    max: config.max || 5,
    idleTimeoutMillis: config.idleTimeoutMillis || 30000,
    connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
  });

  // Error handling
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client:', err);
  });

  return pool;
}

/**
 * Load transformed records into database using UPSERT
 * @param {Pool} pool - Database connection pool
 * @param {Array} records - Transformed records to load
 * @returns {Promise<Object>} Load result with statistics
 */
async function loadRecords(pool, records) {
  if (!records || records.length === 0) {
    console.log('No records to load');
    return {
      success: true,
      insertedCount: 0,
      updatedCount: 0,
      errorCount: 0,
      errors: [],
    };
  }

  console.log(`Loading ${records.length} records into database...`);

  const client = await pool.connect();
  let insertedCount = 0;
  let updatedCount = 0;
  const errors = [];

  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Process records in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (const record of batch) {
        try {
          // Use savepoint for each record to allow continuing after errors
          await client.query('SAVEPOINT sp1');
          const result = await upsertRecord(client, record);
          await client.query('RELEASE SAVEPOINT sp1');
          
          if (result.inserted) {
            insertedCount++;
          } else {
            updatedCount++;
          }
        } catch (error) {
          // Rollback to savepoint on error, but continue with other records
          try {
            await client.query('ROLLBACK TO SAVEPOINT sp1');
          } catch (rollbackError) {
            // Ignore rollback errors
          }
          errors.push({
            record: record,
            error: error.message,
          });
          // Only log first few errors to avoid spam
          if (errors.length <= 10) {
            console.error(`Failed to load record for ${record.district_name}:`, error.message);
          }
        }
      }

      // Log progress
      const processed = Math.min(i + batchSize, records.length);
      console.log(`Processed ${processed}/${records.length} records`);
    }

    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`Successfully loaded ${insertedCount + updatedCount} records (${insertedCount} inserted, ${updatedCount} updated)`);
    if (errors.length > 0) {
      console.log(`Failed to load ${errors.length} records`);
    }

    return {
      success: true,
      insertedCount: insertedCount,
      updatedCount: updatedCount,
      errorCount: errors.length,
      errors: errors,
    };

  } catch (error) {
    // Rollback transaction on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      // Ignore rollback errors
    }
    console.error('Load failed:', error.message);
    throw error;
  } finally {
    // Release client back to pool
    client.release();
  }
}

/**
 * UPSERT a single record into monthly_performance table
 * @param {Object} client - Database client
 * @param {Object} record - Record to insert/update
 * @returns {Promise<Object>} Result indicating if record was inserted or updated
 */
async function upsertRecord(client, record) {
  const query = `
    INSERT INTO monthly_performance (
      district_name,
      month,
      fin_year,
      total_households_worked,
      avg_days_employment_per_hh,
      payment_percentage_15_days,
      women_persondays,
      persondays_of_central_liability,
      sc_persondays,
      st_persondays,
      last_updated
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    ON CONFLICT (district_name, month, fin_year)
    DO UPDATE SET
      total_households_worked = EXCLUDED.total_households_worked,
      avg_days_employment_per_hh = EXCLUDED.avg_days_employment_per_hh,
      payment_percentage_15_days = EXCLUDED.payment_percentage_15_days,
      women_persondays = EXCLUDED.women_persondays,
      persondays_of_central_liability = EXCLUDED.persondays_of_central_liability,
      sc_persondays = EXCLUDED.sc_persondays,
      st_persondays = EXCLUDED.st_persondays,
      last_updated = NOW()
    RETURNING (xmax = 0) AS inserted
  `;

  const values = [
    record.district_name,
    record.month,
    record.fin_year,
    record.total_households_worked,
    record.avg_days_employment_per_hh,
    record.payment_percentage_15_days,
    record.women_persondays,
    record.persondays_of_central_liability,
    record.sc_persondays,
    record.st_persondays,
  ];

  const result = await client.query(query, values);
  
  return {
    inserted: result.rows[0].inserted,
  };
}

/**
 * Ensure districts table is populated with unique districts
 * @param {Pool} pool - Database connection pool
 * @param {Array} records - Records containing district names
 * @returns {Promise<Object>} Result with count of districts added
 */
async function ensureDistricts(pool, records) {
  if (!records || records.length === 0) {
    return { success: true, addedCount: 0 };
  }

  // Create a set of unique district-state pairs
  const uniqueDistrictStatePairs = [
    ...new Map(
      records.map(r => ({ name: r.district_name, state: r.state_name || 'India' }))
      .map(item => [`${item.name}-${item.state}`, item])
    ).values()
  ];

  console.log(`Ensuring ${uniqueDistrictStatePairs.length} districts exist in database...`);

  const client = await pool.connect();
  let addedCount = 0;

  try {
    await client.query('BEGIN');

    for (const district of uniqueDistrictStatePairs) {
      const query = `
        INSERT INTO districts (name, state)
        VALUES ($1, $2)
        ON CONFLICT (name, state) DO NOTHING
        RETURNING id
      `;
      
      const result = await client.query(query, [district.name, district.state]);
      
      if (result.rowCount > 0) {
        addedCount++;
      }
    }

    await client.query('COMMIT');
    console.log(`Added ${addedCount} new districts to database`);

    return {
      success: true,
      addedCount: addedCount,
      totalDistricts: uniqueDistrictStatePairs.length,
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to ensure districts:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 * @param {Pool} pool - Database connection pool
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection(pool) {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
}

/**
 * Get the last ETL run timestamp
 * @param {Pool} pool - Database connection pool
 * @returns {Promise<Date|null>} Last update timestamp or null
 */
async function getLastETLRun(pool) {
  try {
    const query = `
      SELECT MAX(last_updated) as last_run
      FROM monthly_performance
    `;
    
    const result = await pool.query(query);
    return result.rows[0].last_run;
  } catch (error) {
    console.error('Failed to get last ETL run:', error.message);
    return null;
  }
}

/**
 * Get database statistics
 * @param {Pool} pool - Database connection pool
 * @returns {Promise<Object>} Database statistics
 */
async function getDatabaseStats(pool) {
  try {
    const queries = {
      totalRecords: 'SELECT COUNT(*) as count FROM monthly_performance',
      totalDistricts: 'SELECT COUNT(*) as count FROM districts',
      lastUpdate: 'SELECT MAX(last_updated) as last_update FROM monthly_performance',
    };

    const results = await Promise.all([
      pool.query(queries.totalRecords),
      pool.query(queries.totalDistricts),
      pool.query(queries.lastUpdate),
    ]);

    return {
      totalRecords: parseInt(results[0].rows[0].count),
      totalDistricts: parseInt(results[1].rows[0].count),
      lastUpdate: results[2].rows[0].last_update,
    };
  } catch (error) {
    console.error('Failed to get database stats:', error.message);
    return null;
  }
}

/**
 * Close database connection pool
 * @param {Pool} pool - Database connection pool
 * @returns {Promise<void>}
 */
async function closePool(pool) {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
    throw error;
  }
}

module.exports = {
  createPool,
  loadRecords,
  upsertRecord,
  ensureDistricts,
  testConnection,
  getLastETLRun,
  getDatabaseStats,
  closePool,
};
