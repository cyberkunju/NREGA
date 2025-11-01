import axios from 'axios';

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Delay helper for retry logic
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper for API calls
 */
const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await delay(RETRY_DELAY);
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

/**
 * Check if error is retryable
 */
const isRetryableError = (error) => {
  // Retry on network errors or 5xx server errors
  return (
    !error.response ||
    (error.response.status >= 500 && error.response.status < 600) ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT'
  );
};

/**
 * Error handler to format error messages
 */
const handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (data && data.error) {
      return {
        message: data.error.message || 'An error occurred',
        code: data.error.code,
        suggestions: data.error.suggestions,
        status,
      };
    }
    
    return {
      message: `Server error: ${status}`,
      status,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Unable to connect. Please check your internet connection.',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Error in request setup
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'REQUEST_ERROR',
    };
  }
};

/**
 * Fetch list of all districts
 * Implements localStorage caching with 24-hour TTL
 * @returns {Promise<Array<string>>} Array of district names
 */
export const getDistricts = async () => {
  const CACHE_KEY = 'mgnrega_districts_v3'; // Changed key to force fresh fetch
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  try {
    // Check localStorage cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { districts, timestamp } = JSON.parse(cachedData);
      const age = Date.now() - timestamp;
      
      // Validate cached data isn't empty
      if (age < CACHE_DURATION && districts && Array.isArray(districts) && districts.length > 0) {
        console.log(`✅ Using cached district list: ${districts.length} districts`);
        return { districts, fromCache: true };
      } else {
        console.log('⚠️ Cache invalid or empty, fetching fresh data');
      }
    }

    // Fetch from API if cache is stale or missing
    console.log('🔄 Fetching districts from API...');
    const response = await retryRequest(() => apiClient.get('/districts'));
    console.log('📡 API response received:', response.data);
    
    const districts = response.data.districts || [];
    console.log(`✅ Extracted ${districts.length} districts from API response`);
    
    if (districts.length === 0) {
      console.error('❌ API returned empty districts array!');
      throw new Error('No districts returned from API');
    }
    
    // Update cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        districts,
        timestamp: Date.now()
      }));
      console.log('💾 Districts cached successfully');
    } catch (storageError) {
      // localStorage might be full or disabled, continue without caching
      console.warn('⚠️ Failed to cache districts:', storageError);
    }
    
    return { districts, fromCache: false };
  } catch (error) {
    // If API fails, try to return stale cache as fallback
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { districts } = JSON.parse(cachedData);
      console.log('API failed, using stale cached district list');
      return { districts, fromCache: true, stale: true };
    }
    
    throw handleError(error);
  }
};

/**
 * Fetch performance data for ALL districts in a single request
 * This replaces 736 individual API calls with 1 bulk call
 * @returns {Promise<Object>} All districts with performance metrics
 */
export const getAllPerformance = async () => {
  try {
    console.log('🔄 Fetching all district performance data in single request...');
    const startTime = Date.now();
    
    const response = await retryRequest(() => 
      apiClient.get('/performance/all')
    );
    
    const loadTime = Date.now() - startTime;
    
    console.log('[getAllPerformance] Raw response:', response);
    console.log('[getAllPerformance] Response data keys:', Object.keys(response.data || {}));
    console.log('[getAllPerformance] Districts array:', response.data.districts);
    console.log(`✅ Loaded ${response.data.metadata?.totalDistricts || 'unknown'} districts in ${loadTime}ms`);
    console.log(`📅 Data last synced: ${response.data.metadata?.lastSync ? new Date(response.data.metadata.lastSync).toLocaleString() : 'unknown'}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch all performance data:', error);
    throw handleError(error);
  }
};

/**
 * Fetch heatmap data for ALL districts - optimized for map visualization
 * Returns latest performance metrics for all districts in a single request
 * Data is already capped (percentages ≤ 100%) by the backend
 * @returns {Promise<Array>} Array of district performance data
 */
export const getHeatmapData = async () => {
  const CACHE_KEY = 'mgnrega_heatmap_data_v6'; // UPDATED: v6 with work completion fix
  const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours as per backend cache-control

  try {
    // Clear old cache versions
    localStorage.removeItem('mgnrega_heatmap_data_v1');
    localStorage.removeItem('mgnrega_heatmap_data_v2');
    localStorage.removeItem('mgnrega_heatmap_data_v3');
    localStorage.removeItem('mgnrega_heatmap_data_v4');
    localStorage.removeItem('mgnrega_heatmap_data_v5');
    
    // Check localStorage cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const age = Date.now() - timestamp;
      
      if (age < CACHE_DURATION && data && Array.isArray(data) && data.length > 0) {
        console.log(`✅ Using cached heatmap data: ${data.length} districts`);
        return { data, fromCache: true };
      }
    }

    // Fetch from API if cache is stale or missing
    console.log('🔄 Fetching heatmap data from /api/performance/heatmap-data...');
    const startTime = Date.now();
    
    // Add cache-busting timestamp to force fresh data
    const cacheBuster = Date.now();
    const response = await retryRequest(() => 
      apiClient.get(`/performance/heatmap-data?_=${cacheBuster}`)
    );
    
    const loadTime = Date.now() - startTime;
    const data = response.data || [];
    
    console.log(`✅ Loaded ${data.length} districts in ${loadTime}ms`);
    console.log('📊 Sample district:', data[0]);
    
    if (data.length === 0) {
      console.warn('⚠️ API returned empty heatmap data array');
    }
    
    // Update cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      console.log('💾 Heatmap data cached successfully');
    } catch (storageError) {
      console.warn('⚠️ Failed to cache heatmap data:', storageError);
    }
    
    return { data, fromCache: false };
  } catch (error) {
    // Try to return stale cache as fallback
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      console.log('⚠️ API failed, using stale cached heatmap data');
      return { data, fromCache: true, stale: true };
    }
    
    console.error('❌ Failed to fetch heatmap data:', error);
    throw handleError(error);
  }
};

/**
 * Fetch performance data for a specific district
 * @param {string} districtName - Name of the district
 * @param {string} year - Optional financial year (e.g., "2024-25")
 * @param {string} month - Optional month (e.g., "October")
 * @returns {Promise<Object>} Performance data object
 */
export const getPerformance = async (districtName, year = null, month = null) => {
  try {
    const encodedName = encodeURIComponent(districtName);
    let url = `/performance/${encodedName}`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await retryRequest(() => apiClient.get(url));
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Fetch available time periods for a district
 * @param {string} districtName - Name of the district
 * @returns {Promise<Array>} Array of available periods
 */
export const getAvailablePeriods = async (districtName) => {
  try {
    const encodedName = encodeURIComponent(districtName);
    const response = await retryRequest(() => 
      apiClient.get(`/performance/${encodedName}/periods`)
    );
    return response.data.periods || [];
  } catch (error) {
    console.error('Error fetching available periods:', error);
    return [];
  }
};

/**
 * Check API health status
 * @returns {Promise<Object>} Health status object
 */
export const getHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

const apiService = {
  getDistricts,
  getPerformance,
  getAllPerformance,
  getHeatmapData,
  getAvailablePeriods,
  getHealth,
};

export default apiService;
