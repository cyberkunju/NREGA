#!/usr/bin/env node

/**
 * Deep Check for District Abnormalities
 * Checks for potential mapping issues between API and GeoJSON
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3001/api/performance/heatmap-data';
const GEOJSON_PATH = path.join(__dirname, '../frontend/public/india-districts.geojson');
const MAPPING_PATH = path.join(__dirname, '../frontend/src/data/perfect-district-mapping.json');

const normalizeDistrictName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\bdist(rict)?\b/g, '')
    .trim();
};

async function deepCheck() {
  console.log('🔍 Starting Deep District Check...\n');

  // Load API data
  console.log('📡 Fetching API data...');
  const apiResponse = await axios.get(API_URL);
  const apiData = apiResponse.data;
  console.log(`✓ Loaded ${apiData.length} districts from API\n`);

  // Load GeoJSON
  console.log('📂 Loading GeoJSON...');
  const geoJSON = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
  console.log(`✓ Loaded ${geoJSON.features.length} districts from GeoJSON\n`);

  // Load perfect mapping
  console.log('📊 Loading perfect mapping...');
  const perfectMapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));
  const mappingCount = Object.keys(perfectMapping.mappings).length;
  console.log(`✓ Loaded ${mappingCount} mappings\n`);

  // Build reverse mapping: geoId -> API districts
  const geoIdToApi = {};
  Object.entries(perfectMapping.mappings).forEach(([key, mapping]) => {
    const [district, state] = key.split('|');
    if (!geoIdToApi[mapping.geoId]) {
      geoIdToApi[mapping.geoId] = [];
    }
    geoIdToApi[mapping.geoId].push({ district, state, key });
  });

  // Check for abnormalities
  const issues = {
    multipleApiToOneGeo: [],
    noGeoMatch: [],
    noApiMatch: [],
    shortNames: [],
    duplicateNames: [],
    suspiciousMatches: []
  };

  // Check 1: Multiple API districts mapping to same GeoJSON
  console.log('🔍 Checking for multiple API districts mapping to same GeoJSON...');
  Object.entries(geoIdToApi).forEach(([geoId, apiDistricts]) => {
    if (apiDistricts.length > 1) {
      const geoFeature = geoJSON.features.find(f => (f.properties.dt_code || f.properties.id) == geoId);
      if (geoFeature) {
        issues.multipleApiToOneGeo.push({
          geoId,
          geoDistrict: geoFeature.properties.District || geoFeature.properties.district,
          geoState: geoFeature.properties.STATE || geoFeature.properties.state,
          apiDistricts: apiDistricts.map(d => `${d.district} (${d.state})`)
        });
      }
    }
  });
  console.log(`  Found ${issues.multipleApiToOneGeo.length} cases\n`);

  // Check 2: API districts with no GeoJSON match
  console.log('🔍 Checking for API districts with no GeoJSON match...');
  apiData.forEach(api => {
    const key = `${normalizeDistrictName(api.districtName)}|${normalizeDistrictName(api.stateName)}`;
    const mapping = perfectMapping.mappings[key];
    if (!mapping) {
      issues.noGeoMatch.push({
        district: api.districtName,
        state: api.stateName,
        normalized: key
      });
    }
  });
  console.log(`  Found ${issues.noGeoMatch.length} API districts without GeoJSON match\n`);

  // Check 3: GeoJSON districts with no API match
  console.log('🔍 Checking for GeoJSON districts with no API data...');
  geoJSON.features.forEach(feature => {
    const geoId = feature.properties.dt_code || feature.properties.id;
    const apiMatches = geoIdToApi[geoId];
    if (!apiMatches || apiMatches.length === 0) {
      issues.noApiMatch.push({
        district: feature.properties.District || feature.properties.district,
        state: feature.properties.STATE || feature.properties.state,
        geoId: geoId
      });
    }
  });
  console.log(`  Found ${issues.noApiMatch.length} GeoJSON districts without API data\n`);

  // Check 4: Short district names (potential conflicts)
  console.log('🔍 Checking for short district names...');
  apiData.forEach(api => {
    if (api.districtName.length <= 4) {
      issues.shortNames.push({
        district: api.districtName,
        state: api.stateName,
        length: api.districtName.length
      });
    }
  });
  console.log(`  Found ${issues.shortNames.length} districts with names ≤ 4 characters\n`);

  // Check 5: Duplicate district names across states
  console.log('🔍 Checking for duplicate district names...');
  const nameCount = {};
  apiData.forEach(api => {
    const name = normalizeDistrictName(api.districtName);
    if (!nameCount[name]) {
      nameCount[name] = [];
    }
    nameCount[name].push(api.stateName);
  });
  Object.entries(nameCount).forEach(([name, states]) => {
    if (states.length > 1) {
      issues.duplicateNames.push({
        district: name,
        states: states,
        count: states.length
      });
    }
  });
  console.log(`  Found ${issues.duplicateNames.length} duplicate district names\n`);

  // Print detailed results
  console.log('\n' + '='.repeat(80));
  console.log('📋 DETAILED RESULTS');
  console.log('='.repeat(80) + '\n');

  if (issues.multipleApiToOneGeo.length > 0) {
    console.log('⚠️  MULTIPLE API DISTRICTS → ONE GEOJSON:');
    issues.multipleApiToOneGeo.forEach(issue => {
      console.log(`   GeoJSON: ${issue.geoDistrict} (${issue.geoState}) [ID: ${issue.geoId}]`);
      console.log(`   ← API: ${issue.apiDistricts.join(', ')}`);
      console.log();
    });
  }

  if (issues.noGeoMatch.length > 0) {
    console.log(`\n❌ API DISTRICTS WITHOUT GEOJSON MATCH (${issues.noGeoMatch.length}):`);
    issues.noGeoMatch.slice(0, 20).forEach(issue => {
      console.log(`   ${issue.district} (${issue.state})`);
    });
    if (issues.noGeoMatch.length > 20) {
      console.log(`   ... and ${issues.noGeoMatch.length - 20} more`);
    }
  }

  if (issues.noApiMatch.length > 0) {
    console.log(`\n❌ GEOJSON DISTRICTS WITHOUT API DATA (${issues.noApiMatch.length}):`);
    issues.noApiMatch.slice(0, 20).forEach(issue => {
      console.log(`   ${issue.district} (${issue.state}) [ID: ${issue.geoId}]`);
    });
    if (issues.noApiMatch.length > 20) {
      console.log(`   ... and ${issues.noApiMatch.length - 20} more`);
    }
  }

  if (issues.shortNames.length > 0) {
    console.log(`\n⚠️  SHORT DISTRICT NAMES (${issues.shortNames.length}):`);
    issues.shortNames.slice(0, 15).forEach(issue => {
      console.log(`   ${issue.district} (${issue.state}) - ${issue.length} chars`);
    });
    if (issues.shortNames.length > 15) {
      console.log(`   ... and ${issues.shortNames.length - 15} more`);
    }
  }

  if (issues.duplicateNames.length > 0) {
    console.log(`\n⚠️  DUPLICATE DISTRICT NAMES (${issues.duplicateNames.length}):`);
    issues.duplicateNames.slice(0, 15).forEach(issue => {
      console.log(`   ${issue.district}: ${issue.states.join(', ')}`);
    });
    if (issues.duplicateNames.length > 15) {
      console.log(`   ... and ${issues.duplicateNames.length - 15} more`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`API Districts: ${apiData.length}`);
  console.log(`GeoJSON Districts: ${geoJSON.features.length}`);
  console.log(`Perfect Mappings: ${mappingCount}`);
  console.log(`Coverage: ${((mappingCount / apiData.length) * 100).toFixed(2)}%`);
  console.log();
  console.log(`Issues Found:`);
  console.log(`  - Multiple API → One GeoJSON: ${issues.multipleApiToOneGeo.length}`);
  console.log(`  - API without GeoJSON: ${issues.noGeoMatch.length}`);
  console.log(`  - GeoJSON without API: ${issues.noApiMatch.length}`);
  console.log(`  - Short names (≤4 chars): ${issues.shortNames.length}`);
  console.log(`  - Duplicate names: ${issues.duplicateNames.length}`);
  console.log();

  // Save results
  const outputPath = path.join(__dirname, '../analysis-output/deep-check-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
  console.log(`✓ Detailed results saved to: ${outputPath}`);
  console.log('\n✅ Deep check complete!');
}

deepCheck().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
