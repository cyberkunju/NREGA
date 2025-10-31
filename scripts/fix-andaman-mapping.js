/**
 * Fix Andaman & Nicobar mapping inconsistency
 */

const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

console.log('Fixing Andaman & Nicobar mappings...\n');

// Find all Andaman keys
const andamanKeys = Object.keys(mapping.mappings).filter(k => 
  k.toLowerCase().includes('andaman') || k.toLowerCase().includes('nicobar')
);

console.log('Current mappings:');
andamanKeys.forEach(key => {
  console.log(`  "${key}"`);
});

// Fix: Standardize all to "andaman and nicobar"
const fixes = [
  {
    old: 'andaman  nicobar:south andaman',
    new: 'andaman and nicobar:south andaman'
  },
  {
    old: 'andaman  nicobar:nicobars',
    new: 'andaman and nicobar:nicobars'
  }
];

console.log('\nApplying fixes:');
fixes.forEach(({ old, new: newKey }) => {
  if (mapping.mappings[old]) {
    console.log(`  ✅ ${old} → ${newKey}`);
    mapping.mappings[newKey] = mapping.mappings[old];
    delete mapping.mappings[old];
  }
});

// Update metadata
mapping.version = '4.1-andaman-fix';
mapping.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

console.log('\n✅ Fixed! All Andaman & Nicobar districts now use consistent format:');
console.log('   "andaman and nicobar:district_name"\n');

// Verify
const newAndamanKeys = Object.keys(mapping.mappings).filter(k => 
  k.toLowerCase().includes('andaman') || k.toLowerCase().includes('nicobar')
);

console.log('Updated mappings:');
newAndamanKeys.forEach(key => {
  console.log(`  "${key}"`);
});
