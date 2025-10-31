
## **Phase 1: Data Foundation & Backend Adjustments**

**(Goal: Ensure clean, capped data is available via enhanced API endpoints)**

### **Task 1: Implement Data Validation & Capping (Crucial First Step)**

  * **Problem:** Our source API (`data.gov.in`) has known data quality issues, specifically percentage fields like `percentage_payments_gererated_within_15_days` often exceeding 100%, sometimes drastically. This breaks visualizations and confuses users.
  * **Objective:** Implement logic to cap these percentage values at a realistic maximum (100%) *before* they are sent to the frontend, while ensuring values below 0 are also handled (though less likely).
  * **Decision Point - Where to Implement:**
      * **Option A (ETL Script):** Cap the data *before* inserting it into the PostgreSQL database.
          * *Pros:* Database only stores clean data.
          * *Cons:* Loses the original raw value from the source; harder to audit source discrepancies later.
      * **Option B (Backend API - Recommended):** Store the raw, potentially incorrect, data in the database but apply capping logic *within the API endpoints* just before sending the JSON response to the frontend.
          * *Pros:* Preserves original source data in the DB for potential future analysis/auditing. Centralizes the capping logic in one place (the API layer). Easier to adjust capping rules later.
          * *Cons:* Requires applying the logic in every relevant API endpoint.
      * **Decision:** Proceed with **Option B (Backend API)**.
  * **Implementation Steps (Backend API - Node.js/Express):**
    1.  **Identify Fields:** Confirm all percentage fields that need capping. Primarily `percentage_payments_gererated_within_15_days`, but review others like `percent_of_Category_B_Works`, `percent_of_Expenditure_on_Agriculture_Allied_Works`, `percent_of_NRM_Expenditure`.
    2.  **Create Utility Function:** Create a reusable function `capPercentageFields(record)` in a utility file (e.g., `utils/dataCleaner.js`).
        ```javascript
        // utils/dataCleaner.js
        export function capPercentageFields(record) {
          if (!record) return record; // Handle null/undefined input

          const cappedRecord = { ...record }; // Create a shallow copy

          const fieldsToCap = [
            'percentage_payments_gererated_within_15_days',
            'percent_of_category_b_works', // Use consistent snake_case from DB
            'percent_of_expenditure_on_agriculture_allied_works',
            'percent_of_nrm_expenditure',
            // Add any other percentage fields here
          ];

          fieldsToCap.forEach(field => {
            if (cappedRecord[field] !== null && typeof cappedRecord[field] === 'number') {
              // Cap between 0 and 100
              cappedRecord[field] = Math.max(0, Math.min(cappedRecord[field], 100));
            } else if (cappedRecord[field] !== null) {
              // Handle potential non-numeric values if necessary (e.g., log warning, set to null)
              console.warn(`Unexpected non-numeric value in ${field}:`, cappedRecord[field]);
              cappedRecord[field] = null; // Or handle as appropriate
            }
          });

          return cappedRecord;
        }
        ```
    3.  **Apply in API Routes:** In your API route handlers (specifically for `/api/performance/:district_name` and `/api/heatmap-data`), after fetching data from the database, apply this function to each record *before* sending the response.
        ```javascript
        // Example in /api/performance/:district_name route handler
        import { capPercentageFields } from './utils/dataCleaner.js';
        // ... fetch 'currentMonthData' and 'previousMonthData' from DB ...

        const cappedCurrentMonthData = capPercentageFields(currentMonthData);
        const cappedPreviousMonthData = capPercentageFields(previousMonthData);

        res.json({
          district: districtName,
          state_name: cappedCurrentMonthData?.state_name, // Pass state name
          currentMonth: mapRecordToFrontendFormat(cappedCurrentMonthData), // Function to select/rename fields
          previousMonth: mapRecordToFrontendFormat(cappedPreviousMonthData), // Apply to previous month too
          trend: calculateTrend(cappedCurrentMonthData, cappedPreviousMonthData),
          lastUpdated: cappedCurrentMonthData?.last_updated // Use DB timestamp
        });
        ```
  * **Verification:** Use tools like Postman or `curl` to hit your API endpoints. Check responses for districts known to have \>100% values (like 'South Andaman') and verify the percentages are now correctly capped at 100. Check districts with valid percentages remain unchanged.

-----

### **Task 2: Enhance District Performance API Endpoint (`/api/performance/:district_name`)**

  * **Problem:** The current endpoint likely only fetches the latest data for a district and might be missing the state name or filtering capabilities.

  * **Objective:** Modify the endpoint to include the state name, support filtering by financial year and month, and reliably provide previous month's data for trend calculation.

  * **Implementation Steps (Backend API - Node.js/Express & SQL):**

    1.  **Include State Name:**
          * **Database:** Ensure your `monthly_performance` table includes the `state_name` column. Your ETL script should already be populating this from the source API.
          * **API Query:** Modify the SQL query to select `state_name`.
          * **API Response:** Add the `state_name` field to the main level of the JSON response object.
    2.  **Add Year/Month Filtering:**
          * **Express Route:** Update the route definition to accept optional query parameters: `GET /api/performance/:district_name`. Access them via `req.query.year` and `req.query.month`.
          * **SQL Query Logic:**
              * If `year` and `month` parameters are provided: Modify the `WHERE` clause to filter by `district_name`, `fin_year`, and `month`.
              * If parameters are *not* provided: Fetch the record(s) for the specified `district_name` ordered by `fin_year DESC, month DESC` (you'll need a mapping from month name to a sortable order, e.g., using a case statement or a separate month table/enum) and take the `LIMIT 1` to get the absolute latest.
          * **Consolidated Query (Conceptual Example using CTEs and Window Functions - adapt for actual month sorting):**
            ```sql
            WITH RankedData AS (
              SELECT
                *,
                -- Rank records for the district, latest first
                ROW_NUMBER() OVER(PARTITION BY district_name ORDER BY fin_year DESC, month_sort_order DESC) as rn,
                -- Get previous month's payment percentage using LAG
                LAG(percentage_payments_gererated_within_15_days, 1) OVER(PARTITION BY district_name ORDER BY fin_year ASC, month_sort_order ASC) as prev_payment_percentage
                -- Replace month_sort_order with actual sorting logic for month names ('Jan'->1, 'Feb'->2...)
              FROM monthly_performance
              WHERE district_name = $1 -- District Name Param
                -- Optional Filtering based on query params:
                AND ($2::TEXT IS NULL OR fin_year = $2) -- Year Param or NULL
                AND ($3::TEXT IS NULL OR month = $3)     -- Month Param or NULL
            )
            SELECT *
            FROM RankedData
            WHERE rn = 1; -- Select the latest record matching the filters (or absolute latest if no filters)
            ```
            *(Note: This conceptual query fetches the latest record *and* its previous payment percentage in one go. You might need to adjust based on your exact month sorting approach and how you structure the response)*
          * **API Logic:** Parse `req.query.year` and `req.query.month`. Pass them as parameters (or `null`) to your database query function.
    3.  **Provide Previous Month Data:**
          * **Method 1 (Using LAG - Preferred):** As shown in the SQL example above, use the `LAG` window function to fetch the previous month's key metrics (like `percentage_payments_gererated_within_15_days`) within the same query that gets the current month's data. This is efficient.
          * **Method 2 (Separate Query):** If using `LAG` is difficult, after fetching the latest/requested month's data, perform a *second* database query to explicitly find the record for the month immediately preceding it. Handle cases where the previous month might be in the prior financial year or might not exist.
          * **API Response:** Structure the response to include both `currentMonth` and `previousMonth` objects (or at least the necessary fields from the previous month needed for trend calculation). Make `previousMonth` null if no preceding data exists.
    4.  **Trend Calculation:** Move the trend calculation logic (`calculateTrend`) into the backend API. It should compare the `currentMonth.paymentPercentage` (capped) with `previousMonth.paymentPercentage` (capped) and return "improving", "stable", or "declining". Include this in the main response object.

  * **Verification:** Test the endpoint thoroughly:

      * Without query parameters (should return latest data + previous month + trend).
      * With specific `year` and `month` (should return data for that period + its preceding month + trend).
      * With a district having data for the previous month.
      * With a district *not* having data for the previous month (trend should be handled, `previousMonth` might be null).
      * Ensure `state_name` is present.
      * Verify capped percentages.

-----

### **Task 3: Enhance Heatmap Data API Endpoint (`/api/heatmap-data`)**

  * **Problem:** The existing endpoint might only return one metric or might not cover all districts efficiently.
  * **Objective:** Create/Modify the endpoint to return the latest values for *all* required heatmap metrics for *every* district in India in a single, efficient call.
  * **Implementation Steps (Backend API - Node.js/Express & SQL):**
    1.  **Define Required Metrics:** List all fields needed for *any* heatmap view (e.g., `percentage_payments_gererated_within_15_days`, `Average_days_of_employment_provided_per_Household`, `Women_Persondays`, `Persondays_of_Central_Liability_so_far`).
    2.  **Efficient SQL Query:** Write a single SQL query to get the *most recent* record for *each district* in the `monthly_performance` table, selecting only the necessary metric fields and a unique district identifier (like `district_code` or `district_name` + `state_name`).
          * **Example using `DISTINCT ON` (PostgreSQL specific and very efficient):**
            ```sql
            SELECT DISTINCT ON (district_name, state_name) -- Or use district_code if unique
                district_name,
                state_name,
                -- district_code, -- Include if needed for joining
                fin_year,
                month,
                percentage_payments_gererated_within_15_days,
                Average_days_of_employment_provided_per_Household,
                Women_Persondays,
                Persondays_of_Central_Liability_so_far
                -- Select other needed metrics...
            FROM monthly_performance
            ORDER BY
                district_name,
                state_name,
                fin_year DESC,
                month_sort_order DESC; -- Replace with actual month sorting logic
            ```
            *(This query efficiently fetches only the latest row for each unique district/state combination)*
    3.  **API Route Handler:**
          * Create the `GET /api/heatmap-data` endpoint.
          * Execute the efficient SQL query.
          * **Apply Capping:** Iterate through the results and use your `capPercentageFields` utility function on each record.
          * **Calculate Derived Metrics:** Calculate ratios like `women_participation_percent` (`(Women_Persondays / Persondays_of_Central_Liability_so_far) * 100`) for each record. Handle division by zero. Cap this derived percentage too.
          * **Format Response:** Return the results as a JSON array, ensuring each object has a clear district identifier that can be matched to your GeoJSON properties.
            ```json
            // Example Response Structure
            [
              {
                "district_id": "UP_SITAPUR", // Or use census code if available in GeoJSON
                "district_name": "Sitapur",
                "state_name": "UTTAR PRADESH",
                "paymentPercentage": 100.0, // Capped
                "averageDays": 37,
                "womenParticipationPercent": 55.6 // Calculated & Capped
                // ... other metrics ...
              },
              // ... approx 700+ district entries ...
            ]
            ```
  * **Verification:** Call the endpoint and verify:
      * It returns data for districts across multiple states.
      * It includes all necessary metrics for all planned heatmap views.
      * Percentage values are capped correctly.
      * Derived percentages (like women's participation) are calculated correctly and capped.
      * The response time is reasonable (should be fast if the query is efficient).

-----

Execute these tasks thoroughly. This will solidify your backend, ensuring it provides clean, reliable, and flexible data, setting you up perfectly for the frontend refactoring in the next phases. 