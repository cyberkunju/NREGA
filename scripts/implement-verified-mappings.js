/**
 * Implement Verified Mappings
 * 
 * Based on research validation, this script adds 16 verified mappings
 * that were found in the GeoJSON file.
 */

const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const perfectMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

console.log('═'.repeat(80));
console.log('IMPLEMENTING VERIFIED MAPPINGS FROM RESEARCH');
console.log('Adding 16 districts with confirmed geoIds');
console.log('═'.repeat(80));
console.log(`\nCurrent state:`);
console.log(`  Mappings: ${Object.keys(perfectMapping.mappings).length}`);
console.log(`  Excluded: ${Object.keys(perfectMapping.excluded).length}`);

// Verified mappings with geoIds found in GeoJSON
const VERIFIED_MAPPINGS = {
  'madhya pradesh:narmadapuram': {
    geoDistrict: 'HOSHANGABAD',
    geoState: 'MADHYA PRADESH',
    geoId: 245,
    confidence: 1.0,
    method: 'research-verified-renamed',
    note: 'Renamed from Hoshangabad to Narmadapuram on February 7, 2022'
  },
  'chhattisgarh:kawardha': {
    geoDistrict: 'KABIRDHAM',
    geoState: 'CHHATTISGARH',
    geoId: 227,
    confidence: 1.0,
    method: 'research-verified-renamed',
    note: 'Renamed to Kabirdham in 2003'
  },
  'puducherry:pondicherry': {
    geoDistrict: 'PUDUCHERRY',
    geoState: 'PUDUCHERRY',
    geoId: 63,
    confidence: 1.0,
    method: 'research-verified-renamed',
    note: 'Territory officially renamed to Puducherry in 2006'
  },
  'punjab:nawanshahr': {
    geoDistrict: 'SHAHID BHAGAT SINGH NAGAR',
    geoState: 'PUNJAB',
    geoId: 552,
    confidence: 1.0,
    method: 'research-verified-renamed',
    note: 'Officially renamed Shahid Bhagat Singh Nagar in 2008'
  },
  'punjab:ropar': {
    geoDistrict: 'RUPNAGAR',
    geoState: 'PUNJAB',
    geoId: 718,
    confidence: 1.0,
    method: 'research-verified-renamed',
    note: 'Official name is Rupnagar, Ropar is common name'
  },
  'maharashtra:beed': {
    geoDistrict: 'BID',
    geoState: 'MAHARASHTRA',
    geoId: 158,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Bid is alternate spelling of Beed'
  },
  'odisha:boudh': {
    geoDistrict: 'BAUDH (BAUDA)',
    geoState: 'ODISHA',
    geoId: 184,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Baudh is official alternate spelling'
  },
  'punjab:mukatsar': {
    geoDistrict: 'SRI MUKTSAR SAHIB',
    geoState: 'PUNJAB',
    geoId: 541,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Official name is Sri Muktsar Sahib (changed 2012)'
  },
  'tamil nadu:thoothukkudi': {
    geoDistrict: 'TUTICORIN',
    geoState: 'TAMIL NADU',
    geoId: 34,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Tuticorin is former anglicized name'
  },
  'jammu and kashmir:poonch': {
    geoDistrict: 'PUNCH',
    geoState: 'JAMMU AND KASHMIR',
    geoId: 641,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Punch is alternate spelling'
  },
  'gujarat:dohad': {
    geoDistrict: 'DAHOD',
    geoState: 'GUJARAT',
    geoId: 269,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Dahod is primary spelling, Dohad is official alternate'
  },
  'madhya pradesh:khandwa': {
    geoDistrict: 'EAST NIMAR',
    geoState: 'MADHYA PRADESH',
    geoId: 226,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'District was officially known as East Nimar'
  },
  'madhya pradesh:khargone': {
    geoDistrict: 'WEST NIMAR',
    geoState: 'MADHYA PRADESH',
    geoId: 230,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'District was officially known as West Nimar'
  },
  'odisha:sonepur': {
    geoDistrict: 'SUBARNAPUR',
    geoState: 'ODISHA',
    geoId: 191,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Official district name is Subarnapur'
  },
  'telangana:jayashanker bhopalapally': {
    geoDistrict: 'JAYASHANKAR BHUPALAPALLY',
    geoState: 'TELANGANA',
    geoId: 629,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Official spelling is Jayashankar Bhupalapally, created 2016'
  },
  'uttar pradesh:siddharth nagar': {
    geoDistrict: 'SIDDHARTHNAGAR',
    geoState: 'UTTAR PRADESH',
    geoId: 447,
    confidence: 1.0,
    method: 'research-verified-spelling',
    note: 'Official spelling is Siddharthnagar (no space)'
  }
};

// Wrong state corrections
const WRONG_STATE_FIXES = {
  'gujarat:narmadapuram': 'madhya pradesh:narmadapuram',
  'madhya pradesh:jayashanker bhopalapally': 'telangana:jayashanker bhopalapally',
  'madhya pradesh:siddharth nagar': 'uttar pradesh:siddharth nagar'
};

let added = 0;
let fixed = 0;

console.log('\n' + '─'.repeat(80));
console.log('Adding verified mappings...');
console.log('─'.repeat(80));

for (const [key, mapping] of Object.entries(VERIFIED_MAPPINGS)) {
  // Remove from excluded if it exists
  if (perfectMapping.excluded[key]) {
    delete perfectMapping.excluded[key];
  }
  
  // Add to mappings
  perfectMapping.mappings[key] = mapping;
  added++;
  
  console.log(`✅ ${key}`);
  console.log(`   → ${mapping.geoDistrict} (geoId: ${mapping.geoId})`);
  console.log(`   📝 ${mapping.note}`);
}

console.log('\n' + '─'.repeat(80));
console.log('Fixing wrong state assignments...');
console.log('─'.repeat(80));

for (const [wrongKey, correctKey] of Object.entries(WRONG_STATE_FIXES)) {
  if (perfectMapping.excluded[wrongKey]) {
    // Get the mapping for the correct key
    const mapping = VERIFIED_MAPPINGS[correctKey];
    if (mapping) {
      // Remove wrong key
      delete perfectMapping.excluded[wrongKey];
      
      // Mapping already added above
      fixed++;
      console.log(`🔴 FIXED: ${wrongKey} → ${correctKey}`);
    }
  }
}

// Update metadata
perfectMapping.version = '3.0-research-implemented';
perfectMapping.generated = new Date().toISOString();
perfectMapping.researchBased = true;
perfectMapping.researchSource = 'research_1.md - Professional Analysis + Validation';
perfectMapping.totalMappings = Object.keys(perfectMapping.mappings).length;
perfectMapping.excludedDistricts = Object.keys(perfectMapping.excluded).length;
perfectMapping.coverage = ((perfectMapping.totalMappings / perfectMapping.totalAPIDistricts) * 100).toFixed(2) + '%';

// Save
fs.writeFileSync(mappingPath, JSON.stringify(perfectMapping, null, 2));

console.log('\n' + '═'.repeat(80));
console.log('IMPLEMENTATION COMPLETE');
console.log('═'.repeat(80));
console.log(`\n📊 Results:`);
console.log(`  ✅ Added mappings: ${added}`);
console.log(`  🔴 Fixed wrong states: ${fixed}`);
console.log(`\n📈 New totals:`);
console.log(`  Total mappings: ${perfectMapping.totalMappings} (was 693)`);
console.log(`  Excluded: ${perfectMapping.excludedDistricts} (was 42)`);
console.log(`  Coverage: ${perfectMapping.coverage} (was 94.29%)`);
console.log(`\n💾 Saved to: ${mappingPath}`);
console.log('\n✨ Research-verified mappings successfully implemented!\n');
