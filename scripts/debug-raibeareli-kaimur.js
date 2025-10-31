const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('=== DEBUGGING RAIBEARELI & KAIMUR ===\n');

async function debug() {
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

    // Create dataLookup from API data
    const dataLookup = {};
    apiData.forEach(district => {
        const stateNorm = normalizeDistrictName(district.stateName);
        const districtNorm = normalizeDistrictName(district.districtName);
        const key = `${stateNorm}:${districtNorm}`;
        dataLookup[key] = district;
    });

    // Test RAIBEARELI
    console.log('=== RAIBEARELI ===\n');
    
    const raibeareliFeature = geojsonFile.features.find(f => 
        f.properties.District === 'RAIBEARELI' && f.properties.STATE === 'UTTAR PRADESH'
    );
    
    if (raibeareliFeature) {
        console.log('GeoJSON Feature:');
        console.log('  District:', raibeareliFeature.properties.District);
        console.log('  State:', raibeareliFeature.properties.STATE);
        console.log('  geoId:', raibeareliFeature.properties.id || raibeareliFeature.properties.dt_code);
        
        // Check mapping
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === 'RAIBEARELI' && value.geoState === 'UTTAR PRADESH') {
                apiKey = key;
                break;
            }
        }
        
        console.log('\nMapping:');
        console.log('  API Key:', apiKey || 'NOT FOUND');
        if (apiKey) {
            console.log('  Mapping:', JSON.stringify(mappingFile.mappings[apiKey], null, 2));
        }
        
        // Check API data
        console.log('\nAPI Data:');
        const apiDistricts = apiData.filter(d => 
            d.districtName.toLowerCase().includes('rae') || 
            d.districtName.toLowerCase().includes('rai')
        );
        console.log('  Found', apiDistricts.length, 'matching districts:');
        apiDistricts.forEach(d => {
            const key = `${normalizeDistrictName(d.stateName)}:${normalizeDistrictName(d.districtName)}`;
            console.log(`    - "${d.districtName}" (${d.stateName}) → key: "${key}"`);
        });
        
        // Check dataLookup
        if (apiKey) {
            console.log('\nDataLookup:');
            console.log('  Key exists:', !!dataLookup[apiKey]);
            if (dataLookup[apiKey]) {
                console.log('  Data:', {
                    payment: dataLookup[apiKey].paymentPercentage,
                    days: dataLookup[apiKey].averageDays,
                    households: dataLookup[apiKey].totalHouseholds
                });
            }
        }
    } else {
        console.log('❌ RAIBEARELI not found in GeoJSON');
    }

    // Test KAIMUR
    console.log('\n\n=== KAIMUR ===\n');
    
    const kaimurFeature = geojsonFile.features.find(f => 
        f.properties.District === 'KAIMUR' && f.properties.STATE === 'BIHAR'
    );
    
    if (kaimurFeature) {
        console.log('GeoJSON Feature:');
        console.log('  District:', kaimurFeature.properties.District);
        console.log('  State:', kaimurFeature.properties.STATE);
        console.log('  geoId:', kaimurFeature.properties.id || kaimurFeature.properties.dt_code);
        
        // Check mapping
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === 'KAIMUR' && value.geoState === 'BIHAR') {
                apiKey = key;
                break;
            }
        }
        
        console.log('\nMapping:');
        console.log('  API Key:', apiKey || 'NOT FOUND');
        if (apiKey) {
            console.log('  Mapping:', JSON.stringify(mappingFile.mappings[apiKey], null, 2));
        }
        
        // Check API data
        console.log('\nAPI Data:');
        const apiDistricts = apiData.filter(d => 
            d.districtName.toLowerCase().includes('kaimur')
        );
        console.log('  Found', apiDistricts.length, 'matching districts:');
        apiDistricts.forEach(d => {
            const key = `${normalizeDistrictName(d.stateName)}:${normalizeDistrictName(d.districtName)}`;
            console.log(`    - "${d.districtName}" (${d.stateName}) → key: "${key}"`);
        });
        
        // Check dataLookup
        if (apiKey) {
            console.log('\nDataLookup:');
            console.log('  Key exists:', !!dataLookup[apiKey]);
            if (dataLookup[apiKey]) {
                console.log('  Data:', {
                    payment: dataLookup[apiKey].paymentPercentage,
                    days: dataLookup[apiKey].averageDays,
                    households: dataLookup[apiKey].totalHouseholds
                });
            }
        }
        
        // Check all bihar:kaimur* keys
        console.log('\nAll Kaimur-related keys in mapping:');
        Object.keys(mappingFile.mappings).filter(k => k.includes('kaimur')).forEach(k => {
            console.log(`  - "${k}"`);
        });
        
        console.log('\nAll Kaimur-related keys in dataLookup:');
        Object.keys(dataLookup).filter(k => k.includes('kaimur')).forEach(k => {
            console.log(`  - "${k}"`);
        });
    } else {
        console.log('❌ KAIMUR not found in GeoJSON');
    }
}

debug().catch(console.error);
