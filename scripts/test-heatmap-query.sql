-- Test the exact heatmap query for Andaman districts
SELECT DISTINCT ON (mp.district_name, d.state)
  mp.district_name,
  d.state as state_name,
  mp.district_name || '_' || UPPER(REPLACE(d.state, ' ', '_')) as district_id,
  mp.fin_year,
  mp.month,
  mp.payment_percentage_15_days,
  mp.avg_days_employment_per_hh,
  mp.total_households_worked,
  mp.last_updated
FROM monthly_performance mp
LEFT JOIN districts d ON mp.district_name = d.name
WHERE mp.payment_percentage_15_days IS NOT NULL
  AND (mp.district_name ILIKE '%andaman%' OR mp.district_name ILIKE '%nicobar%')
ORDER BY 
  mp.district_name,
  d.state,
  mp.last_updated DESC;
