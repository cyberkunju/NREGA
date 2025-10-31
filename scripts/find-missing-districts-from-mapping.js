/**
 * Find which districts are missing from the mapping file
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n=== FINDING MISSING DISTRICTS FROM MAPPING ===\n', 'bright');

  // Load GeoJSON
  const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  
  // Load mapping file
  const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  
  // Get all GeoJSON districts
  const geojsonDistricts = geojson.features
    .map(f => ({
      district: f.properties?.District,
      state: f.properties?.STATE,
      fullName: f.properties?.FULL_NAME
    }))
    .filter(d => d.district);
  
  // Get unique GeoJSON districts
  const uniqueGeoDistricts = [...new Set(geojsonDistricts.map(d => d.district))];
  
  // Get mapping keys (these are the GeoJSON district names that have mappings)
  const mappingKeys = Object.keys(mapping.mappings || mapping);
  const mappedGeoDistricts = new Set(mappingKeys);
  
  log(`Total GeoJSON features: ${geojson.features.length}`, 'blue');
  log(`Unique GeoJSON districts: ${uniqueGeoDistricts.length}`, 'blue');
  log(`Mapping entries: ${mappingKeys.length}`, 'blue');
  
  // Find missing districts
  const missingDistricts = [];
  
  geojsonDistricts.forEach(d => {
    if (!mappedGeoDistricts.has(d.district)) {
      missingDistricts.push(d);
    }
  });
  
  // Get unique missing districts
  const uniqueMissing = [];
  const seenDistricts = new Set();
  
  missingDistricts.forEach(d => {
    if (!seenDistricts.has(d.district)) {
      seenDistricts.add(d.district);
      uniqueMissing.push(d);
    }
  });
  
  log(`\nMissing from mapping: ${uniqueMissing.length} districts\n`, 'red');
  
  if (uniqueMissing.length > 0) {
    log('MISSING DISTRICTS:', 'red');
    log('='.repeat(80), 'red');
    
    // Group by state
    const byState = {};
    uniqueMissing.forEach(d => {
      const state = d.state || 'Unknown';
      if (!byState[state]) {
        byState[state] = [];
      }
      byState[state].push(d);
    });
    
    // Sort states
    const sortedStates = Object.keys(byState).sort();
    
    sortedStates.forEach(state => {
      log(`\n${state}:`, 'yellow');
      byState[state].forEach(d => {
        log(`  - ${d.district}`, 'red');
        if (d.fullName) {
          log(`    Full: ${d.fullName}`, 'blue');
        }
      });
    });
    
    // Check if these are disputed or special districts
    log('\n\nANALYSIS:', 'cyan');
    log('='.repeat(80), 'cyan');
    
    const disputed = uniqueMissing.filter(d => d.district && d.district.includes('DISPUTED'));
    const withAmpersand = uniqueMissing.filter(d => d.district && d.district.includes('&'));
    const multipleSpaces = uniqueMissing.filter(d => d.district && /\s{2,}/.test(d.district));
    
    if (disputed.length > 0) {
      log(`\n${disputed.length} Disputed districts (may not have API data):`, 'yellow');
      disputed.forEach(d => log(`  - ${d.district}`, 'yellow'));
    }
    
    if (withAmpersand.length > 0) {
      log(`\n${withAmpersand.length} Districts with & symbol:`, 'yellow');
      withAmpersand.forEach(d => log(`  - ${d.district}`, 'yellow'));
    }
    
    if (multipleSpaces.length > 0) {
      log(`\n${multipleSpaces.length} Districts with multiple spaces:`, 'yellow');
      multipleSpaces.forEach(d => log(`  - ${d.district}`, 'yellow'));
    }
    
    // Regular districts (not disputed, no special characters)
    const regularMissing = uniqueMissing.filter(d => 
      d.district &&
      !d.district.includes('DISPUTED') && 
      !d.district.includes('&') && 
      !/\s{2,}/.test(d.district)
    );
    
    if (regularMissing.length > 0) {
      log(`\n${regularMissing.length} Regular districts missing:`, 'red');
      regularMissing.forEach(d => log(`  - ${d.district} (${d.state})`, 'red'));
    }
  } else {
    log('✅ All GeoJSON districts are in the mapping file!', 'green');
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    totalGeoJSONFeatures: geojson.features.length,
    uniqueGeoJSONDistricts: uniqueGeoDistricts.length,
    mappingEntries: mappingKeys.length,
    missingCount: uniqueMissing.length,
    missingDistricts: uniqueMissing,
    analysis: {
      disputed: disputed.length,
      withAmpersand: withAmpersand.length,
      multipleSpaces: multipleSpaces.length,
      regular: regularMissing.length
    }
  };
  
  const reportPath = path.join(__dirname, 'missing-districts-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
  log('='.repeat(80), 'bright');
}

main().catch(console.error);
