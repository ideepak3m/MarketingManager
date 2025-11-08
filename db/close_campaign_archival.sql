-- =====================================================
-- Campaign Closure & Archival Process
-- =====================================================
-- Run this when closing a campaign to capture final metrics
-- Replace :campaign_id with actual campaign UUID

-- Step 1: Update campaign_post_platforms with aggregated metrics
UPDATE campaign_post_platforms cpp
SET 
    -- Comment metrics from social_comments
    comments_count = COALESCE(comment_stats.total_comments, 0),
    replied_comments_count = COALESCE(comment_stats.replied_comments, 0),
    response_rate = CASE 
        WHEN COALESCE(comment_stats.total_comments, 0) > 0 
        THEN ROUND((COALESCE(comment_stats.replied_comments, 0)::DECIMAL / comment_stats.total_comments) * 100, 2)
        ELSE 0 
    END,
    
    -- Platform metrics (likes, shares, views, reach, impressions)
    -- These should already be updated by your n8n workflow that fetches from platform APIs
    -- If not populated yet, they will remain as 0
    
    -- Calculate engagement rate if we have reach
    engagement_rate = CASE 
        WHEN cpp.reach > 0 
        THEN ROUND(((cpp.likes_count + cpp.comments_count + cpp.shares_count)::DECIMAL / cpp.reach) * 100, 2)
        ELSE 0 
    END,
    
    -- Mark when metrics were captured
    metrics_captured_at = NOW()
    
FROM (
    SELECT 
        sc.campaign_post_platform_id,
        COUNT(sc.id) as total_comments,
        COUNT(CASE WHEN sc.replied = true THEN 1 END) as replied_comments
    FROM social_comments sc
    WHERE sc.campaign_id = :campaign_id
    GROUP BY sc.campaign_post_platform_id
) comment_stats

WHERE cpp.id = comment_stats.campaign_post_platform_id
  AND cpp.campaign_post_id IN (
      SELECT id FROM campaign_posts WHERE campaign_id = :campaign_id
  );

-- Step 2: Export social_comments to CSV (run in your app or manually)
-- COPY (
--     SELECT * FROM social_comments 
--     WHERE campaign_id = :campaign_id
--     ORDER BY timestamp DESC
-- ) TO '/path/to/export/campaign_:campaign_id_comments.csv' WITH CSV HEADER;

-- Step 3: Update campaign status to closed
UPDATE campaigns 
SET status = 'completed',
    end_date = NOW()
WHERE id = :campaign_id;

-- Step 4: (Optional) Archive/delete old comments after export
-- Uncomment below if you want to remove comments after archival
-- DELETE FROM social_comments WHERE campaign_id = :campaign_id;

-- Verification Query: Check captured metrics
SELECT 
    c.name as campaign_name,
    cp.scheduled_time,
    cpp.platform,
    cpp.status,
    cpp.comments_count,
    cpp.replied_comments_count,
    cpp.response_rate,
    cpp.likes_count,
    cpp.shares_count,
    cpp.views_count,
    cpp.reach,
    cpp.engagement_rate,
    cpp.metrics_captured_at
FROM campaign_post_platforms cpp
INNER JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
INNER JOIN campaigns c ON cp.campaign_id = c.id
WHERE c.id = :campaign_id
ORDER BY cp.scheduled_time, cpp.platform;
