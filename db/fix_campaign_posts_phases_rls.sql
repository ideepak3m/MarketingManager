-- Fix RLS policies for campaign_posts and campaign_phases tables
-- These also need to understand the session_id architecture

-- ============================================
-- FIX campaign_phases RLS
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own campaign phases" ON campaign_phases;
DROP POLICY IF EXISTS "Users can create own campaign phases" ON campaign_phases;
DROP POLICY IF EXISTS "Users can update own campaign phases" ON campaign_phases;
DROP POLICY IF EXISTS "Users can delete own campaign phases" ON campaign_phases;

-- SELECT: Users can see phases for their campaigns OR admins see all
CREATE POLICY "campaign_phases_select_policy" ON campaign_phases
FOR SELECT
TO authenticated
USING (
    -- User's campaign phases (via campaign ownership)
    campaign_id IN (
        SELECT id FROM campaigns
        WHERE user_id IN (
            SELECT session_id 
            FROM nova_user_sessions 
            WHERE user_id = auth.uid()
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

-- INSERT: Users can create phases for their campaigns OR admins
CREATE POLICY "campaign_phases_insert_policy" ON campaign_phases
FOR INSERT
TO authenticated
WITH CHECK (
    campaign_id IN (
        SELECT id FROM campaigns
        WHERE user_id IN (
            SELECT session_id 
            FROM nova_user_sessions 
            WHERE user_id = auth.uid()
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

-- UPDATE: Users can update their own campaign phases OR admins
CREATE POLICY "campaign_phases_update_policy" ON campaign_phases
FOR UPDATE
TO authenticated
USING (
    campaign_id IN (
        SELECT id FROM campaigns
        WHERE user_id IN (
            SELECT session_id 
            FROM nova_user_sessions 
            WHERE user_id = auth.uid()
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

-- DELETE: Users can delete their own campaign phases OR admins
CREATE POLICY "campaign_phases_delete_policy" ON campaign_phases
FOR DELETE
TO authenticated
USING (
    campaign_id IN (
        SELECT id FROM campaigns
        WHERE user_id IN (
            SELECT session_id 
            FROM nova_user_sessions 
            WHERE user_id = auth.uid()
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

-- ============================================
-- FIX campaign_posts RLS
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own campaign posts" ON campaign_posts;
DROP POLICY IF EXISTS "Users can create own campaign posts" ON campaign_posts;
DROP POLICY IF EXISTS "Users can update own campaign posts" ON campaign_posts;
DROP POLICY IF EXISTS "Users can delete own campaign posts" ON campaign_posts;

-- SELECT: Users can see posts for their campaigns OR admins see all
CREATE POLICY "campaign_posts_select_policy" ON campaign_posts
FOR SELECT
TO authenticated
USING (
    -- User's campaign posts (via campaign ownership)
    campaign_id IN (
        SELECT id FROM campaigns
        WHERE user_id IN (
            SELECT session_id 
            FROM nova_user_sessions 
            WHERE user_id = auth.uid()
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

-- INSERT: Users can create posts for their campaigns OR admins
CREATE POLICY "campaign_posts_insert_policy" ON campaign_posts
FOR INSERT
TO authenticated
WITH CHECK (
    campaign_id IN (
        SELECT id FROM campaigns
        WHERE user_id IN (
            SELECT session_id 
            FROM nova_user_sessions 
            WHERE user_id = auth.uid()
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

-- UPDATE: Users can update their own campaign posts OR admins
CREATE POLICY "campaign_posts_update_policy" ON campaign_posts
FOR UPDATE
TO authenticated
USING (
    campaign_id IN (
        SELECT id FROM campaigns
        WHERE user_id IN (
            SELECT session_id 
            FROM nova_user_sessions 
            WHERE user_id = auth.uid()
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

-- DELETE: Users can delete their own campaign posts OR admins
CREATE POLICY "campaign_posts_delete_policy" ON campaign_posts
FOR DELETE
TO authenticated
USING (
    campaign_id IN (
        SELECT id FROM campaigns
        WHERE user_id IN (
            SELECT session_id 
            FROM nova_user_sessions 
            WHERE user_id = auth.uid()
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

-- Verify all policies are created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('campaign_phases', 'campaign_posts')
ORDER BY tablename, policyname;
