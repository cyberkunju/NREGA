const fs = require('fs');
const path = require('path');

console.log('=== TESTING REVERSE LOOKUP LOGIC ===\n');

// Load files
const mappingFile = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json'),
    'utf8'
));

const geojsonFile = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../frontend/public/india-districts.geojson'),
    'utf8'
));

console.log('✓ Loaded mapping:', Object.keys(mappingFile.mappings).length, 'entries');
console.log('✓ Loaded GeoJSON:', geojsonFile.features.length, 'features\n');

// Test the reverse lookup logic
const testDistricts = [
    'KEONJHAR (KENDUJHAR)',
    'PURULIYA',
    'BANKURA',
    'BIRBHUM',
    'MURSHIDABAD'
];

console.log('=== TESTING REVERSE LOOKUP ===\n');

testDistricts.forEach(geojsonName => {
    const feature = geojsonFile.features.find(f => f.properties.District === geojsonName);
    if (!feature) {
        console.log(`❌ ${geojsonName}: NOT IN GEOJSON`);
        return;
    }
    
    const stateName = feature.properties.STATE;
    
    // Simulate the new logic
    let apiKey = null;
    for (const [key, value] of Object.entries(mappingFile.mappings)) {
        if (value.geoDistrict === geojsonName && value.geoState === stateName) {
            apiKey = key;
            break;
        }
    }
    
    if (apiKey) {
        console.log(`✓ ${geojsonName} (${stateName})`);
        console.log(`  → API key: "${apiKey}"`);
        console.log(`  → Mapping: ${JSON.stringify(mappingFile.mappings[apiKey], null, 2)}`);
    } else {
        console.log(`❌ ${geojsonName} (${stateName}): NO MAPPING FOUND`);
    }
    console.log();
});

// Count how many GeoJSON features have mappings
let matchCount = 0;
let noMatchCount = 0;

geojsonFile.features.forEach(feature => {
    const geojsonName = feature.properties.District;
    const stateName = feature.properties.STATE;
    
    let found = false;
    for (const [key, value] of Object.entries(mappingFile.mappings)) {
        if (value.geoDistrict === geojsonName && value.geoState === stateName) {
            found = true;
            break;
        }
    }
    
    if (found) {
        matchCount++;
    } else {
        noMatchCount++;
        if (noMatchCount <= 10) {
            console.log(`No mapping: ${geojsonName} (${stateName})`);
        }
    }
});

console.log(`\n=== SUMMARY ===`);
console.log(`GeoJSON features with mappings: ${matchCount}/${geojsonFile.features.length} (${(matchCount/geojsonFile.features.length*100).toFixed(2)}%)`);
console.log(`GeoJSON features without mappings: ${noMatchCount}`);
