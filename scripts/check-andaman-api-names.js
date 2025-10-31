/**
 * Check what district names exist in API for Andaman & Nicobar
 */

const https = require('https');

const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const url = `https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=${API_KEY}&format=json&filters[state]=ANDAMAN AND NICOBAR&limit=100`;

console.log('Fetching all Andaman & Nicobar districts from API...\n');

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      console.log('Total records:', json.total || 0);
      console.log('Fetched:', json.count || 0, '\n');
      
      if (json.records && json.records.length > 0) {
        // Get unique district names
        const districts = new Set();
        json.records.forEach(r => {
          if (r.district_name) {
            districts.add(r.district_name);
          }
        });
        
        console.log('Unique districts in API:');
        Array.from(districts).sort().forEach(d => {
          console.log(`  - ${d}`);
        });
        
        console.log('\n✅ These are the ACTUAL district names in the API');
        console.log('   Your mapping must match these exactly!');
      } else {
        console.log('❌ No records found');
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
