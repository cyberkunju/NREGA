const fs = require('fs');
const path = require('path');

console.log('=== ADDING MISSING UP & BIHAR DISTRICTS TO MAPPING ===\n');

// Load files
const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mappingFile = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
const geojsonFile = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Districts to add
const districtsToAdd = [
    {
        apiState: 'Uttar Pradesh',
        apiDistrict: 'Balrampur',
        geoState: 'UTTAR PRADESH',
        geoDistrict: 'BALRAMPUR'
    },
    {
        apiState: 'Uttar Pradesh',
        apiDistrict: 'Hamirpur',
        geoState: 'UTTAR PRADESH',
        geoDistrict: 'HAMIRPUR'
    },
    {
        apiState: 'Uttar Pradesh',
        apiDistrict: 'Pratapgarh',
        geoState: 'UTTAR PRADESH',
        geoDistrict: 'PRATAPGARH'
    },
    {
        apiState: 'Uttar Pradesh',
        apiDistrict: 'Raebareli',  // API spelling
        geoState: 'UTTAR PRADESH',
        geoDistrict: 'RAIBEARELI'  // GeoJSON spelling
    }
];

// Normalize function
const normalizeDistrictName = (name) => {
    if (!name) return '';

    let processedName = name.toLowerCase().normalize('NFC').trim();
    
    const parenMatch = processedName.match(/\s*\(([^)]+)\)/);
    if (parenMatch) {
        const parenContent = parenMatch[1].trim();
        if (/\b(north|south|east|west)\b/i.test(parenContent)) {
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
    // Find geoId from GeoJSON
    const feature = geojsonFile.features.find(f => 
        f.properties.District === district.geoDistrict && 
        f.properties.STATE === district.geoState
    );

    if (!feature) {
        console.log(`❌ Could not find ${district.geoDistrict} in GeoJSON`);
        return;
    }

    const geoId = feature.properties.id || feature.properties.dt_code;
    
    // Create mapping key
    const stateNorm = normalizeDistrictName(district.apiState);
    const districtNorm = normalizeDistrictName(district.apiDistrict);
    const key = `${stateNorm}:${districtNorm}`;

    // Check if already exists
    if (mappingFile.mappings[key]) {
        console.log(`⚠️  ${key} already exists in mapping`);
        return;
    }

    // Add to mapping
    mappingFile.mappings[key] = {
        geoDistrict: district.geoDistrict,
        geoState: district.geoState,
        geoId: geoId,
        confidence: 1,
        method: 'manual-addition',
        note: 'Added to fix missing UP/Bihar districts'
    };

    console.log(`✓ Added: ${key} → ${district.geoDistrict} (geoId: ${geoId})`);
    addedCount++;
});

// Fix Kaimur - it's in mapping but with wrong API name
const kaimurKey = 'bihar:kaimur bhabua';
if (mappingFile.mappings[kaimurKey]) {
    console.log(`\n⚠️  Found Kaimur with key "${kaimurKey}"`);
    console.log(`   This won't match API data which has "Kaimur (bhabua)"`);
    
    // The API normalizes "Kaimur (bhabua)" to "kaimur"
    const correctKey = 'bihar:kaimur';
    
    if (!mappingFile.mappings[correctKey]) {
        mappingFile.mappings[correctKey] = mappingFile.mappings[kaimurKey];
        mappingFile.mappings[correctKey].note = 'Fixed from "kaimur bhabua" to match API normalization';
        console.log(`✓ Added correct key: "${correctKey}"`);
        addedCount++;
    }
}

// Update metadata
mappingFile.totalMappings = Object.keys(mappingFile.mappings).length;
mappingFile.version = '4.2-up-bihar-fix';
mappingFile.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mappingFile, null, 2));

console.log(`\n✅ Added ${addedCount} mappings`);
console.log(`📊 Total mappings: ${mappingFile.totalMappings}`);
console.log(`💾 Saved to ${mappingPath}`);
