/**
 * FINAL VERIFICATION - Check Everything is 100% Perfect
 */

const fs = require('fs');
const path = require('path');

console.log('═'.repeat(80));
console.log('FINAL VERIFICATION - 100% PERFECT CHECK');
console.log('═'.repeat(80));
console.log('');

let allPerfect = true;

function countPoints(feature) {
  const coords = feature.geometry.coordinates;
  if (feature.geometry.type === 'Polygon') {
    return coords.reduce((sum, ring) => sum + ring.length, 0);
  } else if (feature.geometry.type === 'MultiPolygon') {
    return coords.reduce((sum, polygon) => 
      sum + polygon.reduce((s, ring) => s + ring.length, 0), 0
    );
  }
  return 0;
}

// 1. Check GeoJSON file
console.log('1️⃣  CHECKING GEOJSON FILE...');
const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

console.log(`   Total features: ${geoJson.features.length}`);

// Check for duplicates
const districtKeys = new Map();
let duplicates = 0;
geoJson.features.forEach(f => {
  const key = `${f.properties.STATE}:${f.properties.District}`;
  if (districtKeys.has(key)) {
    console.log(`   ❌ DUPLICATE: ${key}`);
    duplicates++;
    allPerfect = false;
  } else {
    districtKeys.set(key, true);
  }
});

if (duplicates === 0) {
  console.log('   ✅ No duplicates found');
}

// 2. Check downloaded districts
console.log('\n2️⃣  CHECKING DOWNLOADED DISTRICTS...');
const downloadedDistricts = [
  'RANIPET',
  'VIJAYANAGARA',
  'MAYILADUTHURAI',
  'HANUMAKONDA',
  'MALERKOTLA',
  'BAJALI',
  'PAKYONG',
  'SORENG',
  'TAMULPUR',
  'RAE BARELI',
  'EASTERN WEST KHASI HILLS'
];

let foundCount = 0;
downloadedDistricts.forEach(district => {
  const found = geoJson.features.find(f => f.properties.District === district);
  if (found) {
    const points = countPoints(found);
    if (points > 100) {
      console.log(`   ✅ ${district}: ${points.toLocaleString()} points (DETAILED)`);
      foundCount++;
    } else {
      console.log(`   ⚠️  ${district}: ${points} points (TOO FEW!)`);
      allPerfect = false;
    }
  } else {
    console.log(`   ❌ ${district}: NOT FOUND`);
    allPerfect = false;
  }
});

console.log(`   Found: ${foundCount}/${downloadedDistricts.length}`);

// 3. Check mapping file
console.log('\n3️⃣  CHECKING MAPPING FILE...');
const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

console.log(`   Total mappings: ${Object.keys(mapping.mappings).length}`);
console.log(`   Excluded: ${Object.keys(mapping.excluded).length}`);
console.log(`   Coverage: ${mapping.coverage}`);

// Check downloaded districts in mapping
const downloadedKeys = [
  'tamil nadu:ranipet',
  'karnataka:vijayanagara',
  'tamil nadu:mayiladuthurai',
  'telangana:hanumakonda',
  'punjab:malerkotla',
  'assam:bajali',
  'sikkim:pakyong',
  'sikkim:soreng',
  'assam:tamulpur',
  'uttar pradesh:rae bareli',
  'meghalaya:eastern west khasi hills'
];

let mappedCount = 0;
let detailedCount = 0;
downloadedKeys.forEach(key => {
  const m = mapping.mappings[key];
  if (m) {
    if (m.method === 'openstreetmap-detailed' && m.confidence === 1) {
      console.log(`   ✅ ${key}: confidence=${m.confidence}, method=${m.method}`);
      detailedCount++;
    } else {
      console.log(`   ⚠️  ${key}: confidence=${m.confidence}, method=${m.method} (NOT UPDATED!)`);
      allPerfect = false;
    }
    mappedCount++;
  } else {
    console.log(`   ❌ ${key}: NOT IN MAPPING`);
    allPerfect = false;
  }
});

console.log(`   Mapped: ${mappedCount}/${downloadedKeys.length}`);
console.log(`   With detailed method: ${detailedCount}/${downloadedKeys.length}`);

// 4. Check total points
console.log('\n4️⃣  CHECKING TOTAL COORDINATE POINTS...');
let totalPoints = 0;
geoJson.features.forEach(f => {
  totalPoints += countPoints(f);
});

console.log(`   Total points in GeoJSON: ${totalPoints.toLocaleString()}`);
console.log(`   Average per district: ${Math.round(totalPoints / geoJson.features.length)}`);

const geoJsonStats = fs.statSync(geoJsonPath);
const geoJsonSizeMB = (geoJsonStats.size / 1024 / 1024).toFixed(2);
console.log(`   File size: ${geoJsonSizeMB} MB`);

if (totalPoints > 70000) {
  console.log('   ✅ Excellent point density - detailed boundaries confirmed');
} else {
  console.log('   ⚠️  Low point count - might be missing detailed boundaries');
  allPerfect = false;
}

// 5. Check for old rectangles
console.log('\n5️⃣  CHECKING FOR OLD RECTANGLES...');
let rectangles = 0;
downloadedDistricts.forEach(district => {
  const found = geoJson.features.find(f => f.properties.District === district);
  if (found) {
    const points = countPoints(found);
    if (points <= 10) {
      console.log(`   ❌ ${district}: Only ${points} points - STILL A RECTANGLE!`);
      rectangles++;
      allPerfect = false;
    }
  }
});

if (rectangles === 0) {
  console.log('   ✅ No rectangles found - all detailed!');
}

// 6. Check mapping metadata
console.log('\n6️⃣  CHECKING MAPPING METADATA...');
console.log(`   Version: ${mapping.version}`);
console.log(`   Note: ${mapping.note}`);

if (mapping.note.includes('OpenStreetMap') && mapping.note.includes('detailed')) {
  console.log('   ✅ Metadata correctly updated');
} else {
  console.log('   ⚠️  Metadata not updated properly');
  allPerfect = false;
}

// FINAL VERDICT
console.log('\n' + '═'.repeat(80));
if (allPerfect) {
  console.log('🎉 PERFECT! EVERYTHING IS 100% CORRECT!');
  console.log('═'.repeat(80));
  console.log('\n✅ All checks passed:');
  console.log('   ✅ No duplicates in GeoJSON');
  console.log('   ✅ All 11 districts have detailed boundaries (100+ points)');
  console.log('   ✅ All mappings updated with confidence=1.0');
  console.log('   ✅ All mappings use "openstreetmap-detailed" method');
  console.log('   ✅ No old rectangles remaining');
  console.log(`   ✅ Total ${totalPoints.toLocaleString()} coordinate points`);
  console.log('   ✅ Metadata updated');
  console.log('\n🚀 READY FOR PRODUCTION!');
} else {
  console.log('⚠️  ISSUES FOUND - NOT PERFECT YET');
  console.log('═'.repeat(80));
  console.log('\nPlease review the issues above and fix them.');
}
console.log('═'.repeat(80));
