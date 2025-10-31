/**
 * Remove duplicate districts from GeoJSON
 */

const fs = require('fs');
const path = require('path');

const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');

console.log('Removing duplicates...\n');

const data = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

console.log(`Before: ${data.features.length} features`);

// Remove duplicates - keep the one with more coordinates (more detailed)
const seen = new Map();

data.features.forEach(feature => {
  const key = `${feature.properties.STATE}:${feature.properties.District}`;
  
  if (!seen.has(key)) {
    seen.set(key, feature);
  } else {
    // Keep the one with more coordinates
    const existing = seen.get(key);
    const existingPoints = countPoints(existing);
    const newPoints = countPoints(feature);
    
    if (newPoints > existingPoints) {
      console.log(`  Replacing ${key}: ${existingPoints} → ${newPoints} points`);
      seen.set(key, feature);
    }
  }
});

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

data.features = Array.from(seen.values());

console.log(`\nAfter: ${data.features.length} features`);
console.log(`Removed: ${data.features.length - seen.size} duplicates\n`);

fs.writeFileSync(geoJsonPath, JSON.stringify(data, null, 2));

console.log('✅ Done!');
