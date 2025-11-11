-- COMPREHENSIVE RLS FIX FOR ALL CAMPAIGN TABLES
-- This fixes RLS to work with the session_id architecture where:
-- profiles.id → nova_user_sessions.user_id → nova_user_sessions.session_id → campaigns.user_id

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Already has RLS, just verify it works
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'profiles';

-- ============================================
-- 2. NOVA_USER_SESSIONS TABLE  
-- ============================================
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'nova_user_sessions';

-- ============================================
-- 3. CAMPAIGNS TABLE (ALREADY FIXED)
-- ============================================
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'campaigns';

-- ============================================
-- 4. CAMPAIGN_PHASES TABLE (ALREADY FIXED)
-- ============================================
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'campaign_phases';

-- ============================================
-- 5. CAMPAIGN_POSTS TABLE (ALREADY FIXED)
-- ============================================
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'campaign_posts';

-- ============================================
-- 6. CAMPAIGN_POST_PLATFORMS TABLE - FIX THIS
-- ============================================

-- Check current state
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'campaign_post_platforms';
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'campaign_post_platforms';

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own campaign post platforms" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can create own campaign post platforms" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can update own campaign post platforms" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can delete own campaign post platforms" ON campaign_post_platforms;

-- Create new policies
CREATE POLICY "campaign_post_platforms_select_policy" ON campaign_post_platforms
FOR SELECT
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

-- ============================================
-- 7. VERIFY ALL POLICIES
-- ============================================
SELECT 
    tablename, 
    policyname, 
    cmd 
FROM pg_policies 
WHERE tablename IN (
    'campaigns', 
    'campaign_phases', 
    'campaign_posts', 
    'campaign_post_platforms'
)
ORDER BY tablename, cmd, policyname;
