/**
 * Phase 1 Verification Script
 * Tests all Phase 1 enhancements to ensure they work correctly
 * 
 * Run this script after starting the backend server:
 * node backend/verify-phase1.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(testName) {
  log(`\n▶ ${testName}`, 'blue');
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

/**
 * Verify Task 1: Data Validation & Capping
 */
async function verifyTask1() {
  logSection('TASK 1: Data Validation & Capping');
  
  try {
    logTest('Testing /api/performance/:district_name with known high-percentage district');
    
    // Test with a district known to have percentage issues (e.g., South Andaman)
    const response = await axios.get(`${API_BASE_URL}/performance/South Andaman`);
    const data = response.data;
    
    // Check if payment percentage is capped at 100
    if (data.currentMonth && data.currentMonth.paymentPercentage) {
      const percentage = data.currentMonth.paymentPercentage;
      
      if (percentage <= 100 && percentage >= 0) {
        logSuccess(`Payment percentage is correctly capped: ${percentage}%`);
      } else {
        logError(`Payment percentage NOT capped correctly: ${percentage}%`);
      }
    } else {
      logWarning('No current month payment percentage data found');
    }
    
    // Check if state name is included
    if (data.state) {
      logSuccess(`State name included: ${data.state}`);
    } else {
      logError('State name missing from response');
    }
    
    // Check if previous month data is included
    if (data.previousMonth) {
      logSuccess('Previous month data is included');
      if (data.previousMonth.paymentPercentage <= 100 && data.previousMonth.paymentPercentage >= 0) {
        logSuccess(`Previous month percentage is capped: ${data.previousMonth.paymentPercentage}%`);
      } else {
        logError(`Previous month percentage NOT capped: ${data.previousMonth.paymentPercentage}%`);
      }
    } else {
      logWarning('No previous month data available');
    }
    
    // Check if trend is calculated
    if (data.trend) {
      logSuccess(`Trend calculated: ${data.trend}`);
    } else {
      logError('Trend missing from response');
    }
    
  } catch (error) {
    logError(`Failed to test Task 1: ${error.message}`);
    if (error.response) {
      logError(`Response status: ${error.response.status}`);
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

/**
 * Verify Task 2: Enhanced District Performance API
 */
async function verifyTask2() {
  logSection('TASK 2: Enhanced District Performance API');
  
  try {
    logTest('Testing /api/performance/:district_name without query parameters');
    
    const response1 = await axios.get(`${API_BASE_URL}/performance/Agra`);
    const data1 = response1.data;
    
    logSuccess(`District: ${data1.district}`);
    logSuccess(`State: ${data1.state || 'NOT PROVIDED'}`);
    logSuccess(`Current Month: ${data1.currentMonth?.month} ${data1.currentMonth?.year}`);
    logSuccess(`Payment %: ${data1.currentMonth?.paymentPercentage}%`);
    logSuccess(`Trend: ${data1.trend}`);
    
    if (data1.previousMonth) {
      logSuccess(`Previous Month Payment %: ${data1.previousMonth.paymentPercentage}%`);
    }
    
    // Test with year and month filters
    logTest('Testing /api/performance/:district_name with year/month filters');
    
    const year = data1.currentMonth?.year;
    const month = data1.currentMonth?.month;
    
    if (year && month) {
      const response2 = await axios.get(
        `${API_BASE_URL}/performance/Agra?year=${year}&month=${month}`
      );
      const data2 = response2.data;
      
      if (data2.currentMonth.year === year && data2.currentMonth.month === month) {
        logSuccess(`Year/Month filtering works correctly`);
      } else {
        logError(`Year/Month filtering not working as expected`);
      }
    } else {
      logWarning('Could not test year/month filtering - no data available');
    }
    
  } catch (error) {
    logError(`Failed to test Task 2: ${error.message}`);
    if (error.response) {
      logError(`Response status: ${error.response.status}`);
    }
  }
}

/**
 * Verify Task 3: Heatmap Data API
 */
async function verifyTask3() {
  logSection('TASK 3: Heatmap Data API');
  
  try {
    logTest('Testing /api/performance/heatmap-data');
    
    const startTime = Date.now();
    const response = await axios.get(`${API_BASE_URL}/performance/heatmap-data`);
    const queryTime = Date.now() - startTime;
    const data = response.data;
    
    logSuccess(`Response time: ${queryTime}ms`);
    logSuccess(`Total districts returned: ${data.length}`);
    
    if (data.length > 0) {
      const sampleDistrict = data[0];
      logSuccess(`Sample district: ${sampleDistrict.districtName}, ${sampleDistrict.stateName}`);
      logSuccess(`Sample data structure:`);
      console.log(JSON.stringify(sampleDistrict, null, 2));
      
      // Check if all required fields are present
      const requiredFields = [
        'districtId',
        'districtName',
        'stateName',
        'paymentPercentage',
        'averageDays',
        'totalHouseholds',
      ];
      
      const missingFields = requiredFields.filter(field => !(field in sampleDistrict));
      
      if (missingFields.length === 0) {
        logSuccess('All required fields present');
      } else {
        logError(`Missing fields: ${missingFields.join(', ')}`);
      }
      
      // Verify percentage capping
      const invalidPercentages = data.filter(
        d => d.paymentPercentage > 100 || d.paymentPercentage < 0
      );
      
      if (invalidPercentages.length === 0) {
        logSuccess('All payment percentages are correctly capped (0-100)');
      } else {
        logError(`Found ${invalidPercentages.length} districts with invalid percentages`);
        invalidPercentages.slice(0, 5).forEach(d => {
          logError(`  ${d.districtName}: ${d.paymentPercentage}%`);
        });
      }
      
      // Check for state name coverage
      const districtsWithState = data.filter(d => d.stateName && d.stateName !== 'India');
      const coverage = (districtsWithState.length / data.length) * 100;
      logSuccess(`State name coverage: ${coverage.toFixed(1)}% (${districtsWithState.length}/${data.length})`);
      
    } else {
      logError('No heatmap data returned');
    }
    
  } catch (error) {
    logError(`Failed to test Task 3: ${error.message}`);
    if (error.response) {
      logError(`Response status: ${error.response.status}`);
    }
  }
}

/**
 * Verify /api/performance/all endpoint still works
 */
async function verifyBulkEndpoint() {
  logSection('BONUS: Verify /api/performance/all endpoint');
  
  try {
    logTest('Testing /api/performance/all');
    
    const startTime = Date.now();
    const response = await axios.get(`${API_BASE_URL}/performance/all`);
    const queryTime = Date.now() - startTime;
    const data = response.data;
    
    logSuccess(`Response time: ${queryTime}ms`);
    logSuccess(`Total districts: ${data.metadata?.totalDistricts || data.districts?.length}`);
    
    if (data.districts && data.districts.length > 0) {
      const sampleDistrict = data.districts[0];
      logSuccess(`Sample district: ${sampleDistrict.district}, ${sampleDistrict.state}`);
      
      // Verify percentage capping
      const invalidPercentages = data.districts.filter(
        d => d.paymentPercentage > 100 || d.paymentPercentage < 0
      );
      
      if (invalidPercentages.length === 0) {
        logSuccess('All payment percentages are correctly capped in bulk endpoint');
      } else {
        logError(`Found ${invalidPercentages.length} districts with invalid percentages in bulk endpoint`);
      }
    }
    
  } catch (error) {
    logError(`Failed to test bulk endpoint: ${error.message}`);
  }
}

/**
 * Run all verification tests
 */
async function runAllTests() {
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║          PHASE 1 VERIFICATION TEST SUITE                ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nTesting API at: ${API_BASE_URL}\n`, 'yellow');
  
  await verifyTask1();
  await verifyTask2();
  await verifyTask3();
  await verifyBulkEndpoint();
  
  logSection('VERIFICATION COMPLETE');
  log('\nPlease review the results above to ensure all tests passed.', 'yellow');
  log('If any tests failed, check the backend logs for more details.\n', 'yellow');
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`\nFatal error running tests: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  verifyTask1,
  verifyTask2,
  verifyTask3,
  verifyBulkEndpoint,
  runAllTests,
};
