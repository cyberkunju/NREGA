/**
 * Performance API Route Handler
 * Endpoint: GET /api/performance/:district_name
 * Returns performance metrics for a specific district with trend calculation
 */

const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { capPercentageFields, cleanRecords, calculateWomenParticipation } = require('../utils/dataCleaner');

/**
 * Calculate trend indicator based on payment percentage comparison
 * @param {Object} currentRecord - Current month data record (after capping)
 * @param {Object} previousRecord - Previous month data record (after capping)
 * @returns {string} Trend indicator: 'improving', 'declining', or 'stable'
 */
function calculateTrend(currentRecord, previousRecord) {
  if (!previousRecord || previousRecord.payment_percentage_15_days === null || previousRecord.payment_percentage_15_days === undefined) {
    return 'stable'; // No previous data to compare
  }
  
  const currentPayment = parseFloat(currentRecord.payment_percentage_15_days);
  const previousPayment = parseFloat(previousRecord.payment_percentage_15_days);
  
  const difference = currentPayment - previousPayment;
  
  if (difference >= 5) {
    return 'improving';
  } else if (difference <= -5) {
    return 'declining';
  } else {
    return 'stable';
  }
}

/**
 * Format month name and get sort order
 * @param {string} month - Month in format like "10" or "October"
 * @returns {Object} { name: string, sortOrder: number }
 */
function getMonthInfo(month) {
  const monthMap = {
    'january': { name: 'January', order: 1 },
    'february': { name: 'February', order: 2 },
    'march': { name: 'March', order: 3 },
    'april': { name: 'April', order: 4 },
    'may': { name: 'May', order: 5 },
    'june': { name: 'June', order: 6 },
    'july': { name: 'July', order: 7 },
    'august': { name: 'August', order: 8 },
    'september': { name: 'September', order: 9 },
    'october': { name: 'October', order: 10 },
    'november': { name: 'November', order: 11 },
    'december': { name: 'December', order: 12 }
  };

  // If already a month name, normalize it
  const monthLower = month.toLowerCase().trim();
  if (monthMap[monthLower]) {
    return monthMap[monthLower];
  }

  // If numeric, convert to name
  const monthNum = parseInt(month, 10);
  if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return { name: monthNames[monthNum - 1], order: monthNum };
  }

  // Default fallback
  return { name: month, order: 0 };
}

/**
 * Format month name from numeric value or string
 * @param {string} month - Month in format like "10" or "October"
 * @returns {string} Month name
 */
function formatMonth(month) {
  return getMonthInfo(month).name;
}

/**
 * GET /api/performance/all
 * Returns performance metrics for ALL districts in a single request
 * Optimizes frontend by replacing 736 individual API calls with 1 bulk call
 * 
 * Response format:
 * {
 *   "districts": [
 *     {
 *       "district": "Agra",
 *       "state": "Uttar Pradesh",
 *       "paymentPercentage": 99.9,
 *       "totalHouseholds": 17219,
 *       "averageDays": 43,
 *       "month": "October",
 *       "year": "2024",
 *       "trend": "improving",
 *       "lastUpdated": "2024-10-23T02:15:00Z"
 *     },
 *     ...
 *   ],
 *   "metadata": {
 *     "totalDistricts": 736,
 *     "lastSync": "2024-10-27T02:00:00Z",
 *     "fromCache": false
 *   }
 * }
 */
router.get('/all', async (req, res, next) => {
  try {
    console.log('🔄 Fetching ALL district performance data...');
    
    // Single SQL query to get ALL districts' latest performance with trend calculation
    const query = `
      WITH latest_performance AS (
        SELECT 
          mp.district_name,
          d.state,
          mp.payment_percentage_15_days,
          mp.total_households_worked,
          mp.avg_days_employment_per_hh,
          mp.month,
          mp.fin_year,
          mp.last_updated,
          ROW_NUMBER() OVER (
            PARTITION BY mp.district_name 
            ORDER BY mp.last_updated DESC
          ) as rn
        FROM monthly_performance mp
        LEFT JOIN districts d ON mp.district_name = d.name
      ),
      previous_performance AS (
        SELECT 
          mp.district_name,
          mp.payment_percentage_15_days as prev_payment,
          ROW_NUMBER() OVER (
            PARTITION BY mp.district_name 
            ORDER BY mp.last_updated DESC
          ) as rn
        FROM monthly_performance mp
      )
      SELECT 
        lp.district_name,
        lp.state,
        lp.payment_percentage_15_days,
        lp.total_households_worked,
        lp.avg_days_employment_per_hh,
        lp.month,
        lp.fin_year,
        lp.last_updated,
        pp.prev_payment
      FROM latest_performance lp
      LEFT JOIN previous_performance pp 
        ON lp.district_name = pp.district_name AND pp.rn = 2
      WHERE lp.rn = 1
      ORDER BY lp.district_name;
    `;
    
    const startTime = Date.now();
    const result = await db.query(query);
    const queryTime = Date.now() - startTime;
    
    // Apply data capping to all records
    const cappedRecords = cleanRecords(result.rows);
    
    // Format response with trend calculation
    const districts = cappedRecords.map(row => {
      const currentPayment = parseFloat(row.payment_percentage_15_days);
      const previousPayment = row.prev_payment ? parseFloat(row.prev_payment) : null;
      
      // Calculate trend using capped values
      let trend = 'stable';
      if (previousPayment !== null) {
        // Create mock records for trend calculation
        const currentRecord = { payment_percentage_15_days: currentPayment };
        const previousRecord = { payment_percentage_15_days: previousPayment };
        trend = calculateTrend(currentRecord, previousRecord);
      }
      
      return {
        district: row.district_name,
        state: row.state || 'India',
        paymentPercentage: currentPayment, // Already capped
        totalHouseholds: parseInt(row.total_households_worked, 10),
        averageDays: parseFloat(row.avg_days_employment_per_hh),
        month: formatMonth(row.month),
        year: row.fin_year,
        trend: trend,
        lastUpdated: row.last_updated
      };
    });
    
    // Get most recent update timestamp
    const lastSync = districts.length > 0 
      ? districts.reduce((latest, d) => 
          new Date(d.lastUpdated) > new Date(latest) ? d.lastUpdated : latest
        , districts[0].lastUpdated)
      : new Date();
    
    const response = {
      districts: districts,
      metadata: {
        totalDistricts: districts.length,
        lastSync: lastSync,
        fromCache: false,
        queryTimeMs: queryTime
      }
    };
    
    console.log(`✅ Returned ${districts.length} districts in ${queryTime}ms`);
    
    // Cache for 12 hours (data refreshes every 12 hours via ETL cron)
    res.set({
      'Cache-Control': 'public, max-age=43200',
      'Expires': new Date(Date.now() + 43200000).toUTCString(),
    });
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching all performance data:', error);
    next(error);
  }
});

/**
 * GET /api/performance/heatmap-data
 * Phase 1, Task 3: Heatmap Data API Endpoint
 * Returns latest values for ALL heatmap metrics for EVERY district in a single efficient call
 * 
 * This endpoint is optimized for choropleth map visualizations and supports multiple metric views:
 * - Payment Performance (percentage_payments_generated_within_15_days)
 * - Average Employment Days (Average_days_of_employment_provided_per_Household)
 * - Women's Participation (Women_Persondays / Total_Persondays * 100)
 * - And other derived metrics
 * 
 * Response format:
 * [
 *   {
 *     "districtId": "UP_SITAPUR",
 *     "districtName": "Sitapur",
 *     "stateName": "UTTAR PRADESH",
 *     "paymentPercentage": 100.0,
 *     "averageDays": 37,
 *     "womenParticipationPercent": 55.6,
 *     "totalHouseholds": 50000,
 *     "finYear": "2024-25",
 *     "month": "October"
 *   },
 *   ...
 * ]
 */
router.get('/heatmap-data', async (req, res, next) => {
  try {
    console.log('🗺️ Fetching heatmap data for all districts...');
    
    // Efficient SQL query using DISTINCT ON to get the most recent record for each district
    const query = `
      SELECT DISTINCT ON (mp.district_name, d.state)
        mp.district_name,
        d.state as state_name,
        mp.district_name || '_' || UPPER(REPLACE(d.state, ' ', '_')) as district_id,
        mp.fin_year,
        mp.month,
        mp.payment_percentage_15_days,
        mp.avg_days_employment_per_hh,
        mp.total_households_worked,
        mp.women_persondays,
        mp.persondays_of_central_liability,
        mp.sc_persondays,
        mp.st_persondays,
        mp.households_100_days,
        mp.average_wage_rate,
        mp.total_works_completed,
        mp.total_works_ongoing,
        mp.agriculture_works_percent,
        mp.nrm_expenditure_percent,
        mp.category_b_works_percent,
        mp.last_updated,
        -- Month order for proper sorting
        CASE LOWER(mp.month)
          WHEN 'january' THEN 1
          WHEN 'february' THEN 2
          WHEN 'march' THEN 3
          WHEN 'april' THEN 4
          WHEN 'may' THEN 5
          WHEN 'june' THEN 6
          WHEN 'july' THEN 7
          WHEN 'august' THEN 8
          WHEN 'september' THEN 9
          WHEN 'october' THEN 10
          WHEN 'november' THEN 11
          WHEN 'december' THEN 12
          ELSE 0
        END as month_num,
        -- Financial year as sortable number
        CAST(LEFT(mp.fin_year, 4) AS INTEGER) as year_num
      FROM monthly_performance mp
      LEFT JOIN districts d ON mp.district_name = d.name
      WHERE mp.payment_percentage_15_days IS NOT NULL
      ORDER BY 
        mp.district_name,
        d.state,
        year_num DESC,
        month_num DESC,
        mp.last_updated DESC;
    `;
    
    const startTime = Date.now();
    const result = await db.query(query);
    const queryTime = Date.now() - startTime;
    
    // Apply data capping to all records
    const cappedRecords = cleanRecords(result.rows);
    
    // Format response for heatmap consumption
    const heatmapData = cappedRecords.map(row => {
      // Use the women_participation_percent already calculated by cleanRecords
      const womenParticipation = row.women_participation_percent !== undefined 
        ? row.women_participation_percent 
        : null;
      
      // Calculate SC/ST participation percentage
      const scstParticipation = (row.sc_persondays && row.st_persondays && row.persondays_of_central_liability)
        ? ((parseFloat(row.sc_persondays) + parseFloat(row.st_persondays)) / parseFloat(row.persondays_of_central_liability)) * 100
        : null;
      
      // Calculate 100-day households percentage
      const households100DaysPercent = (row.households_100_days && row.total_households_worked)
        ? (parseFloat(row.households_100_days) / parseFloat(row.total_households_worked)) * 100
        : null;
      
      // Calculate work completion percentage
      const workCompletionPercent = (row.total_works_completed && row.total_works_ongoing)
        ? (parseFloat(row.total_works_completed) / (parseFloat(row.total_works_completed) + parseFloat(row.total_works_ongoing))) * 100
        : null;
      
      return {
        districtId: row.district_id || `${row.district_name}_${(row.state_name || 'INDIA').toUpperCase().replace(/\s+/g, '_')}`,
        districtName: row.district_name,
        stateName: row.state_name || 'India',
        paymentPercentage: parseFloat(row.payment_percentage_15_days),
        averageDays: parseFloat(row.avg_days_employment_per_hh),
        totalHouseholds: parseInt(row.total_households_worked, 10),
        womenParticipationPercent: womenParticipation,
        // Advanced metrics
        households100DaysPercent: households100DaysPercent,
        scstParticipationPercent: scstParticipation,
        workCompletionPercent: workCompletionPercent,
        averageWageRate: row.average_wage_rate ? parseFloat(row.average_wage_rate) : null,
        agricultureWorksPercent: row.agriculture_works_percent ? parseFloat(row.agriculture_works_percent) : null,
        finYear: row.fin_year,
        month: formatMonth(row.month),
        lastUpdated: row.last_updated
      };
    });
    
    // Debug: Check women participation data
    const withWomenData = heatmapData.filter(d => d.womenParticipationPercent !== null).length;
    console.log(`✅ Returned heatmap data for ${heatmapData.length} districts in ${queryTime}ms`);
    console.log(`📊 Women participation data: ${withWomenData}/${heatmapData.length} districts (${((withWomenData/heatmapData.length)*100).toFixed(1)}%)`);
    if (withWomenData > 0) {
      console.log(`📊 Sample women participation values:`, heatmapData.filter(d => d.womenParticipationPercent !== null).slice(0, 3).map(d => `${d.districtName}: ${d.womenParticipationPercent}%`));
    }
    
    // Set cache headers (cache for 6 hours)
    res.set({
      'Cache-Control': 'public, max-age=21600', // 6 hours
      'Expires': new Date(Date.now() + 21600000).toUTCString(),
    });
    
    res.json(heatmapData);
  } catch (error) {
    console.error('❌ Error fetching heatmap data:', error);
    next(error);
  }
});

/**
 * GET /api/performance/:district_name/periods
 * Returns available time periods for a district
 * Used by timeline selector to show available historical data
 */
router.get('/:district_name/periods', async (req, res, next) => {
  try {
    const districtName = req.params.district_name;
    const decodedDistrictName = decodeURIComponent(districtName);
    
    console.log(`Fetching available periods for district: ${decodedDistrictName}`);
    
    const query = `
      SELECT DISTINCT
        mp.month,
        mp.fin_year,
        mp.last_updated,
        CASE LOWER(mp.month)
          WHEN 'january' THEN 1
          WHEN 'february' THEN 2
          WHEN 'march' THEN 3
          WHEN 'april' THEN 4
          WHEN 'may' THEN 5
          WHEN 'june' THEN 6
          WHEN 'july' THEN 7
          WHEN 'august' THEN 8
          WHEN 'september' THEN 9
          WHEN 'october' THEN 10
          WHEN 'november' THEN 11
          WHEN 'december' THEN 12
          ELSE 0
        END as month_num,
        CAST(LEFT(mp.fin_year, 4) AS INTEGER) as year_num
      FROM monthly_performance mp
      WHERE LOWER(mp.district_name) = LOWER($1)
      ORDER BY year_num DESC, month_num DESC, mp.last_updated DESC;
    `;
    
    const result = await db.query(query, [decodedDistrictName]);
    
    const periods = result.rows.map(row => ({
      month: formatMonth(row.month),
      year: row.fin_year,
      lastUpdated: row.last_updated
    }));
    
    res.json({ periods });
  } catch (error) {
    console.error('Error fetching available periods:', error);
    next(error);
  }
});

/**
 * GET /api/performance/:district_name
 * Returns performance metrics for specified district
 * Supports optional query parameters: ?year=2024-25&month=October
 * 
 * Response format:
 * {
 *   "district": "Agra",
 *   "state": "Uttar Pradesh",
 *   "currentMonth": {
 *     "month": "October",
 *     "year": "2024",
 *     "paymentPercentage": 99.9,
 *     "totalHouseholds": 17219,
 *     "averageDays": 43
 *   },
 *   "previousMonth": {
 *     "month": "September",
 *     "year": "2024",
 *     "paymentPercentage": 95.2,
 *     "totalHouseholds": 16800,
 *     "averageDays": 41
 *   },
 *   "trend": "improving",
 *   "lastUpdated": "2024-10-23T02:15:00Z"
 * }
 */
router.get('/:district_name', async (req, res, next) => {
  try {
    const districtName = req.params.district_name;
    const requestedYear = req.query.year; // Optional: filter by year (e.g., "2024-25")
    const requestedMonth = req.query.month; // Optional: filter by month (e.g., "October")
    
    // Validate district name
    if (!districtName || districtName.trim() === '') {
      return res.status(400).json({
        error: {
          code: 'INVALID_DISTRICT_NAME',
          message: 'District name is required',
        },
      });
    }
    
    // Decode URL-encoded district name
    const decodedDistrictName = decodeURIComponent(districtName);
    
    console.log(`Fetching performance data for district: ${decodedDistrictName}`, 
      requestedYear ? `year: ${requestedYear}` : '',
      requestedMonth ? `month: ${requestedMonth}` : ''
    );
    
    // Build query to get current and previous month data with state info
    // Uses window functions to efficiently get the record and its predecessor
    const query = `
      WITH month_order AS (
        SELECT 
          mp.id,
          mp.district_name,
          d.state,
          mp.month,
          mp.fin_year,
          mp.total_households_worked,
          mp.avg_days_employment_per_hh,
          mp.payment_percentage_15_days,
          mp.women_persondays,
          mp.persondays_of_central_liability,
          mp.sc_persondays,
          mp.st_persondays,
          mp.households_100_days,
          mp.average_wage_rate,
          mp.total_works_completed,
          mp.total_works_ongoing,
          mp.agriculture_works_percent,
          mp.nrm_expenditure_percent,
          mp.category_b_works_percent,
          mp.last_updated,
          -- Create sortable month order
          CASE LOWER(mp.month)
            WHEN 'january' THEN 1
            WHEN 'february' THEN 2
            WHEN 'march' THEN 3
            WHEN 'april' THEN 4
            WHEN 'may' THEN 5
            WHEN 'june' THEN 6
            WHEN 'july' THEN 7
            WHEN 'august' THEN 8
            WHEN 'september' THEN 9
            WHEN 'october' THEN 10
            WHEN 'november' THEN 11
            WHEN 'december' THEN 12
            ELSE 0
          END as month_num,
          -- Financial year as sortable number (e.g., "2024-25" -> 2024)
          CAST(LEFT(mp.fin_year, 4) AS INTEGER) as year_num
        FROM monthly_performance mp
        LEFT JOIN districts d ON mp.district_name = d.name
        WHERE LOWER(mp.district_name) = LOWER($1)
          -- Optional filtering based on query params
          AND ($2::TEXT IS NULL OR mp.fin_year = $2)
          AND ($3::TEXT IS NULL OR LOWER(mp.month) = LOWER($3))
      ),
      ranked_data AS (
        SELECT 
          *,
          -- Rank records for the district, latest first
          ROW_NUMBER() OVER(
            ORDER BY year_num DESC, month_num DESC, last_updated DESC
          ) as rn
        FROM month_order
      )
      SELECT 
        district_name,
        state,
        month,
        fin_year,
        total_households_worked,
        avg_days_employment_per_hh,
        payment_percentage_15_days,
        women_persondays,
        persondays_of_central_liability,
        sc_persondays,
        st_persondays,
        households_100_days,
        average_wage_rate,
        total_works_completed,
        total_works_ongoing,
        agriculture_works_percent,
        nrm_expenditure_percent,
        category_b_works_percent,
        last_updated,
        rn
      FROM ranked_data
      WHERE rn <= 2
      ORDER BY rn ASC;
    `;
    
    const result = await db.query(query, [
      decodedDistrictName,
      requestedYear || null,
      requestedMonth || null
    ]);
    
    // Check if district exists
    if (result.rows.length === 0) {
      // Try to find similar district names for suggestions
      const suggestionQuery = `
        SELECT name 
        FROM districts 
        WHERE LOWER(name) LIKE LOWER($1)
        LIMIT 5
      `;
      
      const suggestions = await db.query(suggestionQuery, [`%${decodedDistrictName}%`]);
      const suggestionList = suggestions.rows.map(row => row.name);
      
      return res.status(404).json({
        error: {
          code: 'DISTRICT_NOT_FOUND',
          message: `District '${decodedDistrictName}' not found.`,
          suggestions: suggestionList.length > 0 ? suggestionList : undefined,
        },
      });
    }
    
    // Extract current and previous month data
    const currentData = result.rows[0];
    const previousData = result.rows.length > 1 ? result.rows[1] : null;
    
    // Apply data capping to both records
    const cappedCurrentData = capPercentageFields(currentData);
    const cappedPreviousData = previousData ? capPercentageFields(previousData) : null;
    
    // Calculate trend using capped data
    const trend = calculateTrend(cappedCurrentData, cappedPreviousData);
    
    // Calculate women participation percentage
    const womenParticipation = (cappedCurrentData.women_persondays && cappedCurrentData.persondays_of_central_liability)
      ? (parseFloat(cappedCurrentData.women_persondays) / parseFloat(cappedCurrentData.persondays_of_central_liability)) * 100
      : null;

    // Calculate SC/ST participation percentage
    const scstParticipation = (cappedCurrentData.sc_persondays && cappedCurrentData.st_persondays && cappedCurrentData.persondays_of_central_liability)
      ? ((parseFloat(cappedCurrentData.sc_persondays) + parseFloat(cappedCurrentData.st_persondays)) / parseFloat(cappedCurrentData.persondays_of_central_liability)) * 100
      : null;

    // Calculate work completion percentage
    const workCompletion = (cappedCurrentData.total_works_completed && cappedCurrentData.total_works_ongoing)
      ? (parseFloat(cappedCurrentData.total_works_completed) / (parseFloat(cappedCurrentData.total_works_completed) + parseFloat(cappedCurrentData.total_works_ongoing))) * 100
      : null;

    // Format response
    const response = {
      district: cappedCurrentData.district_name,
      state: cappedCurrentData.state || 'India', // Include state name (Phase 1, Task 2)
      currentMonth: {
        month: formatMonth(cappedCurrentData.month),
        year: cappedCurrentData.fin_year,
        paymentPercentage: parseFloat(cappedCurrentData.payment_percentage_15_days),
        totalHouseholds: parseInt(cappedCurrentData.total_households_worked, 10),
        averageDays: parseFloat(cappedCurrentData.avg_days_employment_per_hh),
        // Additional primary metrics
        womenParticipation: womenParticipation,
        averageWage: cappedCurrentData.average_wage_rate ? parseFloat(cappedCurrentData.average_wage_rate) : null,
        households100Days: cappedCurrentData.households_100_days ? parseInt(cappedCurrentData.households_100_days, 10) : null,
        workCompletion: workCompletion,
        // Advanced metrics
        scstParticipation: scstParticipation,
        agricultureWorks: cappedCurrentData.agriculture_works_percent ? parseFloat(cappedCurrentData.agriculture_works_percent) : null,
        nrmExpenditure: cappedCurrentData.nrm_expenditure_percent ? parseFloat(cappedCurrentData.nrm_expenditure_percent) : null,
        categoryBWorks: cappedCurrentData.category_b_works_percent ? parseFloat(cappedCurrentData.category_b_works_percent) : null,
        worksCompleted: cappedCurrentData.total_works_completed ? parseInt(cappedCurrentData.total_works_completed, 10) : null,
        worksOngoing: cappedCurrentData.total_works_ongoing ? parseInt(cappedCurrentData.total_works_ongoing, 10) : null,
      },
      previousMonth: cappedPreviousData ? {
        month: formatMonth(cappedPreviousData.month),
        year: cappedPreviousData.fin_year,
        paymentPercentage: parseFloat(cappedPreviousData.payment_percentage_15_days),
        totalHouseholds: parseInt(cappedPreviousData.total_households_worked, 10),
        averageDays: parseFloat(cappedPreviousData.avg_days_employment_per_hh),
      } : null, // Return null if no previous month data (Phase 1, Task 2)
      trend: trend, // Backend-calculated trend (Phase 1, Task 2)
      lastUpdated: cappedCurrentData.last_updated,
    };
    
    console.log(`Successfully fetched performance data for ${decodedDistrictName}`);
    
    // Set cache headers (cache for 1 hour since data updates daily)
    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hour
      'Expires': new Date(Date.now() + 3600000).toUTCString(),
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching performance data:', error);
    
    // Check if it's a database connection error
    if (error.code && error.code.startsWith('08')) {
      return res.status(503).json({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Unable to fetch performance data. Please try again later.',
        },
      });
    }
    
    // Pass other errors to global error handler
    next(error);
  }
});

module.exports = router;
