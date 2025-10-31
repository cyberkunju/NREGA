/**
 * Data Fetcher Module
 * Handles API calls to data.gov.in with authentication, timeout, and error handling
 */

const axios = require('axios');

/**
 * Fetch MGNREGA data from data.gov.in API
 * @param {Object} options - Fetch options
 * @param {string} options.apiEndpoint - API endpoint URL
 * @param {string} options.apiKey - API authentication key
 * @param {string} options.stateFilter - State name to filter data
 * @param {number} options.timeout - Request timeout in milliseconds (default: 30000)
 * @returns {Promise<Object>} API response data
 * @throws {Error} If API call fails
 */
async function fetchMGNREGAData(options) {
  const {
    apiEndpoint,
    apiKey,
    stateFilter,
    timeout = 30000,
  } = options;

  // Validate required parameters
  if (!apiEndpoint) {
    throw new Error('API endpoint is required');
  }
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
    const filterMsg = stateFilter ? `for state: ${stateFilter}` : 'for all states';
    console.log(`Fetching MGNREGA data ${filterMsg}`);
    console.log(`API Endpoint: ${apiEndpoint}`);

    // Build request params
    const params = {
      'api-key': apiKey,
      format: 'json',
      limit: 10000, // Fetch up to 10000 records
    };
    
    // Add state filter only if provided
    if (stateFilter && stateFilter.trim() !== '') {
      params['filters[state_name]'] = stateFilter;
    }

    // Make API request with authentication and filters
    const response = await axios.get(apiEndpoint, {
      params: params,
      timeout: timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MGNREGA-Report-Card-ETL/1.0',
      },
    });

    // Check response status
    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }

    // Validate response structure
    if (!response.data) {
      throw new Error('API response is empty');
    }

    // Extract records from response
    const records = response.data.records || [];
    
    console.log(`Successfully fetched ${records.length} records from API`);
    
    // Debug: Print sample record to see available fields
    if (records.length > 0) {
      console.log('Sample API record fields:', Object.keys(records[0]).join(', '));
      console.log('Sample API record:', JSON.stringify(records[0], null, 2));
    }

    return {
      success: true,
      recordCount: records.length,
      records: records,
      fetchedAt: new Date().toISOString(),
    };

  } catch (error) {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      throw new Error(`API request timeout after ${timeout}ms`);
    } else if (error.response) {
      // API responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(`API error (${status}): ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(`No response from API: ${error.message}`);
    } else {
      // Other errors
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}

/**
 * Fetch data with retry logic
 * @param {Object} options - Fetch options (same as fetchMGNREGAData)
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay between retries in ms (default: 1000)
 * @returns {Promise<Object>} API response data
 */
async function fetchWithRetry(options, maxRetries = 3, initialDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt}/${maxRetries}`);
      const result = await fetchMGNREGAData(options);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Fetch attempt ${attempt} failed:`, error.message);

      // Don't retry on authentication errors (401, 403)
      if (error.message.includes('401') || error.message.includes('403')) {
        console.error('Authentication error - not retrying');
        throw error;
      }

      // Don't retry on client errors (400, 404)
      if (error.message.includes('400') || error.message.includes('404')) {
        console.error('Client error - not retrying');
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} fetch attempts failed`);
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying after ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test API connectivity
 * @param {Object} options - Fetch options
 * @returns {Promise<boolean>} True if API is accessible
 */
async function testAPIConnection(options) {
  try {
    const result = await fetchMGNREGAData({
      ...options,
      timeout: 10000, // Shorter timeout for test
    });
    console.log('API connection test successful');
    return true;
  } catch (error) {
    console.error('API connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  fetchMGNREGAData,
  fetchWithRetry,
  testAPIConnection,
};
