const fs = require('fs');
const path = require('path');

console.log('=== ADDING FINAL MISSING DISTRICTS ===\n');

const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mappingFile = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
const geojsonFile = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

const districtsToAdd = [
    {
        apiState: 'Telangana',
        apiDistrict: 'Warangal',
        geoState: 'TELANGANA',
        geoDistrict: 'WARANGAL (RURAL)'
    },
    {
        apiState: 'Tamil Nadu',
        apiDistrict: 'Ranipet',
        geoState: 'TAMIL NADU',
        geoDistrict: 'RANIPPETTAI'
    },
    {
        apiState: 'Punjab',
        apiDistrict: 'Sas Nagar Mohali',
        geoState: 'PUNJAB',
        geoDistrict: 'SAS NAGAR (SAHIBZADA AJIT SINGH NAGAR)'
    }
];

const normalizeDistrictName = (name) => {
    if (!name) return '';
    let processedName = name.toLowerCase().normalize('NFC').trim();
    const parenMatch = processedName.match(/\s*\(([^)]+)\)/);
    if (parenMatch) {
        const parenContent = parenMatch[1].trim();
        if (/\b(north|south|east|west|metro|rural)\b/i.test(parenContent)) {
            processedName = processedName.replace(/\s*\([^)]*\)/, ' ' + parenContent);
        } else {
            processedName = processedName.replace(/\s*\([^)]*\)/, '');
        }
    }
    return processedName
        .replace(/\s*&\s*/g, ' and ')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-]/g, '')
        .replace(/\bdist(rict)?\b/g, '')
        .trim();
};

let addedCount = 0;

districtsToAdd.forEach(district => {
    const feature = geojsonFile.features.find(f => 
        f.properties.District === district.geoDistrict && 
        f.properties.STATE === district.geoState
    );

    if (!feature) {
        console.log(`❌ ${district.geoDistrict} not found in GeoJSON`);
        return;
    }

    const geoId = feature.properties.id || feature.properties.dt_code;
    const stateNorm = normalizeDistrictName(district.apiState);
    const districtNorm = normalizeDistrictName(district.apiDistrict);
    const key = `${stateNorm}:${districtNorm}`;

    if (mappingFile.mappings[key]) {
        console.log(`⚠️  ${key} already exists`);
        return;
    }

    mappingFile.mappings[key] = {
        geoDistrict: district.geoDistrict,
        geoState: district.geoState,
        geoId: geoId,
        confidence: 1,
        method: 'manual-addition',
        note: `API: "${district.apiDistrict}"`
    };

    console.log(`✓ Added: ${key} → ${district.geoDistrict} (geoId: ${geoId})`);
    addedCount++;
});

// Fix KUMURAM BHEEM - check if the key is correct
console.log('\n=== CHECKING KUMURAM BHEEM ===');
const kumuram = mappingFile.mappings['telangana:kumram bheemasifabad'];
if (kumuram) {
    console.log('Current mapping:', JSON.stringify(kumuram, null, 2));
    console.log('Note: This mapping exists but might not be matching in frontend');
    console.log('API has: "Kumram Bheem Asifabad" which normalizes to "kumram bheem asifabad"');
    console.log('Mapping has: "telangana:kumram bheemasifabad"');
    console.log('→ MISMATCH! Need to fix the key');
    
    // Add correct key
    const correctKey = 'telangana:kumram bheem asifabad';
    if (!mappingFile.mappings[correctKey]) {
        mappingFile.mappings[correctKey] = kumuram;
        console.log(`✓ Added correct key: "${correctKey}"`);
        addedCount++;
    }
}

// Update metadata
mappingFile.totalMappings = Object.keys(mappingFile.mappings).length;
mappingFile.version = '4.7-final-missing-districts';
mappingFile.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mappingFile, null, 2));

console.log(`\n✅ Added ${addedCount} mappings`);
console.log(`📊 Total mappings: ${mappingFile.totalMappings}`);
console.log(`💾 Saved`);
