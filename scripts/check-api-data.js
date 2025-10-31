/**
 * Check if API has data for North & Middle Andaman
 */

const https = require('https');

const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const url = `https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=${API_KEY}&format=json&filters[state]=ANDAMAN AND NICOBAR&filters[district_name]=NORTH AND MIDDLE ANDAMAN&limit=5`;

console.log('Checking API for North & Middle Andaman...\n');
console.log('URL:', url, '\n');

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      console.log('API Response:');
      console.log('  Total records:', json.total || 0);
      console.log('  Count:', json.count || 0);
      
      if (json.records && json.records.length > 0) {
        console.log('\n✅ DATA FOUND!');
        console.log('\nSample record:');
        const record = json.records[0];
        console.log('  State:', record.state);
        console.log('  District:', record.district_name);
        console.log('  Financial Year:', record.fin_year);
        console.log('  Month:', record.month);
        console.log('  Payment %:', record.payment_within_15_days_percentage);
      } else {
        console.log('\n❌ NO DATA FOUND');
        console.log('\nPossible reasons:');
        console.log('  1. District name mismatch in API');
        console.log('  2. No data available for this district');
        console.log('  3. API filter not working correctly');
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
