const fs = require('fs');
const path = require('path');

console.log('=== FIXING KAMRUP WITH METRO PRESERVED ===\n');

const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mappingFile = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
const geojsonFile = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Now that normalization preserves "metro", we need to update the mapping
// API has "Kamrup (metro)" which will now normalize to "kamrup metro"

const kamrupMetroFeature = geojsonFile.features.find(f => 
    f.properties.District === 'KAMRUP METRO' && f.properties.STATE === 'ASSAM'
);

if (kamrupMetroFeature) {
    const geoId = kamrupMetroFeature.properties.id || kamrupMetroFeature.properties.dt_code;
    
    // With updated normalization, "Kamrup (metro)" → "kamrup metro"
    const key = 'assam:kamrup metro';
    
    mappingFile.mappings[key] = {
        geoDistrict: 'KAMRUP METRO',
        geoState: 'ASSAM',
        geoId: geoId,
        confidence: 1,
        method: 'manual-fix',
        note: 'Fixed with updated normalization that preserves "metro" in parentheses'
    };
    console.log(`✓ Added/Updated: "${key}" (geoId: ${geoId})`);
} else {
    console.log('❌ KAMRUP METRO not found in GeoJSON');
}

// Also check if KAMRUP RURAL needs updating
const kamrupRuralFeature = geojsonFile.features.find(f => 
    f.properties.District === 'KAMRUP RURAL' && f.properties.STATE === 'ASSAM'
);

if (kamrupRuralFeature) {
    const geoId = kamrupRuralFeature.properties.id || kamrupRuralFeature.properties.dt_code;
    
    // Check if "assam:kamrup" exists and points to KAMRUP RURAL
    if (mappingFile.mappings['assam:kamrup']) {
        console.log(`\n✓ "assam:kamrup" already exists`);
        console.log(`  Points to: ${mappingFile.mappings['assam:kamrup'].geoDistrict}`);
        
        if (mappingFile.mappings['assam:kamrup'].geoDistrict !== 'KAMRUP RURAL') {
            console.log(`  ⚠️  Updating to point to KAMRUP RURAL`);
            mappingFile.mappings['assam:kamrup'].geoDistrict = 'KAMRUP RURAL';
            mappingFile.mappings['assam:kamrup'].geoState = 'ASSAM';
            mappingFile.mappings['assam:kamrup'].geoId = geoId;
        }
    }
} else {
    console.log('\n⚠️  KAMRUP RURAL not found in GeoJSON');
}

// Update metadata
mappingFile.totalMappings = Object.keys(mappingFile.mappings).length;
mappingFile.version = '4.6-kamrup-metro-fix';
mappingFile.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mappingFile, null, 2));

console.log(`\n✅ Kamrup Metro fixed`);
console.log(`📊 Total mappings: ${mappingFile.totalMappings}`);
console.log(`💾 Saved to ${mappingPath}`);
