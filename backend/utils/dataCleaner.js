/**
 * Data Cleaner Utility Module
 * Implements data validation and capping logic for percentage fields
 * As per Phase 1, Task 1: Implement Data Validation & Capping
 */

/**
 * Cap percentage fields to ensure values are between 0 and 100
 * This prevents frontend visualization issues caused by bad source data
 * 
 * @param {Object} record - Database record with potential percentage fields
 * @returns {Object} Record with capped percentage values
 */
function capPercentageFields(record) {
  if (!record) return record; // Handle null/undefined input

  const cappedRecord = { ...record }; // Create a shallow copy to avoid mutations

  // List of all percentage fields that need capping
  // These correspond to database column names
  const fieldsToCap = [
    'payment_percentage_15_days',
    'percentage_payments_gererated_within_15_days', // Original API field name
    'percent_of_category_b_works',
    'percent_of_expenditure_on_agriculture_allied_works',
    'percent_of_nrm_expenditure',
    'women_participation_percent', // Calculated field
    // Add any other percentage fields here as they are discovered
  ];

  fieldsToCap.forEach(field => {
    if (cappedRecord[field] !== null && cappedRecord[field] !== undefined) {
      let numericValue = cappedRecord[field];
      
      // Convert string to number if needed
      if (typeof numericValue === 'string') {
        numericValue = parseFloat(numericValue);
      }
      
      if (typeof numericValue === 'number' && !isNaN(numericValue)) {
        // Cap between 0 and 100
        const originalValue = numericValue;
        cappedRecord[field] = Math.max(0, Math.min(numericValue, 100));
        
        // Log significant capping events for auditing
        if (originalValue > 100) {
          console.warn(`[DataCleaner] Capped ${field} from ${originalValue.toFixed(2)}% to 100%`);
        } else if (originalValue < 0) {
          console.warn(`[DataCleaner] Capped ${field} from ${originalValue.toFixed(2)}% to 0%`);
        }
      } else {
        // Handle invalid values
        console.warn(`[DataCleaner] Invalid value in ${field}:`, cappedRecord[field]);
        cappedRecord[field] = null; // Set to null if not a valid number
      }
    }
  });

  return cappedRecord;
}

/**
 * Calculate women's participation percentage from raw data
 * Formula: (Women_Persondays / Total_Persondays) * 100
 * 
 * @param {Object} record - Database record
 * @returns {number|null} Women participation percentage (0-100) or null
 */
function calculateWomenParticipation(record) {
  if (!record) return null;

  const womenPersondays = parseFloat(record.women_persondays || 0);
  const totalPersondays = parseFloat(record.persondays_of_central_liability || record.persondays_of_central_liability_so_far || record.total_persondays || 0);

  // Avoid division by zero
  if (totalPersondays === 0) {
    return null;
  }

  // Calculate percentage
  const percentage = (womenPersondays / totalPersondays) * 100;

  // Cap the result between 0 and 100
  return Math.max(0, Math.min(percentage, 100));
}

/**
 * Clean and validate multiple records in bulk
 * 
 * @param {Array} records - Array of database records
 * @returns {Array} Array of cleaned and capped records
 */
function cleanRecords(records) {
  if (!Array.isArray(records)) {
    console.error('[DataCleaner] cleanRecords expects an array');
    return [];
  }

  return records.map(record => {
    const cleaned = capPercentageFields(record);
    
    // Add calculated fields if base data exists
    if (record.women_persondays && (record.persondays_of_central_liability || record.persondays_of_central_liability_so_far)) {
      cleaned.women_participation_percent = calculateWomenParticipation(record);
    }
    
    return cleaned;
  });
}

/**
 * Validate that a percentage value is within acceptable bounds
 * 
 * @param {number} value - Percentage value to validate
 * @param {string} fieldName - Name of the field (for logging)
 * @returns {boolean} True if valid, false otherwise
 */
function isValidPercentage(value, fieldName = 'field') {
  if (value === null || value === undefined) {
    return true; // Null values are acceptable
  }

  if (typeof value !== 'number') {
    console.warn(`[DataCleaner] ${fieldName} is not a number:`, value);
    return false;
  }

  if (value < 0 || value > 100) {
    console.warn(`[DataCleaner] ${fieldName} out of range (${value})`);
    return false;
  }

  return true;
}

module.exports = {
  capPercentageFields,
  calculateWomenParticipation,
  cleanRecords,
  isValidPercentage,
};
