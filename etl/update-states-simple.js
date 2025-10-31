#!/usr/bin/env node

/**
 * Simple Update District States Script
 * Updates existing districts in the database with correct state names
 */

const { Pool } = require('pg');
const { getStateForDistrict, getMappingStats } = require('./district-state-mapping');

// Database configuration from environment
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'mgnrega',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

async function updateDistrictStates() {
  const client = await pool.connect();
  
  try {
    console.log('================================================================================');
    console.log('Updating District States');
    console.log('================================================================================');
    
    // Show mapping stats
    const stats = getMappingStats();
    console.log(`\nMapping Statistics:`);
    console.log(`  - Total mappings: ${stats.totalMappings}`);
    console.log(`  - Unique states: ${stats.uniqueStates}`);
    
    // Get all districts from database
    console.log('\nFetching districts from database...');
    const result = await client.query('SELECT id, name, state FROM districts ORDER BY name');
    console.log(`Found ${result.rows.length} districts`);
    
    // Count how many need updates
    const needsUpdate = result.rows.filter(r => r.state === 'Unknown' || r.state === 'India').length;
    console.log(`Districts needing state update: ${needsUpdate}`);
    
    if (needsUpdate === 0) {
      console.log('\n✓ All districts already have state information!');
      return;
    }
    
    // Update each district
    console.log('\nUpdating district states...');
    await client.query('BEGIN');
    
    let updatedCount = 0;
    let unchangedCount = 0;
    
    for (const district of result.rows) {
      const newState = getStateForDistrict(district.name);
      
      // Only update if state changed and is not 'India'
      if (newState !== district.state && newState !== 'India') {
        await client.query(
          'UPDATE districts SET state = $1 WHERE id = $2',
          [newState, district.id]
        );
        updatedCount++;
        
        if (updatedCount <= 10) {
          console.log(`  ✓ Updated: ${district.name} -> ${newState}`);
        }
      } else {
        unchangedCount++;
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n================================================================================');
    console.log('Update Complete');
    console.log(`  - Updated: ${updatedCount} districts`);
    console.log(`  - Unchanged: ${unchangedCount} districts`);
    console.log('================================================================================');
    
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {}
    console.error('\n❌ Error updating districts:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateDistrictStates().then(() => {
  console.log('\n✓ Done');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Failed:', error.message);
  process.exit(1);
});
