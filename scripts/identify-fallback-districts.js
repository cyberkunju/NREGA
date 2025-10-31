/**
 * Identify Fallback Districts
 * Find which 20 districts are using fallback lookup instead of perfect mapping
 */

const fs = require('fs');
const path = require('path');

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\bdist(rict)?\b/g, '')
    .trim();
}

// Load perfect mapping
const perfectMapping = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json'),
  'utf-8'
));

console.log(`📊 Perfect mapping has ${Object.keys(perfectMapping.mappings).length} mappings\n`);

// Load API districts
const apiContent = fs.readFileSync(
  path.join(__dirname, '..', 'complete-api-districts.txt'),
  'utf-8'
);

const apiDistricts = [];
const lines = apiContent.split('\n');

for (const line of lines) {
  if (!line.trim() || line.includes('districtName') || line.includes('---')) continue;
  
  const parts = line.split(/\s{2,}/);
  if (parts.length >= 2) {
    const districtName = parts[0].trim();
    const stateName = parts[1].trim();
    
    if (districtName && stateName) {
      apiDistricts.push({
        districtName,
        stateName,
        normalizedDistrict: normalize(districtName),
        normalizedState: normalize(stateName),
        compositeKey: `${normalize(stateName)}:${normalize(districtName)}`
      });
    }
  }
}

console.log(`📊 Found ${apiDistricts.length} API districts\n`);

// Find districts NOT in perfect mapping
const notInPerfectMapping = [];
const inPerfectMapping = [];

for (const api of apiDistricts) {
  const key = api.compositeKey;
  
  if (perfectMapping.mappings[key]) {
    inPerfectMapping.push(api);
  } else {
    notInPerfectMapping.push(api);
  }
}

console.log(`✅ In perfect mapping: ${inPerfectMapping.length}`);
console.log(`⚠️  NOT in perfect mapping (using fallback): ${notInPerfectMapping.length}\n`);

console.log('Districts using FALLBACK LOOKUP:\n');
console.log('═'.repeat(70));

notInPerfectMapping.forEach((d, i) => {
  console.log(`${i + 1}. ${d.districtName}, ${d.stateName}`);
  console.log(`   Key: ${d.compositeKey}`);
  console.log('');
});

// Load GeoJSON to find potential matches
const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

console.log('\n' + '═'.repeat(70));
console.log('FINDING POTENTIAL MATCHES IN GEOJSON:\n');

const suggestions = [];

for (const api of notInPerfectMapping) {
  const apiNorm = api.normalizedDistrict;
  const stateNorm = api.normalizedState;
  
  // Find potential matches in same state
  const potentialMatches = geoJson.features.filter(f => {
    const geoDistrict = normalize(f.properties.District || f.properties.district || '');
    const geoState = normalize(f.properties.STATE || f.properties.state || '');
    
    // Must be same state
    if (geoState !== stateNorm) return false;
    
    // Check if names are similar
    if (geoDistrict.includes(apiNorm) || apiNorm.includes(geoDistrict)) {
      return true;
    }
    
    // Check word overlap
    const apiWords = apiNorm.split(' ').filter(w => w.length >= 4);
    const geoWords = geoDistrict.split(' ').filter(w => w.length >= 4);
    
    for (const aw of apiWords) {
      for (const gw of geoWords) {
        if (aw === gw) return true;
      }
    }
    
    return false;
  });
  
  suggestions.push({
    api: api,
    matches: potentialMatches.map(f => ({
      district: f.properties.District,
      state: f.properties.STATE,
      geoId: f.properties.id,
      normalized: normalize(f.properties.District)
    }))
  });
  
  console.log(`${api.districtName}, ${api.stateName}`);
  console.log(`  API Key: ${api.compositeKey}`);
  
  if (potentialMatches.length > 0) {
    console.log(`  Potential matches:`);
    potentialMatches.forEach((m, i) => {
      console.log(`    ${i + 1}. ${m.properties.District} (geoId: ${m.properties.id})`);
    });
  } else {
    console.log(`  ❌ No potential matches found`);
  }
  console.log('');
}

// Save results
const outputPath = path.join(__dirname, '..', 'analysis-output', 'fallback-districts.json');
fs.writeFileSync(outputPath, JSON.stringify({
  generated: new Date().toISOString(),
  totalAPIDistricts: apiDistricts.length,
  inPerfectMapping: inPerfectMapping.length,
  usingFallback: notInPerfectMapping.length,
  fallbackDistricts: notInPerfectMapping,
  suggestions: suggestions
}, null, 2));

console.log('═'.repeat(70));
console.log(`\n💾 Saved to: ${outputPath}`);
console.log('\n📋 Next Steps:');
console.log('1. Review each fallback district');
console.log('2. Verify the suggested matches');
console.log('3. Add verified matches to perfect-mapping-v2.json');
console.log('4. Re-run to confirm all districts are mapped\n');
