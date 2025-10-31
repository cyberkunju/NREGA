-- Fix Andaman & Nicobar Duplicates in Districts Table
-- Issue: Multiple entries with different state name formats causing query issues

-- Step 1: Check current duplicates
SELECT name, state, COUNT(*) as count
FROM districts
WHERE name IN ('Nicobars', 'South Andaman', 'North And Middle Andaman')
GROUP BY name, state
ORDER BY name, state;

-- Step 2: Keep only the "Andaman And Nicobar" format (with "And")
-- Delete the "Andaman & Nicobar" format (with "&")
DELETE FROM districts
WHERE (name = 'Nicobars' OR name = 'South Andaman')
  AND state = 'Andaman & Nicobar';

-- Step 3: Verify cleanup
SELECT name, state, COUNT(*) as count
FROM districts
WHERE name IN ('Nicobars', 'South Andaman', 'North And Middle Andaman')
GROUP BY name, state
ORDER BY name, state;

-- Step 4: Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_districts_unique_name 
ON districts(name);
