-- Quick check for Analytics-related tables
-- Run this to see if columns exist

-- Check campaign_post_platforms columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'campaign_post_platforms'
ORDER BY ordinal_position;

-- Check if data exists
SELECT COUNT(*) as total_rows FROM campaign_post_platforms;

-- Sample one row to see actual column names
SELECT * FROM campaign_post_platforms LIMIT 1;
