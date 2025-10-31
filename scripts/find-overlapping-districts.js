const fs = require('fs');
const path = require('path');

console.log('=== FINDING OVERLAPPING/DUPLICATE DISTRICTS ===\n');

const geojsonFile = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../frontend/public/india-districts.geojson'),
    'utf8'
));

console.log(`Total features: ${geojsonFile.features.length}\n`);

// Find districts with same name in same state (duplicates)
const districtMap = {};
const duplicates = [];

geojsonFile.features.forEach((feature, index) => {
    const district = feature.properties.District;
    const state = feature.properties.STATE;
    const key = `${district}|${state}`;
    
    if (!districtMap[key]) {
        districtMap[key] = [];
    }
    districtMap[key].push({
        index,
        district,
        state,
        geoId: feature.properties.id || feature.properties.dt_code,
        layer: feature.properties.layer,
        fullName: feature.properties.FULL_NAME,
        coordCount: feature.geometry.coordinates[0]?.length || 0
    });
});

// Find duplicates
Object.entries(districtMap).forEach(([key, features]) => {
    if (features.length > 1) {
        duplicates.push({ key, features });
    }
});

console.log(`=== DUPLICATE DISTRICTS (Same name in same state) ===`);
console.log(`Found ${duplicates.length} duplicates\n`);

duplicates.forEach(({ key, features }) => {
    const [district, state] = key.split('|');
    console.log(`\n${district} (${state}) - ${features.length} copies:`);
    features.forEach(f => {
        console.log(`  [${f.index}] geoId: ${f.geoId}, layer: ${f.layer}, coords: ${f.coordCount}, fullName: ${f.fullName}`);
    });
});

// Check for districts with very high coordinate counts (detailed boundaries)
console.log('\n\n=== DISTRICTS WITH DETAILED BOUNDARIES (>1000 coords) ===\n');

const detailedDistricts = [];
geojsonFile.features.forEach((feature, index) => {
    const coordCount = feature.geometry.coordinates[0]?.length || 0;
    if (coordCount > 1000) {
        detailedDistricts.push({
            index,
            district: feature.properties.District,
            state: feature.properties.STATE,
            geoId: feature.properties.id || feature.properties.dt_code,
            coordCount,
            layer: feature.properties.layer
        });
    }
});

console.log(`Found ${detailedDistricts.length} districts with >1000 coordinates:\n`);
detailedDistricts.slice(0, 20).forEach(d => {
    console.log(`  [${d.index}] ${d.district} (${d.state}) - ${d.coordCount} coords, layer: ${d.layer}`);
});

// Check the specific districts from screenshot
console.log('\n\n=== CHECKING SPECIFIC DISTRICTS FROM SCREENSHOT ===\n');

const checkDistricts = [
    'BALGARH',
    'SATI',
    'BEMEHARA',
    'MAHENDRAGARH CHIKNI BHARATPUR',
    'KORBA MANPUR AMBAGARH CHOWKI'
];

checkDistricts.forEach(name => {
    const matches = geojsonFile.features.filter(f => 
        f.properties.District === name || 
        f.properties.District?.includes(name) ||
        name.includes(f.properties.District || '')
    );
    
    console.log(`\n${name}:`);
    if (matches.length === 0) {
        console.log('  NOT FOUND in GeoJSON');
    } else {
        matches.forEach((f, i) => {
            const coordCount = f.geometry.coordinates[0]?.length || 0;
            console.log(`  [${i}] ${f.properties.District} (${f.properties.STATE})`);
            console.log(`      geoId: ${f.properties.id || f.properties.dt_code}, coords: ${coordCount}, layer: ${f.properties.layer}`);
        });
    }
});

console.log('\n\n=== RECOMMENDATION ===');
if (duplicates.length > 0) {
    console.log('You have duplicate districts in your GeoJSON file.');
    console.log('These duplicates are causing overlapping boundaries.');
    console.log('\nTo fix: Remove duplicate features, keeping only one per district.');
    console.log('Prefer features with:');
    console.log('  1. layer = "Dist_bnd_rename" (original boundaries)');
    console.log('  2. Lower coordinate counts (simpler, faster rendering)');
    console.log('  3. Non-null geoIds');
}
