const fs = require('fs');
const path = require('path');

console.log('=== FIXING DARJILING & KAMRUP METRO ===\n');

const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mappingFile = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
const geojsonFile = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Fix 1: Add DARJILING
console.log('Adding DARJILING (West Bengal)...');

const darjilingFeature = geojsonFile.features.find(f => 
    f.properties.District === 'DARJILING' && f.properties.STATE === 'WEST BENGAL'
);

if (darjilingFeature) {
    const geoId = darjilingFeature.properties.id || darjilingFeature.properties.dt_code;
    
    // API has "Darjeeling Gorkha Hill Council (dghc)" which normalizes to "darjeeling gorkha hill council"
    const key = 'west bengal:darjeeling gorkha hill council';
    
    if (!mappingFile.mappings[key]) {
        mappingFile.mappings[key] = {
            geoDistrict: 'DARJILING',
            geoState: 'WEST BENGAL',
            geoId: geoId,
            confidence: 1,
            method: 'manual-addition',
            note: 'API name: "Darjeeling Gorkha Hill Council (dghc)"'
        };
        console.log(`  ✓ Added: "${key}" (geoId: ${geoId})`);
    } else {
        console.log('  Already exists');
    }
} else {
    console.log('  ❌ DARJILING not found in GeoJSON');
}

// Fix 2: Fix KAMRUP METRO
console.log('\nFixing KAMRUP METRO (Assam)...');

// Remove the wrong key
if (mappingFile.mappings['assam:kamrup metro']) {
    console.log('  Removing wrong key: "assam:kamrup metro"');
    delete mappingFile.mappings['assam:kamrup metro'];
}

// The API has "Kamrup (metro)" which normalizes to "kamrup" (parentheses removed)
// But there's already "assam:kamrup" mapped to "KAMRUP RURAL"
// We need to check which one the API actually refers to

console.log('  Note: API has "Kamrup (metro)" which normalizes to "kamrup"');
console.log('  But "assam:kamrup" is already mapped to KAMRUP RURAL');
console.log('  Need to check which district the API data actually refers to...');

// For now, let's add a specific key for metro
// The issue is that both "Kamrup" and "Kamrup (metro)" normalize to the same key!
// This is a normalization problem - parentheses are removed

console.log('  ⚠️  PROBLEM: Both "Kamrup" and "Kamrup (metro)" normalize to "kamrup"');
console.log('  This is a fundamental issue with the normalization function');
console.log('  The parentheses with "metro" should be preserved!');

// Update metadata
mappingFile.totalMappings = Object.keys(mappingFile.mappings).length;
mappingFile.version = '4.5-darjiling-fix';
mappingFile.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mappingFile, null, 2));

console.log(`\n✅ Partial fix applied (Darjiling added)`);
console.log(`⚠️  Kamrup Metro needs normalization function fix`);
console.log(`📊 Total mappings: ${mappingFile.totalMappings}`);
console.log(`💾 Saved to ${mappingPath}`);
