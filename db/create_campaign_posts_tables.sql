-- =====================================================
-- MULTI-PLATFORM CAMPAIGN POSTS SCHEMA
-- Created: 2025-11-04
-- Purpose: Support posting to multiple platforms per post
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: campaign_posts
-- Core post information (platform-agnostic)
-- One record per scheduled post slot
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    campaign_phase_id UUID NOT NULL REFERENCES campaign_phases(id) ON DELETE CASCADE,
    
    -- Scheduling
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Asset information
    asset_url TEXT,              -- URL to uploaded media in Supabase Storage
    asset_name TEXT,             -- Original filename
    asset_type TEXT,             -- 'image', 'video', 'carousel', 'document'
    
    -- Content (common across platforms)
    caption TEXT,                -- Main post text/caption
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint: one post per phase per scheduled time
    UNIQUE(campaign_phase_id, scheduled_time)
);

-- =====================================================
-- TABLE 2: campaign_post_platforms
-- Platform-specific details for each post
-- One-to-many relationship with campaign_posts
-- Multiple platforms per post
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_post_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_post_id UUID NOT NULL REFERENCES campaign_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    
    -- Platform details
    platform TEXT NOT NULL,      -- 'Facebook', 'Instagram', 'Pinterest', 'TikTok', etc.
    
    -- Platform-specific content
    platform_caption TEXT,       -- Platform-specific caption override (optional)
    hashtags TEXT[],             -- Platform-specific hashtags
    mentions TEXT[],             -- Platform-specific mentions/tags
    
    -- Publishing details
    status TEXT DEFAULT 'pending', -- 'pending', 'scheduled', 'published', 'failed', 'skipped'
    platform_post_id TEXT,       -- ID returned by platform API after publishing
    platform_url TEXT,           -- Direct URL to the published post
    
    -- Publishing results
    published_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,          -- Error details if publishing failed
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Platform-specific metadata
    metadata JSONB,              -- Store platform-specific data (location, product tags, etc.)
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint: one platform entry per post per platform
    UNIQUE(campaign_post_id, platform)
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

-- campaign_posts indexes
CREATE INDEX idx_campaign_posts_user ON campaign_posts(user_id);
CREATE INDEX idx_campaign_posts_campaign ON campaign_posts(campaign_id);
CREATE INDEX idx_campaign_posts_phase ON campaign_posts(campaign_phase_id);
CREATE INDEX idx_campaign_posts_scheduled ON campaign_posts(scheduled_time);
CREATE INDEX idx_campaign_posts_created ON campaign_posts(created_at);

-- campaign_post_platforms indexes
CREATE INDEX idx_post_platforms_campaign_post ON campaign_post_platforms(campaign_post_id);
CREATE INDEX idx_post_platforms_user ON campaign_post_platforms(user_id);
CREATE INDEX idx_post_platforms_platform ON campaign_post_platforms(platform);
CREATE INDEX idx_post_platforms_status ON campaign_post_platforms(status);
CREATE INDEX idx_post_platforms_published ON campaign_post_platforms(published_at);

-- Composite index for n8n workflow queries
CREATE INDEX idx_post_platforms_scheduled_status 
    ON campaign_post_platforms(status, published_at) 
    INCLUDE (platform, campaign_post_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_post_platforms ENABLE ROW LEVEL SECURITY;

-- campaign_posts policies
CREATE POLICY "Users can view own campaign posts" 
    ON campaign_posts FOR SELECT 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own campaign posts" 
    ON campaign_posts FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own campaign posts" 
    ON campaign_posts FOR UPDATE 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own campaign posts" 
    ON campaign_posts FOR DELETE 
    USING (auth.uid()::text = user_id);

-- campaign_post_platforms policies
CREATE POLICY "Users can view own platform posts" 
    ON campaign_post_platforms FOR SELECT 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own platform posts" 
    ON campaign_post_platforms FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own platform posts" 
    ON campaign_post_platforms FOR UPDATE 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own platform posts" 
    ON campaign_post_platforms FOR DELETE 
    USING (auth.uid()::text = user_id);

-- Service role policies (for n8n automation)
CREATE POLICY "Service role full access to posts" 
    ON campaign_posts FOR ALL 
    TO service_role 
    USING (true);

CREATE POLICY "Service role full access to platforms" 
    ON campaign_post_platforms FOR ALL 
    TO service_role 
    USING (true);

-- =====================================================
-- TRIGGERS for updated_at timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for campaign_posts
DROP TRIGGER IF EXISTS update_campaign_posts_updated_at ON campaign_posts;
CREATE TRIGGER update_campaign_posts_updated_at
    BEFORE UPDATE ON campaign_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for campaign_post_platforms
DROP TRIGGER IF EXISTS update_campaign_post_platforms_updated_at ON campaign_post_platforms;
CREATE TRIGGER update_campaign_post_platforms_updated_at
    BEFORE UPDATE ON campaign_post_platforms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON campaign_posts TO anon, authenticated;
GRANT ALL ON campaign_post_platforms TO anon, authenticated;

-- =====================================================
-- USEFUL QUERIES FOR REFERENCE
-- =====================================================

-- Query 1: Get all posts for a campaign with platform details
/*
SELECT 
    cp.id,
    cp.scheduled_time,
    cp.asset_name,
    cp.caption,
    array_agg(
        json_build_object(
            'platform', cpp.platform,
            'status', cpp.status,
            'hashtags', cpp.hashtags,
            'platform_post_id', cpp.platform_post_id
        )
    ) as platforms
FROM campaign_posts cp
LEFT JOIN campaign_post_platforms cpp ON cp.id = cpp.campaign_post_id
WHERE cp.campaign_id = 'YOUR_CAMPAIGN_ID'
GROUP BY cp.id, cp.scheduled_time, cp.asset_name, cp.caption
ORDER BY cp.scheduled_time;
*/

-- Query 2: Get posts ready to publish (for n8n workflow)
/*
SELECT 
    cp.id as post_id,
    cp.asset_url,
    cp.caption,
    cpp.id as platform_entry_id,
    cpp.platform,
    cpp.hashtags,
    cpp.platform_caption
FROM campaign_posts cp
INNER JOIN campaign_post_platforms cpp ON cp.id = cpp.campaign_post_id
WHERE cpp.status = 'pending'
  AND cp.scheduled_time <= NOW()
  AND cpp.retry_count < 3
ORDER BY cp.scheduled_time, cpp.platform;
*/

-- Query 3: Get platform statistics for a campaign
/*
SELECT 
    cpp.platform,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN cpp.status = 'published' THEN 1 END) as published,
    COUNT(CASE WHEN cpp.status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN cpp.status = 'failed' THEN 1 END) as failed
FROM campaign_post_platforms cpp
INNER JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
WHERE cp.campaign_id = 'YOUR_CAMPAIGN_ID'
GROUP BY cpp.platform;
*/
