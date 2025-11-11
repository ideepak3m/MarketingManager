-- Find which user_ids have campaign data
SELECT 
    c.user_id,
    COUNT(DISTINCT c.id) as campaign_count,
    COUNT(DISTINCT ph.id) as phase_count,
    COUNT(DISTINCT cp.id) as post_count,
    COUNT(DISTINCT cpp.id) as platform_post_count
FROM campaigns c
LEFT JOIN campaign_phases ph ON ph.campaign_id = c.id
LEFT JOIN campaign_posts cp ON cp.campaign_phase_id = ph.id
LEFT JOIN campaign_post_platforms cpp ON cpp.campaign_post_id = cp.id
GROUP BY c.user_id
ORDER BY campaign_count DESC;

-- Get user details for users with campaigns
SELECT DISTINCT 
    c.user_id,
    p.email,
    p.first_name,
    p.last_name
FROM campaigns c
LEFT JOIN profiles p ON p.id = c.user_id
LIMIT 10;

-- Get all session_ids that have campaigns
SELECT DISTINCT 
    c.session_id,
    c.user_id,
    COUNT(c.id) as campaign_count
FROM campaigns c
WHERE c.session_id IS NOT NULL
GROUP BY c.session_id, c.user_id
ORDER BY campaign_count DESC;
