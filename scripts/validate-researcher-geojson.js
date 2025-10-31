/**
 * Validate Researcher's GeoJSON Files
 * 
 * Check if the provided GeoJSON files are valid and can be used
 */

const fs = require('fs');
const path = require('path');

const researchDir = path.join(__dirname, '..', 'research');

console.log('═'.repeat(80));
console.log('VALIDATING RESEARCHER GEOJSON FILES');
console.log('═'.repeat(80));
console.log('');

const files = fs.readdirSync(researchDir).filter(f => f.endsWith('.geojson'));

console.log(`Found ${files.length} GeoJSON files\n`);

let valid = 0;
let invalid = 0;
let warnings = 0;

const results = [];

files.forEach(filename => {
  const filepath = path.join(researchDir, filename);
  const districtName = filename.replace('.geojson', '');
  
  console.log(`🔍 Validating: ${filename}`);
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content);
    
    const issues = [];
    const warns = [];
    
    // Check structure
    if (data.type !== 'Feature') {
      issues.push('❌ Not a Feature type');
    }
    
    if (!data.properties) {
      issues.push('❌ Missing properties');
    } else {
      if (!data.properties.District) warns.push('⚠️  Missing District property');
      if (!data.properties.STATE) warns.push('⚠️  Missing STATE property');
      if (!data.properties.id) warns.push('⚠️  Missing id property');
    }
    
    if (!data.geometry) {
      issues.push('❌ Missing geometry');
    } else {
      if (!data.geometry.type) {
        issues.push('❌ Missing geometry type');
      } else if (!['Polygon', 'MultiPolygon'].includes(data.geometry.type)) {
        issues.push(`❌ Invalid geometry type: ${data.geometry.type}`);
      }
      
      if (!data.geometry.coordinates) {
        issues.push('❌ Missing coordinates');
      } else {
        const coords = data.geometry.coordinates;
        
        // Check coordinate structure
        if (data.geometry.type === 'Polygon') {
          if (!Array.isArray(coords[0]) || !Array.isArray(coords[0][0])) {
            issues.push('❌ Invalid coordinate structure');
          } else {
            const ring = coords[0];
            const pointCount = ring.length;
            
            console.log(`   Points: ${pointCount}`);
            
            if (pointCount < 4) {
              issues.push(`❌ Too few points: ${pointCount} (need at least 4)`);
            } else if (pointCount > 5000) {
              warns.push(`⚠️  Too many points: ${pointCount} (may be slow)`);
            }
            
            // Check if polygon closes
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
              issues.push('❌ Polygon does not close (first ≠ last)');
            }
            
            // Check coordinate ranges (India bounds)
            const lons = ring.map(p => p[0]);
            const lats = ring.map(p => p[1]);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            
            console.log(`   Bounds: Lon [${minLon.toFixed(2)}, ${maxLon.toFixed(2)}], Lat [${minLat.toFixed(2)}, ${maxLat.toFixed(2)}]`);
            
            // India bounds: roughly 68-97 longitude, 8-37 latitude
            if (minLon < 60 || maxLon > 100) {
              warns.push(`⚠️  Longitude out of India range: [${minLon.toFixed(2)}, ${maxLon.toFixed(2)}]`);
            }
            if (minLat < 5 || maxLat > 40) {
              warns.push(`⚠️  Latitude out of India range: [${minLat.toFixed(2)}, ${maxLat.toFixed(2)}]`);
            }
          }
        }
      }
    }
    
    // Print results
    if (issues.length === 0) {
      if (warns.length === 0) {
        console.log('   ✅ VALID - No issues');
        valid++;
      } else {
        console.log('   ⚠️  VALID with warnings:');
        warns.forEach(w => console.log(`      ${w}`));
        valid++;
        warnings++;
      }
    } else {
      console.log('   ❌ INVALID:');
      issues.forEach(i => console.log(`      ${i}`));
      warns.forEach(w => console.log(`      ${w}`));
      invalid++;
    }
    
    results.push({
      filename,
      districtName,
      valid: issues.length === 0,
      issues,
      warnings: warns,
      properties: data.properties,
      pointCount: data.geometry?.type === 'Polygon' ? data.geometry.coordinates[0]?.length : 0
    });
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    invalid++;
    results.push({
      filename,
      districtName,
      valid: false,
      issues: [error.message],
      warnings: []
    });
  }
  
  console.log('');
});

console.log('═'.repeat(80));
console.log('VALIDATION SUMMARY');
console.log('═'.repeat(80));
console.log(`\n✅ Valid: ${valid}`);
console.log(`⚠️  Valid with warnings: ${warnings}`);
console.log(`❌ Invalid: ${invalid}`);
console.log(`📊 Total: ${files.length}`);

if (invalid === 0) {
  console.log('\n🎉 ALL FILES ARE VALID!');
  console.log('✅ Ready to integrate into the map');
} else {
  console.log(`\n⚠️  ${invalid} files need fixing before integration`);
}

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalFiles: files.length,
  valid,
  warnings,
  invalid,
  details: results
};

fs.writeFileSync(
  path.join(researchDir, 'VALIDATION_REPORT.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n💾 Detailed report saved to: research/VALIDATION_REPORT.json\n');
