#!/usr/bin/env node

/**
 * Cleanup Districts Script
 * Removes duplicate districts and normalizes state names to Title Case
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'mgnrega',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

/**
 * Convert string to Title Case
 */
function toTitleCase(str) {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

async function cleanupDistricts() {
  const client = await pool.connect();
  
  try {
    console.log('================================================================================');
    console.log('Cleaning Up Duplicate Districts and Normalizing State Names');
    console.log('================================================================================\n');
    
    await client.query('BEGIN');
    
    // Step 1: Get all unique district-state combinations (normalized)
    console.log('Step 1: Analyzing districts...');
    const result = await client.query(`
      SELECT 
        name,
        state,
        id,
        ROW_NUMBER() OVER (
          PARTITION BY LOWER(name), LOWER(state) 
          ORDER BY 
            CASE 
              WHEN state NOT IN ('Unknown', 'India') THEN 1
              ELSE 2
            END,
            id
        ) as rn
      FROM districts
      ORDER BY name, state
    `);
    
    console.log(`Found ${result.rows.length} total district records`);
    
    // Step 2: Delete duplicates (keep the first one with best state name)
    console.log('\nStep 2: Removing duplicates...');
    const duplicates = result.rows.filter(r => r.rn > 1);
    console.log(`Found ${duplicates.length} duplicate records to remove`);
    
    for (const dup of duplicates) {
      await client.query('DELETE FROM districts WHERE id = $1', [dup.id]);
    }
    
    console.log(`✓ Removed ${duplicates.length} duplicate districts`);
    
    // Step 3: Normalize all state names to Title Case
    console.log('\nStep 3: Normalizing state names to Title Case...');
    const districts = await client.query('SELECT id, name, state FROM districts');
    
    let normalizedCount = 0;
    for (const district of districts.rows) {
      const normalizedState = toTitleCase(district.state);
      if (normalizedState !== district.state) {
        await client.query(
          'UPDATE districts SET state = $1 WHERE id = $2',
          [normalizedState, district.id]
        );
        normalizedCount++;
      }
    }
    
    console.log(`✓ Normalized ${normalizedCount} state names`);
    
    await client.query('COMMIT');
    
    // Step 4: Show final statistics
    console.log('\n================================================================================');
    const stats = await client.query(`
      SELECT 
        COUNT(DISTINCT name) as unique_districts,
        COUNT(*) as total_records,
        COUNT(DISTINCT state) as unique_states
      FROM districts
      WHERE state NOT IN ('Unknown', 'India')
    `);
    
    console.log('Final Statistics:');
    console.log(`  - Unique districts: ${stats.rows[0].unique_districts}`);
    console.log(`  - Total records: ${stats.rows[0].total_records}`);
    console.log(`  - Unique states: ${stats.rows[0].unique_states}`);
    
    // Show top states
    const topStates = await client.query(`
      SELECT state, COUNT(*) as count 
      FROM districts 
      WHERE state NOT IN ('Unknown', 'India')
      GROUP BY state 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log('\nTop 10 States:');
    topStates.rows.forEach(row => {
      console.log(`  - ${row.state}: ${row.count} districts`);
    });
    
    console.log('================================================================================');
    console.log('✓ Cleanup Complete!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupDistricts().then(() => {
  console.log('\n✓ Done\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Failed:', error.message);
  process.exit(1);
});
