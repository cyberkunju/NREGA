const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const data = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

console.log('═'.repeat(80));
console.log('COMPARING RESEARCHER 2 FINDINGS WITH CURRENT STATE');
console.log('═'.repeat(80));
console.log('');

// Researcher 2's key findings
const researcher2Findings = {
  'madhya pradesh:narmadapuram': { geoId: 245, note: 'Renamed from Hoshangabad' },
  'maharashtra:chatrapati sambhaji nagar': { geoId: 181, note: 'Renamed from Aurangabad' },
  'maharashtra:dharashiv': { geoId: 143, note: 'Renamed from Osmanabad' },
  'telangana:jayashankar bhopalapally': { geoId: 629, note: 'Wrong state fixed' },
  'uttar pradesh:siddharth nagar': { geoId: 447, note: 'Wrong state fixed' },
  'andhra pradesh:anantapur': { geoId: 94, note: 'Spelling: Ananthapuramu' },
  'chhattisgarh:kawardha': { geoId: 227, note: 'Renamed to Kabirdham' },
  'gujarat:dohad': { geoId: 269, note: 'Spelling: Dahod' },
  'jammu and kashmir:poonch': { geoId: 641, note: 'Spelling: Punch' },
  'maharashtra:beed': { geoId: 158, note: 'Spelling: Bid' },
  'madhya pradesh:khandwa': { geoId: 226, note: 'Historical: East Nimar' },
  'madhya pradesh:khargone': { geoId: 230, note: 'Historical: West Nimar' },
  'madhya pradesh:narsinghpur': { geoId: 254, note: 'Spelling: Narshimapura' }
};

const newDistricts = [
  'chhattisgarh:sarangarh bilaigarh',
  'tripura:unakoti',
  'meghalaya:eastern west khasi hills',
  'karnataka:vijayanagara'
];

let alreadyMapped = 0;
let alreadyExcluded = 0;
let missing = 0;
let geoIdMismatch = 0;

console.log('📊 CHECKING MAPPABLE DISTRICTS:\n');

for (const [key, info] of Object.entries(researcher2Findings)) {
  if (data.mappings[key]) {
    const current = data.mappings[key];
    if (current.geoId === info.geoId) {
      console.log(`✅ ${key}`);
      console.log(`   Already mapped correctly (geoId: ${info.geoId})`);
      alreadyMapped++;
    } else {
      console.log(`⚠️  ${key}`);
      console.log(`   Mapped but geoId mismatch: ${current.geoId} vs ${info.geoId}`);
      geoIdMismatch++;
    }
  } else if (data.excluded[key]) {
    console.log(`📊 ${key}`);
    console.log(`   Currently excluded, but Researcher 2 says it should be mapped`);
    console.log(`   GeoID: ${info.geoId} - ${info.note}`);
    alreadyExcluded++;
  } else {
    console.log(`❌ ${key}`);
    console.log(`   MISSING - Should be added with geoId: ${info.geoId}`);
    console.log(`   Note: ${info.note}`);
    missing++;
  }
  console.log('');
}

console.log('📊 CHECKING NEW DISTRICTS (Should be excluded):\n');

newDistricts.forEach(key => {
  if (data.excluded[key]) {
    console.log(`✅ ${key} - Already excluded`);
  } else if (data.mappings[key]) {
    console.log(`⚠️  ${key} - Currently mapped, but should be excluded (new district)`);
  } else {
    console.log(`❌ ${key} - Not found (should be in excluded)`);
  }
});

console.log('\n' + '═'.repeat(80));
console.log('SUMMARY');
console.log('═'.repeat(80));
console.log(`✅ Already correctly mapped: ${alreadyMapped}`);
console.log(`📊 Currently excluded (need to map): ${alreadyExcluded}`);
console.log(`❌ Missing (need to add): ${missing}`);
console.log(`⚠️  GeoID mismatches: ${geoIdMismatch}`);
console.log('');

if (alreadyMapped === Object.keys(researcher2Findings).length) {
  console.log('🎉 ALL FINDINGS FROM RESEARCHER 2 ALREADY IMPLEMENTED!');
} else {
  console.log('⚠️  Some findings from Researcher 2 need attention');
}
