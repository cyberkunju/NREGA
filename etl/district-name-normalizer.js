/**
 * District Name Normalizer Module
 * Advanced normalization and fuzzy matching for district names
 */

const districtOverrides = require('./district-name-overrides');

/**
 * Normalize district name by removing special characters, spaces, parentheses
 * @param {string} name - District name to normalize
 * @returns {string} Normalized district name
 */
function normalizeDistrictName(name) {
  if (!name) return '';
  
  let normalized = name
    .toLowerCase()
    .trim()
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    // Remove common suffixes
    .replace(/\s*district$/i, '')
    .replace(/\s*zilla$/i, '')
    // Remove parentheses and their contents
    .replace(/\s*\([^)]*\)/g, '')
    // Normalize punctuation
    .replace(/[.,;:]/g, '')
    .trim();
  
  return normalized;
}

/**
 * Create a super-normalized version for fuzzy matching (removes ALL non-alphanumeric)
 * @param {string} name - District name
 * @returns {string} Super normalized name
 */
function superNormalize(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
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
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between two strings (0-1)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0 = no match, 1 = exact match)
 */
function similarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Find matching district from GeoJSON using multiple strategies
 * @param {string} apiDistrictName - District name from API
 * @param {Array} geoJsonDistricts - Array of districts from GeoJSON
 * @returns {Object|null} Matched district or null
 */
function findDistrictMatch(apiDistrictName, geoJsonDistricts) {
  if (!apiDistrictName || !geoJsonDistricts) return null;
  
  // Strategy 1: Check manual overrides first
  const superNorm = superNormalize(apiDistrictName);
  if (districtOverrides[superNorm]) {
    const overrideName = districtOverrides[superNorm];
    const match = geoJsonDistricts.find(d => 
      superNormalize(d.name) === superNormalize(overrideName)
    );
    if (match) {
      console.log(`✓ Manual override match: ${apiDistrictName} -> ${match.name}`);
      return match;
    }
  }
  
  // Normalize API name
  const apiNormalized = normalizeDistrictName(apiDistrictName);
  const apiSuperNorm = superNormalize(apiDistrictName);
  
  // Strategy 2: Exact match (normalized)
  for (const district of geoJsonDistricts) {
    if (normalizeDistrictName(district.name) === apiNormalized) {
      return district;
    }
  }
  
  // Strategy 3: Super-normalized exact match
  for (const district of geoJsonDistricts) {
    if (superNormalize(district.name) === apiSuperNorm) {
      return district;
    }
  }
  
  // Strategy 4: Contains match
  for (const district of geoJsonDistricts) {
    const geoSuperNorm = superNormalize(district.name);
    if (apiSuperNorm.includes(geoSuperNorm) || geoSuperNorm.includes(apiSuperNorm)) {
      // Make sure it's not a tiny substring match
      const minLength = Math.min(apiSuperNorm.length, geoSuperNorm.length);
      if (minLength >= 5) { // Only match if at least 5 characters
        return district;
      }
    }
  }
  
  // Strategy 5: Fuzzy match (Levenshtein distance)
  let bestMatch = null;
  let bestScore = 0;
  const threshold = 0.85; // 85% similarity required
  
  for (const district of geoJsonDistricts) {
    const geoSuperNorm = superNormalize(district.name);
    const score = similarity(apiSuperNorm, geoSuperNorm);
    
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = district;
    }
  }
  
  if (bestMatch) {
    console.log(`✓ Fuzzy match (${(bestScore * 100).toFixed(1)}%): ${apiDistrictName} -> ${bestMatch.name}`);
    return bestMatch;
  }
  
  // No match found
  console.log(`✗ No match found for: ${apiDistrictName}`);
  return null;
}

/**
 * Match districts between API data and GeoJSON
 * @param {Array} apiDistricts - Districts from API with {name, state}
 * @param {Array} geoJsonDistricts - Districts from GeoJSON
 * @returns {Object} Matching results
 */
function matchDistricts(apiDistricts, geoJsonDistricts) {
  const matched = [];
  const unmatched = [];
  
  for (const apiDistrict of apiDistricts) {
    const match = findDistrictMatch(apiDistrict.name, geoJsonDistricts);
    
    if (match) {
      matched.push({
        api: apiDistrict,
        geo: match,
        matchType: 'auto'
      });
    } else {
      unmatched.push(apiDistrict);
    }
  }
  
  return {
    matched,
    unmatched,
    matchRate: apiDistricts.length > 0 ? matched.length / apiDistricts.length : 0
  };
}

module.exports = {
  normalizeDistrictName,
  superNormalize,
  similarity,
  findDistrictMatch,
  matchDistricts,
  levenshteinDistance
};
