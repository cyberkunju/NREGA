/**
 * Comprehensive Bug Detection Script
 * Finds ALL hidden issues based on 2024/2025 best practices
 */

const fs = require('fs');
const path = require('path');

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class BugDetector {
  constructor() {
    this.criticalBugs = [];
    this.warnings = [];
    this.suggestions = [];
  }

  addCritical(title, description, fix) {
    this.criticalBugs.push({ title, description, fix });
  }

  addWarning(title, description, fix) {
    this.warnings.push({ title, description, fix });
  }

  addSuggestion(title, description) {
    this.suggestions.push({ title, description });
  }

  report() {
    log('\n' + '='.repeat(100), 'bright');
    log('COMPREHENSIVE BUG DETECTION REPORT', 'bright');
    log('Based on 2024/2025 React MapLibre Best Practices', 'cyan');
    log('='.repeat(100), 'bright');

    if (this.criticalBugs.length > 0) {
      log('\n🔴 CRITICAL BUGS FOUND:', 'red');
      log('='.repeat(100), 'red');
      this.criticalBugs.forEach((bug, idx) => {
        log(`\n${idx + 1}. ${bug.title}`, 'red');
        log(`   Problem: ${bug.description}`, 'yellow');
        log(`   Fix: ${bug.fix}`, 'green');
      });
    }

    if (this.warnings.length > 0) {
      log('\n⚠️  WARNINGS:', 'yellow');
      log('='.repeat(100), 'yellow');
      this.warnings.forEach((warning, idx) => {
        log(`\n${idx + 1}. ${warning.title}`, 'yellow');
        log(`   Issue: ${warning.description}`, 'yellow');
        log(`   Recommendation: ${warning.fix}`, 'cyan');
      });
    }

    if (this.suggestions.length > 0) {
      log('\n💡 OPTIMIZATION SUGGESTIONS:', 'cyan');
      log('='.repeat(100), 'cyan');
      this.suggestions.forEach((suggestion, idx) => {
        log(`\n${idx + 1}. ${suggestion.title}`, 'cyan');
        log(`   ${suggestion.description}`, 'blue');
      });
    }

    log('\n' + '='.repeat(100), 'bright');
    log(`Total Issues: ${this.criticalBugs.length + this.warnings.length + this.suggestions.length}`, 'bright');
    log(`Critical: ${this.criticalBugs.length} | Warnings: ${this.warnings.length} | Suggestions: ${this.suggestions.length}`, 'bright');
    log('='.repeat(100), 'bright');
  }
}

async function main() {
  const detector = new BugDetector();

  log('\n🔍 Starting comprehensive bug detection...', 'cyan');

  // 1. Check Unicode Normalization
  log('\n1. Checking Unicode Normalization...', 'yellow');
  const districtMappingPath = path.join(__dirname, '../frontend/src/utils/districtNameMapping.js');
  const districtMappingCode = fs.readFileSync(districtMappingPath, 'utf8');

  if (!districtMappingCode.includes('.normalize(')) {
    detector.addCritical(
      'Missing Unicode Normalization',
      'The normalizeDistrictName function does not use .normalize("NFC"). This causes silent failures when comparing strings with different Unicode representations (e.g., "ñ" as single character vs "n" + combining tilde).',
      'Add .normalize("NFC") after .toLowerCase() in the normalizeDistrictName function'
    );
  }

  // 2. Check & Symbol Handling
  log('2. Checking & Symbol Handling...', 'yellow');
  if (districtMappingCode.includes('.replace(/\\s*&\\s*/g, \' and \')')) {
    log('   ✓ & symbol handling found', 'green');
  } else {
    detector.addCritical(
      'Missing & Symbol Conversion',
      'Districts with & symbols (e.g., "Andaman & Nicobar", "Lahul & Spiti") will not match correctly.',
      'Add .replace(/\\s*&\\s*/g, \' and \') to convert & to "and"'
    );
  }

  // 3. Check for Multiple Spaces
  log('3. Checking Multiple Spaces Handling...', 'yellow');
  const geojsonPath = path.join(__dirname, '../frontend/public/india-districts.geojson');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  
  const multipleSpaceDistricts = geojson.features
    .filter(f => f.properties?.District && /\s{2,}/.test(f.properties.District))
    .map(f => f.properties.District);

  if (multipleSpaceDistricts.length > 0) {
    detector.addWarning(
      'Districts with Multiple Spaces',
      `Found ${multipleSpaceDistricts.length} districts with multiple consecutive spaces: ${multipleSpaceDistricts.slice(0, 3).join(', ')}`,
      'The normalization function handles this, but consider cleaning the GeoJSON source data'
    );
  }

  // 4. Check for Leading/Trailing Whitespace
  log('4. Checking Leading/Trailing Whitespace...', 'yellow');
  const whitespaceDistricts = geojson.features
    .filter(f => f.properties?.District && /^\s|\s$/.test(f.properties.District))
    .map(f => f.properties.District);

  if (whitespaceDistricts.length > 0) {
    detector.addWarning(
      'Districts with Leading/Trailing Whitespace',
      `Found ${whitespaceDistricts.length} districts with whitespace issues`,
      'Clean the GeoJSON source data to remove leading/trailing spaces'
    );
  }

  // 5. Check Coordinate Precision
  log('5. Checking Coordinate Precision...', 'yellow');
  let highPrecisionCount = 0;
  let totalCoords = 0;

  geojson.features.forEach(feature => {
    if (feature.geometry && feature.geometry.coordinates) {
      const checkCoords = (coords) => {
        if (Array.isArray(coords[0])) {
          coords.forEach(c => checkCoords(c));
        } else {
          totalCoords++;
          const [lon, lat] = coords;
          const lonDecimals = (lon.toString().split('.')[1] || '').length;
          const latDecimals = (lat.toString().split('.')[1] || '').length;
          if (lonDecimals > 6 || latDecimals > 6) {
            highPrecisionCount++;
          }
        }
      };
      checkCoords(feature.geometry.coordinates);
    }
  });

  if (highPrecisionCount > totalCoords * 0.5) {
    detector.addSuggestion(
      'Reduce Coordinate Precision',
      `${((highPrecisionCount / totalCoords) * 100).toFixed(1)}% of coordinates have >6 decimal places. Reducing to 6 decimals can reduce file size by ~50% without losing practical accuracy (10cm precision).`
    );
  }

  // 6. Check File Size
  log('6. Checking File Sizes...', 'yellow');
  const geojsonStats = fs.statSync(geojsonPath);
  const geojsonSizeMB = (geojsonStats.size / 1024 / 1024).toFixed(2);

  if (geojsonStats.size > 5 * 1024 * 1024) {
    detector.addSuggestion(
      'Large GeoJSON File',
      `GeoJSON is ${geojsonSizeMB} MB. Consider: 1) Reducing coordinate precision, 2) Removing unused properties, 3) Using vector tiles for production.`
    );
  }

  // 7. Check for Disputed Districts
  log('7. Checking for Disputed Districts...', 'yellow');
  const disputedDistricts = geojson.features
    .filter(f => f.properties?.District && f.properties.District.includes('DISPUTED'))
    .map(f => f.properties.District);

  if (disputedDistricts.length > 0) {
    detector.addWarning(
      'Disputed Districts Found',
      `Found ${disputedDistricts.length} disputed districts: ${disputedDistricts.join(', ')}`,
      'These districts may not have API data. Consider handling them separately or showing a special message.'
    );
  }

  // 8. Check Mapping Coverage
  log('8. Checking Mapping Coverage...', 'yellow');
  const mappingPath = path.join(__dirname, '../frontend/src/data/perfect-district-mapping-v2.json');
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  
  const geojsonDistricts = geojson.features
    .map(f => f.properties?.District)
    .filter(Boolean);
  const uniqueGeoDistricts = [...new Set(geojsonDistricts)];

  const mappingKeys = Object.keys(mapping.mappings || mapping);
  const coveragePercent = ((mappingKeys.length / uniqueGeoDistricts.length) * 100).toFixed(2);

  if (coveragePercent < 95) {
    detector.addWarning(
      'Low Mapping Coverage',
      `Only ${coveragePercent}% of GeoJSON districts are in the mapping file (${mappingKeys.length}/${uniqueGeoDistricts.length})`,
      'Run the mapping generation scripts to improve coverage'
    );
  } else {
    log(`   ✓ Mapping coverage: ${coveragePercent}%`, 'green');
  }

  // 9. Check for Case Sensitivity Issues
  log('9. Checking Case Sensitivity...', 'yellow');
  const lowerMap = new Map();
  uniqueGeoDistricts.forEach(name => {
    const lower = name.toLowerCase();
    if (!lowerMap.has(lower)) {
      lowerMap.set(lower, []);
    }
    lowerMap.get(lower).push(name);
  });

  const caseIssues = [];
  lowerMap.forEach((variants, lower) => {
    if (variants.length > 1) {
      caseIssues.push(variants);
    }
  });

  if (caseIssues.length > 0) {
    detector.addWarning(
      'Case Sensitivity Issues',
      `Found ${caseIssues.length} districts with case variations: ${caseIssues.slice(0, 2).map(v => v.join(' vs ')).join(', ')}`,
      'Ensure normalization function uses .toLowerCase() consistently'
    );
  }

  // 10. Check for Special Characters
  log('10. Checking Special Characters...', 'yellow');
  const specialCharPatterns = [
    { regex: /[''`]/, name: 'various apostrophes' },
    { regex: /[–—]/, name: 'various dashes' },
    { regex: /[^\x00-\x7F]/, name: 'non-ASCII characters' }
  ];

  const specialCharIssues = [];
  uniqueGeoDistricts.forEach(name => {
    specialCharPatterns.forEach(({ regex, name: patternName }) => {
      if (regex.test(name)) {
        specialCharIssues.push({ district: name, issue: patternName });
      }
    });
  });

  if (specialCharIssues.length > 0) {
    detector.addWarning(
      'Special Characters in District Names',
      `Found ${specialCharIssues.length} districts with special characters`,
      'Ensure normalization handles these characters consistently'
    );
  }

  // 11. Check MapView.jsx for Property Access
  log('11. Checking MapView.jsx Property Access...', 'yellow');
  const mapViewPath = path.join(__dirname, '../frontend/src/components/IndiaDistrictMap/MapView.jsx');
  const mapViewCode = fs.readFileSync(mapViewPath, 'utf8');

  if (mapViewCode.includes('props.District') || mapViewCode.includes('properties.District')) {
    log('   ✓ Uses "District" property', 'green');
  } else if (mapViewCode.includes('props.dtname') || mapViewCode.includes('properties.dtname')) {
    detector.addCritical(
      'Property Name Mismatch',
      'MapView.jsx looks for "dtname" property but GeoJSON uses "District" property',
      'Update MapView.jsx to use "District" or add "dtname" property to GeoJSON'
    );
  }

  // 12. Check for Homoglyphs
  log('12. Checking for Homoglyphs...', 'yellow');
  const homoglyphPatterns = [
    { pattern: /[АВЕКМНОРСТХаеорсух]/g, script: 'Cyrillic' },
    { pattern: /[ΑΒΕΖΗΙΚΜΝΟΡΤΥΧαβεζηικμνοπρστυχ]/g, script: 'Greek' }
  ];

  const homoglyphIssues = [];
  uniqueGeoDistricts.forEach(name => {
    homoglyphPatterns.forEach(({ pattern, script }) => {
      if (pattern.test(name)) {
        homoglyphIssues.push({ district: name, script });
      }
    });
  });

  if (homoglyphIssues.length > 0) {
    detector.addCritical(
      'Homoglyph Characters Detected',
      `Found ${homoglyphIssues.length} districts with characters from ${homoglyphIssues[0].script} script that look like Latin`,
      'These can cause silent matching failures. Validate and clean the source data.'
    );
  }

  // 13. Check for Zero-Width Characters
  log('13. Checking for Zero-Width Characters...', 'yellow');
  const zeroWidthChars = /[\u200B-\u200D\uFEFF]/g;
  const zeroWidthIssues = uniqueGeoDistricts.filter(name => zeroWidthChars.test(name));

  if (zeroWidthIssues.length > 0) {
    detector.addCritical(
      'Zero-Width Characters Found',
      `Found ${zeroWidthIssues.length} districts with invisible zero-width characters`,
      'Clean the source data to remove these invisible characters'
    );
  }

  // 14. Check Database Connection
  log('14. Checking Database Configuration...', 'yellow');
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  if (fs.existsSync(backendEnvPath)) {
    const envContent = fs.readFileSync(backendEnvPath, 'utf8');
    if (!envContent.includes('DB_HOST') || !envContent.includes('DB_NAME')) {
      detector.addWarning(
        'Incomplete Database Configuration',
        'Backend .env file is missing database configuration',
        'Ensure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD are set'
      );
    }
  } else {
    detector.addWarning(
      'Missing Backend .env File',
      'Backend .env file not found',
      'Create backend/.env with database configuration'
    );
  }

  // 15. Check for Duplicate Districts
  log('15. Checking for Duplicate Districts...', 'yellow');
  const districtCounts = {};
  geojsonDistricts.forEach(name => {
    districtCounts[name] = (districtCounts[name] || 0) + 1;
  });

  const duplicates = Object.entries(districtCounts)
    .filter(([name, count]) => count > 1)
    .map(([name, count]) => `${name} (${count}x)`);

  if (duplicates.length > 0) {
    detector.addWarning(
      'Duplicate Districts in GeoJSON',
      `Found ${duplicates.length} duplicate districts: ${duplicates.slice(0, 5).join(', ')}`,
      'This may cause rendering issues. Verify if these are intentional (e.g., multi-part geometries) or errors.'
    );
  }

  // Generate report
  detector.report();

  // Save detailed report
  const reportPath = path.join(__dirname, 'comprehensive-bug-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    criticalBugs: detector.criticalBugs,
    warnings: detector.warnings,
    suggestions: detector.suggestions
  }, null, 2));

  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
}

main().catch(console.error);
