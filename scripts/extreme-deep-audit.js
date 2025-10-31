/**
 * EXTREME DEEP AUDIT - Find EVERY possible issue
 * Uses advanced debugging techniques from 2024/2025 best practices
 */

const fs = require('fs');
const path = require('path');

console.log('═'.repeat(100));
console.log('EXTREME DEEP AUDIT - FINDING EVERY POSSIBLE ISSUE');
console.log('═'.repeat(100));
console.log('');

const issues = [];
const warnings = [];

// Load all data files
const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

// Simulate normalization (with fix)
function normalizeDistrictName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\bdist(rict)?\b/g, '')
    .trim();
}

console.log('🔍 TEST 1: DATABASE DUPLICATE CHECK');
console.log('─'.repeat(100));
// This requires database access - create SQL script
fs.writeFileSync(path.join(__dirname, 'check-db-duplicates.sql'), `
-- Find all duplicate district names in database
SELECT name, COUNT(*) as count, STRING_AGG(state, ', ') as states
FROM districts
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC, name;
`);
console.log('✅ Created check-db-duplicates.sql - Run: Get-Content scripts/check-db-duplicates.sql | docker exec -i mgnrega-db psql -U postgres -d mgnrega');
console.log('');

console.log('🔍 TEST 2: EXTREME PERCENTAGE VALIDATION');
console.log('─'.repeat(100));
// Check for districts with suspicious percentages in database
fs.writeFileSync(path.join(__dirname, 'check-extreme-percentages.sql'), `
-- Find districts with extreme percentages (>100% or <0%)
SELECT 
  district_name,
  month,
  fin_year,
  payment_percentage_15_days,
  CASE 
    WHEN payment_percentage_15_days > 1000 THEN 'EXTREME (>1000%)'
    WHEN payment_percentage_15_days > 200 THEN 'VERY HIGH (>200%)'
    WHEN payment_percentage_15_days > 100 THEN 'HIGH (>100%)'
    WHEN payment_percentage_15_days < 0 THEN 'NEGATIVE'
    ELSE 'NORMAL'
  END as severity
FROM monthly_performance
WHERE payment_percentage_15_days > 100 OR payment_percentage_15_days < 0
ORDER BY payment_percentage_15_days DESC
LIMIT 50;
`);
console.log('✅ Created check-extreme-percentages.sql');
console.log('');

console.log('🔍 TEST 3: MAPPING KEY CONSISTENCY');
console.log('─'.repeat(100));
const mappingKeys = Object.keys(mapping.mappings);
const keyIssues = {
  doubleSpaces: [],
  mixedCase: [],
  specialChars: [],
  noColon: [],
  multipleColons: []
};

mappingKeys.forEach(key => {
  if (key.includes('  ')) keyIssues.doubleSpaces.push(key);
  if (key !== key.toLowerCase()) keyIssues.mixedCase.push(key);
  if (/[^a-z0-9:\s-]/.test(key)) keyIssues.specialChars.push(key);
  if (!key.includes(':')) keyIssues.noColon.push(key);
  if ((key.match(/:/g) || []).length > 1) keyIssues.multipleColons.push(key);
});

let keyProblems = 0;
Object.entries(keyIssues).forEach(([type, keys]) => {
  if (keys.length > 0) {
    console.log(`❌ ${type}: ${keys.length} keys`);
    keys.slice(0, 3).forEach(k => console.log(`   - "${k}"`));
    keyProblems += keys.length;
    issues.push(`${keys.length} keys with ${type}`);
  }
});

if (keyProblems === 0) {
  console.log('✅ All mapping keys are properly formatted');
}
console.log('');

console.log('🔍 TEST 4: GEOJSON INTEGRITY');
console.log('─'.repeat(100));
const geoIssues = {
  missingProperties: [],
  invalidGeometry: [],
  emptyCoordinates: [],
  duplicateIds: new Map()
};

geoJson.features.forEach((feature, idx) => {
  // Check properties
  if (!feature.properties || !feature.properties.District || !feature.properties.STATE) {
    geoIssues.missingProperties.push(idx);
  }
  
  // Check geometry
  if (!feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
    geoIssues.invalidGeometry.push(idx);
  }
  
  // Check for empty coordinates
  if (feature.geometry && feature.geometry.coordinates) {
    const coords = feature.geometry.coordinates;
    if (Array.isArray(coords) && coords.length === 0) {
      geoIssues.emptyCoordinates.push(idx);
    }
  }
  
  // Check for duplicate IDs
  if (feature.properties && feature.properties.id) {
    const id = feature.properties.id;
    if (geoIssues.duplicateIds.has(id)) {
      geoIssues.duplicateIds.get(id).push(idx);
    } else {
      geoIssues.duplicateIds.set(id, [idx]);
    }
  }
});

const duplicates = Array.from(geoIssues.duplicateIds.entries()).filter(([id, indices]) => indices.length > 1);

let geoProblems = 0;
if (geoIssues.missingProperties.length > 0) {
  console.log(`❌ Missing properties: ${geoIssues.missingProperties.length} features`);
  geoProblems++;
  issues.push(`${geoIssues.missingProperties.length} features with missing properties`);
}
if (geoIssues.invalidGeometry.length > 0) {
  console.log(`❌ Invalid geometry: ${geoIssues.invalidGeometry.length} features`);
  geoProblems++;
  issues.push(`${geoIssues.invalidGeometry.length} features with invalid geometry`);
}
if (geoIssues.emptyCoordinates.length > 0) {
  console.log(`❌ Empty coordinates: ${geoIssues.emptyCoordinates.length} features`);
  geoProblems++;
  issues.push(`${geoIssues.emptyCoordinates.length} features with empty coordinates`);
}
if (duplicates.length > 0) {
  console.log(`❌ Duplicate IDs: ${duplicates.length} IDs used multiple times`);
  duplicates.slice(0, 5).forEach(([id, indices]) => {
    console.log(`   - ID ${id}: used by features ${indices.join(', ')}`);
  });
  geoProblems++;
  issues.push(`${duplicates.length} duplicate IDs`);
}

if (geoProblems === 0) {
  console.log('✅ GeoJSON integrity is perfect');
}
console.log('');

console.log('🔍 TEST 5: BACKEND-TO-FRONTEND DATA FLOW');
console.log('─'.repeat(100));
console.log('⚠️  This requires live backend - checking mapping consistency...');

// Check if all mapped districts have corresponding GeoJSON features
const unmappedDistricts = [];
Object.entries(mapping.mappings).forEach(([key, value]) => {
  const geoId = value.geoId;
  const found = geoJson.features.find(f => f.properties.id === geoId);
  if (!found) {
    unmappedDistricts.push({ key, geoId, geoDistrict: value.geoDistrict });
  }
});

if (unmappedDistricts.length > 0) {
  console.log(`❌ Mapped districts without GeoJSON features: ${unmappedDistricts.length}`);
  unmappedDistricts.slice(0, 10).forEach(d => {
    console.log(`   - ${d.key} → geoId ${d.geoId} (${d.geoDistrict}) NOT FOUND`);
  });
  issues.push(`${unmappedDistricts.length} mapped districts missing from GeoJSON`);
} else {
  console.log('✅ All mapped districts have corresponding GeoJSON features');
}
console.log('');

console.log('🔍 TEST 6: REVERSE CHECK - GEOJSON TO MAPPING');
console.log('─'.repeat(100));
const unmappedFeatures = [];
geoJson.features.forEach(feature => {
  const geoId = feature.properties.id;
  const found = Object.values(mapping.mappings).find(m => m.geoId === geoId);
  if (!found) {
    unmappedFeatures.push({
      district: feature.properties.District,
      state: feature.properties.STATE,
      geoId: geoId
    });
  }
});

if (unmappedFeatures.length > 0) {
  console.log(`⚠️  GeoJSON features without API mapping: ${unmappedFeatures.length}`);
  console.log('   (This is OK if they are subdivisions or historical boundaries)');
  unmappedFeatures.slice(0, 10).forEach(f => {
    console.log(`   - ${f.district} (${f.state}) - geoId ${f.geoId}`);
  });
  warnings.push(`${unmappedFeatures.length} GeoJSON features without API mapping`);
} else {
  console.log('✅ All GeoJSON features are mapped to API districts');
}
console.log('');

console.log('🔍 TEST 7: SPECIAL CHARACTER PATTERNS');
console.log('─'.repeat(100));
const specialCharPatterns = {
  ampersand: [],
  parentheses: [],
  dots: [],
  slashes: [],
  commas: [],
  apostrophes: []
};

mappingKeys.forEach(key => {
  const [state, district] = key.split(':');
  const fullName = `${state}:${district}`;
  
  // Check original mapping values for special chars
  const m = mapping.mappings[key];
  const geoDistrict = m.geoDistrict || '';
  const geoState = m.geoState || '';
  
  if (geoDistrict.includes('&') || geoState.includes('&')) specialCharPatterns.ampersand.push(key);
  if (geoDistrict.includes('(') || geoState.includes('(')) specialCharPatterns.parentheses.push(key);
  if (geoDistrict.includes('.') || geoState.includes('.')) specialCharPatterns.dots.push(key);
  if (geoDistrict.includes('/') || geoState.includes('/')) specialCharPatterns.slashes.push(key);
  if (geoDistrict.includes(',') || geoState.includes(',')) specialCharPatterns.commas.push(key);
  if (geoDistrict.includes("'") || geoState.includes("'")) specialCharPatterns.apostrophes.push(key);
});

let specialCharCount = 0;
Object.entries(specialCharPatterns).forEach(([type, keys]) => {
  if (keys.length > 0) {
    console.log(`⚠️  ${type}: ${keys.length} districts`);
    keys.slice(0, 3).forEach(k => {
      const m = mapping.mappings[k];
      console.log(`   - ${k} → ${m.geoDistrict}, ${m.geoState}`);
    });
    specialCharCount += keys.length;
    warnings.push(`${keys.length} districts with ${type}`);
  }
});

if (specialCharCount === 0) {
  console.log('✅ No special characters in GeoJSON names');
}
console.log('');

console.log('🔍 TEST 8: NORMALIZATION ROUND-TRIP TEST');
console.log('─'.repeat(100));
const normalizationFailures = [];

// Test that backend names can round-trip through normalization
const testNames = [
  { backend: 'Andaman & Nicobar', expected: 'andaman and nicobar' },
  { backend: 'Jammu & Kashmir', expected: 'jammu and kashmir' },
  { backend: 'D & N Haveli', expected: 'd and n haveli' },
  { backend: 'Dadra & Nagar Haveli', expected: 'dadra and nagar haveli' },
  { backend: 'Daman & Diu', expected: 'daman and diu' },
  { backend: 'North & Middle Andaman', expected: 'north and middle andaman' },
  { backend: 'Y.S.R', expected: 'ysr' },
  { backend: 'Y.S.R.', expected: 'ysr' },
  { backend: 'Kamrup (Metro)', expected: 'kamrup metro' },
  { backend: '24 Parganas (North)', expected: '24 parganas north' },
];

testNames.forEach(test => {
  const normalized = normalizeDistrictName(test.backend);
  if (normalized !== test.expected) {
    normalizationFailures.push({
      backend: test.backend,
      expected: test.expected,
      actual: normalized
    });
  }
});

if (normalizationFailures.length > 0) {
  console.log(`❌ Normalization failures: ${normalizationFailures.length}`);
  normalizationFailures.forEach(f => {
    console.log(`   Backend: "${f.backend}"`);
    console.log(`   Expected: "${f.expected}"`);
    console.log(`   Got: "${f.actual}"`);
    console.log('');
  });
  issues.push(`${normalizationFailures.length} normalization failures`);
} else {
  console.log('✅ All normalization tests pass');
}
console.log('');

console.log('🔍 TEST 9: CROSS-REFERENCE API vs GEOJSON vs MAPPING');
console.log('─'.repeat(100));

// Check for orphaned mappings (in mapping but not in GeoJSON)
const orphanedMappings = [];
Object.entries(mapping.mappings).forEach(([key, value]) => {
  const geoId = value.geoId;
  const found = geoJson.features.find(f => f.properties.id === geoId);
  if (!found) {
    orphanedMappings.push({ key, geoId });
  }
});

if (orphanedMappings.length > 0) {
  console.log(`❌ Orphaned mappings: ${orphanedMappings.length}`);
  orphanedMappings.slice(0, 5).forEach(o => {
    console.log(`   - ${o.key} → geoId ${o.geoId} (NOT IN GEOJSON)`);
  });
  issues.push(`${orphanedMappings.length} orphaned mappings`);
} else {
  console.log('✅ No orphaned mappings');
}
console.log('');

console.log('🔍 TEST 10: GEOID UNIQUENESS');
console.log('─'.repeat(100));
const geoIdMap = new Map();
geoJson.features.forEach((feature, idx) => {
  const geoId = feature.properties.id;
  if (geoIdMap.has(geoId)) {
    geoIdMap.get(geoId).push(idx);
  } else {
    geoIdMap.set(geoId, [idx]);
  }
});

const duplicateGeoIds = Array.from(geoIdMap.entries()).filter(([id, indices]) => indices.length > 1);

if (duplicateGeoIds.length > 0) {
  console.log(`❌ Duplicate geoIds: ${duplicateGeoIds.length}`);
  duplicateGeoIds.slice(0, 5).forEach(([id, indices]) => {
    const features = indices.map(i => geoJson.features[i].properties.District);
    console.log(`   - geoId ${id}: ${features.join(', ')}`);
  });
  issues.push(`${duplicateGeoIds.length} duplicate geoIds`);
} else {
  console.log('✅ All geoIds are unique');
}
console.log('');

console.log('🔍 TEST 11: STATE NAME VARIATIONS');
console.log('─'.repeat(100));
// Find all unique state names in GeoJSON
const geoStates = new Set();
geoJson.features.forEach(f => {
  if (f.properties.STATE) {
    geoStates.add(f.properties.STATE);
  }
});

// Find all unique state names in mapping
const mappingStates = new Set();
Object.values(mapping.mappings).forEach(m => {
  if (m.geoState) {
    mappingStates.add(m.geoState);
  }
});

console.log(`GeoJSON states: ${geoStates.size}`);
console.log(`Mapping states: ${mappingStates.size}`);

// Find states in GeoJSON but not in mapping
const unmappedStates = Array.from(geoStates).filter(s => !mappingStates.has(s));
if (unmappedStates.length > 0) {
  console.log(`⚠️  States in GeoJSON but not in mapping: ${unmappedStates.length}`);
  unmappedStates.forEach(s => console.log(`   - ${s}`));
  warnings.push(`${unmappedStates.length} unmapped states`);
} else {
  console.log('✅ All GeoJSON states are in mapping');
}
console.log('');

console.log('🔍 TEST 12: COORDINATE VALIDATION');
console.log('─'.repeat(100));
const coordIssues = [];

geoJson.features.forEach((feature, idx) => {
  if (feature.geometry && feature.geometry.coordinates) {
    const coords = feature.geometry.coordinates;
    
    // Check for invalid coordinates (outside India bounds)
    const checkCoords = (coordArray) => {
      coordArray.forEach(coord => {
        if (Array.isArray(coord[0])) {
          checkCoords(coord);
        } else {
          const [lon, lat] = coord;
          // India bounds: roughly 68-97°E, 8-37°N
          if (lon < 60 || lon > 100 || lat < 5 || lat > 40) {
            coordIssues.push({
              feature: idx,
              district: feature.properties.District,
              coord: [lon, lat]
            });
          }
        }
      });
    };
    
    try {
      checkCoords(coords);
    } catch (e) {
      coordIssues.push({
        feature: idx,
        district: feature.properties.District,
        error: e.message
      });
    }
  }
});

if (coordIssues.length > 0) {
  console.log(`⚠️  Suspicious coordinates: ${coordIssues.length}`);
  coordIssues.slice(0, 5).forEach(c => {
    console.log(`   - ${c.district}: ${c.coord ? c.coord.join(', ') : c.error}`);
  });
  warnings.push(`${coordIssues.length} suspicious coordinates`);
} else {
  console.log('✅ All coordinates within India bounds');
}
console.log('');

console.log('🔍 TEST 13: CONFIDENCE SCORE ANALYSIS');
console.log('─'.repeat(100));
const confidenceBreakdown = {
  perfect: 0,
  high: 0,
  medium: 0,
  low: 0
};

Object.values(mapping.mappings).forEach(m => {
  const conf = m.confidence || 0;
  if (conf >= 1.0) confidenceBreakdown.perfect++;
  else if (conf >= 0.9) confidenceBreakdown.high++;
  else if (conf >= 0.7) confidenceBreakdown.medium++;
  else confidenceBreakdown.low++;
});

console.log('Confidence distribution:');
console.log(`   Perfect (1.0): ${confidenceBreakdown.perfect}`);
console.log(`   High (0.9-0.99): ${confidenceBreakdown.high}`);
console.log(`   Medium (0.7-0.89): ${confidenceBreakdown.medium}`);
console.log(`   Low (<0.7): ${confidenceBreakdown.low}`);

if (confidenceBreakdown.low > 0) {
  console.log(`\n⚠️  ${confidenceBreakdown.low} districts have low confidence`);
  warnings.push(`${confidenceBreakdown.low} low-confidence mappings`);
}
console.log('');

// FINAL SUMMARY
console.log('═'.repeat(100));
console.log('AUDIT RESULTS');
console.log('═'.repeat(100));
console.log('');

console.log(`🔴 CRITICAL ISSUES: ${issues.length}`);
if (issues.length > 0) {
  issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
} else {
  console.log('   ✅ None found!');
}

console.log(`\n⚠️  WARNINGS: ${warnings.length}`);
if (warnings.length > 0) {
  warnings.forEach((warning, i) => console.log(`   ${i + 1}. ${warning}`));
} else {
  console.log('   ✅ None found!');
}

console.log('\n📊 STATISTICS:');
console.log(`   Total GeoJSON features: ${geoJson.features.length}`);
console.log(`   Total mappings: ${Object.keys(mapping.mappings).length}`);
console.log(`   Excluded districts: ${Object.keys(mapping.excluded).length}`);
console.log(`   Coverage: ${mapping.coverage}`);
console.log(`   Unmapped features: ${unmappedFeatures.length}`);

console.log('\n🎯 QUALITY SCORE:');
const totalTests = 13;
const passedTests = totalTests - issues.length;
const score = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`   ${passedTests}/${totalTests} tests passed (${score}%)`);

if (issues.length === 0 && warnings.length <= 2) {
  console.log('\n✅ PRODUCTION READY - Quality is excellent!');
} else if (issues.length === 0) {
  console.log('\n⚠️  ACCEPTABLE - Minor warnings but no critical issues');
} else {
  console.log('\n❌ NEEDS ATTENTION - Critical issues must be fixed');
}

console.log('\n' + '═'.repeat(100));
console.log('NEXT STEPS:');
console.log('═'.repeat(100));
console.log('');
console.log('1. Run database checks:');
console.log('   Get-Content scripts/check-db-duplicates.sql | docker exec -i mgnrega-db psql -U postgres -d mgnrega');
console.log('   Get-Content scripts/check-extreme-percentages.sql | docker exec -i mgnrega-db psql -U postgres -d mgnrega');
console.log('');
console.log('2. Fix any critical issues found above');
console.log('');
console.log('3. Test in browser with Chrome DevTools Network tab');
console.log('');
console.log('4. Verify all districts display correctly on map');
console.log('');
console.log('═'.repeat(100));
