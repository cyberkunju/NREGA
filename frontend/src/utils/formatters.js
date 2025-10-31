/**
 * Format a number with comma separators for readability
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 * @example formatNumber(17219) => "17,219"
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString('en-IN');
};

/**
 * Format a date string in human-readable format
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} Human-readable date string
 * @example formatDate("2024-10-23T02:15:00Z") => "October 23, 2024"
 */
export const formatDate = (dateString) => {
  if (!dateString) {
    return 'Unknown';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Calculate color based on percentage value
 * Green for good performance (>90%), Yellow for moderate (70-90%), Red for poor (<70%)
 * @param {number} percentage - The percentage value
 * @returns {string} Color code
 */
export const getColorForPercentage = (percentage) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return '#9E9E9E'; // Neutral grey for unknown values
  }

  if (percentage >= 95) {
    return '#26a69a'; // Accent teal for excellent performance
  }

  if (percentage >= 85) {
    return '#66bb6a'; // Muted green for good performance
  }

  if (percentage >= 75) {
    return '#9e9e9e'; // Medium grey for average
  }

  if (percentage >= 60) {
    return '#757575'; // Dark grey for below average
  }

  return '#616161'; // Darker grey for poor performance
};

/**
 * Classify payment percentage into simplified buckets for UI badges and summaries
 * @param {number} percentage
 * @returns {('excellent'|'good'|'average'|'below_average'|'poor'|'unknown')} bucket name
 */
export const classifyPaymentPerformance = (percentage) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return 'unknown';
  }

  if (percentage >= 95) return 'excellent';
  if (percentage >= 85) return 'good';
  if (percentage >= 75) return 'average';
  if (percentage >= 60) return 'below_average';
  return 'poor';
};

/**
 * Check if data is outdated (older than 7 days)
 * @param {string} dateString - ISO 8601 date string
 * @returns {boolean} True if data is outdated
 */
export const isDataOutdated = (dateString) => {
  if (!dateString) {
    return true;
  }
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = (now - date) / (1000 * 60 * 60 * 24);
    
    return diffInDays > 7;
  } catch (error) {
    return true;
  }
};

/**
 * Format percentage with one decimal place
 * @param {number} percentage - The percentage value
 * @returns {string} Formatted percentage string
 * @example formatPercentage(99.9) => "99.9%"
 */
export const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return '0%';
  }
  return `${percentage.toFixed(1)}%`;
};

const cleanValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : value.trim();
  }

  return null;
};

const buildMetric = (label, value, formatter = (val) => val) => {
  const cleaned = cleanValue(value);
  return {
    label,
    value: cleaned !== null && cleaned !== undefined ? formatter(cleaned) : 'Data not available'
  };
};

/**
 * Transform currentMonth data into grouped detailed metrics for the UI
 * @param {Object} performanceData
 * @returns {{workAndWages: Array, projectStatus: Array, inclusionFocus: Array}}
 */
export const processDetailedMetrics = (performanceData) => {
  const current = performanceData?.currentMonth || {};

  return {
    workAndWages: [
      buildMetric('Average daily wage', current.averageDailyWage, (val) => `₹${formatNumber(val)}`),
      buildMetric('Total wage payments', current.totalWagePayments, (val) => `₹${formatNumber(val)}`),
      buildMetric('Wage payment delay', current.wagePaymentDelay, (val) => `${val} days`)
    ],
    projectStatus: [
      buildMetric('Ongoing projects', current.ongoingProjects, formatNumber),
      buildMetric('Completed projects', current.completedProjects, formatNumber),
      buildMetric('Project completion rate', current.projectCompletionRate, formatPercentage)
    ],
    inclusionFocus: [
      buildMetric('Women participation', current.womenParticipation, formatPercentage),
      buildMetric('SC/ST participation', current.scStParticipation, formatPercentage),
      buildMetric('Persons with disabilities participation', current.disabledParticipation, formatPercentage)
    ]
  };
};

/**
 * Determine if any detailed metric data is available
 * @param {Object} performanceData
 * @returns {boolean}
 */
export const hasDetailedMetrics = (performanceData) => {
  const current = performanceData?.currentMonth || {};

  return [
    current.averageDailyWage,
    current.totalWagePayments,
    current.wagePaymentDelay,
    current.ongoingProjects,
    current.completedProjects,
    current.projectCompletionRate,
    current.womenParticipation,
    current.scStParticipation,
    current.disabledParticipation
  ].some((value) => value !== null && value !== undefined);
};
