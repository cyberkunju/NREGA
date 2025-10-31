#!/usr/bin/env node

/**
 * District Mapping Analysis Tool
 * 
 * This script:
 * 1. Fetches ALL districts from government API (direct, no database)
 * 2. Loads ALL districts from GeoJSON file
 * 3. Compares and finds ALL mismatches
 * 4. Generates a perfect mapping file
 * 5. Creates a comprehensive report
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const GOV_API_ENDPOINT = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
const GOV_API_KEY = '579b464db66ec23bdd000001d68ccbbe91b645a3578141daa6dc3a34';
const GEOJSON_PATH = path.join(__dirname, '../frontend/public/india-districts.geojson');
const OUTPUT_DIR = path.join(__dirname, '../analysis-output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Normalize district name for comparison
 */
function normalize(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\bdist(rict)?\b/g, '')
    .trim();
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score (0-1)
 */
function similarity(a, b) {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1.0;
  return (longer.length - levenshtein(longer, shorter)) / longer.length;
}

/**
 * Fetch ALL districts from government API
 */
async function fetchAllAPIDistricts() {
  console.log('📡 Fetching ALL districts from government API...');
  console.log(`   Endpoint: ${GOV_API_ENDPOINT}`);
  
  const allRecords = [];
  const limit = 10000;
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    try {
      console.log(`   Fetching records ${offset} to ${offset + limit}...`);
      
      const response = await axios.get(GOV_API_ENDPOINT, {
        params: {
          'api-key': GOV_API_KEY,
          format: 'json',
          limit: limit,
          offset: offset
        },
        timeout: 60000
      });
      
      const records = response.data.records || [];
      allRecords.push(...records);
      
      console.log(`   ✓ Fetched ${records.length} records (Total: ${allRecords.length})`);
      
      if (records.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
        // Wait 2 seconds between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`   ✗ Error fetching data:`, error.message);
      hasMore = false;
    }
  }
  
  // Extract unique districts with their states
  const districtMap = new Map();
  
  allRecords.forEach(record => {
    const districtName = record.district_name;
    const stateName = record.state_name;
    
    if (districtName && stateName) {
      const key = `${districtName}|${stateName}`;
      if (!districtMap.has(key)) {
        districtMap.set(key, {
          district: districtName,
          state: stateName,
          normalized: normalize(districtName),
          stateNormalized: normalize(stateName)
        });
      }
    }
  });
  
  const districts = Array.from(districtMap.values());
  
  console.log(`\n✅ Found ${districts.length} unique districts from API`);
  console.log(`   Total records processed: ${allRecords.length}`);
  
  return districts;
}

/**
 * Load ALL districts from GeoJSON
 */
function loadGeoJSONDistricts() {
  console.log('\n📂 Loading districts from GeoJSON...');
  console.log(`   File: ${GEOJSON_PATH}`);
  
  const geoData = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
  
  const districts = geoData.features.map((feature, index) => {
    const districtName = feature.properties?.District || 
                        feature.properties?.DISTRICT || 
                        feature.properties?.district || 
                        feature.properties?.NAME_2 || 
                        feature.properties?.name;
    
    const stateName = feature.properties?.STATE || 
                     feature.properties?.state || 
                     feature.properties?.st_nm || 
                     feature.properties?.NAME_1;
    
    return {
      district: districtName,
      state: stateName,
      normalized: normalize(districtName),
      stateNormalized: normalize(stateName),
      id: feature.properties?.id || index,
      properties: feature.properties
    };
  });
  
  console.log(`✅ Found ${districts.length} districts in GeoJSON`);
  
  return districts;
}

/**
 * Find best match for API district in GeoJSON
 */
function findBestMatch(apiDistrict, geoDistricts) {
  const apiNorm = apiDistrict.normalized;
  const apiStateNorm = apiDistrict.stateNormalized;
  
  // Strategy 1: Exact match (district + state)
  let match = geoDistricts.find(g => 
    g.normalized === apiNorm && g.stateNormalized === apiStateNorm
  );
  if (match) return { match, confidence: 1.0, method: 'exact' };
  
  // Strategy 2: Exact district name, any state
  match = geoDistricts.find(g => g.normalized === apiNorm);
  if (match) return { match, confidence: 0.9, method: 'district-only' };
  
  // Strategy 3: Fuzzy match within same state
  const sameStateDistricts = geoDistricts.filter(g => 
    g.stateNormalized === apiStateNorm
  );
  
  let bestScore = 0;
  let bestMatch = null;
  
  for (const geo of sameStateDistricts) {
    const score = similarity(apiNorm, geo.normalized);
    if (score > bestScore && score >= 0.7) {
      bestScore = score;
      bestMatch = geo;
    }
  }
  
  if (bestMatch) {
    return { match: bestMatch, confidence: bestScore, method: 'fuzzy-same-state' };
  }
  
  // Strategy 4: Fuzzy match across all states
  for (const geo of geoDistricts) {
    const score = similarity(apiNorm, geo.normalized);
    if (score > bestScore && score >= 0.8) {
      bestScore = score;
      bestMatch = geo;
    }
  }
  
  if (bestMatch) {
    return { match: bestMatch, confidence: bestScore, method: 'fuzzy-any-state' };
  }
  
  return { match: null, confidence: 0, method: 'no-match' };
}

/**
 * Analyze and compare districts
 */
function analyzeDistricts(apiDistricts, geoDistricts) {
  console.log('\n🔍 Analyzing district mappings...\n');
  
  const results = {
    perfectMatches: [],
    fuzzyMatches: [],
    noMatches: [],
    multipleAPIToOneGeo: new Map(),
    stateSpecificIssues: new Map()
  };
  
  // Find matches for each API district
  apiDistricts.forEach(api => {
    const result = findBestMatch(api, geoDistricts);
    
    const entry = {
      api: api,
      geo: result.match,
      confidence: result.confidence,
      method: result.method
    };
    
    if (result.confidence === 1.0) {
      results.perfectMatches.push(entry);
    } else if (result.confidence >= 0.7) {
      results.fuzzyMatches.push(entry);
    } else {
      results.noMatches.push(entry);
    }
    
    // Track multiple API districts mapping to same GeoJSON district
    if (result.match) {
      const geoKey = `${result.match.district}|${result.match.state}`;
      if (!results.multipleAPIToOneGeo.has(geoKey)) {
        results.multipleAPIToOneGeo.set(geoKey, []);
      }
      results.multipleAPIToOneGeo.get(geoKey).push(api);
    }
    
    // Track state-specific issues
    if (!results.stateSpecificIssues.has(api.state)) {
      results.stateSpecificIssues.set(api.state, {
        total: 0,
        matched: 0,
        unmatched: 0
      });
    }
    const stateStats = results.stateSpecificIssues.get(api.state);
    stateStats.total++;
    if (result.confidence >= 0.7) {
      stateStats.matched++;
    } else {
      stateStats.unmatched++;
    }
  });
  
  // Find GeoJSON districts with no API match
  const unmatchedGeo = geoDistricts.filter(geo => {
    return !apiDistricts.some(api => {
      const result = findBestMatch(api, [geo]);
      return result.confidence >= 0.7;
    });
  });
  
  results.unmatchedGeo = unmatchedGeo;
  
  return results;
}

/**
 * Generate comprehensive report
 */
function generateReport(apiDistricts, geoDistricts, results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE DISTRICT MAPPING ANALYSIS REPORT');
  console.log('='.repeat(80));
  
  console.log('\n📈 OVERALL STATISTICS:');
  console.log(`   API Districts: ${apiDistricts.length}`);
  console.log(`   GeoJSON Districts: ${geoDistricts.length}`);
  console.log(`   Perfect Matches: ${results.perfectMatches.length} (${(results.perfectMatches.length/apiDistricts.length*100).toFixed(1)}%)`);
  console.log(`   Fuzzy Matches: ${results.fuzzyMatches.length} (${(results.fuzzyMatches.length/apiDistricts.length*100).toFixed(1)}%)`);
  console.log(`   No Matches: ${results.noMatches.length} (${(results.noMatches.length/apiDistricts.length*100).toFixed(1)}%)`);
  console.log(`   Unmatched GeoJSON: ${results.unmatchedGeo.length}`);
  
  // State-wise breakdown
  console.log('\n📍 STATE-WISE MATCH RATE:');
  const stateStats = Array.from(results.stateSpecificIssues.entries())
    .map(([state, stats]) => ({
      state,
      ...stats,
      matchRate: (stats.matched / stats.total * 100).toFixed(1)
    }))
    .sort((a, b) => parseFloat(a.matchRate) - parseFloat(b.matchRate));
  
  console.log('\n   Worst performing states:');
  stateStats.slice(0, 10).forEach(s => {
    console.log(`   ${s.state.padEnd(30)} ${s.matchRate}% (${s.matched}/${s.total})`);
  });
  
  // Multiple API to one GeoJSON
  console.log('\n⚠️  MULTIPLE API DISTRICTS MAPPING TO SAME GEOJSON:');
  let multipleCount = 0;
  results.multipleAPIToOneGeo.forEach((apis, geoKey) => {
    if (apis.length > 1) {
      multipleCount++;
      if (multipleCount <= 10) {
        console.log(`\n   GeoJSON: ${geoKey}`);
        apis.forEach(api => {
          console.log(`      ← API: ${api.district} (${api.state})`);
        });
      }
    }
  });
  console.log(`   Total: ${multipleCount} GeoJSON districts with multiple API matches`);
  
  // No matches
  console.log('\n❌ API DISTRICTS WITH NO MATCH:');
  results.noMatches.slice(0, 20).forEach(entry => {
    console.log(`   ${entry.api.district.padEnd(35)} ${entry.api.state}`);
  });
  if (results.noMatches.length > 20) {
    console.log(`   ... and ${results.noMatches.length - 20} more`);
  }
  
  // Unmatched GeoJSON
  console.log('\n❌ GEOJSON DISTRICTS WITH NO API MATCH:');
  results.unmatchedGeo.slice(0, 20).forEach(geo => {
    console.log(`   ${geo.district.padEnd(35)} ${geo.state}`);
  });
  if (results.unmatchedGeo.length > 20) {
    console.log(`   ... and ${results.unmatchedGeo.length - 20} more`);
  }
  
  console.log('\n' + '='.repeat(80));
}

/**
 * Generate mapping files
 */
function generateMappingFiles(apiDistricts, geoDistricts, results) {
  console.log('\n📝 Generating mapping files...');
  
  // 1. Complete API districts list
  const apiList = apiDistricts.map(d => ({
    district: d.district,
    state: d.state
  }));
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'api-districts.json'),
    JSON.stringify(apiList, null, 2)
  );
  console.log(`   ✓ api-districts.json (${apiList.length} districts)`);
  
  // 2. Complete GeoJSON districts list
  const geoList = geoDistricts.map(d => ({
    district: d.district,
    state: d.state,
    id: d.id
  }));
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'geojson-districts.json'),
    JSON.stringify(geoList, null, 2)
  );
  console.log(`   ✓ geojson-districts.json (${geoList.length} districts)`);
  
  // 3. Perfect mapping (API → GeoJSON)
  const perfectMapping = {};
  results.perfectMatches.forEach(entry => {
    const key = `${entry.api.district.toLowerCase()}|${entry.api.state.toLowerCase()}`;
    perfectMapping[key] = {
      geoDistrict: entry.geo.district,
      geoState: entry.geo.state,
      geoId: entry.geo.id,
      confidence: entry.confidence
    };
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'perfect-mapping.json'),
    JSON.stringify(perfectMapping, null, 2)
  );
  console.log(`   ✓ perfect-mapping.json (${Object.keys(perfectMapping).length} mappings)`);
  
  // 4. Fuzzy mapping (needs review)
  const fuzzyMapping = {};
  results.fuzzyMatches.forEach(entry => {
    const key = `${entry.api.district.toLowerCase()}|${entry.api.state.toLowerCase()}`;
    fuzzyMapping[key] = {
      geoDistrict: entry.geo.district,
      geoState: entry.geo.state,
      geoId: entry.geo.id,
      confidence: entry.confidence,
      method: entry.method,
      needsReview: entry.confidence < 0.9
    };
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'fuzzy-mapping.json'),
    JSON.stringify(fuzzyMapping, null, 2)
  );
  console.log(`   ✓ fuzzy-mapping.json (${Object.keys(fuzzyMapping).length} mappings)`);
  
  // 5. Unmatched API districts
  const unmatchedAPI = results.noMatches.map(entry => ({
    district: entry.api.district,
    state: entry.api.state,
    normalized: entry.api.normalized
  }));
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'unmatched-api.json'),
    JSON.stringify(unmatchedAPI, null, 2)
  );
  console.log(`   ✓ unmatched-api.json (${unmatchedAPI.length} districts)`);
  
  // 6. Unmatched GeoJSON districts
  const unmatchedGeo = results.unmatchedGeo.map(d => ({
    district: d.district,
    state: d.state,
    id: d.id,
    normalized: d.normalized
  }));
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'unmatched-geojson.json'),
    JSON.stringify(unmatchedGeo, null, 2)
  );
  console.log(`   ✓ unmatched-geojson.json (${unmatchedGeo.length} districts)`);
  
  // 7. State-wise statistics
  const stateStats = {};
  results.stateSpecificIssues.forEach((stats, state) => {
    stateStats[state] = {
      total: stats.total,
      matched: stats.matched,
      unmatched: stats.unmatched,
      matchRate: (stats.matched / stats.total * 100).toFixed(2) + '%'
    };
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'state-statistics.json'),
    JSON.stringify(stateStats, null, 2)
  );
  console.log(`   ✓ state-statistics.json (${Object.keys(stateStats).length} states)`);
  
  // 8. Complete mapping file (for production use)
  const completeMapping = { ...perfectMapping, ...fuzzyMapping };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'complete-mapping.json'),
    JSON.stringify(completeMapping, null, 2)
  );
  console.log(`   ✓ complete-mapping.json (${Object.keys(completeMapping).length} mappings)`);
  
  console.log(`\n✅ All files saved to: ${OUTPUT_DIR}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('\n🚀 Starting District Mapping Analysis...\n');
    
    // Step 1: Fetch API districts
    const apiDistricts = await fetchAllAPIDistricts();
    
    // Step 2: Load GeoJSON districts
    const geoDistricts = loadGeoJSONDistricts();
    
    // Step 3: Analyze mappings
    const results = analyzeDistricts(apiDistricts, geoDistricts);
    
    // Step 4: Generate report
    generateReport(apiDistricts, geoDistricts, results);
    
    // Step 5: Generate mapping files
    generateMappingFiles(apiDistricts, geoDistricts, results);
    
    console.log('\n✅ Analysis complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
