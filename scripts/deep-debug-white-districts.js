const fs = require('fs');
const path = require('path');

console.log('=== DEEP DEBUGGING WHITE DISTRICTS ===\n');

// Load all necessary files
const mappingFile = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json'),
    'utf8'
));

const geojsonFile = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../frontend/public/india-districts.geojson'),
    'utf8'
));

// Recreate the normalization function
const normalizeDistrictName = (name) => {
    if (!name) return '';
    
    return name
        .toLowerCase()
        .trim()
        // Remove content in parentheses
        .replace(/\s*\([^)]*\)/g, '')
        // Remove special characters but keep spaces and hyphens
        .replace(/[^\w\s-]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim()
        // Replace spaces with hyphens for consistency
        .replace(/\s+/g, '-')
        // Remove any trailing/leading hyphens
        .replace(/^-+|-+$/g, '');
};

console.log('✓ Loaded mapping file:', Object.keys(mappingFile.mappings).length, 'mappings');
console.log('✓ Loaded GeoJSON file:', geojsonFile.features.length, 'features');
console.log('✓ Created normalizeDistrictName function\n');

// Test the normalization function
console.log('=== TESTING NORMALIZATION ===');
const testCases = [
    'Kendujhar',
    'KEONJHAR (KENDUJHAR)',
    'Purba Bardhaman',
    'PURBA BARDDHAMAN (BARDHAMAN)',
    'Dakshin Dinajpur',
    'DAKSHIN DINAJPUR (SOUTH DINAJPUR)'
];

testCases.forEach(name => {
    console.log(`"${name}" → "${normalizeDistrictName(name)}"`);
});

console.log('\n=== CHECKING WHITE DISTRICTS FROM SCREENSHOT ===');

// Districts that appear white in the screenshot
const whiteDistricts = [
    'KEONJHAR (KENDUJHAR)',
    'PURULIYA',
    'BANKURA',
    'PURBA BARDDHAMAN (BARDHAMAN)',
    'PASCHIM BARDHAMAN (BURDWAN)',
    'BIRBHUM',
    'MURSHIDABAD',
    'NADIA',
    'PURBA MEDINIPUR (MIDNAPORE)',
    'SOUTH TWENTY FOUR PARGANAS',
    'HUGLI',
    'DAKSHIN DINAJPUR (SOUTH DINAJPUR)',
    'UTTAR DINAJPUR (NORTH DINAJPUR)',
    'KOCH BIHAR',
    'DARJILING',
    'LIPURDUAR'
];

whiteDistricts.forEach(geojsonName => {
    console.log(`\n--- ${geojsonName} ---`);
    
    // Find in GeoJSON
    const feature = geojsonFile.features.find(f => f.properties.District === geojsonName);
    if (!feature) {
        console.log('❌ NOT FOUND in GeoJSON!');
        return;
    }
    
    const state = feature.properties.STATE;
    console.log(`State: ${state}`);
    
    // Check what the mapping file expects
    const stateNorm = normalizeDistrictName(state);
    console.log(`State normalized: "${stateNorm}"`);
    
    // Try to find in mapping
    let foundInMapping = false;
    let mappingKey = null;
    
    for (const [key, value] of Object.entries(mappingFile.mappings)) {
        if (value === geojsonName) {
            foundInMapping = true;
            mappingKey = key;
            break;
        }
    }
    
    if (foundInMapping) {
        console.log(`✓ Found in mapping: "${mappingKey}"`);
        
        // Parse the key
        const [keyState, keyDistrict] = mappingKey.split(':');
        console.log(`  Key state: "${keyState}"`);
        console.log(`  Key district: "${keyDistrict}"`);
        
        // Check if the lookup would work
        const geojsonNorm = normalizeDistrictName(geojsonName);
        const lookupKey = `${stateNorm}:${geojsonNorm}`;
        console.log(`  GeoJSON lookup key would be: "${lookupKey}"`);
        console.log(`  Match: ${lookupKey === mappingKey ? '✓ YES' : '❌ NO'}`);
        
    } else {
        console.log('❌ NOT FOUND in mapping file!');
    }
});

console.log('\n=== REVERSE CHECK: MAPPING → GEOJSON ===');

// Check if all mappings can be found in GeoJSON
let mappingsWithoutGeoJSON = [];
for (const [key, geojsonName] of Object.entries(mappingFile.mappings)) {
    const feature = geojsonFile.features.find(f => f.properties.District === geojsonName);
    if (!feature) {
        mappingsWithoutGeoJSON.push({ key, geojsonName });
    }
}

if (mappingsWithoutGeoJSON.length > 0) {
    console.log(`\n❌ Found ${mappingsWithoutGeoJSON.length} mappings without GeoJSON features:`);
    mappingsWithoutGeoJSON.slice(0, 10).forEach(({ key, geojsonName }) => {
        console.log(`  ${key} → "${geojsonName}"`);
    });
} else {
    console.log('\n✓ All mappings have corresponding GeoJSON features');
}

console.log('\n=== CHECKING LOOKUP LOGIC ===');

// Simulate the frontend lookup logic
console.log('\nSimulating frontend enrichFeatureWithData logic:');

const testFeature = geojsonFile.features.find(f => f.properties.District === 'KEONJHAR (KENDUJHAR)');
if (testFeature) {
    const district = testFeature.properties.District;
    const state = testFeature.properties.STATE;
    
    console.log(`\nTest feature: ${district}, ${state}`);
    
    // This is what the frontend does
    const stateNorm = normalizeDistrictName(state);
    const districtNorm = normalizeDistrictName(district);
    const lookupKey = `${stateNorm}:${districtNorm}`;
    
    console.log(`Normalized state: "${stateNorm}"`);
    console.log(`Normalized district: "${districtNorm}"`);
    console.log(`Lookup key: "${lookupKey}"`);
    
    // Check if this key exists in mapping
    const mappedValue = mappingFile.mappings[lookupKey];
    console.log(`Mapping result: ${mappedValue ? `"${mappedValue}"` : 'NOT FOUND'}`);
    
    // Find what key actually maps to this district
    let actualKey = null;
    for (const [key, value] of Object.entries(mappingFile.mappings)) {
        if (value === district) {
            actualKey = key;
            break;
        }
    }
    
    if (actualKey) {
        console.log(`\nActual key in mapping: "${actualKey}"`);
        console.log(`Expected key: "${lookupKey}"`);
        console.log(`Match: ${actualKey === lookupKey ? '✓ YES' : '❌ NO - THIS IS THE BUG!'}`);
    }
}

console.log('\n=== SUMMARY ===');
console.log('If the lookup keys don\'t match, that\'s the bug!');
