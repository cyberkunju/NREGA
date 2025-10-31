/**
 * Find Missing Districts
 * Compare all-districts-statewise.txt (741) with complete-api-districts.txt (735)
 */

const fs = require('fs');
const path = require('path');

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Parse all-districts-statewise.txt
const allDistrictsContent = fs.readFileSync(
  path.join(__dirname, '..', 'all-districts-statewise.txt'),
  'utf-8'
);

const allDistricts = [];
const lines = allDistrictsContent.split('\n');

for (const line of lines) {
  // Look for lines with district lists (format: "STATE = DIST1, DIST2, DIST3")
  if (line.includes(' = ')) {
    const parts = line.split(' = ');
    if (parts.length === 2) {
      const state = parts[0].trim().replace(/^\d+\.\s*/, ''); // Remove number prefix
      const districts = parts[1].split(',').map(d => d.trim());
      
      districts.forEach(district => {
        if (district && district !== 'NA') {
          allDistricts.push({
            district: district,
            state: state,
            normalized: `${normalize(state)}:${normalize(district)}`
          });
        }
      });
    }
  }
}

console.log(`Found ${allDistricts.length} districts in all-districts-statewise.txt\n`);

// Parse complete-api-districts.txt
const apiContent = fs.readFileSync(
  path.join(__dirname, '..', 'complete-api-districts.txt'),
  'utf-8'
);

const apiDistricts = [];
const apiLines = apiContent.split('\n');

for (const line of apiLines) {
  if (!line.trim() || line.includes('districtName') || line.includes('---')) continue;
  
  const parts = line.split(/\s{2,}/);
  if (parts.length >= 2) {
    const district = parts[0].trim();
    const state = parts[1].trim();
    
    if (district && state) {
      apiDistricts.push({
        district: district,
        state: state,
        normalized: `${normalize(state)}:${normalize(district)}`
      });
    }
  }
}

console.log(`Found ${apiDistricts.length} districts in complete-api-districts.txt\n`);

// Find missing districts
const apiSet = new Set(apiDistricts.map(d => d.normalized));
const missing = allDistricts.filter(d => !apiSet.has(d.normalized));

console.log(`Missing ${missing.length} districts:\n`);
missing.forEach((d, i) => {
  console.log(`${i + 1}. ${d.district}, ${d.state}`);
});

// Save to file
fs.writeFileSync(
  path.join(__dirname, '..', 'analysis-output', 'missing-districts.json'),
  JSON.stringify({
    generated: new Date().toISOString(),
    totalInAllDistricts: allDistricts.length,
    totalInAPI: apiDistricts.length,
    missingCount: missing.length,
    missing: missing
  }, null, 2)
);

console.log(`\nSaved to analysis-output/missing-districts.json`);
