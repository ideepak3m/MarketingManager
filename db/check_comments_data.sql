-- Check if social_comments has data
SELECT COUNT(*) as total_comments FROM social_comments;

-- Check sample comments
SELECT 
    id,
    text,
    campaign_post_platform_id,
    replied
FROM social_comments
LIMIT 10;

-- Check which campaign posts have comments
SELECT 
    cpp.platform,
    c.name as campaign_name,
    COUNT(sc.id) as comment_count
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id
JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
JOIN campaign_phases cph ON cp.campaign_phase_id = cph.id
JOIN campaigns c ON cph.campaign_id = c.id
WHERE c.status IN ('active', 'completed')
GROUP BY cpp.platform, c.name
ORDER BY comment_count DESC;
