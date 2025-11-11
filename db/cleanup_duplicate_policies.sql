-- Clean up duplicate RLS policies
-- Remove old policies that don't support admin access

-- ============================================
-- CAMPAIGN_PHASES - Remove old duplicate policies
-- ============================================
DROP POLICY IF EXISTS "Users can delete own campaign_phases" ON campaign_phases;
DROP POLICY IF EXISTS "campaign_phases_insert_by_id" ON campaign_phases;
DROP POLICY IF EXISTS "Users can view own campaign_phases" ON campaign_phases;
DROP POLICY IF EXISTS "campaign_phases_update_by_id" ON campaign_phases;

-- ============================================
-- CAMPAIGN_POST_PLATFORMS - Remove old duplicate policies
-- ============================================
DROP POLICY IF EXISTS "Users can delete own platform posts" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can insert own platform posts" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can view own platform posts" ON campaign_post_platforms;
DROP POLICY IF EXISTS "Users can update own platform posts" ON campaign_post_platforms;

-- ============================================
-- CAMPAIGN_POSTS - Remove old duplicate policies
-- ============================================
DROP POLICY IF EXISTS "Users can delete own posts" ON campaign_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON campaign_posts;
DROP POLICY IF EXISTS "Users can view own posts" ON campaign_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON campaign_posts;

-- ============================================
-- CAMPAIGNS - Remove old duplicate policies
-- ============================================
DROP POLICY IF EXISTS "campaigns_insert_by_id" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_by_id" ON campaigns;

-- ============================================
-- VERIFY - Should only have the new *_policy policies
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
