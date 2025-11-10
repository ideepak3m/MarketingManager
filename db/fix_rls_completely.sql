-- COMPREHENSIVE RLS FIX FOR ANALYTICS
-- This will ensure social_comments can be read by the Supabase client

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('social_comments', 'campaign_post_platforms');

-- Step 2: Disable RLS entirely (simplest solution for analytics)
ALTER TABLE social_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_post_platforms DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify it's disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('social_comments', 'campaign_post_platforms');

-- Alternative Step 2 (if you want to keep RLS enabled but make it permissive):
-- First enable RLS if not enabled
-- ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
-- DROP POLICY IF EXISTS "Enable read access for all users" ON social_comments;
-- DROP POLICY IF EXISTS "Allow read" ON social_comments;

-- Create a fully permissive SELECT policy
-- CREATE POLICY "allow_all_select" ON social_comments
--     FOR SELECT
--     USING (true);

-- Verify the policy was created
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'social_comments';
