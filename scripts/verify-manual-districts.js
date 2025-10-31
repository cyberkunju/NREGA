const fs = require('fs');
const geojson = JSON.parse(fs.readFileSync('frontend/public/india-districts.geojson', 'utf8'));

console.log('Total districts in GeoJSON:', geojson.features.length);
console.log('\n=== ANALYZING MANUALLY ADDED DISTRICTS ===\n');

// Districts that were likely added manually (based on research docs)
const suspectedManualDistricts = [
  'kumuram bheem',
  'mulugu',
  'narayanpet',
  'jogulamba gadwal',
  'wanaparthy',
  'yadadri bhuvanagiri',
  'medchal malkajgiri',
  'vikarabad',
  'rajanna sircilla',
  'jayashankar',
  'mancherial',
  'kamareddy',
  'siddipet',
  'jangaon',
  'peddapalli',
  'suryapet',
  'mahabubabad',
  'nirmal',
  'sangareddy',
  'nagarkurnool'
];

const normalize = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const manuallyAdded = [];

geojson.features.forEach(feature => {
  const props = feature.properties;
  const districtName = props.district || props.DISTRICT || props.name || props.NAME || '';
  const normalizedName = normalize(districtName);
  
  if (suspectedManualDistricts.some(suspect => normalizedName.includes(suspect) || suspect.includes(normalizedName.split(' ')[0]))) {
    const geometry = feature.geometry;
    const coords = geometry.coordinates;
    
    // Calculate rough complexity (number of coordinate points)
    let pointCount = 0;
    const countPoints = (arr) => {
      if (Array.isArray(arr[0])) {
        arr.forEach(countPoints);
      } else {
        pointCount++;
      }
    };
    countPoints(coords);
    
    // Get bounding box
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    const getBounds = (arr) => {
      if (Array.isArray(arr[0])) {
        arr.forEach(getBounds);
      } else {
        minLon = Math.min(minLon, arr[0]);
        maxLon = Math.max(maxLon, arr[0]);
        minLat = Math.min(minLat, arr[1]);
        maxLat = Math.max(maxLat, arr[1]);
      }
    };
    getBounds(coords);
    
    const area = (maxLon - minLon) * (maxLat - minLat);
    
    manuallyAdded.push({
      name: districtName,
      state: props.st_nm || props.STATE || props.state || 'Unknown',
      geometryType: geometry.type,
      pointCount,
      area: area.toFixed(4),
      bounds: {
        lon: [minLon.toFixed(4), maxLon.toFixed(4)],
        lat: [minLat.toFixed(4), maxLat.toFixed(4)]
      },
      properties: Object.keys(props).join(', ')
    });
  }
});

console.log('Found', manuallyAdded.length, 'potentially manually-added districts:\n');

manuallyAdded.forEach((d, i) => {
  console.log(`${i + 1}. ${d.name} (${d.state})`);
  console.log(`   Type: ${d.geometryType}`);
  console.log(`   Complexity: ${d.pointCount} coordinate points`);
  console.log(`   Area: ${d.area} sq degrees`);
  console.log(`   Bounds: Lon[${d.bounds.lon[0]} to ${d.bounds.lon[1]}], Lat[${d.bounds.lat[0]} to ${d.bounds.lat[1]}]`);
  console.log(`   Properties: ${d.properties}`);
  console.log('');
});

// Compare with typical original districts
console.log('\n=== COMPARISON WITH ORIGINAL DISTRICTS ===\n');

const originalSamples = geojson.features
  .filter(f => {
    const name = normalize(f.properties.district || f.properties.DISTRICT || '');
    return !suspectedManualDistricts.some(s => name.includes(s));
  })
  .slice(0, 10);

let totalPoints = 0;
originalSamples.forEach(f => {
  let count = 0;
  const countPoints = (arr) => {
    if (Array.isArray(arr[0])) arr.forEach(countPoints);
    else count++;
  };
  countPoints(f.geometry.coordinates);
  totalPoints += count;
});

console.log('Average complexity of original districts:', Math.round(totalPoints / originalSamples.length), 'points');
console.log('Average complexity of manual districts:', Math.round(manuallyAdded.reduce((sum, d) => sum + d.pointCount, 0) / manuallyAdded.length), 'points');

// Check for suspicious patterns
console.log('\n=== QUALITY CHECKS ===\n');

const suspicious = manuallyAdded.filter(d => {
  return d.pointCount < 50 || // Too simple
         d.pointCount > 50000 || // Too complex
         parseFloat(d.area) < 0.01 || // Too small
         parseFloat(d.area) > 5; // Too large
});

if (suspicious.length > 0) {
  console.log('⚠️  SUSPICIOUS DISTRICTS (may be incorrect):');
  suspicious.forEach(d => {
    console.log(`   - ${d.name}: ${d.pointCount} points, ${d.area} sq deg area`);
  });
} else {
  console.log('✓ All manually-added districts look reasonable');
}
