const fs = require('fs');
const geojson = JSON.parse(fs.readFileSync('frontend/public/india-districts.geojson', 'utf8'));

console.log('=== IDENTIFYING MANUALLY ADDED DISTRICTS ===\n');

// Check for districts with specific property patterns that indicate manual addition
const manualIndicators = [];

geojson.features.forEach((feature, index) => {
  const props = feature.properties;
  
  // Get district name from various possible properties
  const districtName = props.district || props.DISTRICT || props.name || props.NAME || props.FULL_NAME || 'UNNAMED';
  const state = props.st_nm || props.STATE || props.state || 'Unknown';
  
  // Check for indicators of manual addition:
  // 1. Has 'source' property (indicates downloaded)
  // 2. Has 'downloaded' property
  // 3. Very simple geometry (< 20 points)
  // 4. Missing standard properties
  
  const hasSource = !!props.source;
  const hasDownloaded = !!props.downloaded;
  
  let pointCount = 0;
  const countPoints = (arr) => {
    if (Array.isArray(arr[0])) {
      arr.forEach(countPoints);
    } else {
      pointCount++;
    }
  };
  countPoints(feature.geometry.coordinates);
  
  const verySimple = pointCount < 20;
  const missingStandardProps = !props.Shape_Leng && !props.Shape_Area;
  
  if (hasSource || hasDownloaded || (verySimple && missingStandardProps)) {
    manualIndicators.push({
      index: index + 1,
      name: districtName,
      state: state,
      pointCount,
      hasSource,
      hasDownloaded,
      verySimple,
      allProps: Object.keys(props).join(', ')
    });
  }
});

console.log(`Found ${manualIndicators.length} manually added/modified districts:\n`);

// Group by indicator type
const withSource = manualIndicators.filter(d => d.hasSource);
const withDownloaded = manualIndicators.filter(d => d.hasDownloaded);
const verySimpleGeometry = manualIndicators.filter(d => d.verySimple && !d.hasSource && !d.hasDownloaded);

console.log('=== DISTRICTS WITH "source" PROPERTY (Downloaded from online) ===');
console.log(`Count: ${withSource.length}\n`);
withSource.forEach(d => {
  console.log(`${d.index}. ${d.name} (${d.state}) - ${d.pointCount} points`);
});

console.log('\n=== DISTRICTS WITH "downloaded" PROPERTY ===');
console.log(`Count: ${withDownloaded.length}\n`);
withDownloaded.forEach(d => {
  console.log(`${d.index}. ${d.name} (${d.state}) - ${d.pointCount} points`);
});

console.log('\n=== DISTRICTS WITH VERY SIMPLE GEOMETRY (< 20 points, likely placeholder) ===');
console.log(`Count: ${verySimpleGeometry.length}\n`);
verySimpleGeometry.forEach(d => {
  console.log(`${d.index}. ${d.name} (${d.state}) - ${d.pointCount} points`);
});

// Detailed analysis of downloaded districts
console.log('\n\n=== DETAILED ANALYSIS OF DOWNLOADED DISTRICTS ===\n');

const downloaded = manualIndicators.filter(d => d.hasSource || d.hasDownloaded);

// Check if they look legitimate
const suspicious = downloaded.filter(d => d.pointCount < 50 || d.pointCount > 10000);
const reasonable = downloaded.filter(d => d.pointCount >= 50 && d.pointCount <= 10000);

console.log(`✓ Reasonable quality (50-10000 points): ${reasonable.length}`);
console.log(`⚠️  Suspicious quality (< 50 or > 10000 points): ${suspicious.length}\n`);

if (suspicious.length > 0) {
  console.log('SUSPICIOUS DISTRICTS:');
  suspicious.forEach(d => {
    console.log(`  - ${d.name} (${d.state}): ${d.pointCount} points`);
  });
}

console.log('\n=== SUMMARY ===');
console.log(`Total districts in GeoJSON: ${geojson.features.length}`);
console.log(`Manually added/downloaded: ${downloaded.length}`);
console.log(`Original districts: ${geojson.features.length - downloaded.length}`);
console.log(`Coverage: ${((downloaded.length / geojson.features.length) * 100).toFixed(2)}% manually added`);
