/**
 * Deep Frontend Analysis Script
 * Analyzes how the frontend actually uses data and identifies mismatches
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n=== DEEP FRONTEND ANALYSIS ===\n', 'bright');
  
  // 1. Load all data files
  const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
  const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
  const mapViewPath = path.join(__dirname, '../frontend/src/components/IndiaDistrictMap/MapView.jsx');
  const districtMappingUtilPath = path.join(__dirname, '../frontend/src/utils/districtNameMapping.js');
  
  log('Loading files...', 'cyan');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const mapViewCode = fs.readFileSync(mapViewPath, 'utf8');
  const districtMappingCode = fs.readFileSync(districtMappingUtilPath, 'utf8');
  
  // 2. Analyze GeoJSON structure
  log('\n1. GeoJSON Structure Analysis:', 'yellow');
  const features = geojson.features || [];
  log(`   Total features: ${features.length}`, 'blue');
  
  // Get all unique property keys
  const allPropertyKeys = new Set();
  features.forEach(f => {
    if (f.properties) {
      Object.keys(f.properties).forEach(key => allPropertyKeys.add(key));
    }
  });
  log(`   Unique property keys: ${[...allPropertyKeys].join(', ')}`, 'blue');
  
  // Check which property is used as district name
  const sampleFeatures = features.slice(0, 5);
  log('\n   Sample features:', 'blue');
  sampleFeatures.forEach((f, idx) => {
    log(`   Feature ${idx}:`, 'blue');
    log(`     - District: ${f.properties?.District}`, 'blue');
    log(`     - dtname: ${f.properties?.dtname}`, 'blue');
    log(`     - district: ${f.properties?.district}`, 'blue');
    log(`     - name: ${f.properties?.name}`, 'blue');
    log(`     - FULL_NAME: ${f.properties?.FULL_NAME}`, 'blue');
  });
  
  // 3. Analyze how MapView.jsx uses the data
  log('\n2. MapView.jsx Usage Analysis:', 'yellow');
  
  // Extract the property name used for district identification
  const propertyNameMatch = mapViewCode.match(/feature\.properties\?\.(\w+)/g);
  if (propertyNameMatch) {
    const uniqueProps = [...new Set(propertyNameMatch)];
    log(`   Properties accessed: ${uniqueProps.join(', ')}`, 'blue');
  }
  
  // Check for dtname usage
  if (mapViewCode.includes('dtname')) {
    log('   ✓ Uses "dtname" property', 'green');
  } else if (mapViewCode.includes('District')) {
    log('   ✓ Uses "District" property', 'green');
  } else {
    log('   ✗ Property usage unclear', 'red');
  }
  
  // 4. Analyze districtNameMapping.js
  log('\n3. District Name Mapping Utility Analysis:', 'yellow');
  
  // Check normalization function
  if (districtMappingCode.includes('normalize(')) {
    log('   ✓ Uses Unicode normalization', 'green');
  } else {
    log('   ✗ No Unicode normalization found', 'red');
  }
  
  // Check for & symbol handling
  if (districtMappingCode.includes('& ') || districtMappingCode.includes('&')) {
    if (districtMappingCode.includes('.replace') && districtMappingCode.includes('and')) {
      log('   ✓ Handles & symbol conversion to "and"', 'green');
    } else {
      log('   ⚠ Contains & but may not handle conversion', 'yellow');
    }
  }
  
  // Check for case handling
  if (districtMappingCode.includes('toLowerCase')) {
    log('   ✓ Handles case normalization', 'green');
  } else {
    log('   ✗ No case normalization found', 'red');
  }
  
  // 5. Check for features without dtname
  log('\n4. Features Missing "dtname" Property:', 'yellow');
  const featuresWithoutDtname = features.filter(f => !f.properties?.dtname);
  log(`   Count: ${featuresWithoutDtname.length}`, featuresWithoutDtname.length > 0 ? 'red' : 'green');
  
  if (featuresWithoutDtname.length > 0) {
    log('\n   Sample features without dtname:', 'red');
    featuresWithoutDtname.slice(0, 10).forEach((f, idx) => {
      log(`   ${idx + 1}. District: ${f.properties?.District}, FULL_NAME: ${f.properties?.FULL_NAME}`, 'red');
    });
    
    log('\n   ⚠ CRITICAL ISSUE: These features will not render on the map!', 'red');
    log('   Solution: Add "dtname" property or update MapView.jsx to use "District" property', 'yellow');
  }
  
  // 6. Check mapping coverage
  log('\n5. Mapping Coverage Analysis:', 'yellow');
  const geojsonDistrictNames = features
    .map(f => f.properties?.dtname || f.properties?.District)
    .filter(Boolean);
  const uniqueGeojsonNames = [...new Set(geojsonDistrictNames)];
  
  log(`   Unique district names in GeoJSON: ${uniqueGeojsonNames.length}`, 'blue');
  log(`   Entries in mapping file: ${Object.keys(mapping).length}`, 'blue');
  
  // Find unmapped districts
  const unmappedDistricts = uniqueGeojsonNames.filter(name => !mapping[name]);
  if (unmappedDistricts.length > 0) {
    log(`\n   ⚠ ${unmappedDistricts.length} districts not in mapping file:`, 'yellow');
    unmappedDistricts.slice(0, 10).forEach(name => {
      log(`     - ${name}`, 'yellow');
    });
  } else {
    log('   ✓ All GeoJSON districts are in mapping file', 'green');
  }
  
  // 7. Check for special character issues
  log('\n6. Special Character Analysis:', 'yellow');
  const specialCharIssues = [];
  
  uniqueGeojsonNames.forEach(name => {
    if (name.includes('&')) {
      specialCharIssues.push({ name, issue: 'Contains & symbol' });
    }
    if (name.match(/\s{2,}/)) {
      specialCharIssues.push({ name, issue: 'Contains multiple spaces' });
    }
    if (name.match(/^\s|\s$/)) {
      specialCharIssues.push({ name, issue: 'Has leading/trailing whitespace' });
    }
    if (name !== name.normalize('NFC')) {
      specialCharIssues.push({ name, issue: 'Not in NFC normalization form' });
    }
  });
  
  if (specialCharIssues.length > 0) {
    log(`   Found ${specialCharIssues.length} special character issues:`, 'yellow');
    specialCharIssues.slice(0, 10).forEach(({ name, issue }) => {
      log(`     - "${name}": ${issue}`, 'yellow');
    });
  } else {
    log('   ✓ No special character issues found', 'green');
  }
  
  // 8. Check for case sensitivity issues
  log('\n7. Case Sensitivity Analysis:', 'yellow');
  const lowerCaseMap = new Map();
  uniqueGeojsonNames.forEach(name => {
    const lower = name.toLowerCase();
    if (!lowerCaseMap.has(lower)) {
      lowerCaseMap.set(lower, []);
    }
    lowerCaseMap.get(lower).push(name);
  });
  
  const caseIssues = [];
  lowerCaseMap.forEach((variants, lower) => {
    if (variants.length > 1) {
      caseIssues.push({ variants, lower });
    }
  });
  
  if (caseIssues.length > 0) {
    log(`   Found ${caseIssues.length} case sensitivity issues:`, 'yellow');
    caseIssues.slice(0, 5).forEach(({ variants }) => {
      log(`     - Variants: ${variants.join(', ')}`, 'yellow');
    });
  } else {
    log('   ✓ No case sensitivity issues found', 'green');
  }
  
  // 9. Summary and recommendations
  log('\n' + '='.repeat(80), 'bright');
  log('SUMMARY & RECOMMENDATIONS', 'bright');
  log('='.repeat(80), 'bright');
  
  const issues = [];
  const warnings = [];
  
  if (featuresWithoutDtname.length > 0) {
    issues.push(`${featuresWithoutDtname.length} features missing "dtname" property - these will not render`);
  }
  
  if (unmappedDistricts.length > 0) {
    warnings.push(`${unmappedDistricts.length} districts not in mapping file`);
  }
  
  if (specialCharIssues.length > 0) {
    warnings.push(`${specialCharIssues.length} districts with special character issues`);
  }
  
  if (caseIssues.length > 0) {
    warnings.push(`${caseIssues.length} case sensitivity issues`);
  }
  
  if (issues.length > 0) {
    log('\nCRITICAL ISSUES:', 'red');
    issues.forEach((issue, idx) => {
      log(`  ${idx + 1}. ${issue}`, 'red');
    });
  }
  
  if (warnings.length > 0) {
    log('\nWARNINGS:', 'yellow');
    warnings.forEach((warning, idx) => {
      log(`  ${idx + 1}. ${warning}`, 'yellow');
    });
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    log('\n✓ No critical issues found!', 'green');
  }
  
  log('\n' + '='.repeat(80), 'bright');
}

main().catch(console.error);
