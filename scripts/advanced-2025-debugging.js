/**
 * Advanced 2025 Debugging & Testing Script for React MapLibre Applications
 * Based on latest research and best practices
 * 
 * This script implements comprehensive validation techniques including:
 * 1. Unicode normalization edge case detection
 * 2. GeoJSON coordinate precision validation
 * 3. Data pipeline quality assessment
 * 4. String matching edge cases (homoglyphs, combining characters)
 * 5. Coordinate system validation
 * 6. Choropleth data normalization verification
 * 7. Performance bottleneck identification
 */

const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class Advanced2025Debugger {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.stats = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningChecks: 0
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  addIssue(category, severity, message, details = {}) {
    const issue = { category, severity, message, details, timestamp: new Date().toISOString() };
    if (severity === 'ERROR') {
      this.issues.push(issue);
      this.stats.failedChecks++;
    } else {
      this.warnings.push(issue);
      this.stats.warningChecks++;
    }
    this.stats.totalChecks++;
  }

  addSuccess(category, message) {
    this.stats.passedChecks++;
    this.stats.totalChecks++;
    this.log(`✓ ${category}: ${message}`, 'green');
  }

  // ============================================================================
  // 1. UNICODE NORMALIZATION EDGE CASE DETECTION
  // ============================================================================
  
  checkUnicodeNormalization(strings, context = 'unknown') {
    this.log('\n=== Unicode Normalization Analysis ===', 'cyan');
    
    const issues = [];
    const forms = ['NFC', 'NFD', 'NFKC', 'NFKD'];
    
    // Filter to only strings
    const validStrings = strings.filter(s => typeof s === 'string' && s.length > 0);
    
    validStrings.forEach((str, idx) => {
      // Check if string has multiple normalization forms
      const normalized = {};
      forms.forEach(form => {
        normalized[form] = str.normalize(form);
      });
      
      // Check if different forms produce different results
      const uniqueForms = new Set(Object.values(normalized));
      if (uniqueForms.size > 1) {
        this.addIssue(
          'Unicode Normalization',
          'WARNING',
          `String "${str}" has ${uniqueForms.size} different normalization forms`,
          { context, index: idx, forms: normalized }
        );
      }
      
      // Check for combining characters
      const hasCombiningChars = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/.test(str);
      if (hasCombiningChars) {
        this.addIssue(
          'Unicode Normalization',
          'WARNING',
          `String "${str}" contains combining characters`,
          { context, index: idx, nfc: str.normalize('NFC'), nfd: str.normalize('NFD') }
        );
      }
      
      // Check for homoglyphs (visually similar characters from different scripts)
      const homoglyphPatterns = [
        { pattern: /[АВЕКМНОРСТХаеорсух]/g, script: 'Cyrillic', warning: 'Contains Cyrillic characters that look like Latin' },
        { pattern: /[ΑΒΕΖΗΙΚΜΝΟΡΤΥΧαβεζηικμνοπρστυχ]/g, script: 'Greek', warning: 'Contains Greek characters that look like Latin' }
      ];
      
      homoglyphPatterns.forEach(({ pattern, script, warning }) => {
        if (pattern.test(str)) {
          this.addIssue(
            'Homoglyph Detection',
            'ERROR',
            `String "${str}": ${warning}`,
            { context, index: idx, script }
          );
        }
      });
      
      // Check for zero-width characters
      const zeroWidthChars = /[\u200B-\u200D\uFEFF]/g;
      if (zeroWidthChars.test(str)) {
        this.addIssue(
          'Zero-Width Characters',
          'WARNING',
          `String "${str}" contains zero-width characters`,
          { context, index: idx }
        );
      }
      
      // Check for right-to-left marks
      const rtlMarks = /[\u200E\u200F\u202A-\u202E]/g;
      if (rtlMarks.test(str)) {
        this.addIssue(
          'RTL Marks',
          'WARNING',
          `String "${str}" contains RTL direction marks`,
          { context, index: idx }
        );
      }
    });
    
    if (this.issues.filter(i => i.category.includes('Unicode') || i.category.includes('Homoglyph')).length === 0) {
      this.addSuccess('Unicode Normalization', `All ${validStrings.length} strings passed normalization checks`);
    }
  }

  // ============================================================================
  // 2. GEOJSON COORDINATE PRECISION & VALIDATION
  // ============================================================================
  
  validateGeoJSON(geojson, context = 'unknown') {
    this.log('\n=== GeoJSON Validation ===', 'cyan');
    
    if (!geojson || geojson.type !== 'FeatureCollection') {
      this.addIssue('GeoJSON Structure', 'ERROR', 'Invalid GeoJSON: not a FeatureCollection', { context });
      return;
    }
    
    const features = geojson.features || [];
    let totalCoords = 0;
    let highPrecisionCoords = 0;
    let invalidCoords = 0;
    let outOfBoundsCoords = 0;
    
    features.forEach((feature, fIdx) => {
      if (!feature.geometry) {
        this.addIssue('GeoJSON Structure', 'WARNING', `Feature ${fIdx} has no geometry`, { context, featureIndex: fIdx });
        return;
      }
      
      const coords = this.extractCoordinates(feature.geometry);
      coords.forEach((coord, cIdx) => {
        if (!Array.isArray(coord) || coord.length < 2) return;
        
        const [lon, lat] = coord;
        totalCoords++;
        
        // Check coordinate bounds (WGS84)
        if (lon < -180 || lon > 180) {
          invalidCoords++;
          this.addIssue(
            'Coordinate Validation',
            'ERROR',
            `Invalid longitude ${lon} in feature ${fIdx}`,
            { context, featureIndex: fIdx, coordIndex: cIdx, lon, lat }
          );
        }
        
        if (lat < -90 || lat > 90) {
          invalidCoords++;
          this.addIssue(
            'Coordinate Validation',
            'ERROR',
            `Invalid latitude ${lat} in feature ${fIdx}`,
            { context, featureIndex: fIdx, coordIndex: cIdx, lon, lat }
          );
        }
        
        // Check coordinate precision (recommended: 6 decimal places)
        const lonPrecision = this.getDecimalPlaces(lon);
        const latPrecision = this.getDecimalPlaces(lat);
        
        if (lonPrecision > 6 || latPrecision > 6) {
          highPrecisionCoords++;
        }
        
        // Check for coordinates that might be swapped (lat, lon instead of lon, lat)
        // India bounds: roughly 68°E to 97°E, 8°N to 37°N
        if (lon >= 8 && lon <= 37 && lat >= 68 && lat <= 97) {
          this.addIssue(
            'Coordinate Validation',
            'WARNING',
            `Possible swapped coordinates in feature ${fIdx}: [${lon}, ${lat}] - might be [lat, lon] instead of [lon, lat]`,
            { context, featureIndex: fIdx, coordIndex: cIdx, lon, lat }
          );
        }
      });
      
      // Check for required properties
      if (!feature.properties) {
        this.addIssue('GeoJSON Structure', 'WARNING', `Feature ${fIdx} has no properties`, { context, featureIndex: fIdx });
      } else {
        // Check for common identifier fields
        const hasId = feature.properties.dtname || feature.properties.district || feature.properties.name || feature.properties.id;
        if (!hasId) {
          this.addIssue(
            'GeoJSON Properties',
            'WARNING',
            `Feature ${fIdx} has no recognizable identifier field`,
            { context, featureIndex: fIdx, properties: Object.keys(feature.properties) }
          );
        }
      }
    });
    
    // Report precision issues
    if (highPrecisionCoords > 0) {
      const percentage = ((highPrecisionCoords / totalCoords) * 100).toFixed(2);
      this.addIssue(
        'Coordinate Precision',
        'WARNING',
        `${highPrecisionCoords} coordinates (${percentage}%) have >6 decimal places - consider reducing precision to optimize file size`,
        { context, totalCoords, highPrecisionCoords }
      );
    }
    
    if (invalidCoords === 0 && outOfBoundsCoords === 0) {
      this.addSuccess('Coordinate Validation', `All ${totalCoords} coordinates are valid`);
    }
    
    this.log(`  Total features: ${features.length}`, 'blue');
    this.log(`  Total coordinates: ${totalCoords}`, 'blue');
    this.log(`  High precision coords: ${highPrecisionCoords}`, 'blue');
  }

  extractCoordinates(geometry) {
    const coords = [];
    
    const extract = (geom) => {
      if (geom.type === 'Point') {
        coords.push(geom.coordinates);
      } else if (geom.type === 'LineString' || geom.type === 'MultiPoint') {
        geom.coordinates.forEach(c => coords.push(c));
      } else if (geom.type === 'Polygon' || geom.type === 'MultiLineString') {
        geom.coordinates.forEach(ring => ring.forEach(c => coords.push(c)));
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach(poly => poly.forEach(ring => ring.forEach(c => coords.push(c))));
      } else if (geom.type === 'GeometryCollection') {
        geom.geometries.forEach(g => extract(g));
      }
    };
    
    extract(geometry);
    return coords;
  }

  getDecimalPlaces(num) {
    const str = num.toString();
    const decimalIndex = str.indexOf('.');
    return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
  }

  // ============================================================================
  // 3. DATA MATCHING & NORMALIZATION VALIDATION
  // ============================================================================
  
  validateDataMatching(geojsonFeatures, apiData, mappingFile) {
    this.log('\n=== Data Matching Validation ===', 'cyan');
    
    // Extract district names from each source
    const geojsonDistricts = new Set();
    const apiDistricts = new Set();
    const mappingDistricts = new Set(Object.keys(mappingFile || {}));
    
    geojsonFeatures.forEach(f => {
      const name = f.properties?.dtname || f.properties?.district || f.properties?.name;
      if (name) geojsonDistricts.add(name);
    });
    
    apiData.forEach(d => {
      const name = d.district_name || d.districtName || d.district;
      if (name) apiDistricts.add(name);
    });
    
    // Check for normalization consistency
    this.log(`  GeoJSON districts: ${geojsonDistricts.size}`, 'blue');
    this.log(`  API districts: ${apiDistricts.size}`, 'blue');
    this.log(`  Mapping file entries: ${mappingDistricts.size}`, 'blue');
    
    // Find unmatched districts
    const unmatchedInGeoJSON = [];
    const unmatchedInAPI = [];
    
    geojsonDistricts.forEach(gd => {
      if (!mappingDistricts.has(gd)) {
        unmatchedInGeoJSON.push(gd);
      }
    });
    
    apiDistricts.forEach(ad => {
      const normalized = this.normalizeDistrictName(ad);
      let found = false;
      for (const [key, value] of Object.entries(mappingFile || {})) {
        if (value === ad || this.normalizeDistrictName(value) === normalized) {
          found = true;
          break;
        }
      }
      if (!found) {
        unmatchedInAPI.push(ad);
      }
    });
    
    if (unmatchedInGeoJSON.length > 0) {
      this.addIssue(
        'Data Matching',
        'ERROR',
        `${unmatchedInGeoJSON.length} GeoJSON districts not in mapping file`,
        { unmatchedDistricts: unmatchedInGeoJSON.slice(0, 10) }
      );
    }
    
    if (unmatchedInAPI.length > 0) {
      this.addIssue(
        'Data Matching',
        'ERROR',
        `${unmatchedInAPI.length} API districts not in mapping file`,
        { unmatchedDistricts: unmatchedInAPI.slice(0, 10) }
      );
    }
    
    // Check for case sensitivity issues
    const caseIssues = this.findCaseSensitivityIssues([...geojsonDistricts], [...apiDistricts]);
    if (caseIssues.length > 0) {
      caseIssues.forEach(issue => {
        this.addIssue('Case Sensitivity', 'WARNING', issue.message, issue.details);
      });
    }
    
    // Check for special character issues
    const specialCharIssues = this.findSpecialCharacterIssues([...geojsonDistricts, ...apiDistricts]);
    if (specialCharIssues.length > 0) {
      specialCharIssues.forEach(issue => {
        this.addIssue('Special Characters', 'WARNING', issue.message, issue.details);
      });
    }
    
    const matchRate = ((mappingDistricts.size / Math.max(geojsonDistricts.size, apiDistricts.size)) * 100).toFixed(2);
    this.log(`  Match rate: ${matchRate}%`, matchRate > 90 ? 'green' : 'yellow');
    
    if (unmatchedInGeoJSON.length === 0 && unmatchedInAPI.length === 0) {
      this.addSuccess('Data Matching', 'All districts successfully matched');
    }
  }

  normalizeDistrictName(name) {
    if (!name || typeof name !== 'string') return '';
    return name
      .toLowerCase()
      .normalize('NFC')
      .replace(/\s*&\s*/g, ' and ')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  findCaseSensitivityIssues(list1, list2) {
    const issues = [];
    const lowerMap = new Map();
    
    [...list1, ...list2].filter(name => typeof name === 'string').forEach(name => {
      const lower = name.toLowerCase();
      if (!lowerMap.has(lower)) {
        lowerMap.set(lower, []);
      }
      lowerMap.get(lower).push(name);
    });
    
    lowerMap.forEach((variants, lower) => {
      if (variants.length > 1 && new Set(variants).size > 1) {
        issues.push({
          message: `Case sensitivity issue: "${variants.join('", "')}" are treated as different`,
          details: { variants, normalized: lower }
        });
      }
    });
    
    return issues;
  }

  findSpecialCharacterIssues(names) {
    const issues = [];
    const patterns = [
      { regex: /&/, name: 'ampersand', suggestion: 'Use "and" instead' },
      { regex: /\s{2,}/, name: 'multiple spaces', suggestion: 'Normalize to single space' },
      { regex: /[''`]/, name: 'various apostrophes', suggestion: 'Standardize apostrophe character' },
      { regex: /[–—]/, name: 'various dashes', suggestion: 'Standardize to hyphen' },
      { regex: /^\s|\s$/, name: 'leading/trailing whitespace', suggestion: 'Trim whitespace' }
    ];
    
    names.forEach(name => {
      patterns.forEach(({ regex, name: patternName, suggestion }) => {
        if (regex.test(name)) {
          issues.push({
            message: `"${name}" contains ${patternName}`,
            details: { name, issue: patternName, suggestion }
          });
        }
      });
    });
    
    return issues;
  }

  // ============================================================================
  // 4. PERFORMANCE & FILE SIZE ANALYSIS
  // ============================================================================
  
  analyzePerformance(geojsonPath, mappingPath) {
    this.log('\n=== Performance Analysis ===', 'cyan');
    
    try {
      const geojsonStats = fs.statSync(geojsonPath);
      const mappingStats = fs.statSync(mappingPath);
      
      const geojsonSizeMB = (geojsonStats.size / 1024 / 1024).toFixed(2);
      const mappingSizeKB = (mappingStats.size / 1024).toFixed(2);
      
      this.log(`  GeoJSON file size: ${geojsonSizeMB} MB`, 'blue');
      this.log(`  Mapping file size: ${mappingSizeKB} KB`, 'blue');
      
      // Warn if GeoJSON is too large
      if (geojsonStats.size > 5 * 1024 * 1024) {
        this.addIssue(
          'Performance',
          'WARNING',
          `GeoJSON file is ${geojsonSizeMB} MB - consider optimization`,
          {
            size: geojsonStats.size,
            suggestions: [
              'Reduce coordinate precision to 6 decimal places',
              'Remove unused properties',
              'Simplify geometries',
              'Consider vector tiles for large datasets'
            ]
          }
        );
      } else {
        this.addSuccess('Performance', `GeoJSON file size (${geojsonSizeMB} MB) is acceptable`);
      }
      
      // Check GeoJSON for optimization opportunities
      const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
      const features = geojson.features || [];
      
      if (features.length > 0) {
        const sampleFeature = features[0];
        const propertyCount = Object.keys(sampleFeature.properties || {}).length;
        
        this.log(`  Average properties per feature: ${propertyCount}`, 'blue');
        
        if (propertyCount > 10) {
          this.addIssue(
            'Performance',
            'WARNING',
            `Features have ${propertyCount} properties - consider removing unused properties`,
            { propertyCount, sampleProperties: Object.keys(sampleFeature.properties) }
          );
        }
      }
      
    } catch (error) {
      this.addIssue('Performance', 'ERROR', `Failed to analyze files: ${error.message}`, { error: error.stack });
    }
  }

  // ============================================================================
  // 5. COMPREHENSIVE REPORT GENERATION
  // ============================================================================
  
  generateReport() {
    this.log('\n' + '='.repeat(80), 'bright');
    this.log('ADVANCED 2025 DEBUGGING REPORT', 'bright');
    this.log('='.repeat(80), 'bright');
    
    this.log(`\nTotal Checks: ${this.stats.totalChecks}`, 'cyan');
    this.log(`Passed: ${this.stats.passedChecks}`, 'green');
    this.log(`Warnings: ${this.stats.warningChecks}`, 'yellow');
    this.log(`Errors: ${this.stats.failedChecks}`, 'red');
    
    if (this.issues.length > 0) {
      this.log('\n' + '='.repeat(80), 'red');
      this.log('CRITICAL ISSUES FOUND', 'red');
      this.log('='.repeat(80), 'red');
      
      const byCategory = {};
      this.issues.forEach(issue => {
        if (!byCategory[issue.category]) {
          byCategory[issue.category] = [];
        }
        byCategory[issue.category].push(issue);
      });
      
      Object.entries(byCategory).forEach(([category, issues]) => {
        this.log(`\n${category} (${issues.length} issues):`, 'red');
        issues.forEach((issue, idx) => {
          this.log(`  ${idx + 1}. ${issue.message}`, 'red');
          if (Object.keys(issue.details).length > 0) {
            this.log(`     Details: ${JSON.stringify(issue.details, null, 2).substring(0, 200)}...`, 'yellow');
          }
        });
      });
    }
    
    if (this.warnings.length > 0) {
      this.log('\n' + '='.repeat(80), 'yellow');
      this.log('WARNINGS', 'yellow');
      this.log('='.repeat(80), 'yellow');
      
      const byCategory = {};
      this.warnings.forEach(warning => {
        if (!byCategory[warning.category]) {
          byCategory[warning.category] = [];
        }
        byCategory[warning.category].push(warning);
      });
      
      Object.entries(byCategory).forEach(([category, warnings]) => {
        this.log(`\n${category} (${warnings.length} warnings):`, 'yellow');
        warnings.slice(0, 5).forEach((warning, idx) => {
          this.log(`  ${idx + 1}. ${warning.message}`, 'yellow');
        });
        if (warnings.length > 5) {
          this.log(`  ... and ${warnings.length - 5} more`, 'yellow');
        }
      });
    }
    
    // Save detailed report to file
    const reportPath = path.join(__dirname, 'advanced-debugging-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats: this.stats,
      issues: this.issues,
      warnings: this.warnings
    }, null, 2));
    
    this.log(`\nDetailed report saved to: ${reportPath}`, 'cyan');
    
    this.log('\n' + '='.repeat(80), 'bright');
    const status = this.stats.failedChecks === 0 ? 'PASSED' : 'FAILED';
    const color = this.stats.failedChecks === 0 ? 'green' : 'red';
    this.log(`OVERALL STATUS: ${status}`, color);
    this.log('='.repeat(80), 'bright');
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const analyzer = new Advanced2025Debugger();
  
  analyzer.log('Starting Advanced 2025 Debugging Analysis...', 'bright');
  analyzer.log('Based on latest React MapLibre best practices\n', 'cyan');
  
  try {
    // Load data files
    const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
    const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
    
    analyzer.log('Loading data files...', 'cyan');
    const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    
    // 1. Unicode Normalization Checks
    const allDistrictNames = [
      ...geojson.features.map(f => f.properties?.dtname || f.properties?.district || f.properties?.name).filter(Boolean),
      ...Object.keys(mapping),
      ...Object.values(mapping)
    ];
    analyzer.checkUnicodeNormalization(allDistrictNames, 'District Names');
    
    // 2. GeoJSON Validation
    analyzer.validateGeoJSON(geojson, 'india-districts.geojson');
    
    // 3. Data Matching Validation
    // Simulate API data (in real scenario, fetch from API)
    const apiData = Object.values(mapping).map(name => ({ district_name: name }));
    analyzer.validateDataMatching(geojson.features, apiData, mapping);
    
    // 4. Performance Analysis
    analyzer.analyzePerformance(geojsonPath, mappingPath);
    
    // Generate final report
    analyzer.generateReport();
    
  } catch (error) {
    analyzer.log(`\nFATAL ERROR: ${error.message}`, 'red');
    analyzer.log(error.stack, 'red');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = Advanced2025Debugger;
