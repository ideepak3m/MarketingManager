-- Verify platform IDs from console logs
-- Replace the UUIDs below with the actual values from your browser console

-- Check if these platform IDs exist in campaign_post_platforms
SELECT id, platform, campaign_post_id
FROM campaign_post_platforms
WHERE id IN (
    'PASTE_UUID_1_HERE',
    'PASTE_UUID_2_HERE',
    'PASTE_UUID_3_HERE',
    'PASTE_UUID_4_HERE',
    'PASTE_UUID_5_HERE'
);

-- Check if these platform IDs have comments
SELECT 
    sc.campaign_post_platform_id,
    cpp.platform,
    COUNT(*) as comment_count
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id
WHERE sc.campaign_post_platform_id IN (
    'PASTE_UUID_1_HERE',
    'PASTE_UUID_2_HERE',
    'PASTE_UUID_3_HERE',
    'PASTE_UUID_4_HERE',
    'PASTE_UUID_5_HERE'
)
GROUP BY sc.campaign_post_platform_id, cpp.platform;

-- Show ALL platform IDs that actually have comments for this campaign
SELECT 
    cpp.id as platform_id,
    cpp.platform,
    cp.campaign_id,
    c.name as campaign_name,
    COUNT(sc.id) as comment_count
FROM campaign_post_platforms cpp
JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
JOIN campaigns c ON cp.campaign_id = c.id
LEFT JOIN social_comments sc ON sc.campaign_post_platform_id = cpp.id
WHERE c.name = 'Amazon Returns Sales Boost Campaign'
GROUP BY cpp.id, cpp.platform, cp.campaign_id, c.name
HAVING COUNT(sc.id) > 0
ORDER BY comment_count DESC;
