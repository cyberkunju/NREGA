const fs = require('fs');
const path = require('path');

const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

const targets = [
  { name: 'HOSHANGABAD', state: 'MADHYA PRADESH' },
  { name: 'AURANGABAD', state: 'MAHARASHTRA' },
  { name: 'OSMANABAD', state: 'MAHARASHTRA' },
  { name: 'KABIRDHAM', state: 'CHHATTISGARH' },
  { name: 'PUDUCHERRY', state: 'PUDUCHERRY' },
  { name: 'SHAHID BHAGAT SINGH NAGAR', state: 'PUNJAB' },
  { name: 'RUPNAGAR', state: 'PUNJAB' },
  { name: 'BID', state: 'MAHARASHTRA' },
  { name: 'BAUDH', state: 'ODISHA' },
  { name: 'SRI MUKTSAR SAHIB', state: 'PUNJAB' },
  { name: 'RAEBARELI', state: 'UTTAR PRADESH' },
  { name: 'TUTICORIN', state: 'TAMIL NADU' },
  { name: 'KOMARAM BHEEM ASIFABAD', state: 'TELANGANA' },
  { name: 'NARSIMHAPUR', state: 'MADHYA PRADESH' },
  { name: 'PUNCH', state: 'JAMMU AND KASHMIR' },
  { name: 'DAHOD', state: 'GUJARAT' },
  { name: 'EAST NIMAR', state: 'MADHYA PRADESH' },
  { name: 'WEST NIMAR', state: 'MADHYA PRADESH' },
  { name: 'SUBARNAPUR', state: 'ODISHA' },
  { name: 'JAYASHANKAR BHUPALPALLY', state: 'TELANGANA' },
  { name: 'SIDDHARTHNAGAR', state: 'UTTAR PRADESH' },
  { name: 'UNAKOTI', state: 'TRIPURA' }
];

console.log('Searching for districts in GeoJSON with state matching...\n');

targets.forEach(target => {
  const feature = geoJson.features.find(f => 
    f.properties.District?.toUpperCase() === target.name &&
    f.properties.STATE?.toUpperCase() === target.state
  );
  
  if (feature) {
    console.log(`✅ ${target.name} (${target.state})`);
    console.log(`   ID: ${feature.properties.id}`);
    console.log(`   Full Name: ${feature.properties.FULL_NAME}`);
  } else {
    // Try partial match
    const partial = geoJson.features.find(f => 
      f.properties.District?.toUpperCase().includes(target.name.split(' ')[0]) &&
      f.properties.STATE?.toUpperCase() === target.state
    );
    if (partial) {
      console.log(`⚠️  ${target.name} - PARTIAL MATCH: ${partial.properties.District}`);
      console.log(`   ID: ${partial.properties.id}`);
      console.log(`   Full Name: ${partial.properties.FULL_NAME}`);
    } else {
      console.log(`❌ ${target.name} (${target.state}) - NOT FOUND`);
    }
  }
  console.log('');
});
