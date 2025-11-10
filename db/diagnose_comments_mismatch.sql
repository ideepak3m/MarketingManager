-- Check the mismatch between social_comments and campaign_post_platforms

-- 1. Check if campaign_post_platform_id exists and has values
SELECT 
    COUNT(*) as total_comments,
    COUNT(campaign_post_platform_id) as comments_with_platform_id,
    COUNT(*) - COUNT(campaign_post_platform_id) as comments_without_platform_id
FROM social_comments;

-- 2. Sample social_comments to see the IDs
SELECT 
    id,
    text,
    campaign_post_platform_id,
    post_id,
    platform
FROM social_comments
LIMIT 5;

-- 3. Check if any platform IDs from active campaigns exist in comments
SELECT 
    cpp.id as platform_id,
    cpp.platform,
    c.name as campaign_name,
    COUNT(sc.id) as comment_count
FROM campaign_post_platforms cpp
JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
JOIN campaign_phases cph ON cp.campaign_phase_id = cph.id
JOIN campaigns c ON cph.campaign_id = c.id
LEFT JOIN social_comments sc ON sc.campaign_post_platform_id = cpp.id
WHERE c.status IN ('active', 'completed')
GROUP BY cpp.id, cpp.platform, c.name
HAVING COUNT(sc.id) > 0
LIMIT 10;

-- 4. Try to match comments by post_id and platform instead
SELECT 
    sc.id as comment_id,
    sc.text,
    sc.post_id,
    sc.platform,
    cpp.id as correct_platform_id
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.post_id = cpp.campaign_post_id AND sc.platform = cpp.platform
LIMIT 10;
