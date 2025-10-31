const fs = require('fs');
const path = require('path');

console.log('=== FIXING WRONG GEOJSON MAPPINGS ===\n');

const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mappingFile = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
const geojsonFile = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Fix 1: RANIPPETTAI - Update existing mapping to point to correct GeoJSON name
console.log('1. Fixing RANIPPETTAI...');
if (mappingFile.mappings['tamil nadu:ranipet']) {
    const feature = geojsonFile.features.find(f => 
        f.properties.District === 'RANIPPETTAI' && f.properties.STATE === 'TAMIL NADU'
    );
    if (feature) {
        mappingFile.mappings['tamil nadu:ranipet'].geoDistrict = 'RANIPPETTAI';
        mappingFile.mappings['tamil nadu:ranipet'].geoState = 'TAMIL NADU';
        mappingFile.mappings['tamil nadu:ranipet'].geoId = feature.properties.id || feature.properties.dt_code;
        console.log('   ✓ Updated "tamil nadu:ranipet" → RANIPPETTAI');
    }
}

// Fix 2: KUMURAM BHEEM - Remove old key, keep only new one
console.log('\n2. Fixing KUMURAM BHEEM...');
if (mappingFile.mappings['telangana:kumram bheemasifabad']) {
    console.log('   Removing old key: "telangana:kumram bheemasifabad"');
    delete mappingFile.mappings['telangana:kumram bheemasifabad'];
}
// The correct key "telangana:kumram bheem asifabad" already exists

// Fix 3: WARANGAL (RURAL) - Update existing mapping
console.log('\n3. Fixing WARANGAL (RURAL)...');
if (mappingFile.mappings['telangana:warangal']) {
    const feature = geojsonFile.features.find(f => 
        f.properties.District === 'WARANGAL (RURAL)' && f.properties.STATE === 'TELANGANA'
    );
    if (feature) {
        mappingFile.mappings['telangana:warangal'].geoDistrict = 'WARANGAL (RURAL)';
        mappingFile.mappings['telangana:warangal'].geoState = 'TELANGANA';
        mappingFile.mappings['telangana:warangal'].geoId = feature.properties.id || feature.properties.dt_code;
        console.log('   ✓ Updated "telangana:warangal" → WARANGAL (RURAL)');
    }
}

// Fix 4: SAS NAGAR - Update existing mapping
console.log('\n4. Fixing SAS NAGAR...');
if (mappingFile.mappings['punjab:sas nagar mohali']) {
    const feature = geojsonFile.features.find(f => 
        f.properties.District === 'SAS NAGAR (SAHIBZADA AJIT SINGH NAGAR)' && f.properties.STATE === 'PUNJAB'
    );
    if (feature) {
        mappingFile.mappings['punjab:sas nagar mohali'].geoDistrict = 'SAS NAGAR (SAHIBZADA AJIT SINGH NAGAR)';
        mappingFile.mappings['punjab:sas nagar mohali'].geoState = 'PUNJAB';
        mappingFile.mappings['punjab:sas nagar mohali'].geoId = feature.properties.id || feature.properties.dt_code;
        console.log('   ✓ Updated "punjab:sas nagar mohali" → SAS NAGAR (SAHIBZADA AJIT SINGH NAGAR)');
    }
}

// Update metadata
mappingFile.totalMappings = Object.keys(mappingFile.mappings).length;
mappingFile.version = '4.8-fix-wrong-geojson-names';
mappingFile.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mappingFile, null, 2));

console.log(`\n✅ All mappings fixed`);
console.log(`📊 Total mappings: ${mappingFile.totalMappings}`);
console.log(`💾 Saved`);
