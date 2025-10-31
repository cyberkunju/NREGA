const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('=== TESTING FRONTEND LOOKUP LOGIC ===\n');

async function test() {
    // Load mapping file
    const mappingFile = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json'),
        'utf8'
    ));

    // Load GeoJSON
    const geojsonFile = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../frontend/public/india-districts.geojson'),
        'utf8'
    ));

    // Fetch API data
    console.log('Fetching API data...');
    const response = await axios.get('http://localhost:3001/api/performance/heatmap-data');
    const apiData = response.data;
    
    console.log(`✓ API returned ${apiData.length} districts`);
    console.log(`✓ Mapping has ${Object.keys(mappingFile.mappings).length} entries`);
    console.log(`✓ GeoJSON has ${geojsonFile.features.length} features\n`);

    // Simulate the frontend logic
    // Step 1: Create dataLookup from API data
    const normalizeDistrictName = (name) => {
        if (!name) return '';

        let processedName = name.toLowerCase().normalize('NFC').trim();
        
        // Handle parentheses intelligently
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

    const dataLookup = {};
    apiData.forEach(district => {
        const stateNorm = normalizeDistrictName(district.stateName);
        const districtNorm = normalizeDistrictName(district.districtName);
        const key = `${stateNorm}:${districtNorm}`;
        dataLookup[key] = district;
    });

    console.log(`Created dataLookup with ${Object.keys(dataLookup).length} keys\n`);

    // Step 2: Test reverse lookup for sample districts
    const testDistricts = [
        'KEONJHAR (KENDUJHAR)',
        'PURULIYA',
        'BANKURA',
        'BIRBHUM',
        'MURSHIDABAD'
    ];

    console.log('=== TESTING REVERSE LOOKUP ===\n');

    let successCount = 0;
    let failCount = 0;

    testDistricts.forEach(geojsonName => {
        const feature = geojsonFile.features.find(f => f.properties.District === geojsonName);
        if (!feature) {
            console.log(`❌ ${geojsonName}: NOT IN GEOJSON`);
            failCount++;
            return;
        }

        const stateName = feature.properties.STATE;

        // Simulate the new reverse lookup logic
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === geojsonName && value.geoState === stateName) {
                apiKey = key;
                break;
            }
        }

        if (apiKey && dataLookup[apiKey]) {
            const data = dataLookup[apiKey];
            console.log(`✓ ${geojsonName} (${stateName})`);
            console.log(`  API key: "${apiKey}"`);
            console.log(`  Payment: ${data.paymentPercentage}%`);
            console.log(`  Days: ${data.averageDays}`);
            console.log(`  Households: ${data.totalHouseholds}`);
            successCount++;
        } else {
            console.log(`❌ ${geojsonName} (${stateName})`);
            console.log(`  API key: ${apiKey || 'NOT FOUND IN MAPPING'}`);
            console.log(`  Data: ${apiKey ? 'NOT FOUND IN LOOKUP' : 'N/A'}`);
            failCount++;
        }
        console.log();
    });

    console.log(`\n=== SUMMARY ===`);
    console.log(`Success: ${successCount}/${testDistricts.length}`);
    console.log(`Failed: ${failCount}/${testDistricts.length}`);

    // Count overall matches
    let totalMatches = 0;
    let totalNoMatches = 0;

    geojsonFile.features.forEach(feature => {
        const geojsonName = feature.properties.District;
        const stateName = feature.properties.STATE;

        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === geojsonName && value.geoState === stateName) {
                apiKey = key;
                break;
            }
        }

        if (apiKey && dataLookup[apiKey]) {
            totalMatches++;
        } else {
            totalNoMatches++;
        }
    });

    console.log(`\n=== OVERALL STATS ===`);
    console.log(`GeoJSON features with data: ${totalMatches}/${geojsonFile.features.length} (${(totalMatches/geojsonFile.features.length*100).toFixed(2)}%)`);
    console.log(`GeoJSON features without data: ${totalNoMatches}`);
}

test().catch(console.error);
