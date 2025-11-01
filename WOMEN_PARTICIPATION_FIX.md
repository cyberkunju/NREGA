# Women Participation Data Fix

## Problem
The women participation metric on the heatmap was showing as empty (gray) because the required data fields were not being stored in the database.

## Root Cause
1. **Database schema** only stored 3 metrics, missing social inclusion fields
2. **ETL pipeline** wasn't extracting women participation data from the API
3. **Backend API** couldn't calculate women participation % without the base data

## Solution Implemented

### 1. Database Schema Update
Added 4 new columns to `monthly_performance` table:
- `women_persondays` (BIGINT)
- `persondays_of_central_liability` (BIGINT)
- `sc_persondays` (BIGINT) - for future SC/ST metrics
- `st_persondays` (BIGINT) - for future SC/ST metrics

### 2. ETL Pipeline Updates

**data-transformer.js:**
- Added extraction functions for social inclusion fields
- Correctly maps API field names (e.g., `Women_Persondays` with capital W)
- Handles multiple field name variations for compatibility

**data-loader.js:**
- Updated INSERT/UPDATE query to include new fields
- Maintains backward compatibility with existing data

### 3. Backend API Updates

**routes/performance.js:**
- Updated to use correct database column name: `persondays_of_central_liability`
- Calculates women participation % when data is available

**utils/dataCleaner.js:**
- Fixed field name references to match database schema
- Supports both old and new field names for compatibility

### 4. Data Population
- Ran ETL to fetch and populate 10,000 records with women participation data
- Verified data is correctly stored in database

## Verification

```sql
-- Check that data exists
SELECT district_name, women_persondays, persondays_of_central_liability 
FROM monthly_performance 
WHERE women_persondays IS NOT NULL 
LIMIT 5;
```

Result: ✅ Data successfully populated

## Files Modified
1. `backend/db/init.sql` - Schema definition
2. `backend/db/migrations/001_add_social_inclusion_columns.sql` - Migration script
3. `etl/data-transformer.js` - Data extraction
4. `etl/data-loader.js` - Data insertion
5. `backend/routes/performance.js` - API endpoint
6. `backend/utils/dataCleaner.js` - Data calculation

## Next Steps
The women participation heatmap should now display correctly. Refresh the browser to see the updated data.

## Future Enhancements
With SC/ST persondays now stored, we can easily add:
- SC/ST Participation Rate metric
- Combined social inclusion metrics
- Trend analysis for social inclusion
