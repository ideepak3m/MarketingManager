-- =====================================================
-- Add engagement metrics to campaign_post_platforms
-- =====================================================
-- These will be populated when campaign closes for archival

ALTER TABLE campaign_post_platforms 
ADD COLUMN likes_count INTEGER DEFAULT 0,
ADD COLUMN comments_count INTEGER DEFAULT 0,
ADD COLUMN shares_count INTEGER DEFAULT 0,
ADD COLUMN views_count INTEGER DEFAULT 0,
ADD COLUMN reach INTEGER DEFAULT 0,
ADD COLUMN impressions INTEGER DEFAULT 0,
ADD COLUMN engagement_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN replied_comments_count INTEGER DEFAULT 0,
ADD COLUMN response_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN metrics_captured_at TIMESTAMP WITH TIME ZONE;

-- Add comment to indicate these are final/archived metrics
COMMENT ON COLUMN campaign_post_platforms.metrics_captured_at IS 
'Timestamp when final metrics were captured during campaign closure';
