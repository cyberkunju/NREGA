const fs = require('fs');
const geojson = JSON.parse(fs.readFileSync('frontend/public/india-districts.geojson', 'utf8'));

console.log('=== FINDING GEOMETRIC ANOMALIES (Hexagonal/Octagonal Districts) ===\n');

const anomalies = [];

geojson.features.forEach((feature, index) => {
  const props = feature.properties;
  const districtName = props.district || props.DISTRICT || props.name || props.NAME || props.FULL_NAME || 'UNNAMED';
  const state = props.st_nm || props.STATE || props.state || 'Unknown';
  const geometry = feature.geometry;
  
  // Count coordinate points
  let pointCount = 0;
  const countPoints = (arr) => {
    if (Array.isArray(arr[0])) arr.forEach(countPoints);
    else pointCount++;
  };
  countPoints(geometry.coordinates);
  
  // Get bounding box and check if it's suspiciously regular
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  const getBounds = (arr) => {
    if (Array.isArray(arr[0])) arr.forEach(getBounds);
    else {
      minLon = Math.min(minLon, arr[0]);
      maxLon = Math.max(maxLon, arr[0]);
      minLat = Math.min(minLat, arr[1]);
      maxLat = Math.max(maxLat, arr[1]);
    }
  };
  getBounds(geometry.coordinates);
  
  const width = maxLon - minLon;
  const height = maxLat - minLat;
  const aspectRatio = width / height;
  
  // Check for suspicious patterns:
  // 1. Very few points (< 15) - likely geometric shape
  // 2. Perfect aspect ratio (close to 1.0) - likely square/hexagon
  // 3. Area too regular
  
  const veryFewPoints = pointCount < 15;
  const perfectSquare = Math.abs(aspectRatio - 1.0) < 0.1;
  const regularHexagon = pointCount >= 6 && pointCount <= 10;
  
  if (veryFewPoints || (regularHexagon && perfectSquare)) {
    anomalies.push({
      index: index + 1,
      name: districtName,
      state: state,
      pointCount,
      aspectRatio: aspectRatio.toFixed(2),
      width: width.toFixed(4),
      height: height.toFixed(4),
      bounds: {
        lon: [minLon.toFixed(4), maxLon.toFixed(4)],
        lat: [minLat.toFixed(4), maxLat.toFixed(4)]
      },
      type: regularHexagon ? 'HEXAGON/OCTAGON' : 'SIMPLE SHAPE',
      properties: Object.keys(props).join(', ')
    });
  }
});

console.log(`Found ${anomalies.length} districts with geometric anomalies:\n`);

// Sort by point count to see the most suspicious first
anomalies.sort((a, b) => a.pointCount - b.pointCount);

anomalies.forEach((d, i) => {
  console.log(`${i + 1}. ${d.name} (${d.state})`);
  console.log(`   Index: ${d.index}`);
  console.log(`   Type: ${d.type}`);
  console.log(`   Points: ${d.pointCount}`);
  console.log(`   Aspect Ratio: ${d.aspectRatio} (1.0 = perfect square)`);
  console.log(`   Size: ${d.width} x ${d.height} degrees`);
  console.log(`   Bounds: Lon[${d.bounds.lon[0]} to ${d.bounds.lon[1]}], Lat[${d.bounds.lat[0]} to ${d.bounds.lat[1]}]`);
  console.log('');
});

// Identify the specific districts visible in the screenshot
console.log('\n=== DISTRICTS VISIBLE IN YOUR SCREENSHOT ===\n');

const screenshotDistricts = [
  'manendragarh chirmiri bharatpur',
  'raigarh',
  'sakti',
  'bemetara',
  'mohla manpur ambagarh chowki',
  'raipur',
  'baloda bazar',
  'janjgir champa',
  'korba',
  'bilaspur',
  'mungeli',
  'jashpur',
  'surguja',
  'surajpur',
  'balrampur',
  'korea',
  'gaurela pendra marwahi'
];

const normalize = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

console.log('Checking which districts from screenshot have geometric issues:\n');

screenshotDistricts.forEach(searchName => {
  const found = anomalies.find(a => {
    const normalizedName = normalize(a.name);
    return normalizedName.includes(searchName) || searchName.includes(normalizedName.split(' ')[0]);
  });
  
  if (found) {
    console.log(`❌ ${found.name} - ${found.type} (${found.pointCount} points)`);
  }
});

console.log('\n=== SUMMARY ===');
console.log(`Total geometric anomalies: ${anomalies.length}`);
console.log(`These are likely placeholder rectangles/hexagons that need real boundaries`);
