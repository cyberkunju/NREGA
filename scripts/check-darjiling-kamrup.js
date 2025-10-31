const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('=== CHECKING DARJILING & KAMRUP METRO ===\n');

async function check() {
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
    const response = await axios.get('http://localhost:3001/api/performance/heatmap-data');
    const apiData = response.data;

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

    // Create dataLookup
    const dataLookup = {};
    apiData.forEach(district => {
        const stateNorm = normalizeDistrictName(district.stateName);
        const districtNorm = normalizeDistrictName(district.districtName);
        const key = `${stateNorm}:${districtNorm}`;
        dataLookup[key] = district;
    });

    // Check DARJILING
    console.log('=== DARJILING (West Bengal) ===\n');
    
    const darjilingFeature = geojsonFile.features.find(f => 
        f.properties.District === 'DARJILING' && f.properties.STATE === 'WEST BENGAL'
    );
    
    if (darjilingFeature) {
        console.log('✓ Found in GeoJSON');
        console.log('  District:', darjilingFeature.properties.District);
        console.log('  State:', darjilingFeature.properties.STATE);
        
        // Check mapping
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === 'DARJILING' && value.geoState === 'WEST BENGAL') {
                apiKey = key;
                break;
            }
        }
        
        if (apiKey) {
            console.log(`✓ Found in mapping: "${apiKey}"`);
            console.log('  Mapping:', JSON.stringify(mappingFile.mappings[apiKey], null, 2));
            
            if (dataLookup[apiKey]) {
                const data = dataLookup[apiKey];
                console.log('✓ Found in API data');
                console.log('  Payment:', data.paymentPercentage + '%');
                console.log('  Days:', data.averageDays);
                console.log('  Households:', data.totalHouseholds);
            } else {
                console.log('❌ NOT in API data');
            }
        } else {
            console.log('❌ NOT in mapping');
        }
        
        // Search for similar in API
        console.log('\nSearching API for Darjiling/Darjeeling...');
        const similar = apiData.filter(d => 
            d.districtName.toLowerCase().includes('darj') && 
            normalizeDistrictName(d.stateName) === 'west bengal'
        );
        console.log(`Found ${similar.length} matches:`);
        similar.forEach(d => {
            const key = `${normalizeDistrictName(d.stateName)}:${normalizeDistrictName(d.districtName)}`;
            console.log(`  - "${d.districtName}" → key: "${key}"`);
        });
    } else {
        console.log('❌ NOT in GeoJSON');
    }

    // Check KAMRUP METRO
    console.log('\n\n=== KAMRUP METRO (Assam) ===\n');
    
    const kamrupFeature = geojsonFile.features.find(f => 
        f.properties.District === 'KAMRUP METRO' && f.properties.STATE === 'ASSAM'
    );
    
    if (kamrupFeature) {
        console.log('✓ Found in GeoJSON');
        console.log('  District:', kamrupFeature.properties.District);
        console.log('  State:', kamrupFeature.properties.STATE);
        
        // Check mapping
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === 'KAMRUP METRO' && value.geoState === 'ASSAM') {
                apiKey = key;
                break;
            }
        }
        
        if (apiKey) {
            console.log(`✓ Found in mapping: "${apiKey}"`);
            console.log('  Mapping:', JSON.stringify(mappingFile.mappings[apiKey], null, 2));
            
            if (dataLookup[apiKey]) {
                const data = dataLookup[apiKey];
                console.log('✓ Found in API data');
                console.log('  Payment:', data.paymentPercentage + '%');
                console.log('  Days:', data.averageDays);
                console.log('  Households:', data.totalHouseholds);
            } else {
                console.log('❌ NOT in API data');
            }
        } else {
            console.log('❌ NOT in mapping');
        }
        
        // Search for similar in API
        console.log('\nSearching API for Kamrup...');
        const similar = apiData.filter(d => 
            d.districtName.toLowerCase().includes('kamrup') && 
            normalizeDistrictName(d.stateName) === 'assam'
        );
        console.log(`Found ${similar.length} matches:`);
        similar.forEach(d => {
            const key = `${normalizeDistrictName(d.stateName)}:${normalizeDistrictName(d.districtName)}`;
            console.log(`  - "${d.districtName}" → key: "${key}"`);
        });
    } else {
        console.log('❌ NOT in GeoJSON');
    }

    // Check all mapping keys for these
    console.log('\n\n=== ALL RELATED KEYS IN MAPPING ===');
    console.log('\nDarjiling-related:');
    Object.keys(mappingFile.mappings).filter(k => k.includes('darj')).forEach(k => {
        console.log(`  - "${k}" → ${mappingFile.mappings[k].geoDistrict}`);
    });
    
    console.log('\nKamrup-related:');
    Object.keys(mappingFile.mappings).filter(k => k.includes('kamrup')).forEach(k => {
        console.log(`  - "${k}" → ${mappingFile.mappings[k].geoDistrict}`);
    });
}

check().catch(console.error);
