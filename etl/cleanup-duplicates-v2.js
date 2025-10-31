/**
 * Cleanup Script v2: Remove duplicate and incorrect district-state mappings
 * 
 * Strategy:
 * 1. Find all districts with multiple state entries
 * 2. For each duplicate, keep only the most frequent/recent correct mapping
 * 3. Delete obvious wrong mappings (e.g., districts from West Bengal mapped to Sikkim)
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'mgnrega',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

async function cleanupDuplicates() {
  try {
    console.log('🔍 Finding duplicate district-state mappings...');

    // Find districts with multiple states
    const duplicates = await pool.query(`
      SELECT 
        name as district_name,
        COUNT(DISTINCT state) as state_count,
        array_agg(DISTINCT state ORDER BY state) as states
      FROM districts
      GROUP BY name
      HAVING COUNT(DISTINCT state) > 1
      ORDER BY state_count DESC, name;
    `);

    console.log(`Found ${duplicates.rows.length} districts with multiple state mappings`);
    
    if (duplicates.rows.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    // Print first 20 examples
    console.log('\nSample duplicates:');
    duplicates.rows.slice(0, 20).forEach(row => {
      console.log(`  - ${row.district_name}: ${row.states.join(', ')}`);
    });

    // Known wrong mappings to delete
    const wrongMappings = [
      // West Bengal districts mapped to Sikkim
      { district: '24 Parganas (north)', wrong_state: 'Sikkim', correct_state: 'West Bengal' },
      { district: '24 Parganas South', wrong_state: 'Sikkim', correct_state: 'West Bengal' },
      
      // Andhra Pradesh districts mapped to Sikkim
      { district: 'East Godavari', wrong_state: 'Sikkim', correct_state: 'Andhra Pradesh' },
      
      // Jharkhand districts mapped to Sikkim  
      { district: 'East Singhbum', wrong_state: 'Sikkim', correct_state: 'Jharkhand' },
      
      // Meghalaya districts mapped to Sikkim
      { district: 'Eastern West Khasi Hills', wrong_state: 'Sikkim', correct_state: 'Meghalaya' },
      
      // Assam districts mapped to Sikkim
      { district: 'South Salmara-mankachar', wrong_state: 'Sikkim', correct_state: 'Assam' },
      
      // Districts mapped to 'Unknown' or 'India'
      // We'll delete all 'Unknown' and 'India' states if a better mapping exists
    ];

    console.log('\n🗑️  Deleting known wrong mappings...');
    
    for (const mapping of wrongMappings) {
      const result = await pool.query(`
        DELETE FROM districts 
        WHERE name = $1 AND state = $2
      `, [mapping.district, mapping.wrong_state]);
      
      if (result.rowCount > 0) {
        console.log(`  ✓ Deleted ${result.rowCount} wrong entries for ${mapping.district} (${mapping.wrong_state})`);
      }
    }

    // Delete all districts with state='Unknown' or 'India' if a better mapping exists
    console.log('\n🗑️  Deleting districts with Unknown/India states where better mapping exists...');
    
    const cleanupBadStates = await pool.query(`
      DELETE FROM districts d1
      WHERE d1.state IN ('Unknown', 'India')
      AND EXISTS (
        SELECT 1 FROM districts d2
        WHERE d2.name = d1.name 
        AND d2.state NOT IN ('Unknown', 'India')
      )
    `);
    
    console.log(`  ✓ Deleted ${cleanupBadStates.rowCount} entries with Unknown/India states`);

    // For remaining duplicates, keep only the most common state
    console.log('\n🗑️  Resolving remaining duplicates by keeping most frequent state...');
    
    await pool.query(`
      WITH duplicate_districts AS (
        SELECT name
        FROM districts
        GROUP BY name
        HAVING COUNT(DISTINCT state) > 1
      ),
      most_frequent_state AS (
        SELECT 
          d.name,
          d.state,
          COUNT(*) as occurrence_count,
          ROW_NUMBER() OVER (PARTITION BY d.name ORDER BY COUNT(*) DESC, d.state) as rn
        FROM districts d
        INNER JOIN duplicate_districts dd ON d.name = dd.name
        WHERE d.state NOT IN ('Unknown', 'India')
        GROUP BY d.name, d.state
      )
      DELETE FROM districts d
      WHERE EXISTS (
        SELECT 1
        FROM most_frequent_state mfs
        WHERE mfs.name = d.name
        AND mfs.rn = 1
        AND d.state != mfs.state
      );
    `);

    // Check final count
    const finalCount = await pool.query('SELECT COUNT(*) as total, COUNT(DISTINCT name) as unique_districts FROM districts');
    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Total records: ${finalCount.rows[0].total}`);
    console.log(`   Unique districts: ${finalCount.rows[0].unique_districts}`);

    // Verify no duplicates remain
    const remainingDuplicates = await pool.query(`
      SELECT name, COUNT(DISTINCT state) as state_count
      FROM districts
      GROUP BY name
      HAVING COUNT(DISTINCT state) > 1
    `);

    if (remainingDuplicates.rows.length === 0) {
      console.log('   ✅ No duplicate district-state mappings remain!');
    } else {
      console.log(`   ⚠️  ${remainingDuplicates.rows.length} districts still have multiple states`);
      remainingDuplicates.rows.slice(0, 10).forEach(row => {
        console.log(`      - ${row.name}: ${row.state_count} states`);
      });
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run cleanup
cleanupDuplicates()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
