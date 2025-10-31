/**
 * Add Final 2 Districts and Clean Up Wrong State Entries
 */

const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const perfectMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

console.log('═'.repeat(80));
console.log('FINAL 2 DISTRICTS + CLEANUP');
console.log('═'.repeat(80));
console.log(`\nCurrent: ${Object.keys(perfectMapping.mappings).length} mappings\n`);

// Add the 2 found districts
const FINAL_2 = {
  'andaman and nicobar:north and middle andaman': {
    geoDistrict: 'NORTH & MIDDLE ANDAMAN',
    geoState: 'ANDAMAN & NICOBAR',
    geoId: 571,
    confidence: 1.0,
    method: 'final-research-verified',
    note: 'Found with ampersand: NORTH & MIDDLE ANDAMAN'
  },
  'dn haveli and dd:dadra and nagar haveli': {
    geoDistrict: 'DADRA & NAGAR HAVELI',
    geoState: 'DADRA & NAGAR HAVELI & DAMAN & DIU',
    geoId: 647,
    confidence: 1.0,
    method: 'final-research-verified',
    note: 'Found with ampersand: DADRA & NAGAR HAVELI'
  }
};

// Wrong state entries to remove (already mapped correctly)
const WRONG_STATE_TO_REMOVE = [
  'jharkhand:chatrapati sambhaji nagar',  // Already mapped as maharashtra
  'madhya pradesh:dharashiv'  // Already mapped as maharashtra
];

// Rae Bareli - genuinely missing
const RAE_BARELI_NOTE = {
  'uttar pradesh:rae bareli': {
    reason: 'GENUINELY MISSING from GeoJSON',
    note: 'Searched all variations (Rae Bareli, Raebareli, Rai Bareli). Found BAREILLY (ID: 497) but that is a different district. Rae Bareli district exists in UP but not in this GeoJSON file.',
    verified: true,
    action: 'CANNOT MAP - Need updated GeoJSON',
    verifiedDate: new Date().toISOString()
  }
};

console.log('✅ Adding 2 found districts:\n');

for (const [key, mapping] of Object.entries(FINAL_2)) {
  if (perfectMapping.excluded[key]) {
    delete perfectMapping.excluded[key];
  }
  
  perfectMapping.mappings[key] = mapping;
  
  console.log(`✅ ${key}`);
  console.log(`   → ${mapping.geoDistrict} (geoId: ${mapping.geoId})`);
  console.log(`   📝 ${mapping.note}`);
  console.log('');
}

console.log('🧹 Removing wrong state duplicates:\n');

WRONG_STATE_TO_REMOVE.forEach(key => {
  if (perfectMapping.excluded[key]) {
    delete perfectMapping.excluded[key];
    console.log(`✅ Removed: ${key} (already mapped in correct state)`);
  }
});

console.log('\n📝 Updating Rae Bareli with detailed note:\n');

perfectMapping.excluded['uttar pradesh:rae bareli'] = RAE_BARELI_NOTE['uttar pradesh:rae bareli'];
console.log('✅ Updated: uttar pradesh:rae bareli');
console.log('   Status: GENUINELY MISSING from GeoJSON');

// Update metadata
perfectMapping.version = '3.3-final-complete';
perfectMapping.generated = new Date().toISOString();
perfectMapping.totalMappings = Object.keys(perfectMapping.mappings).length;
perfectMapping.excludedDistricts = Object.keys(perfectMapping.excluded).length;
perfectMapping.coverage = ((perfectMapping.totalMappings / perfectMapping.totalAPIDistricts) * 100).toFixed(2) + '%';

// Save
fs.writeFileSync(mappingPath, JSON.stringify(perfectMapping, null, 2));

console.log('\n' + '═'.repeat(80));
console.log('COMPLETE');
console.log('═'.repeat(80));
console.log(`\n📊 Results:`);
console.log(`  ✅ Added: 2 districts`);
console.log(`  🧹 Removed duplicates: 2`);
console.log(`  📝 Updated: 1 note`);
console.log(`\n📈 Final totals:`);
console.log(`  Total mappings: ${perfectMapping.totalMappings} (was 717)`);
console.log(`  Excluded: ${perfectMapping.excludedDistricts} (was 21)`);
console.log(`  Coverage: ${perfectMapping.coverage}`);
console.log(`\n💾 Saved to: ${mappingPath}`);
console.log('\n✨ All possible districts mapped!\n');
