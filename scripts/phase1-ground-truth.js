/**
 * Phase 1: Ground Truth Establishment
 * 
 * This script creates authoritative lists of:
 * 1. API districts (from government API)
 * 2. GeoJSON districts (from map file)
 * 3. Initial exact matches
 * 4. Unmatched districts requiring research
 * 
 * Output: Ground truth JSON files for validation
 */

const fs = require('fs');
const path = require('path');

// Normalize function - consistent across all scripts
function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\bdist(rict)?\b/g, '')
    .trim();
}

// Create composite key
function createKey(district, state) {
  return `${normalize(state)}:${normalize(district)}`;
}

async function extractAPIGroundTruth() {
  console.log('📊 Extracting API Ground Truth...\n');
  
  try {
    // Read API data from the complete list
    const apiDataPath = path.join(__dirname, '..', 'complete-api-districts.txt');
    const apiContent = fs.readFileSync(apiDataPath, 'utf-8');
    
    const lines = apiContent.split('\n');
    const apiDistricts = [];
    const seen = new Set();
    
    for (const line of lines) {
      // Skip header and empty lines
      if (!line.trim() || line.includes('districtName') || line.includes('---')) continue;
      
      // Parse the line (format: "District Name                          State Name")
      const parts = line.split(/\s{2,}/); // Split on 2+ spaces
      if (parts.length >= 2) {
        const districtName = parts[0].trim();
        const stateName = parts[1].trim();
        
        if (districtName && stateName) {
          const key = createKey(districtName, stateName);
          
          if (!seen.has(key)) {
            seen.add(key);
            apiDistricts.push({
              districtName,
              stateName,
              normalizedDistrict: normalize(districtName),
              normalizedState: normalize(stateName),
              compositeKey: key
            });
          }
        }
      }
    }
    
    console.log(`✅ Found ${apiDistricts.length} unique API districts`);
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'analysis-output', 'api-ground-truth.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      generated: new Date().toISOString(),
      source: 'Government API /api/performance/heatmap-data',
      count: apiDistricts.length,
      districts: apiDistricts
    }, null, 2));
    
    console.log(`💾 Saved to: ${outputPath}\n`);
    return apiDistricts;
    
  } catch (error) {
    console.error('❌ Error extracting API data:', error.message);
    throw error;
  }
}

async function extractGeoJSONGroundTruth() {
  console.log('🗺️  Extracting GeoJSON Ground Truth...\n');
  
  try {
    // Read GeoJSON file
    const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');
    const geoJsonContent = fs.readFileSync(geoJsonPath, 'utf-8');
    const geoJson = JSON.parse(geoJsonContent);
    
    const geoDistricts = [];
    const seen = new Set();
    
    for (const feature of geoJson.features) {
      const district = feature.properties.District || feature.properties.DISTRICT || feature.properties.district;
      const state = feature.properties.STATE || feature.properties.state || feature.properties.st_nm;
      const geoId = feature.properties.id || feature.properties.dist_code || feature.properties.D_CODE;
      
      if (district && state && geoId) {
        const key = createKey(district, state);
        
        if (!seen.has(key)) {
          seen.add(key);
          geoDistricts.push({
            district,
            state,
            geoId,
            normalizedDistrict: normalize(district),
            normalizedState: normalize(state),
            compositeKey: key,
            fullName: feature.properties.FULL_NAME || `${district}, ${state}`
          });
        }
      }
    }
    
    console.log(`✅ Found ${geoDistricts.length} unique GeoJSON districts`);
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'analysis-output', 'geojson-ground-truth.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      generated: new Date().toISOString(),
      source: 'frontend/public/india-districts.geojson',
      count: geoDistricts.length,
      districts: geoDistricts
    }, null, 2));
    
    console.log(`💾 Saved to: ${outputPath}\n`);
    return geoDistricts;
    
  } catch (error) {
    console.error('❌ Error extracting GeoJSON data:', error.message);
    throw error;
  }
}

async function findExactMatches(apiDistricts, geoDistricts) {
  console.log('🔍 Finding Exact Matches...\n');
  
  const exactMatches = [];
  const unmatchedAPI = [];
  const unmatchedGeo = [...geoDistricts];
  
  for (const api of apiDistricts) {
    let found = false;
    
    for (let i = 0; i < unmatchedGeo.length; i++) {
      const geo = unmatchedGeo[i];
      
      if (api.compositeKey === geo.compositeKey) {
        exactMatches.push({
          apiDistrict: api.districtName,
          apiState: api.stateName,
          geoDistrict: geo.district,
          geoState: geo.state,
          geoId: geo.geoId,
          compositeKey: api.compositeKey,
          confidence: 1.0,
          method: 'exact-match'
        });
        
        unmatchedGeo.splice(i, 1);
        found = true;
        break;
      }
    }
    
    if (!found) {
      unmatchedAPI.push(api);
    }
  }
  
  console.log(`✅ Exact matches: ${exactMatches.length}`);
  console.log(`⚠️  Unmatched API districts: ${unmatchedAPI.length}`);
  console.log(`⚠️  Unmatched GeoJSON districts: ${unmatchedGeo.length}\n`);
  
  // Save results
  const outputDir = path.join(__dirname, '..', 'analysis-output');
  
  fs.writeFileSync(
    path.join(outputDir, 'exact-matches.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      count: exactMatches.length,
      matches: exactMatches
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'unmatched-api.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      count: unmatchedAPI.length,
      districts: unmatchedAPI
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'unmatched-geojson.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      count: unmatchedGeo.length,
      districts: unmatchedGeo
    }, null, 2)
  );
  
  console.log('💾 Saved match results to analysis-output/\n');
  
  return { exactMatches, unmatchedAPI, unmatchedGeo };
}

async function generateResearchQueue(unmatchedAPI, unmatchedGeo) {
  console.log('📋 Generating Research Queue...\n');
  
  const researchQueue = [];
  
  for (const api of unmatchedAPI) {
    // Find potential matches in GeoJSON
    const potentialMatches = [];
    
    for (const geo of unmatchedGeo) {
      // Check if states match
      if (api.normalizedState === geo.normalizedState) {
        // Calculate simple similarity
        const apiDist = api.normalizedDistrict;
        const geoDist = geo.normalizedDistrict;
        
        // Check for substring matches
        if (apiDist.includes(geoDist) || geoDist.includes(apiDist)) {
          potentialMatches.push({
            geoDistrict: geo.district,
            geoState: geo.state,
            geoId: geo.geoId,
            similarity: 'substring-match'
          });
        }
      }
    }
    
    researchQueue.push({
      apiDistrict: api.districtName,
      apiState: api.stateName,
      compositeKey: api.compositeKey,
      potentialMatches,
      status: 'NEEDS_RESEARCH',
      notes: '',
      action: 'MATCH or EXCLUDE',
      researchSources: [
        'Census of India: https://censusindia.gov.in/',
        'Ministry of Home Affairs',
        'State Government Website',
        'District Handbook'
      ]
    });
  }
  
  console.log(`📝 Created research queue with ${researchQueue.length} items`);
  
  // Save research queue
  const outputPath = path.join(__dirname, '..', 'analysis-output', 'research-queue.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generated: new Date().toISOString(),
    count: researchQueue.length,
    instructions: 'For each item, research the correct mapping and update status to MATCHED or EXCLUDED',
    queue: researchQueue
  }, null, 2));
  
  console.log(`💾 Saved to: ${outputPath}\n`);
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PHASE 1: GROUND TRUTH ESTABLISHMENT');
  console.log('  Zero-Compromise District Mapping');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'analysis-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Step 1: Extract API ground truth
    const apiDistricts = await extractAPIGroundTruth();
    
    // Step 2: Extract GeoJSON ground truth
    const geoDistricts = await extractGeoJSONGroundTruth();
    
    // Step 3: Find exact matches
    const { exactMatches, unmatchedAPI, unmatchedGeo } = await findExactMatches(apiDistricts, geoDistricts);
    
    // Step 4: Generate research queue
    await generateResearchQueue(unmatchedAPI, unmatchedGeo);
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total API Districts:      ${apiDistricts.length}`);
    console.log(`Total GeoJSON Districts:  ${geoDistricts.length}`);
    console.log(`Exact Matches:            ${exactMatches.length} (${((exactMatches.length / apiDistricts.length) * 100).toFixed(1)}%)`);
    console.log(`Unmatched API:            ${unmatchedAPI.length}`);
    console.log(`Unmatched GeoJSON:        ${unmatchedGeo.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('✅ Phase 1 Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review analysis-output/research-queue.json');
    console.log('2. Research each unmatched district using government sources');
    console.log('3. Update research-queue.json with findings');
    console.log('4. Run Phase 2 to generate perfect mapping\n');
    
  } catch (error) {
    console.error('\n❌ Phase 1 Failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { extractAPIGroundTruth, extractGeoJSONGroundTruth, findExactMatches };
