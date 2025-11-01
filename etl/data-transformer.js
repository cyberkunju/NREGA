/**
 * Data Transformer Module
 * Extracts, validates, and cleans data from API responses
 */

const { getStateForDistrict } = require('./district-state-mapping');

/**
 * Transform raw API records into database-ready format
 * @param {Array} records - Raw records from API
 * @returns {Object} Transformed records and validation results
 */
function transformRecords(records) {
  if (!Array.isArray(records)) {
    throw new Error('Records must be an array');
  }

  const transformed = [];
  const errors = [];

  console.log(`Transforming ${records.length} records...`);

  for (let i = 0; i < records.length; i++) {
    try {
      const record = records[i];
      const transformedRecord = transformSingleRecord(record);
      
      if (transformedRecord) {
        transformed.push(transformedRecord);
      }
    } catch (error) {
      errors.push({
        index: i,
        record: records[i],
        error: error.message,
      });
      console.warn(`Skipping record ${i}: ${error.message}`);
    }
  }

  console.log(`Successfully transformed ${transformed.length} records`);
  if (errors.length > 0) {
    console.warn(`Failed to transform ${errors.length} records`);
  }

  return {
    success: true,
    transformedCount: transformed.length,
    errorCount: errors.length,
    records: transformed,
    errors: errors,
  };
}

/**
 * Transform a single record
 * @param {Object} record - Raw record from API
 * @returns {Object|null} Transformed record or null if invalid
 */
function transformSingleRecord(record) {
  // Extract required fields
  const districtName = extractDistrictName(record);
  const month = extractMonth(record);
  const finYear = extractFinYear(record);
  const totalHouseholds = extractTotalHouseholds(record);
  const avgDays = extractAvgDays(record);
  const paymentPercentage = extractPaymentPercentage(record);

  // Validate all required fields are present
  if (!districtName || !month || !finYear) {
    throw new Error('Missing required fields: district_name, month, or fin_year');
  }

  // Validate numeric fields
  if (totalHouseholds === null || avgDays === null || paymentPercentage === null) {
    throw new Error('Missing or invalid numeric fields');
  }

  // Get state name from API (with GeoJSON mapping as fallback)
  const stateName = extractStateName(record);

  // Extract social inclusion metrics
  const womenPersondays = extractWomenPersondays(record);
  const persondaysOfCentralLiability = extractPersondaysOfCentralLiability(record);
  const scPersondays = extractSCPersondays(record);
  const stPersondays = extractSTPersondays(record);

  // Extract advanced metrics
  const households100Days = extractHouseholds100Days(record);
  const averageWageRate = extractAverageWageRate(record);
  const totalWorksCompleted = extractTotalWorksCompleted(record);
  const totalWorksOngoing = extractTotalWorksOngoing(record);
  const agricultureWorksPercent = extractAgricultureWorksPercent(record);
  const nrmExpenditurePercent = extractNRMExpenditurePercent(record);
  const categoryBWorksPercent = extractCategoryBWorksPercent(record);

  return {
    district_name: districtName,
    state_name: stateName,
    month: month,
    fin_year: finYear,
    total_households_worked: totalHouseholds,
    avg_days_employment_per_hh: avgDays,
    payment_percentage_15_days: paymentPercentage,
    women_persondays: womenPersondays,
    persondays_of_central_liability: persondaysOfCentralLiability,
    sc_persondays: scPersondays,
    st_persondays: stPersondays,
    households_100_days: households100Days,
    average_wage_rate: averageWageRate,
    total_works_completed: totalWorksCompleted,
    total_works_ongoing: totalWorksOngoing,
    agriculture_works_percent: agricultureWorksPercent,
    nrm_expenditure_percent: nrmExpenditurePercent,
    category_b_works_percent: categoryBWorksPercent,
  };
}

/**
 * Extract and clean district name
 * @param {Object} record - Raw record
 * @returns {string|null} Cleaned district name
 */
function extractDistrictName(record) {
  // API field: district_name
  const value = record.district_name || record.districtName || record.district;
  
  if (!value) {
    return null;
  }

  // Clean and normalize
  return cleanString(value);
}

/**
 * Extract and clean month
 * @param {Object} record - Raw record
 * @returns {string|null} Cleaned month
 */
function extractMonth(record) {
  // API field: month
  const value = record.month || record.Month;
  
  if (!value) {
    return null;
  }

  return cleanString(value);
}

/**
 * Extract and clean financial year
 * @param {Object} record - Raw record
 * @returns {string|null} Cleaned financial year
 */
function extractFinYear(record) {
  // API field: fin_year
  const value = record.fin_year || record.finYear || record.financial_year;
  
  if (!value) {
    return null;
  }

  return cleanString(value);
}

/**
 * Extract and clean state name from API
 * @param {Object} record - Raw record
 * @returns {string} Cleaned state name
 */
function extractStateName(record) {
  // Priority 1: Use API's state_name field (authoritative source)
  const apiState = record.state_name || record.stateName || record.state;
  
  if (apiState && apiState.trim() !== '') {
    return cleanString(apiState);
  }
  
  // Priority 2: Fallback to GeoJSON mapping if API doesn't provide state
  const { getStateForDistrict } = require('./district-state-mapping');
  return getStateForDistrict(record.district_name || '');
}

/**
 * Extract and parse total households
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractTotalHouseholds(record) {
  // API field: Total_Households_Worked
  const value = record.Total_Households_Worked || 
                record.total_households_worked || 
                record.totalHouseholdsWorked || 
                record.total_households;
  
  return parseNumber(value);
}

/**
 * Extract and parse average days of employment
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractAvgDays(record) {
  // API field: Average_days_of_employment_provided_per_Household
  const value = record.Average_days_of_employment_provided_per_Household ||
                record.avg_days_employment_per_hh || 
                record.avgDaysEmploymentPerHh || 
                record.average_days;
  
  return parseNumber(value);
}

/**
 * Extract and parse payment percentage
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractPaymentPercentage(record) {
  // API field: percentage_payments_gererated_within_15_days
  const value = record.percentage_payments_gererated_within_15_days ||
                record.payment_percentage_15_days || 
                record.paymentPercentage15Days || 
                record.payment_percentage;
  
  return parseNumber(value);
}

/**
 * Extract and parse women persondays
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractWomenPersondays(record) {
  // API field: Women_Persondays (note the capital W and camelCase)
  const value = record.Women_Persondays || 
                record.women_persondays || 
                record.womenPersondays;
  
  return parseNumber(value);
}

/**
 * Extract and parse total persondays of central liability
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractPersondaysOfCentralLiability(record) {
  // API field: Persondays_of_Central_Liability_so_far
  const value = record.Persondays_of_Central_Liability_so_far || 
                record.persondays_of_central_liability_so_far || 
                record.persondaysOfCentralLiability;
  
  return parseNumber(value);
}

/**
 * Extract and parse SC persondays
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractSCPersondays(record) {
  // API field: SC_persondays
  const value = record.SC_persondays || 
                record.sc_persondays || 
                record.scPersondays;
  
  return parseNumber(value);
}

/**
 * Extract and parse ST persondays
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractSTPersondays(record) {
  // API field: ST_persondays
  const value = record.ST_persondays || 
                record.st_persondays || 
                record.stPersondays;
  
  return parseNumber(value);
}

/**
 * Clean and trim string values
 * @param {string} value - String to clean
 * @returns {string} Cleaned string
 */
function cleanString(value) {
  if (typeof value !== 'string') {
    value = String(value);
  }

  // Trim whitespace
  value = value.trim();

  // Remove extra spaces
  value = value.replace(/\s+/g, ' ');

  // Capitalize properly (title case for district names)
  value = value.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return value;
}

/**
 * Parse and validate numeric values
 * @param {*} value - Value to parse
 * @returns {number|null} Parsed number or null if invalid
 */
function parseNumber(value) {
  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // If already a number, validate it
  if (typeof value === 'number') {
    return isFinite(value) && value >= 0 ? value : null;
  }

  // If string, try to parse
  if (typeof value === 'string') {
    // Remove commas and whitespace
    const cleaned = value.replace(/,/g, '').trim();
    const parsed = parseFloat(cleaned);
    
    // Validate parsed number
    if (isNaN(parsed) || !isFinite(parsed) || parsed < 0) {
      return null;
    }
    
    return parsed;
  }

  return null;
}

/**
 * Validate a transformed record
 * @param {Object} record - Transformed record
 * @returns {Object} Validation result
 */
function validateRecord(record) {
  const errors = [];

  // Check required fields
  if (!record.district_name) {
    errors.push('district_name is required');
  }
  if (!record.month) {
    errors.push('month is required');
  }
  if (!record.fin_year) {
    errors.push('fin_year is required');
  }

  // Validate numeric fields
  if (typeof record.total_households_worked !== 'number' || record.total_households_worked < 0) {
    errors.push('total_households_worked must be a non-negative number');
  }
  if (typeof record.avg_days_employment_per_hh !== 'number' || record.avg_days_employment_per_hh < 0) {
    errors.push('avg_days_employment_per_hh must be a non-negative number');
  }
  if (typeof record.payment_percentage_15_days !== 'number' || 
      record.payment_percentage_15_days < 0 || 
      record.payment_percentage_15_days > 100) {
    errors.push('payment_percentage_15_days must be between 0 and 100');
  }

  // Validate string lengths
  if (record.district_name.length > 100) {
    errors.push('district_name exceeds maximum length of 100 characters');
  }
  if (record.month.length > 20) {
    errors.push('month exceeds maximum length of 20 characters');
  }
  if (record.fin_year.length > 10) {
    errors.push('fin_year exceeds maximum length of 10 characters');
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Get summary statistics of transformed data
 * @param {Array} records - Transformed records
 * @returns {Object} Summary statistics
 */
function getSummaryStats(records) {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      uniqueDistricts: 0,
      dateRange: null,
    };
  }

  const districts = new Set(records.map(r => r.district_name));
  const months = records.map(r => `${r.month} ${r.fin_year}`);

  return {
    totalRecords: records.length,
    uniqueDistricts: districts.size,
    districts: Array.from(districts).sort(),
    dateRange: {
      earliest: months[0],
      latest: months[months.length - 1],
    },
  };
}

/**
 * Extract and parse households that completed 100 days
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractHouseholds100Days(record) {
  const value = record.Total_No_of_HHs_completed_100_Days_of_Wage_Employment ||
                record.households_100_days ||
                record.hhs_100_days;
  return parseNumber(value);
}

/**
 * Extract and parse average wage rate
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractAverageWageRate(record) {
  const value = record.Average_Wage_rate_per_day_per_person ||
                record.average_wage_rate ||
                record.avgWageRate;
  return parseNumber(value);
}

/**
 * Extract and parse total works completed
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractTotalWorksCompleted(record) {
  const value = record.Number_of_Completed_Works ||
                record.Total_No_of_Works_Completed ||
                record.total_works_completed ||
                record.worksCompleted;
  return parseNumber(value);
}

/**
 * Extract and parse total works ongoing
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractTotalWorksOngoing(record) {
  const value = record.Number_of_Ongoing_Works ||
                record.Total_No_of_Works_Ongoing ||
                record.total_works_ongoing ||
                record.worksOngoing;
  return parseNumber(value);
}

/**
 * Extract and parse agriculture works percentage
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractAgricultureWorksPercent(record) {
  const value = record.percent_of_Expenditure_on_Agriculture_Allied_Works ||
                record.agriculture_works_percent ||
                record.agriculturePercent;
  return parseNumber(value);
}

/**
 * Extract and parse NRM expenditure percentage
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractNRMExpenditurePercent(record) {
  const value = record.percent_of_NRM_Expenditure ||
                record.nrm_expenditure_percent ||
                record.nrmPercent;
  return parseNumber(value);
}

/**
 * Extract and parse Category B works percentage
 * @param {Object} record - Raw record
 * @returns {number|null} Parsed number or null if invalid
 */
function extractCategoryBWorksPercent(record) {
  const value = record.percent_of_Category_B_Works ||
                record.category_b_works_percent ||
                record.categoryBPercent;
  return parseNumber(value);
}

module.exports = {
  transformRecords,
  transformSingleRecord,
  validateRecord,
  getSummaryStats,
  // Export utility functions for testing
  cleanString,
  parseNumber,
};
