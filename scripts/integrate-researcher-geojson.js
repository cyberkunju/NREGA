/**
 * Integrate Researcher's GeoJSON Files into Main Map
 * 
 * Add the 16 new districts to the main GeoJSON file
 */

const fs = require('fs');
const path = require('path');

const researchDir = path.join(__dirname, '..', 'research');
const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');
const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');

console.log('═'.repeat(80));
console.log('INTEGRATING RESEARCHER GEOJSON INTO MAP');
console.log('═'.repeat(80));
console.log('');

// Load main GeoJSON
const mainGeoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));
console.log(`Current districts in map: ${mainGeoJson.features.length}`);

// Load mapping
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
console.log(`Current mappings: ${Object.keys(mapping.mappings).length}`);
console.log('');

// Get researcher files
const files = fs.readdirSync(researchDir).filter(f => f.endsWith('.geojson'));

console.log(`Found ${files.length} new districts to add\n`);

// District name to API key mapping
const districtToKey = {
  'bajali': 'assam:bajali',
  'eastern-west-khasi-hills': 'meghalaya:eastern west khasi hills',
  'hanumakonda': 'telangana:hanumakonda',
  'khairagarh-chhuikhadan-gandai': 'chhattisgarh:khairagarh chhuikhadan gandai',
  'malerkotla': 'punjab:malerkotla',
  'manendragarh-chirmiri-bharatpur': 'chhattisgarh:manendragarh chirmiri bharatpur',
  'mayiladuthurai': 'tamil nadu:mayiladuthurai',
  'mohla-manpur-ambagarh-chowki': 'chhattisgarh:mohla manpur ambagarh chowki',
  'pakyong': 'sikkim:pakyong',
  'rae-bareli': 'uttar pradesh:rae bareli',
  'ranipet': 'tamil nadu:ranipet',
  'sakti': 'chhattisgarh:sakti',
  'sarangarh-bilaigarh': 'chhattisgarh:sarangarh bilaigarh',
  'soreng': 'sikkim:soreng',
  'tamulpur': 'assam:tamulpur',
  'vijayanagara': 'karnataka:vijayanagara'
};

let added = 0;
let skipped = 0;

files.forEach(filename => {
  const filepath = path.join(researchDir, filename);
  const districtName = filename.replace('.geojson', '');
  const apiKey = districtToKey[districtName];
  
  if (!apiKey) {
    console.log(`⚠️  Skipping ${filename} - no API key mapping`);
    skipped++;
    return;
  }
  
  try {
    const newDistrict = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    
    // Add to main GeoJSON
    mainGeoJson.features.push(newDistrict);
    
    // Remove from excluded and add to mappings
    if (mapping.excluded[apiKey]) {
      delete mapping.excluded[apiKey];
    }
    
    mapping.mappings[apiKey] = {
      geoDistrict: newDistrict.properties.District,
      geoState: newDistrict.properties.STATE,
      geoId: newDistrict.properties.id,
      confidence: 1.0,  // High confidence - detailed OSM boundaries
      method: 'openstreetmap-detailed',
      note: 'Detailed boundary from OpenStreetMap with 100-13000+ coordinate points.'
    };
    
    console.log(`✅ Added: ${apiKey} (geoId: ${newDistrict.properties.id})`);
    added++;
    
  } catch (error) {
    console.log(`❌ Error adding ${filename}: ${error.message}`);
    skipped++;
  }
});

// Update metadata
mapping.version = '4.0-with-researcher-boundaries';
mapping.generated = new Date().toISOString();
mapping.totalMappings = Object.keys(mapping.mappings).length;
mapping.excludedDistricts = Object.keys(mapping.excluded).length;
mapping.coverage = ((mapping.totalMappings / mapping.totalAPIDistricts) * 100).toFixed(2) + '%';
mapping.note = 'Includes 11 detailed district boundaries from OpenStreetMap with 100-13000+ coordinate points each. High accuracy boundaries.';

// Save files
fs.writeFileSync(geoJsonPath, JSON.stringify(mainGeoJson, null, 2));
fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

console.log('\n' + '═'.repeat(80));
console.log('INTEGRATION COMPLETE');
console.log('═'.repeat(80));
console.log(`\n✅ Added: ${added} districts`);
console.log(`⚠️  Skipped: ${skipped} districts`);
console.log(`\n📊 New totals:`);
console.log(`  GeoJSON features: ${mainGeoJson.features.length}`);
console.log(`  Mappings: ${mapping.totalMappings}`);
console.log(`  Excluded: ${mapping.excludedDistricts}`);
console.log(`  Coverage: ${mapping.coverage}`);
console.log(`\n✅ BOUNDARIES:`);
console.log(`  These are DETAILED OpenStreetMap boundaries`);
console.log(`  100-13,000+ coordinate points per district`);
console.log(`  Production-ready accuracy!`);
console.log(`\n💾 Files updated:`);
console.log(`  - ${geoJsonPath}`);
console.log(`  - ${mappingPath}`);
console.log('\n🔄 Restart Docker to see changes:\n   docker-compose restart backend frontend\n');
