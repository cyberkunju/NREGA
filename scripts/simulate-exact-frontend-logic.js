const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('=== SIMULATING EXACT FRONTEND LOGIC ===\n');

async function simulate() {
    // Load files EXACTLY as frontend does
    const mappingFile = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json'),
        'utf8'
    ));

    const geojsonFile = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../frontend/public/india-districts.geojson'),
        'utf8'
    ));

    const response = await axios.get('http://localhost:3001/api/performance/heatmap-data');
    const apiData = response.data;

    // EXACT normalization from frontend
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

    // Step 1: Create dataLookup from API data (EXACTLY as frontend does)
    console.log('=== STEP 1: CREATE DATA LOOKUP FROM API ===\n');
    const dataLookup = {};
    apiData.forEach(district => {
        const stateNorm = normalizeDistrictName(district.stateName);
        const districtNorm = normalizeDistrictName(district.districtName);
        const key = `${stateNorm}:${districtNorm}`;
        dataLookup[key] = district;
    });
    console.log(`Created ${Object.keys(dataLookup).length} lookup keys\n`);

    // Step 2: Test specific districts
    const testDistricts = [
        { name: 'RANIPPETTAI', state: 'TAMIL NADU' },
        { name: 'KUMURAM BHEEM', state: 'TELANGANA' },
        { name: 'WARANGAL (RURAL)', state: 'TELANGANA' },
        { name: 'SAS NAGAR (SAHIBZADA AJIT SINGH NAGAR)', state: 'PUNJAB' }
    ];

    console.log('=== STEP 2: SIMULATE FRONTEND REVERSE LOOKUP ===\n');

    for (const district of testDistricts) {
        console.log(`\n--- ${district.name} (${district.state}) ---`);
        
        // Find in GeoJSON
        const feature = geojsonFile.features.find(f => 
            f.properties.District === district.name && f.properties.STATE === district.state
        );
        
        if (!feature) {
            console.log('❌ NOT in GeoJSON');
            continue;
        }
        
        console.log('✓ Found in GeoJSON');
        
        // EXACT reverse lookup as frontend does
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === district.name && value.geoState === district.state) {
                apiKey = key;
                break;
            }
        }
        
        if (!apiKey) {
            console.log('❌ NOT found in mapping via reverse lookup');
            console.log('   Frontend will show: NO DATA');
            continue;
        }
        
        console.log(`✓ Reverse lookup found: "${apiKey}"`);
        
        // Check if this key exists in dataLookup
        if (dataLookup[apiKey]) {
            const data = dataLookup[apiKey];
            console.log(`✓ Data found in lookup!`);
            console.log(`   Payment: ${data.paymentPercentage}%`);
            console.log(`   Days: ${data.averageDays}`);
            console.log(`   Households: ${data.totalHouseholds}`);
            console.log('   Frontend will show: DATA ✓');
        } else {
            console.log(`❌ Key "${apiKey}" NOT in dataLookup`);
            console.log('   Frontend will show: NO DATA');
            
            // Debug: Find similar keys
            const similar = Object.keys(dataLookup).filter(k => 
                k.includes(apiKey.split(':')[1].substring(0, 5))
            );
            if (similar.length > 0) {
                console.log(`   Similar keys in dataLookup:`);
                similar.slice(0, 3).forEach(k => console.log(`     - "${k}"`));
            }
        }
    }

    // Step 3: Check what keys are actually in the mapping for these districts
    console.log('\n\n=== STEP 3: CHECK MAPPING FILE KEYS ===\n');
    
    console.log('Ranipet-related keys:');
    Object.keys(mappingFile.mappings).filter(k => k.includes('ranip')).forEach(k => {
        console.log(`  "${k}" → ${mappingFile.mappings[k].geoDistrict}`);
    });
    
    console.log('\nKumuram-related keys:');
    Object.keys(mappingFile.mappings).filter(k => k.includes('kumur') || k.includes('kumram')).forEach(k => {
        console.log(`  "${k}" → ${mappingFile.mappings[k].geoDistrict}`);
    });
    
    console.log('\nWarangal-related keys:');
    Object.keys(mappingFile.mappings).filter(k => k.includes('warangal')).forEach(k => {
        console.log(`  "${k}" → ${mappingFile.mappings[k].geoDistrict}`);
    });
    
    console.log('\nSas Nagar-related keys:');
    Object.keys(mappingFile.mappings).filter(k => k.includes('sas')).forEach(k => {
        console.log(`  "${k}" → ${mappingFile.mappings[k].geoDistrict}`);
    });
}

simulate().catch(console.error);
