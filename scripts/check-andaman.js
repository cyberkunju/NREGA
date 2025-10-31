const fs = require('fs');

const mapping = JSON.parse(fs.readFileSync('frontend/src/data/perfect-district-mapping-v2.json'));

console.log('Checking Andaman & Nicobar mappings...\n');

// Find all Andaman keys
const andamanKeys = Object.keys(mapping.mappings).filter(k => 
  k.toLowerCase().includes('andaman') || k.toLowerCase().includes('nicobar')
);

console.log('Found mappings:');
andamanKeys.forEach(key => {
  const m = mapping.mappings[key];
  console.log(`\nAPI Key: "${key}"`);
  console.log(`  → GeoJSON: ${m.geoDistrict}`);
  console.log(`  → State: ${m.geoState}`);
  console.log(`  → GeoID: ${m.geoId}`);
});

// Check GeoJSON
const geoJson = JSON.parse(fs.readFileSync('frontend/public/india-districts.geojson'));
const andamanFeatures = geoJson.features.filter(f => 
  f.properties.STATE.includes('ANDAMAN') || 
  f.properties.STATE.includes('NICOBAR') ||
  f.properties.District.includes('ANDAMAN') ||
  f.properties.District.includes('NICOBAR')
);

console.log('\n\nGeoJSON features:');
andamanFeatures.forEach(f => {
  console.log(`  ${f.properties.District} (${f.properties.STATE}) - ID: ${f.properties.id}`);
});

// Check what the API actually sends
console.log('\n\nAPI format check:');
console.log('The API likely sends: "andaman and nicobar:north and middle andaman"');
console.log('Or maybe: "andaman & nicobar:north and middle andaman"');
console.log('Or maybe: "andaman  nicobar:north and middle andaman" (double space)');
