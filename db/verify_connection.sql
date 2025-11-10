-- Run this in your SQL editor to get your database info
SELECT current_database() as database_name;

-- Check if you have multiple Supabase projects
-- Look at your Supabase dashboard URL - it should match the URL in your .env file

-- Example Supabase URL format:
-- https://YOUR_PROJECT_REF.supabase.co
-- Make sure YOUR_PROJECT_REF matches between SQL editor and app

-- To verify, check your campaigns table
SELECT id, name, status
FROM campaigns
WHERE name = 'Amazon Returns Sales Boost Campaign';

-- This should return the SAME campaign ID that's being used in the app
-- Check console: The selectedCampaign UUID should match this result
