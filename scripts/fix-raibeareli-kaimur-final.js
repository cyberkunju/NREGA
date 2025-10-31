const fs = require('fs');
const path = require('path');

console.log('=== FIXING RAIBEARELI & KAIMUR MAPPINGS ===\n');

const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
const mappingFile = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Fix 1: Remove duplicate raebareli entry and update the correct one
console.log('Fixing RAIBEARELI...');

// Remove the wrong entry (without space)
if (mappingFile.mappings['uttar pradesh:raebareli']) {
    console.log('  Removing: "uttar pradesh:raebareli" → RAIBEARELI');
    delete mappingFile.mappings['uttar pradesh:raebareli'];
}

// Update the correct entry (with space) to point to RAIBEARELI
if (mappingFile.mappings['uttar pradesh:rae bareli']) {
    console.log('  Updating: "uttar pradesh:rae bareli"');
    console.log('    Old:', mappingFile.mappings['uttar pradesh:rae bareli'].geoDistrict);
    mappingFile.mappings['uttar pradesh:rae bareli'] = {
        geoDistrict: 'RAIBEARELI',
        geoState: 'UTTAR PRADESH',
        geoId: 404,
        confidence: 1,
        method: 'manual-fix',
        note: 'Fixed to match API normalization "Rae Bareli" → "rae bareli"'
    };
    console.log('    New:', mappingFile.mappings['uttar pradesh:rae bareli'].geoDistrict);
}

// Fix 2: Remove old kaimur entry, keep only the correct one
console.log('\nFixing KAIMUR...');

// Remove the old entry (with "bhabua")
if (mappingFile.mappings['bihar:kaimur bhabua']) {
    console.log('  Removing: "bihar:kaimur bhabua"');
    delete mappingFile.mappings['bihar:kaimur bhabua'];
}

// Ensure the correct entry exists
if (!mappingFile.mappings['bihar:kaimur']) {
    console.log('  Adding: "bihar:kaimur"');
    mappingFile.mappings['bihar:kaimur'] = {
        geoDistrict: 'KAIMUR',
        geoState: 'BIHAR',
        geoId: 346,
        confidence: 1,
        method: 'manual-fix',
        note: 'Fixed to match API normalization "Kaimur (bhabua)" → "kaimur"'
    };
} else {
    console.log('  Already exists: "bihar:kaimur"');
}

// Update metadata
mappingFile.totalMappings = Object.keys(mappingFile.mappings).length;
mappingFile.version = '4.3-raibeareli-kaimur-fix';
mappingFile.generated = new Date().toISOString();

// Save
fs.writeFileSync(mappingPath, JSON.stringify(mappingFile, null, 2));

console.log(`\n✅ Fixed mappings`);
console.log(`📊 Total mappings: ${mappingFile.totalMappings}`);
console.log(`💾 Saved to ${mappingPath}`);

// Verify
console.log('\n=== VERIFICATION ===');
console.log('Checking "uttar pradesh:rae bareli":', mappingFile.mappings['uttar pradesh:rae bareli'] ? '✓ EXISTS' : '✗ MISSING');
console.log('Checking "bihar:kaimur":', mappingFile.mappings['bihar:kaimur'] ? '✓ EXISTS' : '✗ MISSING');
console.log('Checking "uttar pradesh:raebareli" (should be removed):', mappingFile.mappings['uttar pradesh:raebareli'] ? '✗ STILL EXISTS' : '✓ REMOVED');
console.log('Checking "bihar:kaimur bhabua" (should be removed):', mappingFile.mappings['bihar:kaimur bhabua'] ? '✗ STILL EXISTS' : '✓ REMOVED');
