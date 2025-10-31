/**
 * Search for Andaman districts in the actual API data
 */

const https = require('https');

const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

// Try different state name variations
const stateVariations = [
  'ANDAMAN AND NICOBAR',
  'ANDAMAN & NICOBAR',
  'ANDAMAN  NICOBAR',
  'A & N ISLANDS',
  'ANDAMAN AND NICOBAR ISLANDS'
];

console.log('Searching for Andaman districts in API...\n');

let found = false;

function tryState(index) {
  if (index >= stateVariations.length) {
    if (!found) {
      console.log('\n❌ NOT FOUND with any state name variation');
      console.log('\nLet me search ALL records for "ANDAMAN"...');
      searchAll();
    }
    return;
  }
  
  const state = stateVariations[index];
  const url = `https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=${API_KEY}&format=json&filters[state]=${encodeURIComponent(state)}&limit=10`;
  
  console.log(`[${index + 1}/${stateVariations.length}] Trying: "${state}"...`);
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.total > 0) {
          found = true;
          console.log(`  ✅ FOUND! Total records: ${json.total}`);
          console.log('\n  Districts:');
          const districts = new Set();
          json.records.forEach(r => districts.add(r.district_name));
          Array.from(districts).forEach(d => console.log(`    - ${d}`));
          console.log('\n  Sample record:');
          const r = json.records[0];
          console.log(`    State: "${r.state}"`);
          console.log(`    District: "${r.district_name}"`);
          console.log(`    Fin Year: ${r.fin_year}`);
        } else {
          console.log(`  ❌ No records (total: 0)`);
        }
      } catch (e) {
        console.log(`  ❌ Error: ${e.message}`);
      }
      
      setTimeout(() => tryState(index + 1), 1000);
    });
  }).on('error', (e) => {
    console.log(`  ❌ Request error: ${e.message}`);
    setTimeout(() => tryState(index + 1), 1000);
  });
}

function searchAll() {
  const url = `https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=${API_KEY}&format=json&limit=5000`;
  
  console.log('\nFetching 5000 records to search...');
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`Fetched ${json.count} records\n`);
        
        const andamanRecords = json.records.filter(r => 
          r.state && (
            r.state.includes('ANDAMAN') || 
            r.state.includes('NICOBAR') ||
            r.state.includes('A & N')
          )
        );
        
        if (andamanRecords.length > 0) {
          console.log(`✅ FOUND ${andamanRecords.length} Andaman records!`);
          console.log('\nActual state name in API:');
          const states = new Set();
          andamanRecords.forEach(r => states.add(r.state));
          states.forEach(s => console.log(`  "${s}"`));
          
          console.log('\nDistricts:');
          const districts = new Set();
          andamanRecords.forEach(r => districts.add(r.district_name));
          districts.forEach(d => console.log(`  - ${d}`));
        } else {
          console.log('❌ No Andaman records found in 5000 records');
          console.log('\nThis means the API genuinely has NO DATA for Andaman & Nicobar');
          console.log('The all-districts file lists them, but there are no actual records.');
        }
      } catch (e) {
        console.log('Error:', e.message);
      }
    });
  }).on('error', (e) => {
    console.log('Request error:', e.message);
  });
}

tryState(0);
