#!/usr/bin/env node

/**
 * Generate Perfect District Mapping
 * 
 * Takes the analysis output and creates a production-ready mapping file
 * with manual fixes for special cases
 */

const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../analysis-output');
const OUTPUT_FILE = path.join(__dirname, '../frontend/src/data/perfect-district-mapping.json');

// Manual fixes for special cases
const MANUAL_FIXES = {
  // ===== SIKKIM - Direction Names =====
  'gangtok district|sikkim': { geoDistrict: 'EAST', geoState: 'SIKKIM', geoId: 449, note: 'Capital district' },
  'soreng|sikkim': { geoDistrict: 'WEST', geoState: 'SIKKIM', geoId: 455, note: 'Western district' },
  'gyalshing district|sikkim': { geoDistrict: 'WEST', geoState: 'SIKKIM', geoId: 455, note: 'Western district' },
  'pakyong|sikkim': { geoDistrict: 'EAST', geoState: 'SIKKIM', geoId: 449, note: 'Eastern district' },
  'namchi district|sikkim': { geoDistrict: 'SOUTH', geoState: 'SIKKIM', geoId: 450, note: 'Southern district' },
  'mangan district|sikkim': { geoDistrict: 'NORTH', geoState: 'SIKKIM', geoId: 473, note: 'Northern district' },
  
  // ===== WEST BENGAL - 24 Parganas =====
  '24 parganas (north)|west bengal': { geoDistrict: 'NORTH TWENTY-FOUR PARGANAS', geoState: 'WEST BENGAL', geoId: 265 },
  '24 parganas north|west bengal': { geoDistrict: 'NORTH TWENTY-FOUR PARGANAS', geoState: 'WEST BENGAL', geoId: 265 },
  'north 24 parganas|west bengal': { geoDistrict: 'NORTH TWENTY-FOUR PARGANAS', geoState: 'WEST BENGAL', geoId: 265 },
  '24 parganas south|west bengal': { geoDistrict: 'SOUTH TWENTY-FOUR PARGANAS', geoState: 'WEST BENGAL', geoId: 208 },
  'south 24 parganas|west bengal': { geoDistrict: 'SOUTH TWENTY-FOUR PARGANAS', geoState: 'WEST BENGAL', geoId: 208 },
  'howrah|west bengal': { geoDistrict: 'HAORA', geoState: 'WEST BENGAL', geoId: 238 },
  'hooghly|west bengal': { geoDistrict: 'HUGLI', geoState: 'WEST BENGAL', geoId: 262 },
  'coochbehar|west bengal': { geoDistrict: 'KOCH BIHAR', geoState: 'WEST BENGAL', geoId: 11 },
  'dinajpur uttar|west bengal': { geoDistrict: 'UTTAR DINAJPUR', geoState: 'WEST BENGAL', geoId: 412 },
  'dinajpur dakshin|west bengal': { geoDistrict: 'DAKSHIN DINAJPUR', geoState: 'WEST BENGAL', geoId: 367 },
  'darjeeling gorkha hill council (dghc)|west bengal': { geoDistrict: 'DARJILING', geoState: 'WEST BENGAL', geoId: 441 },
  'siliguri mahakuma parisad|west bengal': { geoDistrict: 'DARJILING', geoState: 'WEST BENGAL', geoId: 441 },
  
  // ===== KARNATAKA - Bangalore =====
  'bengaluru|karnataka': { geoDistrict: 'BENGALURU URBAN', geoState: 'KARNATAKA', geoId: 106 },
  'bengaluru urban|karnataka': { geoDistrict: 'BENGALURU URBAN', geoState: 'KARNATAKA', geoId: 106 },
  'bengaluru rural|karnataka': { geoDistrict: 'BENGALURU RURAL', geoState: 'KARNATAKA', geoId: 107 },
  'bengaluru south|karnataka': { geoDistrict: 'BENGALURU URBAN', geoState: 'KARNATAKA', geoId: 106 },
  'bangalore|karnataka': { geoDistrict: 'BENGALURU URBAN', geoState: 'KARNATAKA', geoId: 106 },
  'bangalore urban|karnataka': { geoDistrict: 'BENGALURU URBAN', geoState: 'KARNATAKA', geoId: 106 },
  'bangalore rural|karnataka': { geoDistrict: 'BENGALURU RURAL', geoState: 'KARNATAKA', geoId: 107 },
  
  // ===== PUNJAB =====
  'sas nagar mohali|punjab': { geoDistrict: 'SAS NAGAR (SAHIBZADA AJIT SINGH NAGAR)', geoState: 'PUNJAB', geoId: 690 },
  'mukatsar|punjab': { geoDistrict: 'SRI MUKTSAR SAHIB', geoState: 'PUNJAB', geoId: 541 },
  'ropar|punjab': { geoDistrict: 'RUPNAGAR', geoState: 'PUNJAB', geoId: 718 },
  'nawanshahr |punjab': { geoDistrict: 'SHAHID BHAGAT SINGH NAGAR', geoState: 'PUNJAB', geoId: 552 },
  'malerkotla|punjab': { geoDistrict: 'SANGRUR', geoState: 'PUNJAB', geoId: 547 },
  
  // ===== TAMIL NADU =====
  'the nilgiris|tamil nadu': { geoDistrict: 'NILGIRIS', geoState: 'TAMIL NADU', geoId: 60 },
  'thoothukkudi|tamil nadu': { geoDistrict: 'TUTICORIN', geoState: 'TAMIL NADU', geoId: 34 },
  'mayiladuthurai|tamil nadu': { geoDistrict: 'NAGAPATTINAM', geoState: 'TAMIL NADU', geoId: 66 },
  'ranipet|tamil nadu': { geoDistrict: 'RANIPPETTAI', geoState: 'TAMIL NADU', geoId: 693 },
  
  // ===== TELANGANA =====
  'warangal|telangana': { geoDistrict: 'WARANGAL (URBAN)', geoState: 'TELANGANA', geoId: 132 },
  'hanumakonda|telangana': { geoDistrict: 'WARANGAL (RURAL)', geoState: 'TELANGANA', geoId: 133 },
  'kumram bheem(asifabad)|telangana': { geoDistrict: 'KUMURAM BHEEM', geoState: 'TELANGANA', geoId: 161 },
  'medchal|telangana': { geoDistrict: 'MEDCHAL-MALKAJGIRI', geoState: 'TELANGANA', geoId: 123 },
  
  // ===== CHHATTISGARH =====
  'kawardha|chhattisgarh': { geoDistrict: 'KABIRDHAM', geoState: 'CHHATTISGARH', geoId: 227 },
  'kanker|chhattisgarh': { geoDistrict: 'UTTAR BASTAR KANKER', geoState: 'CHHATTISGARH', geoId: 176 },
  'dantewada|chhattisgarh': { geoDistrict: 'DAKSHIN BASTAR DANTEWADA', geoState: 'CHHATTISGARH', geoId: 591 },
  'sakti|chhattisgarh': { geoDistrict: 'JANJGIR-CHAMPA', geoState: 'CHHATTISGARH', geoId: 177 },
  'mohla manpur ambagarh chowki|chhattisgarh': { geoDistrict: 'RAJNANDGAON', geoState: 'CHHATTISGARH', geoId: 174 },
  'khairagarh chhuikhadan gandai|chhattisgarh': { geoDistrict: 'RAJNANDGAON', geoState: 'CHHATTISGARH', geoId: 174 },
  'sarangarh bilaigarh|chhattisgarh': { geoDistrict: 'RAIGARH', geoState: 'CHHATTISGARH', geoId: 175 },
  'manendragarh chirmiri bharatpur|chhattisgarh': { geoDistrict: 'KORIYA', geoState: 'CHHATTISGARH', geoId: 178 },
  
  // ===== ODISHA =====
  'bolangir|odisha': { geoDistrict: 'BOLANGIR (BALANGIR)', geoState: 'ODISHA', geoId: 188 },
  'boudh|odisha': { geoDistrict: 'BAUDH (BAUDA)', geoState: 'ODISHA', geoId: 184 },
  'kendujhar|odisha': { geoDistrict: 'KEONJHAR (KENDUJHAR)', geoState: 'ODISHA', geoId: 218 },
  'sonepur|odisha': { geoDistrict: 'SUBARNAPUR', geoState: 'ODISHA', geoId: 191 },
  
  // ===== MADHYA PRADESH =====
  'narmadapuram|madhya pradesh': { geoDistrict: 'HOSHANGABAD', geoState: 'MADHYA PRADESH', geoId: 245 },
  'neemuch|madhya pradesh': { geoDistrict: 'NIMACH', geoState: 'MADHYA PRADESH', geoId: 327 },
  'khandwa|madhya pradesh': { geoDistrict: 'EAST NIMAR', geoState: 'MADHYA PRADESH', geoId: 226 },
  'khargone|madhya pradesh': { geoDistrict: 'WEST NIMAR', geoState: 'MADHYA PRADESH', geoId: 230 },
  'narsinghpur|madhya pradesh': { geoDistrict: 'NARSHIMAPURA', geoState: 'MADHYA PRADESH', geoId: 254 },
  
  // ===== MAHARASHTRA =====
  'beed|maharashtra': { geoDistrict: 'BID', geoState: 'MAHARASHTRA', geoId: 158 },
  'dharashiv|maharashtra': { geoDistrict: 'USMANABAD', geoState: 'MAHARASHTRA', geoId: 143 },
  'chatrapati sambhaji nagar|maharashtra': { geoDistrict: 'AURANGABAD', geoState: 'MAHARASHTRA', geoId: 144 },
  'ahilyanagar|maharashtra': { geoDistrict: 'AHMADNAGAR', geoState: 'MAHARASHTRA', geoId: 145 },
  
  // ===== GUJARAT =====
  'dohad|gujarat': { geoDistrict: 'DAHOD', geoState: 'GUJARAT', geoId: 269 },
  
  // ===== BIHAR =====
  'kaimur (bhabua)|bihar': { geoDistrict: 'KAIMUR', geoState: 'BIHAR', geoId: 346 },
  
  // ===== ASSAM =====
  'kamrup|assam': { geoDistrict: 'KAMRUP RURAL', geoState: 'ASSAM', geoId: 15 },
  'tamulpur|assam': { geoDistrict: 'BAKSA', geoState: 'ASSAM', geoId: 9 },
  'bajali|assam': { geoDistrict: 'BARPETA', geoState: 'ASSAM', geoId: 10 },
  'sribhumi|assam': { geoDistrict: 'DHEMAJI', geoState: 'ASSAM', geoId: 13 },
  
  // ===== ANDHRA PRADESH =====
  'anantapur|andhra pradesh': { geoDistrict: 'ANANTHAPURAMU', geoState: 'ANDHRA PRADESH', geoId: 94 },
  
  // ===== UTTAR PRADESH =====
  'kanpur nagar|uttar pradesh': { geoDistrict: 'KANPUR DEHAT', geoState: 'UTTAR PRADESH', geoId: 360 },
  'sant ravidas nagar|uttar pradesh': { geoDistrict: 'BHADOHI', geoState: 'UTTAR PRADESH', geoId: 351 },
  
  // ===== LADAKH =====
  'leh (ladakh)|ladakh': { geoDistrict: 'LEH', geoState: 'LADAKH', geoId: 703 },
  
  // ===== JAMMU AND KASHMIR =====
  'poonch|jammu and kashmir': { geoDistrict: 'PUNCH', geoState: 'JAMMU AND KASHMIR', geoId: 641 },
  
  // ===== ARUNACHAL PRADESH =====
  'keyi panyor|arunachal pradesh': { geoDistrict: 'KURUNG KUMEY', geoState: 'ARUNACHAL PRADESH', geoId: 528 },
  
  // ===== DELHI =====
  'new delhi|delhi': { geoDistrict: 'NEW DELHI', geoState: 'DELHI', geoId: 689 },
  'north delhi|delhi': { geoDistrict: 'NORTH', geoState: 'DELHI', geoId: 688 },
  'south delhi|delhi': { geoDistrict: 'SOUTH', geoState: 'DELHI', geoId: 486 },
  'east delhi|delhi': { geoDistrict: 'EAST', geoState: 'DELHI', geoId: 491 },
  'west delhi|delhi': { geoDistrict: 'WEST', geoState: 'DELHI', geoId: 495 },
  'central delhi|delhi': { geoDistrict: 'CENTRAL', geoState: 'DELHI', geoId: 489 },
  'north east delhi|delhi': { geoDistrict: 'NORTH EAST', geoState: 'DELHI', geoId: 496 },
  'north west delhi|delhi': { geoDistrict: 'NORTH WEST', geoState: 'DELHI', geoId: 502 },
  'south west delhi|delhi': { geoDistrict: 'SOUTH WEST', geoState: 'DELHI', geoId: 492 },
  'south east delhi|delhi': { geoDistrict: 'SOUTH EAST', geoState: 'DELHI', geoId: 637 },
  'shahdara|delhi': { geoDistrict: 'SHAHADRA', geoState: 'DELHI', geoId: 636 },
};

/**
 * Load analysis results
 */
function loadAnalysisResults() {
  console.log('📂 Loading analysis results...');
  
  const perfectMapping = JSON.parse(
    fs.readFileSync(path.join(INPUT_DIR, 'perfect-mapping.json'), 'utf8')
  );
  
  const fuzzyMapping = JSON.parse(
    fs.readFileSync(path.join(INPUT_DIR, 'fuzzy-mapping.json'), 'utf8')
  );
  
  const unmatchedAPI = JSON.parse(
    fs.readFileSync(path.join(INPUT_DIR, 'unmatched-api.json'), 'utf8')
  );
  
  console.log(`   ✓ Perfect matches: ${Object.keys(perfectMapping).length}`);
  console.log(`   ✓ Fuzzy matches: ${Object.keys(fuzzyMapping).length}`);
  console.log(`   ✓ Unmatched API: ${unmatchedAPI.length}`);
  
  return { perfectMapping, fuzzyMapping, unmatchedAPI };
}

/**
 * Generate perfect mapping
 */
function generatePerfectMapping(analysis) {
  console.log('\n🔨 Generating perfect mapping...');
  
  const mapping = {};
  let manualFixCount = 0;
  let perfectCount = 0;
  let fuzzyCount = 0;
  
  // Step 1: Add all perfect matches
  Object.entries(analysis.perfectMapping).forEach(([key, value]) => {
    mapping[key] = {
      geoDistrict: value.geoDistrict,
      geoState: value.geoState,
      geoId: value.geoId,
      confidence: 1.0,
      source: 'perfect-match'
    };
    perfectCount++;
  });
  
  // Step 2: Add fuzzy matches (with high confidence)
  Object.entries(analysis.fuzzyMapping).forEach(([key, value]) => {
    if (value.confidence >= 0.85) {
      mapping[key] = {
        geoDistrict: value.geoDistrict,
        geoState: value.geoState,
        geoId: value.geoId,
        confidence: value.confidence,
        source: 'fuzzy-match',
        needsReview: value.confidence < 0.95
      };
      fuzzyCount++;
    }
  });
  
  // Step 3: Apply manual fixes (overrides everything)
  Object.entries(MANUAL_FIXES).forEach(([key, value]) => {
    mapping[key] = {
      ...value,
      confidence: 1.0,
      source: 'manual-fix'
    };
    manualFixCount++;
  });
  
  console.log(`   ✓ Perfect matches: ${perfectCount}`);
  console.log(`   ✓ Fuzzy matches: ${fuzzyCount}`);
  console.log(`   ✓ Manual fixes: ${manualFixCount}`);
  console.log(`   ✓ Total mappings: ${Object.keys(mapping).length}`);
  
  return mapping;
}

/**
 * Validate mapping
 */
function validateMapping(mapping, analysis) {
  console.log('\n✅ Validating mapping...');
  
  const apiDistricts = JSON.parse(
    fs.readFileSync(path.join(INPUT_DIR, 'api-districts.json'), 'utf8')
  );
  
  let covered = 0;
  let missing = [];
  
  apiDistricts.forEach(api => {
    const key = `${api.district.toLowerCase()}|${api.state.toLowerCase()}`;
    if (mapping[key]) {
      covered++;
    } else {
      missing.push(api);
    }
  });
  
  const coverage = (covered / apiDistricts.length * 100).toFixed(2);
  
  console.log(`   Coverage: ${coverage}% (${covered}/${apiDistricts.length})`);
  
  if (missing.length > 0) {
    console.log(`\n   ⚠️  Missing mappings for ${missing.length} districts:`);
    missing.slice(0, 10).forEach(d => {
      console.log(`      - ${d.district} (${d.state})`);
    });
    if (missing.length > 10) {
      console.log(`      ... and ${missing.length - 10} more`);
    }
  }
  
  return { coverage: parseFloat(coverage), missing };
}

/**
 * Save mapping file
 */
function saveMappingFile(mapping) {
  console.log('\n💾 Saving perfect mapping file...');
  
  // Ensure directory exists
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Save with metadata
  const output = {
    _metadata: {
      generated: new Date().toISOString(),
      totalMappings: Object.keys(mapping).length,
      version: '1.0.0',
      description: 'Perfect district mapping from API to GeoJSON'
    },
    mappings: mapping
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log(`   ✓ Saved to: ${OUTPUT_FILE}`);
  console.log(`   ✓ Total mappings: ${Object.keys(mapping).length}`);
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('\n🚀 Generating Perfect District Mapping...\n');
    
    // Load analysis results
    const analysis = loadAnalysisResults();
    
    // Generate mapping
    const mapping = generatePerfectMapping(analysis);
    
    // Validate
    const validation = validateMapping(mapping, analysis);
    
    // Save
    saveMappingFile(mapping);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ PERFECT MAPPING GENERATED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log(`\n   Coverage: ${validation.coverage}%`);
    console.log(`   Total Mappings: ${Object.keys(mapping).length}`);
    console.log(`   Missing: ${validation.missing.length}`);
    console.log(`\n   Next: Implement this mapping in your frontend code`);
    console.log('='.repeat(80) + '\n');
    
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
