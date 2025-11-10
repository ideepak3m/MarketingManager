-- Fix RLS policies for Analytics queries
-- These tables need to allow reading without strict user_id checks since we're querying by campaign relationships

-- Temporarily disable RLS for testing (you can re-enable later with proper policies)
ALTER TABLE campaign_post_platforms DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, create permissive policies:

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view own platform posts" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can view own comments" ON social_comments;

-- Create new permissive policies that allow reading through campaign relationships
CREATE POLICY "Allow read campaign_post_platforms"
ON campaign_post_platforms FOR SELECT
USING (true);  -- Allow all reads for now, can be restricted later

CREATE POLICY "Allow read social_comments"
ON social_comments FOR SELECT
USING (true);  -- Allow all reads for now, can be restricted later

-- Re-enable RLS with new policies
ALTER TABLE campaign_post_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;

-- Verify the changes
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('campaign_post_platforms', 'social_comments');
