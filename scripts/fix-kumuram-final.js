const fs = require('fs');
const path = require('path');

console.log('=== FIXING KUMURAM BHEEM FINAL ===\n');

const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mappingFile = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// API has "Kumram Bheem(asifabad)" which normalizes to "kumram bheem"
// (parentheses without space before them get removed entirely)

console.log('Checking current Kumuram keys:');
Object.keys(mappingFile.mappings).filter(k => k.includes('kumram')).forEach(k => {
    console.log(`  "${k}" → ${mappingFile.mappings[k].geoDistrict}`);
});

// Remove the wrong key
if (mappingFile.mappings['telangana:kumram bheem asifabad']) {
    console.log('\nRemoving: "telangana:kumram bheem asifabad"');
    const data = mappingFile.mappings['telangana:kumram bheem asifabad'];
    delete mappingFile.mappings['telangana:kumram bheem asifabad'];
    
    // Add correct key
    mappingFile.mappings['telangana:kumram bheem'] = data;
    console.log('Added: "telangana:kumram bheem"');
}

// Update metadata
mappingFile.totalMappings = Object.keys(mappingFile.mappings).length;
mappingFile.version = '4.9-kumuram-final-fix';
mappingFile.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mappingFile, null, 2));

console.log(`\n✅ Fixed`);
console.log(`📊 Total mappings: ${mappingFile.totalMappings}`);
