const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('=== COMPREHENSIVE VERIFICATION OF ALL WHITE DISTRICTS ===\n');

async function verify() {
    // Load files
    const mappingFile = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json'),
        'utf8'
    ));

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

    // Create dataLookup from API data
    const dataLookup = {};
    apiData.forEach(district => {
        const stateNorm = normalizeDistrictName(district.stateName);
        const districtNorm = normalizeDistrictName(district.districtName);
        const key = `${stateNorm}:${districtNorm}`;
        dataLookup[key] = district;
    });

    // Districts from screenshots
    const whiteDistricts = [
        // Screenshot 1 (J&K/Ladakh area)
        { name: 'MUZAFFARABAD', state: 'JAMMU AND KASHMIR' },
        { name: 'MIRPUR', state: 'JAMMU AND KASHMIR' },
        { name: 'LEH', state: 'LADAKH' },
        
        // Screenshot 2 (Himachal/Punjab area)
        { name: 'BILASPUR', state: 'HIMACHAL PRADESH' },
        { name: 'CHANDIGARH', state: 'CHANDIGARH' },
        
        // Screenshot 3 (Delhi)
        { name: 'NORTH', state: 'DELHI' },
        { name: 'NORTH WEST', state: 'DELHI' },
        { name: 'WEST', state: 'DELHI' },
        { name: 'SOUTH WEST', state: 'DELHI' },
        { name: 'SOUTH', state: 'DELHI' },
        { name: 'SOUTH EAST', state: 'DELHI' },
        { name: 'CENTRAL', state: 'DELHI' },
        { name: 'EAST', state: 'DELHI' },
        { name: 'NORTH EAST', state: 'DELHI' },
        { name: 'NEW DELHI', state: 'DELHI' },
        { name: 'SHAHADRA', state: 'DELHI' }
    ];

    console.log('=== CHECKING WHITE DISTRICTS ===\n');

    const results = {
        notInGeoJSON: [],
        notInMapping: [],
        notInAPI: [],
        hasData: [],
        hasZeroData: []
    };

    for (const district of whiteDistricts) {
        console.log(`\n--- ${district.name} (${district.state}) ---`);
        
        // Check GeoJSON
        const feature = geojsonFile.features.find(f => 
            f.properties.District === district.name && 
            f.properties.STATE === district.state
        );
        
        if (!feature) {
            console.log('❌ NOT IN GEOJSON');
            results.notInGeoJSON.push(district);
            continue;
        }
        
        console.log('✓ Found in GeoJSON');
        
        // Check mapping (reverse lookup)
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === district.name && value.geoState === district.state) {
                apiKey = key;
                break;
            }
        }
        
        if (!apiKey) {
            console.log('❌ NOT IN MAPPING');
            results.notInMapping.push(district);
            continue;
        }
        
        console.log(`✓ Found in mapping: "${apiKey}"`);
        
        // Check API data
        if (!dataLookup[apiKey]) {
            console.log('❌ NOT IN API DATA');
            results.notInAPI.push({ ...district, apiKey });
            
            // Try to find similar districts in API
            const statePart = apiKey.split(':')[0];
            const districtPart = apiKey.split(':')[1];
            const similar = Object.keys(dataLookup).filter(k => 
                k.startsWith(statePart) && k.includes(districtPart.substring(0, 5))
            );
            if (similar.length > 0) {
                console.log('  Similar keys in API:', similar.slice(0, 3));
            }
            continue;
        }
        
        const data = dataLookup[apiKey];
        if (data.paymentPercentage === 0 && data.averageDays === 0 && data.totalHouseholds === 0) {
            console.log(`⚠️  HAS ZERO DATA (matched but all zeros)`);
            results.hasZeroData.push({ ...district, apiKey });
        } else {
            console.log(`✓ HAS DATA: ${data.paymentPercentage}%, ${data.averageDays} days, ${data.totalHouseholds} households`);
            results.hasData.push({ ...district, apiKey, data });
        }
    }

    console.log('\n\n=== SUMMARY ===');
    console.log(`\nNot in GeoJSON: ${results.notInGeoJSON.length}`);
    results.notInGeoJSON.forEach(d => console.log(`  - ${d.name} (${d.state})`));
    
    console.log(`\nNot in Mapping: ${results.notInMapping.length}`);
    results.notInMapping.forEach(d => console.log(`  - ${d.name} (${d.state})`));
    
    console.log(`\nNot in API Data: ${results.notInAPI.length}`);
    results.notInAPI.forEach(d => console.log(`  - ${d.name} (${d.state}) - Key: "${d.apiKey}"`));
    
    console.log(`\nHas Zero Data: ${results.hasZeroData.length}`);
    results.hasZeroData.forEach(d => console.log(`  - ${d.name} (${d.state})`));
    
    console.log(`\nHas Real Data (should be colored!): ${results.hasData.length}`);
    results.hasData.forEach(d => console.log(`  - ${d.name} (${d.state}) - ${d.data.paymentPercentage}%`));

    // Check if these districts are in the government API at all
    console.log('\n\n=== CHECKING IF DISTRICTS EXIST IN GOVERNMENT API ===');
    
    for (const district of results.notInAPI) {
        const stateNorm = normalizeDistrictName(district.state);
        const districtNorm = normalizeDistrictName(district.name);
        
        // Search in API data
        const found = apiData.find(d => 
            normalizeDistrictName(d.stateName) === stateNorm &&
            normalizeDistrictName(d.districtName).includes(districtNorm.substring(0, 5))
        );
        
        if (found) {
            console.log(`\n${district.name} (${district.state}):`);
            console.log(`  Found in API as: "${found.districtName}" (${found.stateName})`);
            console.log(`  API key would be: "${normalizeDistrictName(found.stateName)}:${normalizeDistrictName(found.districtName)}"`);
            console.log(`  Mapping has: "${district.apiKey}"`);
            console.log(`  → MISMATCH!`);
        } else {
            console.log(`\n${district.name} (${district.state}): NOT IN GOVERNMENT API`);
            console.log(`  This district is not covered by MGNREGA program`);
        }
    }
}

verify().catch(console.error);
