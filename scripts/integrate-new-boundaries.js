const fs = require('fs');
const path = require('path');

console.log('=== INTEGRATING NEW CHHATTISGARH BOUNDARIES ===\n');

// Load main GeoJSON
const mainGeojsonPath = 'frontend/public/india-districts.geojson';
const mainGeojson = JSON.parse(fs.readFileSync(mainGeojsonPath, 'utf8'));

console.log(`Loaded main GeoJSON: ${mainGeojson.features.length} districts\n`);

// Districts to replace (the hexagonal placeholders)
const districtsToReplace = [
  'khairagarh chhuikhadan gandai',
  'manendragarh chirmiri bharatpur',
  'mohla manpur ambagarh chowki',
  'sakti',
  'sarangarh bilaigarh'
];

const normalize = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Find and remove old placeholder districts
let removedCount = 0;
mainGeojson.features = mainGeojson.features.filter(feature => {
  const districtName = feature.properties.district || feature.properties.DISTRICT || '';
  const normalized = normalize(districtName);
  
  const shouldRemove = districtsToReplace.some(d => normalized.includes(d) || d.includes(normalized));
  
  if (shouldRemove) {
    console.log(`❌ Removing placeholder: ${districtName}`);
    removedCount++;
    return false;
  }
  return true;
});

console.log(`\nRemoved ${removedCount} placeholder districts\n`);

// Load and add new boundaries
const boundariesDir = 'frontend/public/boundaries';
let addedCount = 0;

if (fs.existsSync(boundariesDir)) {
  const files = fs.readdirSync(boundariesDir).filter(f => f.endsWith('.geojson'));
  
  console.log(`Found ${files.length} new boundary files:\n`);
  
  files.forEach(file => {
    try {
      const filePath = path.join(boundariesDir, file);
      const newBoundary = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (newBoundary.type === 'Feature') {
        // Count points
        const coords = newBoundary.geometry.coordinates;
        let pointCount = 0;
        
        const countPoints = (arr) => {
          if (Array.isArray(arr[0])) {
            arr.forEach(countPoints);
          } else {
            pointCount++;
          }
        };
        countPoints(coords);
        
        // Add to main GeoJSON
        mainGeojson.features.push(newBoundary);
        addedCount++;
        
        console.log(`✅ Added: ${newBoundary.properties.District} (${pointCount} points)`);
      }
    } catch (e) {
      console.log(`⚠️  Error loading ${file}: ${e.message}`);
    }
  });
} else {
  console.log(`⚠️  Boundaries directory not found: ${boundariesDir}`);
  console.log('   Run the Python download script first!\n');
}

// Save updated GeoJSON
if (addedCount > 0) {
  // Backup original
  const backupPath = mainGeojsonPath + '.backup';
  fs.copyFileSync(mainGeojsonPath, backupPath);
  console.log(`\n📦 Backup created: ${backupPath}`);
  
  // Save updated version
  fs.writeFileSync(mainGeojsonPath, JSON.stringify(mainGeojson, null, 2));
  
  console.log(`\n✅ SUCCESS!`);
  console.log(`   Removed: ${removedCount} placeholder districts`);
  console.log(`   Added: ${addedCount} real boundaries`);
  console.log(`   Total districts: ${mainGeojson.features.length}`);
  console.log(`\n📁 Updated: ${mainGeojsonPath}`);
} else {
  console.log(`\n⚠️  No new boundaries to add`);
  console.log('   Make sure to run the Python download script first:');
  console.log('   python scripts/download-chhattisgarh-boundaries.py');
}

console.log('\n' + '='.repeat(60));
