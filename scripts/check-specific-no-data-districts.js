const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('=== CHECKING SPECIFIC NO DATA DISTRICTS ===\n');

async function check() {
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

    const districtsToCheck = [
        { name: 'KUMURAM BHEEM', state: 'TELANGANA' },
        { name: 'WARANGAL (RURAL)', state: 'TELANGANA' },
        { name: 'RANIPPETTAI', state: 'TAMIL NADU' },
        { name: 'CHENNAI', state: 'TAMIL NADU' },
        { name: 'MUMBAI CITY', state: 'MAHARASHTRA' },
        { name: 'SUB URBAN MUMBAI', state: 'MAHARASHTRA' },
        { name: 'SAS NAGAR (SAHIBZADA AJIT SINGH NAGAR)', state: 'PUNJAB' },
        { name: 'CHANDIGARH', state: 'CHANDIGARH' }
    ];

    for (const district of districtsToCheck) {
        console.log(`\n=== ${district.name} (${district.state}) ===`);
        
        // Check GeoJSON
        const feature = geojsonFile.features.find(f => 
            f.properties.District === district.name && f.properties.STATE === district.state
        );
        
        if (!feature) {
            console.log('❌ NOT in GeoJSON');
            continue;
        }
        console.log('✓ Found in GeoJSON');
        
        // Check mapping
        let apiKey = null;
        for (const [key, value] of Object.entries(mappingFile.mappings)) {
            if (value.geoDistrict === district.name && value.geoState === district.state) {
                apiKey = key;
                break;
            }
        }
        
        if (!apiKey) {
            console.log('❌ NOT in mapping');
            
            // Search for similar in API
            const stateNorm = normalizeDistrictName(district.state);
            const similar = apiData.filter(d => 
                normalizeDistrictName(d.stateName) === stateNorm &&
                (d.districtName.toLowerCase().includes(district.name.toLowerCase().substring(0, 5)) ||
                 district.name.toLowerCase().includes(d.districtName.toLowerCase().substring(0, 5)))
            );
            
            if (similar.length > 0) {
                console.log(`\n  Found ${similar.length} similar in API:`);
                similar.forEach(d => {
                    const key = `${normalizeDistrictName(d.stateName)}:${normalizeDistrictName(d.districtName)}`;
                    console.log(`    - "${d.districtName}" → key: "${key}"`);
                    console.log(`      Payment: ${d.paymentPercentage}%, Days: ${d.averageDays}, Households: ${d.totalHouseholds}`);
                });
            } else {
                console.log('  No similar districts found in API');
                console.log('  → This district is NOT in MGNREGA program');
            }
        } else {
            console.log(`✓ Found in mapping: "${apiKey}"`);
            console.log('  → Should be showing data! Check browser console for errors');
        }
    }
}

check().catch(console.error);
