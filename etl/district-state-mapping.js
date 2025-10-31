/**
 * District to State Mapping Module
 * Maps district names to their corresponding state names
 * Source: india-districts.geojson
 */

const fs = require('fs');
const path = require('path');

// Load district-state mapping from GeoJSON
let districtStateMap = null;

/**
 * Load mapping from GeoJSON file
 * @returns {Object} District to state mapping
 */
function loadMappingFromGeoJSON() {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../frontend/public/india-districts.geojson'),
      '/tmp/india-districts.geojson',
      '/app/../frontend/public/india-districts.geojson'
    ];
    
    let geoData = null;
    for (const geoJsonPath of possiblePaths) {
      try {
        geoData = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'));
        console.log(`Loaded GeoJSON from: ${geoJsonPath}`);
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    if (!geoData) {
      throw new Error('Could not find GeoJSON file in any known location');
    }
    
    const mapping = {};
    geoData.features.forEach(feature => {
      const district = feature.properties.District;
      const state = feature.properties.STATE;
      
      if (district && state) {
        // Store multiple variations for better matching
        const districtLower = district.toLowerCase().trim();
        mapping[districtLower] = state;
        
        // Also store without special characters
        const districtNormalized = districtLower.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
        mapping[districtNormalized] = state;
      }
    });
    
    console.log(`Loaded ${Object.keys(mapping).length} district-state mappings from GeoJSON`);
    return mapping;
  } catch (error) {
    console.error('Failed to load GeoJSON mapping:', error.message);
    return {};
  }
}

/**
 * Get mapping (lazy load)
 * @returns {Object} District to state mapping
 */
function getMapping() {
  if (!districtStateMap) {
    districtStateMap = loadMappingFromGeoJSON();
  }
  return districtStateMap;
}

/**
 * Get state name for a district
 * @param {string} districtName - District name
 * @returns {string} State name or 'India' if not found
 */
function getStateForDistrict(districtName) {
  if (!districtName) return 'India';
  
  const mapping = getMapping();
  const districtLower = districtName.toLowerCase().trim();
  
  // Try exact match first
  if (mapping[districtLower]) {
    return mapping[districtLower];
  }
  
  // Try normalized match (without special characters)
  const districtNormalized = districtLower.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  if (mapping[districtNormalized]) {
    return mapping[districtNormalized];
  }
  
  // Try super-normalized (no spaces at all)
  const superNormalized = districtLower.replace(/[^a-z0-9]/g, '');
  if (mapping[superNormalized]) {
    return mapping[superNormalized];
  }
  
  // Try fuzzy matching with longer minimum length
  for (const [key, state] of Object.entries(mapping)) {
    const keyNorm = key.replace(/[^a-z0-9]/g, '');
    const distNorm = superNormalized;
    
    if (keyNorm.length >= 5 && distNorm.length >= 5) {
      if (keyNorm.includes(distNorm) || distNorm.includes(keyNorm)) {
        return state;
      }
    }
  }
  
  // Return India as default
  return 'India';
}

/**
 * Get all unique states
 * @returns {Array} Array of unique state names
 */
function getAllStates() {
  const mapping = getMapping();
  return [...new Set(Object.values(mapping))].sort();
}

/**
 * Get statistics about mapping
 * @returns {Object} Mapping statistics
 */
function getMappingStats() {
  const mapping = getMapping();
  const states = getAllStates();
  
  return {
    totalMappings: Object.keys(mapping).length,
    uniqueStates: states.length,
    states: states
  };
}

module.exports = {
  getStateForDistrict,
  getAllStates,
  getMappingStats,
  getMapping
};
