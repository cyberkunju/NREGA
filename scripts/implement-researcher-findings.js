/**
 * Implement Researcher Findings
 * 
 * Based on the comprehensive professional research report (research_1.md),
 * this script implements all verified mappings and corrections.
 * 
 * Key Changes:
 * 1. Move MAPPABLE districts from excluded to mappings with aliases
 * 2. Keep NEW districts in excluded but add parent aggregation info
 * 3. Fix "Wrong State" errors with correct state assignments
 * 4. Add comprehensive notes from research
 */

const fs = require('fs');
const path = require('path');

// Load current mapping
const mappingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'perfect-district-mapping-v2.json');
const perfectMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

// Load GeoJSON to find geoIds
const geoJsonPath = path.join(__dirname, '..', 'frontend', 'public', 'india-districts.geojson');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

console.log('═'.repeat(80));
console.log('IMPLEMENTING PROFESSIONAL RESEARCH FINDINGS');
console.log('Based on research_1.md - Professional Grade Analysis');
console.log('═'.repeat(80));
console.log(`\nCurrent state:`);
console.log(`  Mappings: ${Object.keys(perfectMapping.mappings).length}`);
console.log(`  Excluded: ${Object.keys(perfectMapping.excluded).length}`);

// Helper function to find geoId
function findGeoId(districtName, stateName) {
  const feature = geoJson.features.find(f => {
    const props = f.properties;
    return props.district?.toUpperCase() === districtName.toUpperCase() &&
           props.st_nm?.toUpperCase() === stateName.toUpperCase();
  });
  return feature ? feature.properties.censuscode : null;
}

// CATEGORY 1: RENAMED DISTRICTS (Move from excluded to mappings)
const RENAMED_DISTRICTS = {
  'madhya pradesh:narmadapuram': {
    correctState: 'madhya pradesh',
    geoDistrict: 'HOSHANGABAD',
    geoState: 'MADHYA PRADESH',
    note: 'Renamed from Hoshangabad to Narmadapuram on February 7, 2022'
  },
  'maharashtra:chatrapati sambhaji nagar': {
    correctState: 'maharashtra',
    geoDistrict: 'AURANGABAD',
    geoState: 'MAHARASHTRA',
    note: 'Renamed from Aurangabad in September 2023'
  },
  'maharashtra:dharashiv': {
    correctState: 'maharashtra',
    geoDistrict: 'OSMANABAD',
    geoState: 'MAHARASHTRA',
    note: 'Renamed from Osmanabad in February 2023, ratified September 2023'
  },
  'chhattisgarh:kawardha': {
    correctState: 'chhattisgarh',
    geoDistrict: 'KABIRDHAM',
    geoState: 'CHHATTISGARH',
    note: 'Renamed to Kabirdham in 2003'
  },
  'puducherry:pondicherry': {
    correctState: 'puducherry',
    geoDistrict: 'PUDUCHERRY',
    geoState: 'PUDUCHERRY',
    note: 'Territory officially renamed to Puducherry in 2006'
  },
  'punjab:nawanshahr': {
    correctState: 'punjab',
    geoDistrict: 'SHAHID BHAGAT SINGH NAGAR',
    geoState: 'PUNJAB',
    note: 'Officially renamed Shahid Bhagat Singh Nagar in 2008'
  },
  'punjab:ropar': {
    correctState: 'punjab',
    geoDistrict: 'RUPNAGAR',
    geoState: 'PUNJAB',
    note: 'Official name is Rupnagar, Ropar is common name'
  }
};

// CATEGORY 2: SPELLING VARIATIONS (Move from excluded to mappings)
const SPELLING_VARIATIONS = {
  'maharashtra:beed': {
    correctState: 'maharashtra',
    geoDistrict: 'BID',
    geoState: 'MAHARASHTRA',
    note: 'Bid is alternate spelling of Beed'
  },
  'odisha:boudh': {
    correctState: 'odisha',
    geoDistrict: 'BAUDH',
    geoState: 'ODISHA',
    note: 'Baudh is official alternate spelling'
  },
  'punjab:mukatsar': {
    correctState: 'punjab',
    geoDistrict: 'SRI MUKTSAR SAHIB',
    geoState: 'PUNJAB',
    note: 'Official name is Sri Muktsar Sahib (changed 2012)'
  },
  'uttar pradesh:rae bareli': {
    correctState: 'uttar pradesh',
    geoDistrict: 'RAEBARELI',
    geoState: 'UTTAR PRADESH',
    note: 'Space vs no-space variation, official is Raebareli'
  },
  'tamil nadu:thoothukkudi': {
    correctState: 'tamil nadu',
    geoDistrict: 'TUTICORIN',
    geoState: 'TAMIL NADU',
    note: 'Tuticorin is former anglicized name'
  },
  'telangana:kumram bheemasifabad': {
    correctState: 'telangana',
    geoDistrict: 'KOMARAM BHEEM ASIFABAD',
    geoState: 'TELANGANA',
    note: 'Official name is Komaram Bheem Asifabad'
  },
  'madhya pradesh:narsinghpur': {
    correctState: 'madhya pradesh',
    geoDistrict: 'NARSIMHAPUR',
    geoState: 'MADHYA PRADESH',
    note: 'Narsimhapur is official alternate spelling'
  },
  'jammu and kashmir:poonch': {
    correctState: 'jammu and kashmir',
    geoDistrict: 'PUNCH',
    geoState: 'JAMMU AND KASHMIR',
    note: 'Punch is alternate spelling'
  },
  'gujarat:dohad': {
    correctState: 'gujarat',
    geoDistrict: 'DAHOD',
    geoState: 'GUJARAT',
    note: 'Dahod is primary spelling, Dohad is official alternate'
  },
  'madhya pradesh:khandwa': {
    correctState: 'madhya pradesh',
    geoDistrict: 'EAST NIMAR',
    geoState: 'MADHYA PRADESH',
    note: 'District was officially known as East Nimar'
  },
  'madhya pradesh:khargone': {
    correctState: 'madhya pradesh',
    geoDistrict: 'WEST NIMAR',
    geoState: 'MADHYA PRADESH',
    note: 'District was officially known as West Nimar'
  },
  'odisha:sonepur': {
    correctState: 'odisha',
    geoDistrict: 'SUBARNAPUR',
    geoState: 'ODISHA',
    note: 'Official district name is Subarnapur'
  }
};

// CATEGORY 3: WRONG STATE CORRECTIONS (Fix state, then map)
const WRONG_STATE_CORRECTIONS = {
  'gujarat:narmadapuram': {
    correctKey: 'madhya pradesh:narmadapuram',
    correctState: 'madhya pradesh',
    geoDistrict: 'HOSHANGABAD',
    geoState: 'MADHYA PRADESH',
    note: 'CRITICAL: Narmadapuram is in Madhya Pradesh, not Gujarat. Renamed from Hoshangabad 2022'
  },
  'jharkhand:chatrapati sambhaji nagar': {
    correctKey: 'maharashtra:chatrapati sambhaji nagar',
    correctState: 'maharashtra',
    geoDistrict: 'AURANGABAD',
    geoState: 'MAHARASHTRA',
    note: 'CRITICAL: Chatrapati Sambhaji Nagar is in Maharashtra, not Jharkhand. Renamed from Aurangabad 2023'
  },
  'madhya pradesh:dharashiv': {
    correctKey: 'maharashtra:dharashiv',
    correctState: 'maharashtra',
    geoDistrict: 'OSMANABAD',
    geoState: 'MAHARASHTRA',
    note: 'CRITICAL: Dharashiv is in Maharashtra, not Madhya Pradesh. Renamed from Osmanabad 2023'
  },
  'madhya pradesh:jayashanker bhopalapally': {
    correctKey: 'telangana:jayashanker bhopalapally',
    correctState: 'telangana',
    geoDistrict: 'JAYASHANKAR BHUPALPALLY',
    geoState: 'TELANGANA',
    note: 'CRITICAL: District is in Telangana, not Madhya Pradesh. Created 2016 from Warangal'
  },
  'madhya pradesh:siddharth nagar': {
    correctKey: 'uttar pradesh:siddharth nagar',
    correctState: 'uttar pradesh',
    geoDistrict: 'SIDDHARTHNAGAR',
    geoState: 'UTTAR PRADESH',
    note: 'CRITICAL: Siddharth Nagar is in Uttar Pradesh, not Madhya Pradesh'
  },
  'himachal pradesh:unakoti': {
    correctKey: 'tripura:unakoti',
    correctState: 'tripura',
    geoDistrict: 'UNAKOTI',
    geoState: 'TRIPURA',
    note: 'CRITICAL: Unakoti is in Tripura, not Himachal Pradesh. Created 2012'
  }
};

// CATEGORY 4: NEW DISTRICTS (Keep excluded, add parent info)
const NEW_DISTRICTS = {
  'bihar:sarangarh bilaigarh': {
    correctKey: 'chhattisgarh:sarangarh bilaigarh',
    correctState: 'chhattisgarh',
    created: '2022-09-03',
    parentDistricts: ['raigarh', 'baloda bazar'],
    note: 'New district created September 3, 2022. NOT MAPPABLE - aggregate to parents'
  },
  'assam:bajali': {
    correctState: 'assam',
    created: '2020-08',
    parentDistricts: ['barpeta'],
    note: 'New district created August 2020. NOT MAPPABLE - aggregate to Barpeta'
  },
  'assam:tamulpur': {
    correctState: 'assam',
    created: '2022-01',
    parentDistricts: ['baksa'],
    note: 'New district created January 2022. NOT MAPPABLE - aggregate to Baksa'
  },
  'chhattisgarh:khairagarh chhuikhadan gandai': {
    correctState: 'chhattisgarh',
    created: '2022-09-03',
    parentDistricts: ['rajnandgaon'],
    note: 'New district created September 3, 2022. NOT MAPPABLE - aggregate to Rajnandgaon'
  },
  'chhattisgarh:manendragarh chirmiri bharatpur': {
    correctState: 'chhattisgarh',
    created: '2022-09-09',
    parentDistricts: ['korea'],
    note: 'New district created September 9, 2022. NOT MAPPABLE - aggregate to Korea'
  },
  'chhattisgarh:mohla manpur ambagarh chowki': {
    correctState: 'chhattisgarh',
    created: '2022-09-02',
    parentDistricts: ['rajnandgaon'],
    note: 'New district created September 2, 2022. NOT MAPPABLE - aggregate to Rajnandgaon'
  },
  'chhattisgarh:sakti': {
    correctState: 'chhattisgarh',
    created: '2022-09-09',
    parentDistricts: ['janjgir-champa'],
    note: 'New district created September 9, 2022. NOT MAPPABLE - aggregate to Janjgir-Champa'
  },
  'karnataka:vijayanagara': {
    correctState: 'karnataka',
    created: '2020-11-18',
    parentDistricts: ['ballari'],
    note: 'New district created November 18, 2020. NOT MAPPABLE - aggregate to Ballari'
  },
  'telangana:hanumakonda': {
    correctState: 'telangana',
    created: '2021-08',
    parentDistricts: ['warangal'],
    note: 'Warangal Urban renamed to Hanumakonda August 2021. NOT MAPPABLE - aggregate to Warangal'
  },
  'punjab:malerkotla': {
    correctState: 'punjab',
    created: '2021-06-02',
    parentDistricts: ['sangrur'],
    note: 'New district created June 2, 2021. NOT MAPPABLE - aggregate to Sangrur'
  },
  'sikkim:pakyong': {
    correctState: 'sikkim',
    created: '2021-12-13',
    parentDistricts: ['east sikkim'],
    note: 'New district created December 13, 2021. NOT MAPPABLE - aggregate to East Sikkim'
  },
  'sikkim:soreng': {
    correctState: 'sikkim',
    created: '2021-12-13',
    parentDistricts: ['west sikkim'],
    note: 'New district created December 13, 2021. NOT MAPPABLE - aggregate to West Sikkim'
  },
  'tamil nadu:ranipet': {
    correctState: 'tamil nadu',
    created: '2019-11-28',
    parentDistricts: ['vellore'],
    note: 'New district created November 28, 2019. NOT MAPPABLE - aggregate to Vellore'
  },
  'tamil nadu:mayiladuthurai': {
    correctState: 'tamil nadu',
    created: '2020-12-28',
    parentDistricts: ['nagapattinam'],
    note: 'New district created December 28, 2020. NOT MAPPABLE - aggregate to Nagapattinam'
  },
  'meghalaya:eastern west khasi hills': {
    correctState: 'meghalaya',
    created: '2021-11-10',
    parentDistricts: ['west khasi hills'],
    note: 'New district created November 10, 2021. NOT MAPPABLE - aggregate to West Khasi Hills'
  }
};

// CATEGORY 5: NON-DISTRICT ENTITIES (Keep excluded)
const NON_DISTRICTS = {
  'west bengal:siliguri mahakuma parisad': {
    reason: 'Sub-divisional rural council within Darjeeling district, not a district',
    aggregateTo: 'darjeeling'
  },
  'andaman and nicobar:north and middle andaman': {
    reason: 'This is actually a valid district - needs investigation',
    action: 'VERIFY'
  },
  'dn haveli and dd:dadra and nagar haveli': {
    reason: 'Administrative anomaly - UT merger in 2020, needs special handling',
    action: 'INVESTIGATE'
  }
};

let movedToMappings = 0;
let fixedWrongState = 0;
let updatedNewDistricts = 0;

console.log('\n' + '─'.repeat(80));
console.log('PHASE 1: Moving RENAMED districts from excluded to mappings');
console.log('─'.repeat(80));

for (const [key, info] of Object.entries(RENAMED_DISTRICTS)) {
  const geoId = findGeoId(info.geoDistrict, info.geoState);
  
  if (geoId) {
    // Remove from excluded
    if (perfectMapping.excluded[key]) {
      delete perfectMapping.excluded[key];
    }
    
    // Add to mappings
    perfectMapping.mappings[key] = {
      geoDistrict: info.geoDistrict,
      geoState: info.geoState,
      geoId: geoId,
      confidence: 1.0,
      method: 'research-verified-renamed',
      note: info.note
    };
    
    movedToMappings++;
    console.log(`✅ ${key}`);
    console.log(`   → ${info.geoDistrict}, ${info.geoState} (geoId: ${geoId})`);
    console.log(`   📝 ${info.note}`);
  } else {
    console.log(`❌ ${key} - GeoID not found for ${info.geoDistrict}`);
  }
}

console.log('\n' + '─'.repeat(80));
console.log('PHASE 2: Moving SPELLING VARIATIONS from excluded to mappings');
console.log('─'.repeat(80));

for (const [key, info] of Object.entries(SPELLING_VARIATIONS)) {
  const geoId = findGeoId(info.geoDistrict, info.geoState);
  
  if (geoId) {
    // Remove from excluded
    if (perfectMapping.excluded[key]) {
      delete perfectMapping.excluded[key];
    }
    
    // Add to mappings
    perfectMapping.mappings[key] = {
      geoDistrict: info.geoDistrict,
      geoState: info.geoState,
      geoId: geoId,
      confidence: 1.0,
      method: 'research-verified-spelling',
      note: info.note
    };
    
    movedToMappings++;
    console.log(`✅ ${key}`);
    console.log(`   → ${info.geoDistrict}, ${info.geoState} (geoId: ${geoId})`);
  } else {
    console.log(`❌ ${key} - GeoID not found for ${info.geoDistrict}`);
  }
}

console.log('\n' + '─'.repeat(80));
console.log('PHASE 3: Fixing WRONG STATE errors');
console.log('─'.repeat(80));

for (const [wrongKey, info] of Object.entries(WRONG_STATE_CORRECTIONS)) {
  const correctKey = info.correctKey;
  const geoId = findGeoId(info.geoDistrict, info.geoState);
  
  if (geoId) {
    // Remove wrong key from excluded
    if (perfectMapping.excluded[wrongKey]) {
      delete perfectMapping.excluded[wrongKey];
    }
    
    // Add correct key to mappings
    perfectMapping.mappings[correctKey] = {
      geoDistrict: info.geoDistrict,
      geoState: info.geoState,
      geoId: geoId,
      confidence: 1.0,
      method: 'research-verified-critical',
      note: info.note
    };
    
    fixedWrongState++;
    console.log(`🔴 CRITICAL FIX: ${wrongKey}`);
    console.log(`   ✅ Corrected to: ${correctKey}`);
    console.log(`   → ${info.geoDistrict}, ${info.geoState} (geoId: ${geoId})`);
    console.log(`   📝 ${info.note}`);
  } else {
    console.log(`❌ ${wrongKey} - GeoID not found for ${info.geoDistrict}`);
  }
}

console.log('\n' + '─'.repeat(80));
console.log('PHASE 4: Updating NEW DISTRICTS with parent aggregation info');
console.log('─'.repeat(80));

// Initialize newDistrictsAggregation if it doesn't exist
if (!perfectMapping.newDistrictsAggregation) {
  perfectMapping.newDistrictsAggregation = {};
}

for (const [key, info] of Object.entries(NEW_DISTRICTS)) {
  const correctKey = info.correctKey || key;
  
  // Update excluded entry with detailed info
  perfectMapping.excluded[correctKey] = {
    reason: 'new-district-post-2019',
    created: info.created,
    parentDistricts: info.parentDistricts,
    note: info.note,
    verified: true,
    verifiedDate: new Date().toISOString()
  };
  
  // Add to aggregation list
  perfectMapping.newDistrictsAggregation[correctKey] = {
    parentDistricts: info.parentDistricts,
    created: info.created,
    note: info.note
  };
  
  // Remove old wrong-state key if it exists
  if (info.correctKey && perfectMapping.excluded[key]) {
    delete perfectMapping.excluded[key];
  }
  
  updatedNewDistricts++;
  console.log(`📊 ${correctKey}`);
  console.log(`   → Aggregate to: ${info.parentDistricts.join(', ')}`);
  console.log(`   📅 Created: ${info.created}`);
}

console.log('\n' + '─'.repeat(80));
console.log('PHASE 5: Documenting NON-DISTRICT entities');
console.log('─'.repeat(80));

for (const [key, info] of Object.entries(NON_DISTRICTS)) {
  if (perfectMapping.excluded[key]) {
    perfectMapping.excluded[key] = {
      ...perfectMapping.excluded[key],
      reason: info.reason,
      action: info.action || 'EXCLUDE',
      aggregateTo: info.aggregateTo,
      verified: true,
      verifiedDate: new Date().toISOString()
    };
    console.log(`❌ ${key}`);
    console.log(`   📝 ${info.reason}`);
  }
}

// Update metadata
perfectMapping.version = '3.0-research-verified';
perfectMapping.generated = new Date().toISOString();
perfectMapping.researchBased = true;
perfectMapping.researchSource = 'research_1.md - Professional Grade Analysis';
perfectMapping.totalMappings = Object.keys(perfectMapping.mappings).length;
perfectMapping.excludedDistricts = Object.keys(perfectMapping.excluded).length;
perfectMapping.coverage = ((perfectMapping.totalMappings / perfectMapping.totalAPIDistricts) * 100).toFixed(2) + '%';

// Save
fs.writeFileSync(mappingPath, JSON.stringify(perfectMapping, null, 2));

console.log('\n' + '═'.repeat(80));
console.log('IMPLEMENTATION COMPLETE');
console.log('═'.repeat(80));
console.log(`\n📊 Summary:`);
console.log(`  ✅ Moved to mappings: ${movedToMappings}`);
console.log(`  🔴 Fixed wrong states: ${fixedWrongState}`);
console.log(`  📊 Updated new districts: ${updatedNewDistricts}`);
console.log(`\n📈 New totals:`);
console.log(`  Total mappings: ${perfectMapping.totalMappings}`);
console.log(`  Excluded: ${perfectMapping.excludedDistricts}`);
console.log(`  Coverage: ${perfectMapping.coverage}`);
console.log(`\n💾 Saved to: ${mappingPath}`);
console.log('\n✨ Research findings successfully implemented!\n');
