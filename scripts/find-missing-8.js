const fs = require('fs');
const path = require('path');

const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

const SEARCH_TARGETS = [
  { 
    api: 'Rae Bareli', 
    searches: ['RAE BARELI', 'RAEBARELI', 'RAE-BARELI', 'RAI BARELI', 'RAIBARELI'], 
    state: 'UTTAR PRADESH' 
  },
  { 
    api: 'Kumram Bheemasifabad', 
    searches: ['KUMRAM', 'KOMARAM', 'ASIFABAD', 'BHEEM', 'KUMURAM'], 
    state: 'TELANGANA' 
  },
  { 
    api: 'Narsinghpur', 
    searches: ['NARSINGHPUR', 'NARSIMHAPUR', 'NARSINGPUR', 'NARSINHPUR'], 
    state: 'MADHYA PRADESH' 
  },
  { 
    api: 'Anantapur', 
    searches: ['ANANTAPUR', 'ANANTPUR', 'ANANTHPUR', 'ANANTAPURAM'], 
    state: 'ANDHRA PRADESH' 
  },
  { 
    api: 'Neemuch', 
    searches: ['NEEMUCH', 'NIMACH', 'NEEMACH', 'NIMUCH'], 
    state: 'MADHYA PRADESH' 
  },
  { 
    api: 'Aurangabad (Maharashtra)', 
    searches: ['AURANGABAD'], 
    state: 'MAHARASHTRA' 
  },
  { 
    api: 'Osmanabad', 
    searches: ['OSMANABAD', 'USMANBAD'], 
    state: 'MAHARASHTRA' 
  },
  { 
    api: 'Unakoti', 
    searches: ['UNAKOTI', 'UNOKOTI'], 
    state: 'TRIPURA' 
  }
];

console.log('═'.repeat(80));
console.log('SEARCHING FOR 8 MISSING DISTRICTS');
console.log('Using alternate spellings and partial matches');
console.log('═'.repeat(80));
console.log('');

let found = 0;
let notFound = 0;

SEARCH_TARGETS.forEach(target => {
  console.log(`🔍 Searching: ${target.api} (${target.state})`);
  
  let match = null;
  
  // Try exact matches first
  for (const searchTerm of target.searches) {
    match = geoJson.features.find(f => 
      f.properties.District?.toUpperCase() === searchTerm &&
      f.properties.STATE?.toUpperCase() === target.state
    );
    if (match) {
      console.log(`   ✅ EXACT MATCH: ${match.properties.District}`);
      console.log(`      ID: ${match.properties.id}`);
      console.log(`      Full Name: ${match.properties.FULL_NAME}`);
      found++;
      break;
    }
  }
  
  // Try partial matches if no exact match
  if (!match) {
    for (const searchTerm of target.searches) {
      match = geoJson.features.find(f => 
        f.properties.District?.toUpperCase().includes(searchTerm) &&
        f.properties.STATE?.toUpperCase() === target.state
      );
      if (match) {
        console.log(`   ⚠️  PARTIAL MATCH: ${match.properties.District}`);
        console.log(`      ID: ${match.properties.id}`);
        console.log(`      Full Name: ${match.properties.FULL_NAME}`);
        found++;
        break;
      }
    }
  }
  
  if (!match) {
    console.log(`   ❌ NOT FOUND - Tried: ${target.searches.join(', ')}`);
    notFound++;
  }
  
  console.log('');
});

console.log('═'.repeat(80));
console.log('SEARCH RESULTS');
console.log('═'.repeat(80));
console.log(`✅ Found: ${found}`);
console.log(`❌ Not Found: ${notFound}`);
console.log('');

if (notFound > 0) {
  console.log('⚠️  Districts not found are genuinely missing from GeoJSON');
  console.log('   This confirms the "temporal divide" - GeoJSON is severely outdated');
}
