# Advanced Metrics Implementation

## Overview
Added 5 new advanced metrics to the MGNREGA Report Card system with a collapsible "Advanced Metrics" section in the metric selector.

## New Metrics

### 1. 100-Day Employment (💯)
- **Field**: `households100DaysPercent`
- **Calculation**: (Households completing 100 days / Total households worked) × 100
- **Color Scale**: Red (0%) → Green (20%+)
- **Source**: `Total_No_of_HHs_completed_100_Days_of_Wage_Employment`

### 2. SC/ST Participation (🤝)
- **Field**: `scstParticipationPercent`
- **Calculation**: ((SC persondays + ST persondays) / Total persondays) × 100
- **Color Scale**: Red (0%) → Green (60%+)
- **Source**: `SC_persondays` + `ST_persondays`

### 3. Work Completion Rate (✅)
- **Field**: `workCompletionPercent`
- **Calculation**: (Works completed / (Works completed + Works ongoing)) × 100
- **Color Scale**: Red (0%) → Green (100%)
- **Source**: `Total_No_of_Works_Completed` / `Total_No_of_Works_Ongoing`

### 4. Average Wage Rate (💵)
- **Field**: `averageWageRate`
- **Format**: ₹XXX/day
- **Color Scale**: Red (₹0) → Green (₹350+)
- **Source**: `Average_Wage_rate_per_day_per_person`

### 5. Agriculture Works (🌾)
- **Field**: `agricultureWorksPercent`
- **Format**: XX.X%
- **Color Scale**: Red (0%) → Green (80%+)
- **Source**: `percent_of_Expenditure_on_Agriculture_Allied_Works`

## Database Changes

### New Columns Added to `monthly_performance`
```sql
- households_100_days (bigint)
- average_wage_rate (numeric(10,2))
- total_works_completed (bigint)
- total_works_ongoing (bigint)
- agriculture_works_percent (numeric(5,2))
- nrm_expenditure_percent (numeric(5,2))
- category_b_works_percent (numeric(5,2))
```

## Frontend Changes

### MetricSelector Component
- Added collapsible "Advanced Metrics" section
- Smooth expand/collapse animation
- Arrow icon rotates on toggle
- Maintains selected metric state when toggling

### MapView Component
- Updated METRICS configuration with `category` field
- Primary metrics: Payment Timeliness, Average Payment Days, Women Participation
- Advanced metrics: All 5 new metrics
- Color scales optimized for each metric's typical range

### Styling
- Advanced toggle button with hover effects
- Slide-down animation for advanced section
- Consistent with existing design system
- Responsive on mobile devices

## Backend Changes

### API Response (`/api/performance/heatmap-data`)
Added new fields to response:
```javascript
{
  // Existing fields...
  households100DaysPercent: number | null,
  scstParticipationPercent: number | null,
  workCompletionPercent: number | null,
  averageWageRate: number | null,
  agricultureWorksPercent: number | null
}
```

### Calculation Logic
- Percentages calculated in backend for consistency
- Null handling for missing data
- Proper type conversion and validation

## ETL Changes

### Data Transformer (`etl/data-transformer.js`)
Added extraction functions for:
- `extractHouseholds100Days()`
- `extractAverageWageRate()`
- `extractTotalWorksCompleted()`
- `extractTotalWorksOngoing()`
- `extractAgricultureWorksPercent()`
- `extractNRMExpenditurePercent()`
- `extractCategoryBWorksPercent()`

### Data Loader (`etl/data-loader.js`)
- Updated INSERT query with 7 new fields
- Updated ON CONFLICT clause to handle updates
- Maintains backward compatibility

## Cache Management
- Updated cache version to v5
- Clears old cache versions automatically
- 6-hour cache duration maintained

## Testing Checklist
- [x] Database migration successful
- [x] ETL processes new fields
- [x] Backend returns calculated percentages
- [x] Frontend displays advanced metrics section
- [x] Map colors update correctly for each metric
- [x] Tooltip shows correct values
- [x] Legend updates for each metric
- [x] Mobile responsive design works
- [ ] Test with real data after ETL completes

## Usage
1. Click "Advanced Metrics" button below Women Participation
2. Section expands with 5 additional metrics
3. Click any metric to update the map visualization
4. Click "Advanced Metrics" again to collapse

## Performance Impact
- Minimal: Calculations done in backend
- No additional API calls required
- Data included in existing heatmap endpoint
- Frontend only renders when section is expanded

## Future Enhancements
- Add NRM Expenditure % metric
- Add Category B Works % metric
- Add trend indicators for advanced metrics
- Add comparison with state/national averages
