-- Populate Engagement Metrics for Demo Data
-- This script adds realistic engagement metrics to campaign_post_platforms

-- Update campaign_post_platforms with fake engagement metrics
UPDATE campaign_post_platforms
SET
    likes_count = FLOOR(50 + RANDOM() * 450)::INTEGER,  -- 50-500 likes
    comments_count = FLOOR(5 + RANDOM() * 45)::INTEGER,  -- 5-50 comments (from social_comments table)
    shares_count = FLOOR(10 + RANDOM() * 90)::INTEGER,   -- 10-100 shares
    views_count = FLOOR(500 + RANDOM() * 4500)::INTEGER, -- 500-5000 views
    reach = FLOOR(1000 + RANDOM() * 9000)::INTEGER,      -- 1000-10000 reach
    impressions = FLOOR(2000 + RANDOM() * 18000)::INTEGER, -- 2000-20000 impressions
    replied_comments_count = (
        SELECT COUNT(*)
        FROM social_comments sc
        WHERE sc.campaign_post_platform_id = campaign_post_platforms.id
        AND sc.replied = true
    )
WHERE EXISTS (
    SELECT 1 FROM campaign_posts cp
    JOIN campaign_phases cph ON cp.campaign_phase_id = cph.id
    JOIN campaigns c ON cph.campaign_id = c.id
    WHERE cp.id = campaign_post_platforms.campaign_post_id
    AND c.status IN ('active', 'completed')
);

-- Calculate engagement_rate: (likes + comments + shares) / impressions * 100
UPDATE campaign_post_platforms
SET engagement_rate = ROUND(
    ((likes_count + comments_count + shares_count)::NUMERIC / NULLIF(impressions, 0)::NUMERIC) * 100,
    2
)
WHERE impressions > 0;

-- Calculate response_rate: replied_comments / comments_count * 100
UPDATE campaign_post_platforms
SET response_rate = ROUND(
    (replied_comments_count::NUMERIC / NULLIF(comments_count, 0)::NUMERIC) * 100,
    2
)
WHERE comments_count > 0;

-- Set metrics_captured_at timestamp
UPDATE campaign_post_platforms
SET metrics_captured_at = NOW()
WHERE likes_count IS NOT NULL;

-- Verify results
SELECT
    cpp.platform,
    COUNT(*) as post_count,
    ROUND(AVG(cpp.likes_count), 0) as avg_likes,
    ROUND(AVG(cpp.comments_count), 0) as avg_comments,
    ROUND(AVG(cpp.shares_count), 0) as avg_shares,
    ROUND(AVG(cpp.reach), 0) as avg_reach,
    ROUND(AVG(cpp.engagement_rate), 2) as avg_engagement_rate,
    ROUND(AVG(cpp.response_rate), 2) as avg_response_rate
FROM campaign_post_platforms cpp
JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
JOIN campaign_phases cph ON cp.campaign_phase_id = cph.id
JOIN campaigns c ON cph.campaign_id = c.id
WHERE c.status IN ('active', 'completed')
GROUP BY cpp.platform
ORDER BY avg_engagement_rate DESC;
