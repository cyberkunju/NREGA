/**
 * Verify Fallback Matches
 * Check which fallback districts are actually showing on the map
 * and verify if they're showing correct data
 */

const fs = require('fs');
const path = require('path');

// Load fallback districts
const fallbackData = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'analysis-output', 'fallback-districts.json'),
  'utf-8'
));

console.log('═'.repeat(70));
console.log('FALLBACK DISTRICTS ANALYSIS');
console.log('═'.repeat(70));
console.log(`\nTotal fallback districts: ${fallbackData.usingFallback}\n`);

// Categorize by whether they have potential matches
const withMatches = fallbackData.suggestions.filter(s => s.matches.length > 0);
const withoutMatches = fallbackData.suggestions.filter(s => s.matches.length === 0);

console.log(`✅ With potential GeoJSON matches: ${withMatches.length}`);
console.log(`❌ Without GeoJSON matches (new districts): ${withoutMatches.length}\n`);

console.log('═'.repeat(70));
console.log('DISTRICTS WITH POTENTIAL MATCHES (might be showing on map):');
console.log('═'.repeat(70));
console.log('\nThese are the ones using fallback lookup and might be showing data:\n');

withMatches.forEach((item, i) => {
  const api = item.api;
  console.log(`${i + 1}. ${api.districtName}, ${api.stateName}`);
  console.log(`   API Key: ${api.compositeKey}`);
  console.log(`   Potential matches:`);
  
  item.matches.forEach((m, j) => {
    console.log(`     ${j + 1}. ${m.district}, ${m.state} (geoId: ${m.geoId})`);
  });
  
  // Determine if match is likely correct
  const apiNorm = api.normalizedDistrict;
  const firstMatch = item.matches[0];
  const matchNorm = firstMatch.normalized;
  
  if (apiNorm === matchNorm) {
    console.log(`   ✅ LIKELY CORRECT - Exact name match`);
  } else if (apiNorm.includes(matchNorm) || matchNorm.includes(apiNorm)) {
    console.log(`   ⚠️  UNCERTAIN - Partial name match`);
  } else {
    console.log(`   ❌ LIKELY WRONG - Different names`);
  }
  
  console.log('');
});

console.log('\n' + '═'.repeat(70));
console.log('DISTRICTS WITHOUT MATCHES (NOT showing on map):');
console.log('═'.repeat(70));
console.log('\nThese are NEW districts not in GeoJSON:\n');

withoutMatches.forEach((item, i) => {
  const api = item.api;
  console.log(`${i + 1}. ${api.districtName}, ${api.stateName}`);
});

console.log('\n' + '═'.repeat(70));
console.log('SUMMARY');
console.log('═'.repeat(70));
console.log(`\nTotal fallback districts: ${fallbackData.usingFallback}`);
console.log(`  - With potential matches: ${withMatches.length} (might be showing)`);
console.log(`  - Without matches: ${withoutMatches.length} (definitely NOT showing)`);
console.log(`\nExpected on map:`);
console.log(`  693 (perfect mapping) + ${withMatches.length} (fallback) = ${693 + withMatches.length} districts`);
console.log(`\nActual on map: 713 districts`);
console.log(`\nDifference: ${713 - (693 + withMatches.length)} districts`);
console.log(`(This difference might be from fuzzy matching finding wrong matches)\n`);

// Generate recommendations
console.log('═'.repeat(70));
console.log('RECOMMENDATIONS');
console.log('═'.repeat(70));
console.log('\n1. VERIFY the ${withMatches.length} districts with potential matches');
console.log('   - Check if they\'re showing correct data on the map');
console.log('   - Add verified ones to perfect-mapping-v2.json');
console.log('');
console.log(`2. EXCLUDE the ${withoutMatches.length} new districts`);
console.log('   - These don\'t exist in GeoJSON');
console.log('   - Add to excluded list in perfect-mapping-v2.json');
console.log('');
console.log('3. DISABLE fallback lookup');
console.log('   - Remove fuzzy matching from MapView.jsx');
console.log('   - Only use perfect mapping');
console.log('');
console.log('4. EXPECTED RESULT:');
console.log(`   - ${693 + withMatches.length} districts with 100% accurate data`);
console.log(`   - ${withoutMatches.length} districts excluded (no map boundaries)`);
console.log(`   - 0 districts using uncertain fallback\n`);
