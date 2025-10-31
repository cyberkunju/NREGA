/**
 * Add Final 3 Districts Found
 * 
 * Adding the last 3 districts we found with alternate spellings
 */

const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const perfectMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

console.log('═'.repeat(80));
console.log('ADDING FINAL 3 DISTRICTS');
console.log('═'.repeat(80));
console.log(`\nCurrent: ${Object.keys(perfectMapping.mappings).length} mappings`);

const FINAL_3 = {
  'telangana:kumram bheemasifabad': {
    geoDistrict: 'KUMURAM BHEEM',
    geoState: 'TELANGANA',
    geoId: 161,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Partial match: API uses Kumram Bheemasifabad, GeoJSON has Kumuram Bheem'
  },
  'madhya pradesh:neemuch': {
    geoDistrict: 'NIMACH',
    geoState: 'MADHYA PRADESH',
    geoId: 327,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Spelling variation: Neemuch vs Nimach'
  },
  'tripura:unakoti': {
    geoDistrict: 'UNOKOTI',
    geoState: 'TRIPURA',
    geoId: 726,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Spelling variation: Unakoti vs Unokoti, created 2012'
  }
};

// Also fix the wrong state for Unakoti
const WRONG_STATE_FIX = 'himachal pradesh:unakoti';

console.log('\nAdding mappings...\n');

for (const [key, mapping] of Object.entries(FINAL_3)) {
  // Remove from excluded
  if (perfectMapping.excluded[key]) {
    delete perfectMapping.excluded[key];
  }
  
  // Add to mappings
  perfectMapping.mappings[key] = mapping;
  
  console.log(`✅ ${key}`);
  console.log(`   → ${mapping.geoDistrict} (geoId: ${mapping.geoId})`);
  console.log(`   📝 ${mapping.note}`);
}

// Fix wrong state
if (perfectMapping.excluded[WRONG_STATE_FIX]) {
  delete perfectMapping.excluded[WRONG_STATE_FIX];
  console.log(`\n🔴 FIXED: Removed ${WRONG_STATE_FIX} (wrong state)`);
  console.log(`   ✅ Correct mapping already added: tripura:unakoti`);
}

// Update metadata
perfectMapping.version = '3.1-final-research-complete';
perfectMapping.generated = new Date().toISOString();
perfectMapping.totalMappings = Object.keys(perfectMapping.mappings).length;
perfectMapping.excludedDistricts = Object.keys(perfectMapping.excluded).length;
perfectMapping.coverage = ((perfectMapping.totalMappings / perfectMapping.totalAPIDistricts) * 100).toFixed(2) + '%';

// Save
fs.writeFileSync(mappingPath, JSON.stringify(perfectMapping, null, 2));

console.log('\n' + '═'.repeat(80));
console.log('COMPLETE');
console.log('═'.repeat(80));
console.log(`\n📈 Final totals:`);
console.log(`  Total mappings: ${perfectMapping.totalMappings} (was 709)`);
console.log(`  Excluded: ${perfectMapping.excludedDistricts} (was 26)`);
console.log(`  Coverage: ${perfectMapping.coverage}`);
console.log(`\n💾 Saved to: ${mappingPath}\n`);
