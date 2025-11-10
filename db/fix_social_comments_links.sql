-- Fix social_comments to link to campaign_post_platforms correctly
-- This updates the campaign_post_platform_id based on matching post_id and platform

-- First, let's see the mismatch
SELECT 
    'Before Update' as status,
    COUNT(*) as total_comments,
    COUNT(DISTINCT sc.campaign_post_platform_id) as distinct_platform_ids_in_comments,
    COUNT(DISTINCT cpp.id) as distinct_platform_ids_in_table
FROM social_comments sc
LEFT JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id;

-- Update social_comments to use the correct campaign_post_platform_id
-- Match by campaign_post_id (assuming post_id in social_comments refers to campaign_post_id)
UPDATE social_comments sc
SET campaign_post_platform_id = cpp.id
FROM campaign_post_platforms cpp
WHERE sc.campaign_post_platform_id = cpp.campaign_post_id 
AND sc.platform = cpp.platform;

-- Verify the update
SELECT 
    'After Update' as status,
    COUNT(*) as total_comments,
    COUNT(sc.campaign_post_platform_id) as comments_with_platform_id,
    COUNT(*) - COUNT(sc.campaign_post_platform_id) as comments_without_platform_id
FROM social_comments sc;

-- Show sample matched comments
SELECT 
    sc.text,
    sc.platform,
    cpp.id as platform_id,
    c.name as campaign_name
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id
JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
JOIN campaign_phases cph ON cp.campaign_phase_id = cph.id
JOIN campaigns c ON cph.campaign_id = c.id
WHERE c.status IN ('active', 'completed')
LIMIT 10;
