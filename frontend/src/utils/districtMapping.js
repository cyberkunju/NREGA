/**
 * District Mapping Utilities
 * Handles name normalization, API data enrichment, and GeoJSON integration
 */

import perfectMapping from '../data/perfect-district-mapping.json';

/**
 * Normalize district name for consistent matching
 * @param {string} name - District name from API or GeoJSON
 * @returns {string} Normalized district name
 */
export const normalizeDistrictName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .replace(/district$/i, '')
    .trim();
};

/**
 * Create composite key for district lookup (district|state)
 * @param {string} district - District name
 * @param {string} state - State name
 * @returns {string} Composite key in format "district|state"
 */
export const createCompositeKey = (district, state) => {
  const normalizedDistrict = normalizeDistrictName(district);
  const normalizedState = normalizeDistrictName(state);
  return `${normalizedDistrict}|${normalizedState}`;
};

/**
 * Create performance key for district lookup
 * Uses simple district name (no state) for backward compatibility
 * @param {string} name - District name
 * @returns {string} Lowercase district name
 */
export const createPerformanceKey = (name) => {
  return (name || '').toString().trim().toLowerCase();
};

/**
 * Find GeoJSON district using perfect mapping
 * @param {string} apiDistrict - District name from API
 * @param {string} apiState - State name from API
 * @returns {Object|null} Mapping object with geoDistrict, geoState, geoId
 */
export const findPerfectMapping = (apiDistrict, apiState) => {
  const key = createCompositeKey(apiDistrict, apiState);
  return perfectMapping.mappings[key] || null;
};

/**
 * Enrich GeoJSON features with API performance data using perfect mapping
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {Object} performanceData - API data keyed by district name (lowercase)
 * @returns {Object} Enriched GeoJSON
 */
export const enrichGeoJSONWithPerformance = (geojson, performanceData) => {
  if (!geojson || !geojson.features) {
    return geojson;
  }

  console.log(`[enrichGeoJSON] Enriching ${geojson.features.length} districts with performance data`);
  console.log(`[enrichGeoJSON] Performance data keys:`, Object.keys(performanceData || {}).length);
  console.log(`[enrichGeoJSON] Sample performance keys:`, Object.keys(performanceData || {}).slice(0, 5));
  
  // Build reverse mapping: geoId -> [apiDistrict, apiState]
  const geoIdToApiMap = {};
  Object.entries(perfectMapping.mappings).forEach(([compositeKey, mapping]) => {
    const [apiDistrict, apiState] = compositeKey.split('|');
    if (!geoIdToApiMap[mapping.geoId]) {
      geoIdToApiMap[mapping.geoId] = [];
    }
    geoIdToApiMap[mapping.geoId].push({ apiDistrict, apiState, compositeKey });
  });
  
  let matchedCount = 0;
  let perfectMatchCount = 0;
  let fallbackMatchCount = 0;
  const unmatched = [];

  const enriched = {
    ...geojson,
    features: geojson.features.map((feature, index) => {
      // Handle multiple GeoJSON formats
      const districtName = feature.properties?.District || feature.properties?.DISTRICT || feature.properties?.district || feature.properties?.NAME_2 || feature.properties?.name;
      const stateName = feature.properties?.STATE || feature.properties?.state || feature.properties?.st_nm || feature.properties?.NAME_1;
      const dtCode = feature.properties?.id || feature.properties?.dist_code || feature.properties?.D_CODE || feature.properties?.dt_code || feature.properties?.ID_2 || `auto_${index}`;
      
      let performance = null;
      let matchType = 'none';
      
      // Strategy 1: Use perfect mapping via geoId
      const apiMappings = geoIdToApiMap[dtCode];
      if (apiMappings && apiMappings.length > 0) {
        // Try each possible API district for this GeoJSON district
        for (const mapping of apiMappings) {
          const perfKey = createPerformanceKey(mapping.apiDistrict);
          if (performanceData[perfKey]) {
            performance = performanceData[perfKey];
            matchType = 'perfect-mapping';
            perfectMatchCount++;
            break;
          }
        }
      }
      
      // Strategy 2: Fallback to simple district name matching (backward compatibility)
      if (!performance) {
        const key = createPerformanceKey(districtName);
        performance = performanceData[key];
        if (performance) {
          matchType = 'fallback';
          fallbackMatchCount++;
        }
      }
      
      if (performance) {
        matchedCount++;
      } else if (unmatched.length < 10) {
        // Log first 10 unmatched for debugging
        unmatched.push({ 
          district: districtName, 
          state: stateName,
          dtCode: dtCode,
          apiMappings: apiMappings?.map(m => m.apiDistrict) || []
        });
      }

      // Calculate value for choropleth coloring
      let value = 0;
      if (performance?.currentMonth) {
        value = performance.currentMonth.paymentPercentage || 0;
      }

      return {
        ...feature,
        properties: {
          ...feature.properties,
          // Add performance data
          performance: performance || null,
          value: value, // For Mapbox color expression
          matchType: matchType, // For debugging
          // Ensure consistent property names for tooltip/click handlers
          districtName: districtName,
          stateName: stateName,
          dt_code: dtCode,
          // Add metadata
          hasData: !!performance,
          households: performance?.currentMonth?.totalHouseholds || 0,
          paymentPercentage: performance?.currentMonth?.paymentPercentage || 0,
          averageDays: performance?.currentMonth?.averageDays || 0
        }
      };
    })
  };
  
  console.log(`[enrichGeoJSON] ✅ Matched ${matchedCount} out of ${geojson.features.length} districts`);
  console.log(`[enrichGeoJSON] 🎯 Perfect mapping: ${perfectMatchCount}, Fallback: ${fallbackMatchCount}`);
  if (unmatched.length > 0) {
    console.log(`[enrichGeoJSON] ⚠️ Sample unmatched districts:`, unmatched);
  }
  return enriched;
};

/**
 * Transform performance data from array to keyed object
 * @param {Object} districtPerformance - Performance data object
 * @returns {Object} Keyed by performance key
 */
export const transformPerformanceData = (districtPerformance) => {
  return districtPerformance || {};
};

/**
 * Get statistics from enriched GeoJSON
 * @param {Object} geojson - Enriched GeoJSON
 * @returns {Object} Statistics object
 */
export const getDataStatistics = (geojson) => {
  if (!geojson || !geojson.features) {
    return {
      total: 0,
      withData: 0,
      withoutData: 0,
      minValue: 0,
      maxValue: 0,
      avgValue: 0
    };
  }

  const values = geojson.features
    .map(f => f.properties?.value || 0)
    .filter(v => v > 0);

  return {
    total: geojson.features.length,
    withData: geojson.features.filter(f => f.properties?.hasData).length,
    withoutData: geojson.features.filter(f => !f.properties?.hasData).length,
    minValue: values.length > 0 ? Math.min(...values) : 0,
    maxValue: values.length > 0 ? Math.max(...values) : 100,
    avgValue: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  };
};

/**
 * Find feature by district name (fuzzy matching)
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {string} districtName - District name to search
 * @returns {Object|null} Matching feature or null
 */
export const findDistrictFeature = (geojson, districtName) => {
  if (!geojson || !geojson.features || !districtName) {
    return null;
  }

  const normalized = normalizeDistrictName(districtName);

  return geojson.features.find(feature => {
    const featureName = feature.properties?.name || feature.properties?.district;
    return normalizeDistrictName(featureName) === normalized;
  }) || null;
};

/**
 * Get district centroid coordinates
 * @param {Object} feature - GeoJSON feature
 * @returns {Array} [lng, lat] coordinates
 */
export const getDistrictCentroid = (feature) => {
  if (!feature || !feature.geometry) {
    return [78.9629, 20.5937]; // Default to India center
  }

  // For Point geometry
  if (feature.geometry.type === 'Point') {
    return feature.geometry.coordinates;
  }

  // For Polygon/MultiPolygon, calculate center
  // Simple bounding box center calculation
  const bounds = getBounds(feature.geometry);
  if (bounds) {
    const lng = (bounds[0] + bounds[2]) / 2;
    const lat = (bounds[1] + bounds[3]) / 2;
    return [lng, lat];
  }

  return [78.9629, 20.5937];
};

/**
 * Get bounding box for geometry
 * @param {Object} geometry - GeoJSON geometry
 * @returns {Array} [minLng, minLat, maxLng, maxLat]
 */
const getBounds = (geometry) => {
  let coords = [];

  if (geometry.type === 'Point') {
    return null;
  } else if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    coords = geometry.coordinates.flat(2);
  }

  if (coords.length === 0) return null;

  const lngs = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);

  return [
    Math.min(...lngs),
    Math.min(...lats),
    Math.max(...lngs),
    Math.max(...lats)
  ];
};

export default {
  normalizeDistrictName,
  createPerformanceKey,
  enrichGeoJSONWithPerformance,
  transformPerformanceData,
  getDataStatistics,
  findDistrictFeature,
  getDistrictCentroid
};
