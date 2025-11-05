-- =====================================================
-- FIX: Drop OLD campaign_posts table and recreate with NEW schema
-- =====================================================
-- This removes the old table with 'platform' and 'status' columns
-- and creates the new normalized structure
-- =====================================================

-- Drop old tables (this will cascade to dependent tables)
DROP TABLE IF EXISTS campaign_post_platforms CASCADE;
DROP TABLE IF EXISTS campaign_posts CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: campaign_posts (NEW SCHEMA)
-- Core post information (platform-agnostic)
-- NO platform column, NO status column
-- =====================================================
CREATE TABLE public.campaign_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    campaign_phase_id UUID NOT NULL REFERENCES campaign_phases(id) ON DELETE CASCADE,
    
    -- Scheduling
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Asset information (common across all platforms)
    asset_url TEXT,              -- URL to uploaded media in Supabase Storage
    asset_name TEXT,             -- Original filename
    asset_type TEXT DEFAULT 'image', -- 'image', 'video', 'carousel', 'document'
    
    -- Base content (can be customized per platform in campaign_post_platforms)
    caption TEXT,                -- Default caption for all platforms
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One post per phase per scheduled time
    UNIQUE(campaign_phase_id, scheduled_time)
);

-- =====================================================
-- TABLE 2: campaign_post_platforms (NEW SCHEMA)
-- Platform-specific details (one-to-many with campaign_posts)
-- This is where platform and status live now
-- =====================================================
CREATE TABLE public.campaign_post_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_post_id UUID NOT NULL REFERENCES campaign_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    
    -- Platform identifier
    platform TEXT NOT NULL,      -- 'Facebook', 'Instagram', 'Pinterest', 'TikTok', 'LinkedIn', etc.
    
    -- Platform-specific content overrides (optional)
    platform_caption TEXT,       -- Override default caption for this platform
    hashtags TEXT[],             -- Platform-specific hashtags
    
    -- Publishing status and results
    status TEXT DEFAULT 'pending', -- 'pending', 'scheduled', 'published', 'failed'
    platform_post_id TEXT,       -- ID returned by platform API after publishing
    platform_url TEXT,           -- Direct URL to the published post
    published_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,          -- Error details if publishing failed
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One platform entry per post (prevents duplicate platform assignments)
    UNIQUE(campaign_post_id, platform)
);

-- =====================================================
-- Create Indexes
-- =====================================================
CREATE INDEX idx_campaign_posts_user ON campaign_posts(user_id);
CREATE INDEX idx_campaign_posts_campaign ON campaign_posts(campaign_id);
CREATE INDEX idx_campaign_posts_phase ON campaign_posts(campaign_phase_id);
CREATE INDEX idx_campaign_posts_scheduled ON campaign_posts(scheduled_time);

CREATE INDEX idx_post_platforms_post ON campaign_post_platforms(campaign_post_id);
CREATE INDEX idx_post_platforms_user ON campaign_post_platforms(user_id);
CREATE INDEX idx_post_platforms_platform ON campaign_post_platforms(platform);
CREATE INDEX idx_post_platforms_status ON campaign_post_platforms(status);

-- =====================================================
-- Enable Row Level Security
-- =====================================================
ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_post_platforms ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_posts
CREATE POLICY "Users can view own posts" 
    ON campaign_posts FOR SELECT 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own posts" 
    ON campaign_posts FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own posts" 
    ON campaign_posts FOR UPDATE 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own posts" 
    ON campaign_posts FOR DELETE 
    USING (auth.uid()::text = user_id);

-- Policies for campaign_post_platforms
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

-- =====================================================
-- Grant Permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON campaign_posts TO anon, authenticated;
GRANT ALL ON campaign_post_platforms TO anon, authenticated;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the schema is correct:
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'campaign_posts' 
ORDER BY ordinal_position;

-- Should NOT show 'platform' or 'status' columns
-- Should show: id, user_id, campaign_id, campaign_phase_id, scheduled_time, 
--              asset_url, asset_name, asset_type, caption, created_at, updated_at
