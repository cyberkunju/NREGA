-- Migration: Add social inclusion columns to monthly_performance table
-- Date: 2025-11-01
-- Purpose: Enable women participation and SC/ST metrics calculation

-- Add women participation columns
ALTER TABLE monthly_performance 
ADD COLUMN IF NOT EXISTS women_persondays BIGINT,
ADD COLUMN IF NOT EXISTS persondays_of_central_liability BIGINT;

-- Add SC/ST participation columns
ALTER TABLE monthly_performance 
ADD COLUMN IF NOT EXISTS sc_persondays BIGINT,
ADD COLUMN IF NOT EXISTS st_persondays BIGINT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'monthly_performance' 
ORDER BY ordinal_position;
