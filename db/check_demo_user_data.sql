-- Check if demo user has data
-- Demo User ID: d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

-- 1. Check if user exists in profiles
SELECT 'Profile Check' as check_type, COUNT(*) as count
FROM profiles 
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 2. Check sessions for demo user
SELECT 'Sessions Check' as check_type, session_id, created_at
FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 3. Check campaigns for demo user (by user_id)
SELECT 'Campaigns by user_id' as check_type, id, name, status, session_id
FROM campaigns 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
ORDER BY created_at DESC;

-- 4. Get all session_ids for demo user
WITH demo_sessions AS (
    SELECT session_id 
    FROM nova_user_sessions 
    WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
)
SELECT 'Campaigns by session_id' as check_type, c.id, c.name, c.status, c.session_id
FROM campaigns c
WHERE c.session_id IN (SELECT session_id FROM demo_sessions)
ORDER BY c.created_at DESC;

-- 5. Count posts for demo user campaigns
WITH demo_campaigns AS (
    SELECT id 
    FROM campaigns 
    WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
)
SELECT 
    'Posts Count' as check_type,
    COUNT(DISTINCT cp.id) as total_posts,
    COUNT(DISTINCT cpp.id) as total_platform_posts
FROM campaign_posts cp
LEFT JOIN campaign_post_platforms cpp ON cpp.campaign_post_id = cp.id
WHERE cp.campaign_id IN (SELECT id FROM demo_campaigns);

-- 6. Get detailed view of ALL data for demo user
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.status,
    c.session_id,
    ph.name as phase_name,
    cp.id as post_id,
    cpp.platform,
    cpp.likes_count,
    cpp.comments_count
FROM campaigns c
LEFT JOIN campaign_phases ph ON ph.campaign_id = c.id
LEFT JOIN campaign_posts cp ON cp.campaign_phase_id = ph.id
LEFT JOIN campaign_post_platforms cpp ON cpp.campaign_post_id = cp.id
WHERE c.user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
ORDER BY c.created_at DESC, ph.phase_order, cp.scheduled_time;
