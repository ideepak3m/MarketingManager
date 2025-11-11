-- Fix RLS for campaign_post_platforms table
-- This table links posts to social media platforms

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaign_post_platforms';

-- If RLS is enabled, we need policies
-- If RLS is disabled, we can skip this

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own campaign post platforms" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can create own campaign post platforms" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can update own campaign post platforms" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can delete own campaign post platforms" ON campaign_post_platforms;

-- Option 1: If RLS is enabled, create policies
CREATE POLICY "campaign_post_platforms_select_policy" ON campaign_post_platforms
FOR SELECT
TO authenticated
USING (
    -- User's campaign post platforms (via campaign ownership)
    campaign_post_id IN (
        SELECT id FROM campaign_posts
        WHERE campaign_id IN (
            SELECT id FROM campaigns
            WHERE user_id IN (
                SELECT session_id 
                FROM nova_user_sessions 
                WHERE user_id = auth.uid()
            )
        )
    )
    OR
    -- Admin can see all
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

CREATE POLICY "campaign_post_platforms_insert_policy" ON campaign_post_platforms
FOR INSERT
TO authenticated
WITH CHECK (
    campaign_post_id IN (
        SELECT id FROM campaign_posts
        WHERE campaign_id IN (
            SELECT id FROM campaigns
            WHERE user_id IN (
                SELECT session_id 
                FROM nova_user_sessions 
                WHERE user_id = auth.uid()
            )
        )
    )
    OR
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

CREATE POLICY "campaign_post_platforms_update_policy" ON campaign_post_platforms
FOR UPDATE
TO authenticated
USING (
    campaign_post_id IN (
        SELECT id FROM campaign_posts
        WHERE campaign_id IN (
            SELECT id FROM campaigns
            WHERE user_id IN (
                SELECT session_id 
                FROM nova_user_sessions 
                WHERE user_id = auth.uid()
            )
        )
    )
    OR
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

CREATE POLICY "campaign_post_platforms_delete_policy" ON campaign_post_platforms
FOR DELETE
TO authenticated
USING (
    campaign_post_id IN (
        SELECT id FROM campaign_posts
        WHERE campaign_id IN (
            SELECT id FROM campaigns
            WHERE user_id IN (
                SELECT session_id 
                FROM nova_user_sessions 
                WHERE user_id = auth.uid()
            )
        )
    )
    OR
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Option 2: Or simply disable RLS on this table (if it's for analytics)
-- ALTER TABLE campaign_post_platforms DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'campaign_post_platforms';
