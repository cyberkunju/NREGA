/**
 * Check why specific districts are showing as white (no data)
 */

const fs = require('fs');
const path = require('path');

const whiteDistricts = [
  { name: 'KEONJHAR (KENDUJHAR)', state: 'ODISHA' },
  { name: 'BALASORE (BALESHWAR)', state: 'ODISHA' },
  { name: 'PURBA MEDINIPUR', state: 'WEST BENGAL' },
  { name: 'BOLANGIR (BALANGIR)', state: 'ODISHA' },
  { name: 'BAUDH (BAUDA)', state: 'ODISHA' },
  { name: 'SUBARNAPUR', state: 'ODISHA' }
];

console.log('\n=== CHECKING WHITE DISTRICTS ===\n');

// Load mapping file
const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const mappings = mapping.mappings || mapping;

// Load GeoJSON
const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

whiteDistricts.forEach(({ name, state }) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Checking: ${name} (${state})`);
  console.log('='.repeat(80));
  
  // Check if in GeoJSON
  const geoFeature = geojson.features.find(f => 
    f.properties?.District === name && f.properties?.STATE === state
  );
  
  if (geoFeature) {
    console.log('✓ Found in GeoJSON');
    console.log(`  District: ${geoFeature.properties.District}`);
    console.log(`  State: ${geoFeature.properties.STATE}`);
  } else {
    console.log('✗ NOT found in GeoJSON');
  }
  
  // Check if in mapping (reverse lookup - find which API district maps to this)
  const mappingEntry = Object.entries(mappings).find(([key, value]) => 
    value.geoDistrict === name && value.geoState === state
  );
  
  if (mappingEntry) {
    const [apiKey, mapData] = mappingEntry;
    console.log('✓ Found in mapping file');
    console.log(`  API Key: ${apiKey}`);
    console.log(`  Maps to: ${mapData.geoDistrict}`);
    console.log(`  Confidence: ${mapData.confidence}`);
    console.log(`  Method: ${mapData.method}`);
  } else {
    console.log('✗ NOT found in mapping file');
    console.log('  This means no API district maps to this GeoJSON district');
    
    // Try to find similar names in mapping
    const stateLower = state.toLowerCase().replace(/\s+/g, ' ');
    const districtLower = name.toLowerCase().replace(/\s+/g, ' ');
    
    console.log('\n  Searching for similar API districts...');
    const similar = Object.entries(mappings).filter(([key, value]) => {
      const keyLower = key.toLowerCase();
      return keyLower.includes(stateLower.split(':')[0]) || 
             keyLower.includes(districtLower.split('(')[0].trim());
    });
    
    if (similar.length > 0) {
      console.log(`  Found ${similar.length} similar entries:`);
      similar.slice(0, 5).forEach(([key, value]) => {
        console.log(`    - ${key} → ${value.geoDistrict}`);
      });
    } else {
      console.log('  No similar entries found');
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log('\nThese white districts likely have no data because:');
console.log('1. They are not in the mapping file (no API district maps to them)');
console.log('2. The API uses different names for these districts');
console.log('3. These districts genuinely have no MGNREGA data');
console.log('\nRecommendation: Check the API data to see what names it uses for these districts');
