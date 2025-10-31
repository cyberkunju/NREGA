/**
 * COMPREHENSIVE AUDIT - Find ALL potential mapping issues
 * Check for special characters, mismatches, and data quality
 */

const fs = require('fs');
const path = require('path');

console.log('═'.repeat(80));
console.log('COMPREHENSIVE DATA QUALITY AUDIT');
console.log('═'.repeat(80));
console.log('');

// Load mapping
const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

// Simulate normalizeDistrictName function (with the fix)
function normalizeDistrictName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, ' and ')    // Replace & with "and"
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\bdist(rict)?\b/g, '')
    .replace(/\b(north|south|east|west)\b/g, (match) => match)
    .trim();
}

// Check 1: Find all states with special characters
console.log('1️⃣  CHECKING FOR SPECIAL CHARACTERS IN STATE NAMES\n');
const statesWithSpecialChars = new Set();
Object.keys(mapping.mappings).forEach(key => {
  const [state, district] = key.split(':');
  if (state && /[&().,/]/.test(state)) {
    statesWithSpecialChars.add(state);
  }
});

if (statesWithSpecialChars.size > 0) {
  console.log('⚠️  States with special characters:');
  statesWithSpecialChars.forEach(s => console.log(`   - "${s}"`));
} else {
  console.log('✅ No special characters in state names');
}

// Check 2: Find districts with special characters
console.log('\n2️⃣  CHECKING FOR SPECIAL CHARACTERS IN DISTRICT NAMES\n');
const districtsWithSpecialChars = [];
Object.keys(mapping.mappings).forEach(key => {
  const [state, district] = key.split(':');
  if (district && /[&().,/]/.test(district)) {
    districtsWithSpecialChars.push({ key, state, district });
  }
});

if (districtsWithSpecialChars.length > 0) {
  console.log(`⚠️  Found ${districtsWithSpecialChars.length} districts with special characters:`);
  districtsWithSpecialChars.slice(0, 20).forEach(d => {
    console.log(`   - "${d.district}" (${d.state})`);
  });
  if (districtsWithSpecialChars.length > 20) {
    console.log(`   ... and ${districtsWithSpecialChars.length - 20} more`);
  }
} else {
  console.log('✅ No special characters in district names');
}

// Check 3: Find potential normalization issues
console.log('\n3️⃣  CHECKING FOR NORMALIZATION ISSUES\n');
const normalizationIssues = [];

// Test cases that might break
const testCases = [
  { original: 'Andaman & Nicobar', expected: 'andaman and nicobar' },
  { original: 'Dadra & Nagar Haveli', expected: 'dadra and nagar haveli' },
  { original: 'Daman & Diu', expected: 'daman and diu' },
  { original: 'Jammu & Kashmir', expected: 'jammu and kashmir' },
  { original: 'D & N Haveli', expected: 'd and n haveli' },
];

testCases.forEach(test => {
  const normalized = normalizeDistrictName(test.original);
  if (normalized !== test.expected) {
    normalizationIssues.push({
      original: test.original,
      expected: test.expected,
      actual: normalized
    });
  }
});

if (normalizationIssues.length > 0) {
  console.log('❌ Normalization issues found:');
  normalizationIssues.forEach(issue => {
    console.log(`   "${issue.original}"`);
    console.log(`     Expected: "${issue.expected}"`);
    console.log(`     Got:      "${issue.actual}"`);
  });
} else {
  console.log('✅ All test cases pass normalization');
}

// Check 4: Find mapping keys that might not match backend data
console.log('\n4️⃣  CHECKING MAPPING KEY FORMATS\n');
const suspiciousKeys = [];
Object.keys(mapping.mappings).forEach(key => {
  // Check for double spaces
  if (key.includes('  ')) {
    suspiciousKeys.push({ key, issue: 'double space' });
  }
  // Check for trailing/leading spaces
  if (key !== key.trim()) {
    suspiciousKeys.push({ key, issue: 'trailing/leading space' });
  }
  // Check for uppercase
  if (key !== key.toLowerCase()) {
    suspiciousKeys.push({ key, issue: 'not lowercase' });
  }
});

if (suspiciousKeys.length > 0) {
  console.log(`⚠️  Found ${suspiciousKeys.length} suspicious mapping keys:`);
  suspiciousKeys.slice(0, 10).forEach(s => {
    console.log(`   - "${s.key}" (${s.issue})`);
  });
} else {
  console.log('✅ All mapping keys are properly formatted');
}

// Check 5: Find excluded districts
console.log('\n5️⃣  CHECKING EXCLUDED DISTRICTS\n');
const excludedCount = Object.keys(mapping.excluded).length;
console.log(`Found ${excludedCount} excluded districts:`);
Object.entries(mapping.excluded).forEach(([key, reason]) => {
  console.log(`   - ${key}: ${reason}`);
});

// Check 6: Coverage statistics
console.log('\n6️⃣  COVERAGE STATISTICS\n');
console.log(`   Total API districts: ${mapping.totalAPIDistricts || 'unknown'}`);
console.log(`   Mapped: ${Object.keys(mapping.mappings).length}`);
console.log(`   Excluded: ${excludedCount}`);
console.log(`   Coverage: ${mapping.coverage || 'unknown'}`);

// Check 7: Find states with & symbol in backend
console.log('\n7️⃣  STATES THAT MIGHT USE & SYMBOL IN BACKEND\n');
const statesWithAnd = [];
Object.keys(mapping.mappings).forEach(key => {
  const [state] = key.split(':');
  if (state && state.includes(' and ')) {
    const originalMightHaveAmpersand = state.replace(' and ', ' & ');
    if (!statesWithAnd.includes(originalMightHaveAmpersand)) {
      statesWithAnd.push(originalMightHaveAmpersand);
    }
  }
});

console.log('States that might use & in backend:');
statesWithAnd.forEach(s => console.log(`   - ${s}`));

// Summary
console.log('\n' + '═'.repeat(80));
console.log('AUDIT SUMMARY');
console.log('═'.repeat(80));
console.log('');

let issuesFound = 0;
if (statesWithSpecialChars.size > 0) issuesFound++;
if (districtsWithSpecialChars.length > 0) issuesFound++;
if (normalizationIssues.length > 0) issuesFound++;
if (suspiciousKeys.length > 0) issuesFound++;

if (issuesFound === 0) {
  console.log('✅ NO ISSUES FOUND - Everything looks perfect!');
} else {
  console.log(`⚠️  Found ${issuesFound} potential issue categories`);
  console.log('');
  console.log('RECOMMENDED ACTIONS:');
  if (statesWithSpecialChars.size > 0 || districtsWithSpecialChars.length > 0) {
    console.log('   1. Review special characters in names');
  }
  if (normalizationIssues.length > 0) {
    console.log('   2. Fix normalization function');
  }
  if (suspiciousKeys.length > 0) {
    console.log('   3. Clean up mapping keys');
  }
}

console.log('\n' + '═'.repeat(80));
