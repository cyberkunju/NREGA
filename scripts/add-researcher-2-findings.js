/**
 * Add Researcher 2 Findings
 * 
 * Adding 5 additional districts found by Researcher 2:
 * - 3 missing districts with verified geoIds
 * - 2 currently excluded that should be mapped
 */

const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const perfectMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

console.log('═'.repeat(80));
console.log('ADDING RESEARCHER 2 FINDINGS');
console.log('5 additional districts with verified geoIds');
console.log('═'.repeat(80));
console.log(`\nCurrent: ${Object.keys(perfectMapping.mappings).length} mappings\n`);

const RESEARCHER_2_ADDITIONS = {
  'maharashtra:chatrapati sambhaji nagar': {
    geoDistrict: 'AURANGABAAD',
    geoState: 'MAHARASHTRA',
    geoId: 181,
    confidence: 1.0,
    method: 'researcher-2-verified',
    note: 'Renamed from Aurangabad in August 2023. Researcher 2 found correct GeoJSON match.'
  },
  'maharashtra:dharashiv': {
    geoDistrict: 'USMANABAD',
    geoState: 'MAHARASHTRA',
    geoId: 143,
    confidence: 1.0,
    method: 'researcher-2-verified',
    note: 'Renamed from Osmanabad in February 2023. Researcher 2 found correct GeoJSON match.'
  },
  'telangana:jayashankar bhopalapally': {
    geoDistrict: 'JAYASHANKAR BHUPALAPALLY',
    geoState: 'TELANGANA',
    geoId: 629,
    confidence: 1.0,
    method: 'researcher-2-verified',
    note: 'Created 2016. Researcher 2 confirmed spelling variation.'
  },
  'andhra pradesh:anantapur': {
    geoDistrict: 'ANANTHAPURAMU',
    geoState: 'ANDHRA PRADESH',
    geoId: 94,
    confidence: 1.0,
    method: 'researcher-2-verified',
    note: 'Spelling variation: Anantapur vs Ananthapuramu. Researcher 2 verified.'
  },
  'madhya pradesh:narsinghpur': {
    geoDistrict: 'NARSHIMAPURA',
    geoState: 'MADHYA PRADESH',
    geoId: 254,
    confidence: 1.0,
    method: 'researcher-2-verified',
    note: 'Spelling variation: Narsinghpur vs Narshimapura. Researcher 2 verified.'
  }
};

// Also note: Unakoti should stay mapped (created 2012, should be in GeoJSON)
// Researcher 2 says exclude, but we found it in GeoJSON as "UNOKOTI" (ID: 726)

let added = 0;

console.log('Adding verified mappings...\n');

for (const [key, mapping] of Object.entries(RESEARCHER_2_ADDITIONS)) {
  // Remove from excluded if exists
  if (perfectMapping.excluded[key]) {
    delete perfectMapping.excluded[key];
    console.log(`📊 Moved from excluded: ${key}`);
  } else {
    console.log(`✅ Adding new: ${key}`);
  }
  
  // Add to mappings
  perfectMapping.mappings[key] = mapping;
  added++;
  
  console.log(`   → ${mapping.geoDistrict} (geoId: ${mapping.geoId})`);
  console.log(`   📝 ${mapping.note}`);
  console.log('');
}

// Update metadata
perfectMapping.version = '3.2-both-researchers-complete';
perfectMapping.generated = new Date().toISOString();
perfectMapping.researchSources = [
  'research_1.md - Professional Analysis',
  'research_2.md - Comprehensive Verification'
];
perfectMapping.totalMappings = Object.keys(perfectMapping.mappings).length;
perfectMapping.excludedDistricts = Object.keys(perfectMapping.excluded).length;
perfectMapping.coverage = ((perfectMapping.totalMappings / perfectMapping.totalAPIDistricts) * 100).toFixed(2) + '%';

// Save
fs.writeFileSync(mappingPath, JSON.stringify(perfectMapping, null, 2));

console.log('═'.repeat(80));
console.log('COMPLETE');
console.log('═'.repeat(80));
console.log(`\n📊 Results:`);
console.log(`  ✅ Added mappings: ${added}`);
console.log(`\n📈 New totals:`);
console.log(`  Total mappings: ${perfectMapping.totalMappings} (was 712)`);
console.log(`  Excluded: ${perfectMapping.excludedDistricts} (was 23)`);
console.log(`  Coverage: ${perfectMapping.coverage}`);
console.log(`\n💾 Saved to: ${mappingPath}`);
console.log('\n✨ Both researchers\' findings successfully implemented!\n');
