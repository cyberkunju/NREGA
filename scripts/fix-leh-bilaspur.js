const fs = require('fs');
const path = require('path');

console.log('=== FIXING LEH & ADDING BILASPUR ===\n');

const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mappingFile = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
const geojsonFile = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Fix 1: LEH - Remove wrong key and add correct one
console.log('Fixing LEH (Ladakh)...');

if (mappingFile.mappings['ladakh:leh ladakh']) {
    console.log('  Removing wrong key: "ladakh:leh ladakh"');
    delete mappingFile.mappings['ladakh:leh ladakh'];
}

// Find LEH in GeoJSON
const lehFeature = geojsonFile.features.find(f => 
    f.properties.District === 'LEH' && f.properties.STATE === 'LADAKH'
);

if (lehFeature) {
    const geoId = lehFeature.properties.id || lehFeature.properties.dt_code;
    mappingFile.mappings['ladakh:leh'] = {
        geoDistrict: 'LEH',
        geoState: 'LADAKH',
        geoId: geoId,
        confidence: 1,
        method: 'manual-fix',
        note: 'Fixed to match API normalization "Leh (ladakh)" → "leh"'
    };
    console.log(`  ✓ Added correct key: "ladakh:leh" (geoId: ${geoId})`);
} else {
    console.log('  ❌ LEH not found in GeoJSON');
}

// Fix 2: Add BILASPUR (Himachal Pradesh)
console.log('\nAdding BILASPUR (Himachal Pradesh)...');

const bilaspurFeature = geojsonFile.features.find(f => 
    f.properties.District === 'BILASPUR' && f.properties.STATE === 'HIMACHAL PRADESH'
);

if (bilaspurFeature) {
    const geoId = bilaspurFeature.properties.id || bilaspurFeature.properties.dt_code;
    
    if (!mappingFile.mappings['himachal pradesh:bilaspur']) {
        mappingFile.mappings['himachal pradesh:bilaspur'] = {
            geoDistrict: 'BILASPUR',
            geoState: 'HIMACHAL PRADESH',
            geoId: geoId,
            confidence: 1,
            method: 'manual-addition',
            note: 'Added missing Himachal Pradesh district'
        };
        console.log(`  ✓ Added: "himachal pradesh:bilaspur" (geoId: ${geoId})`);
    } else {
        console.log('  Already exists');
    }
} else {
    console.log('  ❌ BILASPUR not found in GeoJSON');
}

// Update metadata
mappingFile.totalMappings = Object.keys(mappingFile.mappings).length;
mappingFile.version = '4.4-leh-bilaspur-fix';
mappingFile.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mappingFile, null, 2));

console.log(`\n✅ Fixes applied`);
console.log(`📊 Total mappings: ${mappingFile.totalMappings}`);
console.log(`💾 Saved to ${mappingPath}`);

// Verify
console.log('\n=== VERIFICATION ===');
console.log('Checking "ladakh:leh":', mappingFile.mappings['ladakh:leh'] ? '✓ EXISTS' : '✗ MISSING');
console.log('Checking "himachal pradesh:bilaspur":', mappingFile.mappings['himachal pradesh:bilaspur'] ? '✓ EXISTS' : '✗ MISSING');
console.log('Checking "ladakh:leh ladakh" (should be removed):', mappingFile.mappings['ladakh:leh ladakh'] ? '✗ STILL EXISTS' : '✓ REMOVED');
