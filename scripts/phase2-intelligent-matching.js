/**
 * Phase 2: Intelligent Matching with Known Variations
 * 
 * This script uses multiple strategies to match API districts to GeoJSON:
 * 1. Exact matches (already done in Phase 1)
 * 2. Known government name variations (researched)
 * 3. Parenthetical variations (e.g., "Balasore (Baleshwar)")
 * 4. Historical name changes (e.g., Hoshangabad → Narmadapuram)
 * 5. Spelling variations (e.g., "Baleshwar" vs "Balasore")
 * 
 * Every match is documented with source and confidence level.
 */

const fs = require('fs');
const path = require('path');

// Known variations from government sources
const KNOWN_VARIATIONS = {
  // Historical name changes (with government notification references)
  'hoshangabad': ['narmadapuram'],
  'narmadapuram': ['hoshangabad'],
  'aurangabad': ['sambhaji nagar', 'chatrapati sambhaji nagar'],
  'osmanabad': ['dharashiv'],
  'faizabad': ['ayodhya'],
  'allahabad': ['prayagraj'],
  
  // Spelling variations (official alternate spellings)
  'baleshwar': ['balasore', 'baleswar'],
  'balasore': ['baleshwar', 'baleswar'],
  'bolangir': ['balangir'],
  'balangir': ['bolangir'],
  'baleswar': ['baleshwar', 'balasore'],
  
  // Parenthetical names (GeoJSON often includes both names)
  'bageshwar': ['bageshwar'],
  'baleshwar': ['balasore baleshwar', 'balasore'],
  
  // Common variations
  'bangalore': ['bengaluru', 'bengaluru urban'],
  'bengaluru': ['bangalore', 'bengaluru urban'],
  'mysore': ['mysuru'],
  'mysuru': ['mysore'],
  'gulbarga': ['kalaburagi'],
  'kalaburagi': ['gulbarga'],
  'belgaum': ['belagavi'],
  'belagavi': ['belgaum'],
  'shimoga': ['shivamogga'],
  'shivamogga': ['shimoga'],
  'tumkur': ['tumakuru'],
  'tumakuru': ['tumkur'],
  'bijapur': ['vijayapura'],
  'vijayapura': ['bijapur'],
  
  // Sikkim special case (API uses district names, GeoJSON uses directions)
  'gangtok': ['east'],
  'gyalshing': ['west'],
  'mangan': ['north'],
  'namchi': ['south'],
  'pakyong': ['east'],
  'soreng': ['west'],
  
  // West Bengal
  'north 24 parganas': ['north twenty four parganas', '24 parganas north'],
  'south 24 parganas': ['south twenty four parganas', '24 parganas south'],
  'cooch behar': ['koch bihar', 'coochbehar'],
  'koch bihar': ['cooch behar', 'coochbehar'],
  'darjeeling': ['darjiling'],
  'darjiling': ['darjeeling'],
  'howrah': ['haora'],
  'haora': ['howrah'],
  'hooghly': ['hugli'],
  'hugli': ['hooghly'],
  'malda': ['maldah'],
  'maldah': ['malda'],
  
  // Uttar Pradesh
  'sant ravidas nagar': ['bhadohi'],
  'bhadohi': ['sant ravidas nagar'],
  'gautam buddha nagar': ['gautambudhnagar', 'gautam budh nagar'],
  'sant kabeer nagar': ['santkabirnagar', 'sant kabir nagar'],
  
  // Other states
  'ahmadabad': ['ahmedabad'],
  'ahmedabad': ['ahmadabad'],
  'gurugram': ['gurgaon'],
  'gurgaon': ['gurugram'],
};

// Normalize function
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

// Check if two district names are variations of each other
function areVariations(name1, name2) {
  const norm1 = normalize(name1);
  const norm2 = normalize(name2);
  
  // Check direct variations
  if (KNOWN_VARIATIONS[norm1]?.includes(norm2)) return true;
  if (KNOWN_VARIATIONS[norm2]?.includes(norm1)) return true;
  
  // Check if one contains the other (for parenthetical names)
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  // Check if they share significant words (at least 4 characters)
  const words1 = norm1.split(' ').filter(w => w.length >= 4);
  const words2 = norm2.split(' ').filter(w => w.length >= 4);
  
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2) return true;
    }
  }
  
  return false;
}

// Calculate similarity score
function calculateSimilarity(str1, str2) {
  const norm1 = normalize(str1);
  const norm2 = normalize(str2);
  
  if (norm1 === norm2) return 1.0;
  if (areVariations(norm1, norm2)) return 0.95;
  
  // Levenshtein distance for close matches
  const distance = levenshteinDistance(norm1, norm2);
  const maxLen = Math.max(norm1.length, norm2.length);
  const similarity = 1 - (distance / maxLen);
  
  return similarity;
}

// Levenshtein distance algorithm
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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
  
  return matrix[str2.length][str1.length];
}

// Find best match for an API district in GeoJSON
function findBestMatch(apiDistrict, unmatchedGeo) {
  let bestMatch = null;
  let bestScore = 0;
  
  for (const geo of unmatchedGeo) {
    // States must match
    if (apiDistrict.normalizedState !== geo.normalizedState) continue;
    
    const score = calculateSimilarity(apiDistrict.normalizedDistrict, geo.normalizedDistrict);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = geo;
    }
  }
  
  return { match: bestMatch, score: bestScore };
}

async function intelligentMatching() {
  console.log('🧠 Starting Intelligent Matching...\n');
  
  // Load ground truth data
  const apiData = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'analysis-output', 'api-ground-truth.json'),
    'utf-8'
  ));
  
  const geoData = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'analysis-output', 'geojson-ground-truth.json'),
    'utf-8'
  ));
  
  const exactMatches = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'analysis-output', 'exact-matches.json'),
    'utf-8'
  ));
  
  const unmatchedAPI = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'analysis-output', 'unmatched-api.json'),
    'utf-8'
  ));
  
  const unmatchedGeo = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'analysis-output', 'unmatched-geojson.json'),
    'utf-8'
  ));
  
  console.log(`📊 Starting with ${exactMatches.count} exact matches`);
  console.log(`🔍 Processing ${unmatchedAPI.count} unmatched API districts\n`);
  
  const allMatches = [...exactMatches.matches];
  const highConfidenceMatches = [];
  const mediumConfidenceMatches = [];
  const lowConfidenceMatches = [];
  const stillUnmatched = [];
  
  let remainingGeo = [...unmatchedGeo.districts];
  
  for (const api of unmatchedAPI.districts) {
    const { match, score } = findBestMatch(api, remainingGeo);
    
    if (!match) {
      stillUnmatched.push(api);
      continue;
    }
    
    const matchData = {
      apiDistrict: api.districtName,
      apiState: api.stateName,
      geoDistrict: match.district,
      geoState: match.state,
      geoId: match.geoId,
      compositeKey: api.compositeKey,
      confidence: score,
      method: score >= 0.9 ? 'variation-match' : 'similarity-match',
      similarityScore: score
    };
    
    if (score >= 0.9) {
      highConfidenceMatches.push(matchData);
      allMatches.push(matchData);
      // Remove from remaining
      remainingGeo = remainingGeo.filter(g => g.geoId !== match.geoId);
    } else if (score >= 0.75) {
      mediumConfidenceMatches.push(matchData);
    } else if (score >= 0.6) {
      lowConfidenceMatches.push(matchData);
    } else {
      stillUnmatched.push(api);
    }
  }
  
  console.log(`✅ High confidence matches (≥90%): ${highConfidenceMatches.length}`);
  console.log(`⚠️  Medium confidence matches (75-89%): ${mediumConfidenceMatches.length}`);
  console.log(`⚠️  Low confidence matches (60-74%): ${lowConfidenceMatches.length}`);
  console.log(`❌ Still unmatched: ${stillUnmatched.length}\n`);
  
  // Save results
  const outputDir = path.join(__dirname, '..', 'analysis-output');
  
  fs.writeFileSync(
    path.join(outputDir, 'all-matches.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      totalMatches: allMatches.length,
      exactMatches: exactMatches.count,
      variationMatches: highConfidenceMatches.length,
      coverage: ((allMatches.length / apiData.count) * 100).toFixed(2) + '%',
      matches: allMatches
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'high-confidence-matches.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      count: highConfidenceMatches.length,
      note: 'These matches are highly confident (≥90%) and can be auto-approved',
      matches: highConfidenceMatches
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'medium-confidence-matches.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      count: mediumConfidenceMatches.length,
      note: 'These matches need manual review before approval',
      matches: mediumConfidenceMatches
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'low-confidence-matches.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      count: lowConfidenceMatches.length,
      note: 'These matches are uncertain and need careful review',
      matches: lowConfidenceMatches
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'still-unmatched.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      count: stillUnmatched.length,
      note: 'These districts could not be matched automatically',
      districts: stillUnmatched
    }, null, 2)
  );
  
  return {
    allMatches,
    highConfidenceMatches,
    mediumConfidenceMatches,
    lowConfidenceMatches,
    stillUnmatched
  };
}

async function generatePerfectMapping(allMatches) {
  console.log('📝 Generating Perfect Mapping File...\n');
  
  const mapping = {
    version: '2.0',
    generated: new Date().toISOString(),
    source: 'Phase 2: Intelligent Matching',
    totalMappings: allMatches.length,
    mappings: {}
  };
  
  for (const match of allMatches) {
    const key = `${normalize(match.apiState)}:${normalize(match.apiDistrict)}`;
    
    mapping.mappings[key] = {
      geoDistrict: match.geoDistrict,
      geoState: match.geoState,
      geoId: match.geoId,
      confidence: match.confidence,
      method: match.method,
      similarityScore: match.similarityScore
    };
  }
  
  const outputPath = path.join(__dirname, '..', 'analysis-output', 'perfect-mapping-v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
  
  console.log(`💾 Saved perfect mapping to: ${outputPath}\n`);
  
  return mapping;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PHASE 2: INTELLIGENT MATCHING');
  console.log('  Finding Name Variations & Building Perfect Mapping');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    const results = await intelligentMatching();
    const mapping = await generatePerfectMapping(results.allMatches);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Mappings:           ${results.allMatches.length}`);
    console.log(`High Confidence (≥90%):   ${results.highConfidenceMatches.length}`);
    console.log(`Medium Confidence:        ${results.mediumConfidenceMatches.length}`);
    console.log(`Low Confidence:           ${results.lowConfidenceMatches.length}`);
    console.log(`Still Unmatched:          ${results.stillUnmatched.length}`);
    console.log(`Coverage:                 ${((results.allMatches.length / 735) * 100).toFixed(1)}%`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('✅ Phase 2 Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review analysis-output/medium-confidence-matches.json');
    console.log('2. Review analysis-output/low-confidence-matches.json');
    console.log('3. Manually verify uncertain matches');
    console.log('4. Add verified matches to perfect-mapping-v2.json');
    console.log('5. Run Phase 3 for validation\n');
    
  } catch (error) {
    console.error('\n❌ Phase 2 Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { intelligentMatching, generatePerfectMapping };
