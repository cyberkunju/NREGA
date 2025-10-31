#!/usr/bin/env node

/**
 * Test the district matching logic
 */

// Simulate the normalize function
const normalizeDistrictName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\bdist(rict)?\b/g, '')
    .trim();
};

// Test cases
const testCases = [
  {
    api: { district: 'Pune', state: 'Maharashtra' },
    geo: { district: 'PUNE', state: 'MAHARASHTRA' }
  },
  {
    api: { district: '24 Parganas (north)', state: 'West Bengal' },
    geo: { district: 'NORTH TWENTY-FOUR PARGANAS', state: 'WEST BENGAL' }
  },
  {
    api: { district: 'Bengaluru', state: 'Karnataka' },
    geo: { district: 'BENGALURU URBAN', state: 'KARNATAKA' }
  }
];

console.log('🧪 Testing District Matching Logic\n');

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`  API: "${test.api.district}" (${test.api.state})`);
  console.log(`  GEO: "${test.geo.district}" (${test.geo.state})`);
  
  const apiNormDistrict = normalizeDistrictName(test.api.district);
  const apiNormState = normalizeDistrictName(test.api.state);
  const geoNormDistrict = normalizeDistrictName(test.geo.district);
  const geoNormState = normalizeDistrictName(test.geo.state);
  
  console.log(`  API normalized: "${apiNormDistrict}" (${apiNormState})`);
  console.log(`  GEO normalized: "${geoNormDistrict}" (${geoNormState})`);
  
  const apiKey = `${apiNormState}:${apiNormDistrict}`;
  const geoKey = `${geoNormState}:${geoNormDistrict}`;
  
  console.log(`  API key: "${apiKey}"`);
  console.log(`  GEO key: "${geoKey}"`);
  console.log(`  Match: ${apiKey === geoKey ? '✓ YES' : '✗ NO'}`);
  console.log();
});
