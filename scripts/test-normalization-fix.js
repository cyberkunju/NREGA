/**
 * Test if the normalization fix is working
 */

// Simulate the fixed normalization function
function normalizeDistrictName(name) {
    if (!name) return '';

    // Handle parentheses - extract primary name before parentheses
    let primaryName = name;
    if (name.includes('(')) {
        primaryName = name.split('(')[0].trim();
    }

    return primaryName
        .toLowerCase()
        .normalize('NFC')
        .trim()
        .replace(/\s*&\s*/g, ' and ')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-]/g, '')
        .replace(/\bdist(rict)?\b/g, '')
        .replace(/\b(north|south|east|west)\b/g, (match) => match)
        .trim();
}

console.log('\n=== TESTING NORMALIZATION FIX ===\n');

const testCases = [
    'KEONJHAR (KENDUJHAR)',
    'BALASORE (BALESHWAR)',
    'BOLANGIR (BALANGIR)',
    'BAUDH (BAUDA)',
    'PURBA MEDINIPUR',
    'NORTH TWENTY-FOUR PARGANAS',
    'SOUTH TWENTY-FOUR PARGANAS'
];

testCases.forEach(name => {
    const normalized = normalizeDistrictName(name);
    console.log(`"${name}"`);
    console.log(`  → "${normalized}"`);
    console.log('');
});

console.log('Expected API names:');
console.log('  kendujhar, baleshwar, bolangir, boudh');
console.log('  purba medinipur, north 24 parganas, south 24 parganas');
