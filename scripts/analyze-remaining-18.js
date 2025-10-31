/**
 * Analyze Remaining 18 Districts
 * 
 * Determine if any can still be researched/added or if they're impossible
 */

const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const data = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

console.log('═'.repeat(80));
console.log('ANALYZING REMAINING 18 DISTRICTS');
console.log('Can we research more or are they impossible?');
console.log('═'.repeat(80));
console.log('');

const excluded = Object.keys(data.excluded);

console.log(`Total excluded: ${excluded.length}\n`);

// Categorize by reason
const categories = {
  newDistricts: [],
  missingFromGeoJSON: [],
  nonDistricts: [],
  needsResearch: []
};

excluded.forEach(key => {
  const info = data.excluded[key];
  
  if (info.reason === 'new-district-post-2019' || info.created) {
    categories.newDistricts.push({ key, info });
  } else if (info.reason?.includes('NOT FOUND') || info.reason?.includes('missing')) {
    categories.missingFromGeoJSON.push({ key, info });
  } else if (info.reason?.includes('council') || info.reason?.includes('non-district')) {
    categories.nonDistricts.push({ key, info });
  } else {
    categories.needsResearch.push({ key, info });
  }
});

console.log('📊 CATEGORY 1: NEW DISTRICTS (Post-2019)');
console.log('Status: ❌ CANNOT ADD - Not in GeoJSON');
console.log('Solution: Aggregate to parent districts\n');

categories.newDistricts.forEach(({ key, info }) => {
  console.log(`  ${key}`);
  if (info.created) console.log(`    Created: ${info.created}`);
  if (info.parentDistricts) console.log(`    Parents: ${info.parentDistricts.join(', ')}`);
});

console.log(`\nTotal: ${categories.newDistricts.length} districts`);
console.log('Action: ✅ Already documented with parent aggregation');

console.log('\n' + '─'.repeat(80));
console.log('📊 CATEGORY 2: MISSING FROM GEOJSON');
console.log('Status: ⚠️  MIGHT BE RESEARCHABLE');
console.log('Solution: Search with more spelling variations\n');

categories.missingFromGeoJSON.forEach(({ key, info }) => {
  console.log(`  ${key}`);
  if (info.reason) console.log(`    Reason: ${info.reason}`);
});

console.log(`\nTotal: ${categories.missingFromGeoJSON.length} districts`);
console.log('Action: 🔍 Worth one more search attempt');

console.log('\n' + '─'.repeat(80));
console.log('📊 CATEGORY 3: NON-DISTRICTS');
console.log('Status: ✅ CORRECTLY EXCLUDED');
console.log('Solution: Keep excluded\n');

categories.nonDistricts.forEach(({ key, info }) => {
  console.log(`  ${key}`);
  if (info.reason) console.log(`    Reason: ${info.reason}`);
});

console.log(`\nTotal: ${categories.nonDistricts.length} districts`);
console.log('Action: ✅ No action needed');

console.log('\n' + '─'.repeat(80));
console.log('📊 CATEGORY 4: NEEDS RESEARCH');
console.log('Status: 🔍 UNKNOWN - Should investigate\n');

categories.needsResearch.forEach(({ key, info }) => {
  console.log(`  ${key}`);
  console.log(`    Info: ${JSON.stringify(info, null, 2)}`);
});

console.log(`\nTotal: ${categories.needsResearch.length} districts`);
console.log('Action: 🔍 Research these');

console.log('\n' + '═'.repeat(80));
console.log('RECOMMENDATION');
console.log('═'.repeat(80));

const researchable = categories.missingFromGeoJSON.length + categories.needsResearch.length;

if (researchable > 0) {
  console.log(`\n🔍 YES - ${researchable} districts worth researching:`);
  console.log('   - Try more spelling variations');
  console.log('   - Search for historical names');
  console.log('   - Check if they were merged/renamed');
  console.log('   - Verify they actually exist');
} else {
  console.log('\n✅ NO - All remaining districts are:');
  console.log('   - New districts (not in GeoJSON)');
  console.log('   - Non-districts (correctly excluded)');
  console.log('   - Already researched and verified');
}

console.log('\n📊 SUMMARY:');
console.log(`   New Districts: ${categories.newDistricts.length} (cannot add)`);
console.log(`   Missing from GeoJSON: ${categories.missingFromGeoJSON.length} (research more)`);
console.log(`   Non-Districts: ${categories.nonDistricts.length} (correctly excluded)`);
console.log(`   Needs Research: ${categories.needsResearch.length} (investigate)`);
console.log(`   Total: ${excluded.length}`);
console.log('');
