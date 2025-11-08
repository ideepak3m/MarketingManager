-- =====================================================
-- Add campaign_id to social_comments for archival
-- =====================================================

-- Add campaign_id column
ALTER TABLE social_comments 
ADD COLUMN campaign_id UUID;

-- Add foreign key constraint
ALTER TABLE social_comments
ADD CONSTRAINT social_comments_campaign_id_fkey 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

-- Add index for fast campaign lookups
CREATE INDEX idx_social_comments_campaign ON social_comments(campaign_id);

-- Backfill existing data (if any)
UPDATE social_comments sc
SET campaign_id = (
    SELECT cp.campaign_id 
    FROM campaign_post_platforms cpp
    INNER JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
    WHERE cpp.id = sc.campaign_post_platform_id
)
WHERE sc.campaign_id IS NULL 
  AND sc.campaign_post_platform_id IS NOT NULL;
