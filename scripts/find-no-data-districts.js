const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('=== FINDING DISTRICTS WITH NO DATA (NOT MATCHED) ===\n');

async function findNoDataDistricts() {
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

    // Normalize function (matching frontend)
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

    // Create dataLookup from API data
    const dataLookup = {};
    apiData.forEach(district => {
        const stateNorm = normalizeDistrictName(district.stateName);
        const districtNorm = normalizeDistrictName(district.districtName);
        const key = `${stateNorm}:${districtNorm}`;
        dataLookup[key] = district;
    });

    console.log(`Created dataLookup with ${Object.keys(dataLookup).length} keys\n`);

    // Find districts with NO match (not in mapping or not in API data)
    const noDataDistricts = [];
    const zeroDataDistricts = [];
    const hasDataDistricts = [];

    geojsonFile.features.forEach(feature => {
        const geojsonName = feature.properties.District;
        const stateName = feature.properties.STATE;

        // Try reverse lookup via mapping
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === geojsonName && value.geoState === stateName) {
                apiKey = key;
                break;
            }
        }

        if (!apiKey) {
            // Not in mapping at all
            noDataDistricts.push({
                district: geojsonName,
                state: stateName,
                reason: 'NOT_IN_MAPPING'
            });
        } else if (!dataLookup[apiKey]) {
            // In mapping but not in API data
            noDataDistricts.push({
                district: geojsonName,
                state: stateName,
                reason: 'NOT_IN_API_DATA',
                apiKey: apiKey
            });
        } else {
            // Has data - check if it's zero
            const data = dataLookup[apiKey];
            if (data.paymentPercentage === 0 && data.averageDays === 0 && data.totalHouseholds === 0) {
                zeroDataDistricts.push({
                    district: geojsonName,
                    state: stateName,
                    apiKey: apiKey
                });
            } else {
                hasDataDistricts.push({
                    district: geojsonName,
                    state: stateName,
                    payment: data.paymentPercentage
                });
            }
        }
    });

    console.log('=== DISTRICTS WITH NO DATA (NOT MATCHED) ===\n');
    console.log(`Total: ${noDataDistricts.length} districts\n`);

    // Group by state
    const byState = {};
    noDataDistricts.forEach(d => {
        if (!byState[d.state]) byState[d.state] = [];
        byState[d.state].push(d);
    });

    Object.keys(byState).sort().forEach(state => {
        console.log(`\n${state} (${byState[state].length} districts):`);
        byState[state].forEach(d => {
            console.log(`  - ${d.district}`);
            console.log(`    Reason: ${d.reason}`);
            if (d.apiKey) console.log(`    API Key: ${d.apiKey}`);
        });
    });

    console.log('\n\n=== DISTRICTS WITH 0% DATA (MATCHED BUT ZERO) ===\n');
    console.log(`Total: ${zeroDataDistricts.length} districts\n`);

    const zeroByState = {};
    zeroDataDistricts.forEach(d => {
        if (!zeroByState[d.state]) zeroByState[d.state] = [];
        zeroByState[d.state].push(d);
    });

    Object.keys(zeroByState).sort().forEach(state => {
        console.log(`\n${state} (${zeroByState[state].length} districts):`);
        zeroByState[state].forEach(d => {
            console.log(`  - ${d.district}`);
        });
    });

    console.log('\n\n=== SUMMARY ===');
    console.log(`Districts with NO DATA (not matched): ${noDataDistricts.length}`);
    console.log(`Districts with 0% data (matched): ${zeroDataDistricts.length}`);
    console.log(`Districts with >0% data: ${hasDataDistricts.length}`);
    console.log(`Total GeoJSON features: ${geojsonFile.features.length}`);
    console.log(`\nMatch rate: ${((hasDataDistricts.length + zeroDataDistricts.length) / geojsonFile.features.length * 100).toFixed(2)}%`);

    // Check the specific districts from the screenshot
    console.log('\n\n=== CHECKING SCREENSHOT DISTRICTS ===');
    const screenshotDistricts = [
        'BALRAMPUR',
        'HAMIRPUR',
        'RAIBAREILLY',
        'PRATAPGARH',
        'KAIMUR'
    ];

    screenshotDistricts.forEach(name => {
        const found = noDataDistricts.find(d => d.district === name) ||
                     zeroDataDistricts.find(d => d.district === name) ||
                     hasDataDistricts.find(d => d.district === name);
        
        if (!found) {
            console.log(`\n${name}: NOT FOUND IN GEOJSON`);
        } else if (noDataDistricts.find(d => d.district === name)) {
            const d = noDataDistricts.find(d => d.district === name);
            console.log(`\n${name} (${d.state}): NO DATA - ${d.reason}`);
        } else if (zeroDataDistricts.find(d => d.district === name)) {
            const d = zeroDataDistricts.find(d => d.district === name);
            console.log(`\n${name} (${d.state}): 0% DATA (matched but zero)`);
        } else {
            const d = hasDataDistricts.find(d => d.district === name);
            console.log(`\n${name} (${d.state}): HAS DATA (${d.payment}%)`);
        }
    });
}

findNoDataDistricts().catch(console.error);
