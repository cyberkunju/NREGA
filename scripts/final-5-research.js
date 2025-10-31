/**
 * Final 5 Districts Research
 * 
 * Deep search for the last 5 districts that need investigation
 */

const fs = require('fs');
const path = require('path');

const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

console.log('═'.repeat(80));
console.log('FINAL 5 DISTRICTS - DEEP RESEARCH');
console.log('═'.repeat(80));
console.log('');

const searches = [
  {
    name: 'North And Middle Andaman',
    state: 'ANDAMAN AND NICOBAR',
    variations: ['NORTH AND MIDDLE ANDAMAN', 'NORTH ANDAMAN', 'MIDDLE ANDAMAN', 'NORTH & MIDDLE']
  },
  {
    name: 'Dadra And Nagar Haveli',
    state: 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
    variations: ['DADRA AND NAGAR HAVELI', 'DADRA', 'NAGAR HAVELI', 'DNH']
  },
  {
    name: 'Chatrapati Sambhaji Nagar (Jharkhand)',
    state: 'JHARKHAND',
    variations: ['CHATRAPATI', 'SAMBHAJI', 'AURANGABAD'],
    note: 'This is WRONG STATE - should be Maharashtra, already mapped'
  },
  {
    name: 'Dharashiv (Madhya Pradesh)',
    state: 'MADHYA PRADESH',
    variations: ['DHARASHIV', 'OSMANABAD'],
    note: 'This is WRONG STATE - should be Maharashtra, already mapped'
  },
  {
    name: 'Rae Bareli',
    state: 'UTTAR PRADESH',
    variations: ['RAE BARELI', 'RAEBARELI', 'RAE-BARELI', 'RAI BARELI', 'RAIBARELI', 'RAE BAREILLY']
  }
];

searches.forEach(search => {
  console.log(`🔍 Searching: ${search.name}`);
  console.log(`   State: ${search.state}`);
  
  if (search.note) {
    console.log(`   ⚠️  NOTE: ${search.note}`);
    console.log('');
    return;
  }
  
  let found = false;
  
  // Try exact matches
  for (const variant of search.variations) {
    const match = geoJson.features.find(f => 
      f.properties.District?.toUpperCase() === variant &&
      f.properties.STATE?.toUpperCase() === search.state
    );
    
    if (match) {
      console.log(`   ✅ FOUND: ${match.properties.District}`);
      console.log(`      ID: ${match.properties.id}`);
      console.log(`      State: ${match.properties.STATE}`);
      found = true;
      break;
    }
  }
  
  // Try partial matches
  if (!found) {
    for (const variant of search.variations) {
      const match = geoJson.features.find(f => 
        f.properties.District?.toUpperCase().includes(variant.split(' ')[0]) &&
        f.properties.STATE?.toUpperCase() === search.state
      );
      
      if (match) {
        console.log(`   ⚠️  PARTIAL: ${match.properties.District}`);
        console.log(`      ID: ${match.properties.id}`);
        console.log(`      State: ${match.properties.STATE}`);
        found = true;
        break;
      }
    }
  }
  
  if (!found) {
    console.log(`   ❌ NOT FOUND in GeoJSON`);
    console.log(`      Tried: ${search.variations.join(', ')}`);
  }
  
  console.log('');
});

console.log('═'.repeat(80));
console.log('SPECIAL CASES - CHECKING ALL STATES');
console.log('═'.repeat(80));
console.log('');

// Check if Rae Bareli exists in ANY state
console.log('🔍 Checking Rae Bareli in ALL states...');
const raeBareli = geoJson.features.filter(f => 
  f.properties.District?.toUpperCase().includes('RAE') ||
  f.properties.District?.toUpperCase().includes('BARELI') ||
  f.properties.District?.toUpperCase().includes('BAREILLY')
);

if (raeBareli.length > 0) {
  console.log(`   Found ${raeBareli.length} matches:`);
  raeBareli.forEach(f => {
    console.log(`   - ${f.properties.District} (${f.properties.STATE}) - ID: ${f.properties.id}`);
  });
} else {
  console.log('   ❌ Not found in any state');
}

console.log('');

// Check Andaman districts
console.log('🔍 Checking ALL Andaman & Nicobar districts...');
const andaman = geoJson.features.filter(f => 
  f.properties.STATE?.toUpperCase().includes('ANDAMAN')
);

console.log(`   Found ${andaman.length} districts:`);
andaman.forEach(f => {
  console.log(`   - ${f.properties.District} - ID: ${f.properties.id}`);
});

console.log('');

// Check Dadra districts
console.log('🔍 Checking ALL Dadra & Nagar Haveli districts...');
const dadra = geoJson.features.filter(f => 
  f.properties.STATE?.toUpperCase().includes('DADRA') ||
  f.properties.STATE?.toUpperCase().includes('DAMAN')
);

console.log(`   Found ${dadra.length} districts:`);
dadra.forEach(f => {
  console.log(`   - ${f.properties.District} (${f.properties.STATE}) - ID: ${f.properties.id}`);
});

console.log('\n' + '═'.repeat(80));
console.log('FINAL VERDICT');
console.log('═'.repeat(80));
console.log('\n1. Chatrapati Sambhaji Nagar (Jharkhand)');
console.log('   ✅ ALREADY MAPPED as maharashtra:chatrapati sambhaji nagar');
console.log('   Action: Remove from excluded (wrong state entry)');

console.log('\n2. Dharashiv (Madhya Pradesh)');
console.log('   ✅ ALREADY MAPPED as maharashtra:dharashiv');
console.log('   Action: Remove from excluded (wrong state entry)');

console.log('\n3. North And Middle Andaman');
console.log('   Status: Check results above');

console.log('\n4. Dadra And Nagar Haveli');
console.log('   Status: Check results above');

console.log('\n5. Rae Bareli');
console.log('   Status: Check results above');
console.log('');
