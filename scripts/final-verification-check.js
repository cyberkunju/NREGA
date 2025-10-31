/**
 * Final Verification Check
 * Double-checks all critical aspects of the system
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
  log('\n' + '='.repeat(100), 'bright');
  log('FINAL VERIFICATION CHECK', 'bright');
  log('Double-checking all critical aspects', 'cyan');
  log('='.repeat(100), 'bright');

  let allGood = true;

  // 1. Check Unicode Normalization Fix
  log('\n1. Verifying Unicode Normalization Fix...', 'yellow');
  const districtMappingPath = path.join(__dirname, '../frontend/src/utils/districtNameMapping.js');
  const districtMappingCode = fs.readFileSync(districtMappingPath, 'utf8');
  
  if (districtMappingCode.includes('.normalize(\'NFC\')')) {
    log('   ✅ Unicode normalization is present', 'green');
  } else {
    log('   ❌ Unicode normalization is MISSING!', 'red');
    allGood = false;
  }

  // 2. Check & Symbol Handling
  log('\n2. Verifying & Symbol Handling...', 'yellow');
  if (districtMappingCode.includes('.replace(/\\s*&\\s*/g, \' and \')')) {
    log('   ✅ & symbol conversion is present', 'green');
  } else {
    log('   ❌ & symbol conversion is MISSING!', 'red');
    allGood = false;
  }

  // 3. Check GeoJSON exists and is valid
  log('\n3. Verifying GeoJSON File...', 'yellow');
  const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
  
  if (!fs.existsSync(geojsonPath)) {
    log('   ❌ GeoJSON file NOT FOUND!', 'red');
    allGood = false;
  } else {
    const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
    log(`   ✅ GeoJSON loaded: ${geojson.features.length} features`, 'green');
    
    // Check for District property
    const sampleFeature = geojson.features[0];
    if (sampleFeature.properties?.District) {
      log('   ✅ Features have "District" property', 'green');
    } else {
      log('   ❌ Features missing "District" property!', 'red');
      allGood = false;
    }
  }

  // 4. Check Mapping File
  log('\n4. Verifying Mapping File...', 'yellow');
  const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
  
  if (!fs.existsSync(mappingPath)) {
    log('   ❌ Mapping file NOT FOUND!', 'red');
    allGood = false;
  } else {
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    const mappingCount = Object.keys(mapping.mappings || mapping).length;
    log(`   ✅ Mapping file loaded: ${mappingCount} entries`, 'green');
  }

  // 5. Check MapView.jsx
  log('\n5. Verifying MapView.jsx...', 'yellow');
  const mapViewPath = path.join(__dirname, '../frontend/src/components/IndiaDistrictMap/MapView.jsx');
  const mapViewCode = fs.readFileSync(mapViewPath, 'utf8');
  
  if (mapViewCode.includes('props.District') || mapViewCode.includes('properties.District')) {
    log('   ✅ MapView uses "District" property', 'green');
  } else {
    log('   ⚠️  MapView property usage unclear', 'yellow');
  }

  // 6. Check for known problematic districts
  log('\n6. Checking Known Problematic Districts...', 'yellow');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  
  const problematicDistricts = [
    'NORTH & MIDDLE ANDAMAN',
    'LAHUL & SPITI',
    'DADRA & NAGAR HAVELI',
    'DAMAN & DIU'
  ];
  
  const foundProblematic = [];
  geojson.features.forEach(f => {
    const district = f.properties?.District;
    if (district && problematicDistricts.some(p => district.includes('&'))) {
      foundProblematic.push(district);
    }
  });
  
  if (foundProblematic.length > 0) {
    log(`   ✅ Found ${foundProblematic.length} districts with & symbols`, 'green');
    log(`      These will be handled by normalization: ${foundProblematic.slice(0, 3).join(', ')}`, 'blue');
  }

  // 7. Check Database Configuration
  log('\n7. Verifying Database Configuration...', 'yellow');
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  
  if (fs.existsSync(backendEnvPath)) {
    const envContent = fs.readFileSync(backendEnvPath, 'utf8');
    const hasDbConfig = envContent.includes('DB_HOST') && 
                       envContent.includes('DB_NAME') && 
                       envContent.includes('DB_USER');
    
    if (hasDbConfig) {
      log('   ✅ Database configuration present', 'green');
    } else {
      log('   ⚠️  Database configuration incomplete', 'yellow');
    }
  } else {
    log('   ⚠️  Backend .env file not found', 'yellow');
  }

  // 8. Check ETL Configuration
  log('\n8. Verifying ETL Configuration...', 'yellow');
  const etlEnvPath = path.join(__dirname, '../etl/.env');
  
  if (fs.existsSync(etlEnvPath)) {
    log('   ✅ ETL .env file exists', 'green');
  } else {
    log('   ⚠️  ETL .env file not found', 'yellow');
  }

  // 9. Verify Docker Compose
  log('\n9. Verifying Docker Compose...', 'yellow');
  const dockerComposePath = path.join(__dirname, '../docker-compose.yml');
  
  if (fs.existsSync(dockerComposePath)) {
    const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');
    const hasAllServices = dockerComposeContent.includes('mgnrega-db') &&
                          dockerComposeContent.includes('mgnrega-api') &&
                          dockerComposeContent.includes('mgnrega-frontend') &&
                          dockerComposeContent.includes('mgnrega-etl');
    
    if (hasAllServices) {
      log('   ✅ All services defined in docker-compose.yml', 'green');
    } else {
      log('   ❌ Some services missing in docker-compose.yml', 'red');
      allGood = false;
    }
  } else {
    log('   ❌ docker-compose.yml NOT FOUND!', 'red');
    allGood = false;
  }

  // 10. Check for Critical Files
  log('\n10. Verifying Critical Files...', 'yellow');
  const criticalFiles = [
    '../frontend/src/services/api.js',
    '../backend/server.js',
    '../etl/index.js',
    '../backend/db/init.sql'
  ];
  
  let missingFiles = [];
  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length === 0) {
    log('   ✅ All critical files present', 'green');
  } else {
    log(`   ❌ Missing files: ${missingFiles.join(', ')}`, 'red');
    allGood = false;
  }

  // 11. Data Quality Check
  log('\n11. Data Quality Check...', 'yellow');
  const geojsonDistricts = geojson.features
    .map(f => f.properties?.District)
    .filter(Boolean);
  const uniqueDistricts = [...new Set(geojsonDistricts)];
  
  log(`   Total features: ${geojson.features.length}`, 'blue');
  log(`   Unique districts: ${uniqueDistricts.length}`, 'blue');
  
  // Check for duplicates
  const duplicates = geojsonDistricts.filter((item, index) => 
    geojsonDistricts.indexOf(item) !== index
  );
  const uniqueDuplicates = [...new Set(duplicates)];
  
  if (uniqueDuplicates.length > 0) {
    log(`   ⚠️  ${uniqueDuplicates.length} duplicate district names found`, 'yellow');
    log(`      (This is OK if they're in different states: ${uniqueDuplicates.slice(0, 3).join(', ')})`, 'blue');
  } else {
    log('   ✅ No duplicate district names', 'green');
  }

  // 12. Check for Disputed Districts
  const disputedDistricts = uniqueDistricts.filter(d => d.includes('DISPUTED'));
  if (disputedDistricts.length > 0) {
    log(`   ⚠️  ${disputedDistricts.length} disputed districts found`, 'yellow');
    log(`      These may not have API data`, 'blue');
  }

  // Final Summary
  log('\n' + '='.repeat(100), 'bright');
  log('VERIFICATION SUMMARY', 'bright');
  log('='.repeat(100), 'bright');
  
  if (allGood) {
    log('\n✅ ALL CRITICAL CHECKS PASSED!', 'green');
    log('   System is ready for production', 'green');
  } else {
    log('\n❌ SOME CRITICAL CHECKS FAILED!', 'red');
    log('   Please review the issues above', 'red');
  }
  
  log('\n' + '='.repeat(100), 'bright');
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    allChecksPass: allGood,
    checks: {
      unicodeNormalization: districtMappingCode.includes('.normalize(\'NFC\')'),
      ampersandHandling: districtMappingCode.includes('.replace(/\\s*&\\s*/g, \' and \')'),
      geojsonExists: fs.existsSync(geojsonPath),
      mappingExists: fs.existsSync(mappingPath),
      dockerComposeExists: fs.existsSync(dockerComposePath),
      criticalFilesPresent: missingFiles.length === 0
    },
    stats: {
      totalFeatures: geojson.features.length,
      uniqueDistricts: uniqueDistricts.length,
      duplicateDistricts: uniqueDuplicates.length,
      disputedDistricts: disputedDistricts.length
    }
  };
  
  const reportPath = path.join(__dirname, 'final-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
}

main().catch(console.error);
