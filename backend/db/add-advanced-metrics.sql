-- Add advanced metrics columns to monthly_performance table
-- Run this migration to add support for advanced metrics

ALTER TABLE monthly_performance 
ADD COLUMN IF NOT EXISTS households_100_days bigint,
ADD COLUMN IF NOT EXISTS average_wage_rate numeric(10,2),
ADD COLUMN IF NOT EXISTS total_works_completed bigint,
ADD COLUMN IF NOT EXISTS total_works_ongoing bigint,
ADD COLUMN IF NOT EXISTS agriculture_works_percent numeric(5,2),
ADD COLUMN IF NOT EXISTS nrm_expenditure_percent numeric(5,2),
ADD COLUMN IF NOT EXISTS category_b_works_percent numeric(5,2);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_households_100_days ON monthly_performance(households_100_days);
CREATE INDEX IF NOT EXISTS idx_average_wage_rate ON monthly_performance(average_wage_rate);

-- Add comment
COMMENT ON COLUMN monthly_performance.households_100_days IS 'Number of households that completed 100 days of employment';
COMMENT ON COLUMN monthly_performance.average_wage_rate IS 'Average wage rate per day per person in rupees';
COMMENT ON COLUMN monthly_performance.total_works_completed IS 'Total number of works completed';
COMMENT ON COLUMN monthly_performance.total_works_ongoing IS 'Total number of works ongoing';
COMMENT ON COLUMN monthly_performance.agriculture_works_percent IS 'Percentage of expenditure on agriculture and allied works';
COMMENT ON COLUMN monthly_performance.nrm_expenditure_percent IS 'Percentage of expenditure on Natural Resource Management';
COMMENT ON COLUMN monthly_performance.category_b_works_percent IS 'Percentage of Category B (individual beneficiary) works';
