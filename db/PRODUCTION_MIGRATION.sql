-- =====================================================
-- PRODUCTION DATABASE MIGRATION SCRIPT
-- Run this in your NEW Supabase Production Project
-- =====================================================

-- IMPORTANT: Run these scripts in order!
-- This creates the complete database schema for MarketingManager

-- =====================================================
-- TABLE 1: profiles (User profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- TABLE 2: nova_user_sessions (Session tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS nova_user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nova_sessions_user_id ON nova_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_sessions_session_id ON nova_user_sessions(session_id);

-- Enable RLS
ALTER TABLE nova_user_sessions ENABLE ROW LEVEL SECURITY;

-- Session policies
CREATE POLICY "Users can view own sessions" ON nova_user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON nova_user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE 3: campaigns (Marketing campaigns)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT REFERENCES nova_user_sessions(session_id),
    name TEXT NOT NULL,
    description TEXT,
    goals JSONB,
    target_audience TEXT,
    budget DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft',
    number_of_phases INTEGER DEFAULT 3,
    platforms TEXT[],
    created_by_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_number_of_phases ON campaigns(number_of_phases);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by_ai ON campaigns(created_by_ai);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Campaign policies
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 4: campaign_phases (Campaign phases)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    phase_order INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft',
    objectives JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, phase_order)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_phases_campaign_id ON campaign_phases(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_phases_user_id ON campaign_phases(user_id);

-- Enable RLS
ALTER TABLE campaign_phases ENABLE ROW LEVEL SECURITY;

-- Phase policies
CREATE POLICY "Users can view own campaign phases" ON campaign_phases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaign phases" ON campaign_phases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign phases" ON campaign_phases
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign phases" ON campaign_phases
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 5: campaign_posts (Campaign posts)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    campaign_phase_id UUID REFERENCES campaign_phases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_number INTEGER,
    content_text TEXT,
    media_urls TEXT[],
    asset_type TEXT DEFAULT 'image',
    scheduled_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_phase_id, scheduled_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_posts_campaign ON campaign_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_phase ON campaign_posts(campaign_phase_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_user ON campaign_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_scheduled ON campaign_posts(scheduled_time);

-- Enable RLS
ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;

-- Post policies
CREATE POLICY "Users can view own campaign posts" ON campaign_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaign posts" ON campaign_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign posts" ON campaign_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign posts" ON campaign_posts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 6: campaign_post_platforms (Platform-specific post data)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_post_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_post_id UUID REFERENCES campaign_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    platform_caption TEXT,
    hashtags JSONB,
    status TEXT DEFAULT 'pending',
    platform_post_id TEXT,
    platform_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    -- Engagement metrics columns
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    response_rate DECIMAL(5,2) DEFAULT 0.00,
    replied_comments_count INTEGER DEFAULT 0,
    metrics_captured_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_post_id, platform)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_platforms_post ON campaign_post_platforms(campaign_post_id);
CREATE INDEX IF NOT EXISTS idx_post_platforms_user ON campaign_post_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_post_platforms_platform ON campaign_post_platforms(platform);
CREATE INDEX IF NOT EXISTS idx_post_platforms_status ON campaign_post_platforms(status);

-- Disable RLS for analytics queries (or create permissive policies)
ALTER TABLE campaign_post_platforms DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE 7: social_comments (Comments from social platforms)
-- =====================================================
CREATE TABLE IF NOT EXISTS social_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_post_platform_id UUID REFERENCES campaign_post_platforms(id) ON DELETE CASCADE,
    comment_id TEXT UNIQUE NOT NULL,
    post_id TEXT,
    platform TEXT NOT NULL,
    author_name TEXT,
    author_username TEXT,
    author_profile_url TEXT,
    text TEXT,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE,
    replied BOOLEAN DEFAULT false,
    parent_comment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_campaign_post ON social_comments(campaign_post_platform_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_platform ON social_comments(post_id, platform);
CREATE INDEX IF NOT EXISTS idx_comments_replied ON social_comments(replied) WHERE replied = false;

-- Disable RLS for analytics queries
ALTER TABLE social_comments DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE 8: content (Content library)
-- =====================================================
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT,
    media_url TEXT,
    platforms TEXT[],
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_user_id ON content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_campaign_id ON content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_date ON content(scheduled_date);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Content policies
CREATE POLICY "Users can view own content" ON content
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content" ON content
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content" ON content
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content" ON content
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 9: posts (Legacy posts table - optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    post_text TEXT,
    media_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    platform_post_id TEXT,
    engagement_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_content_id ON posts(content_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Post policies
CREATE POLICY "Users can view own posts" ON posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 10: social_metrics (Platform metrics)
-- =====================================================
CREATE TABLE IF NOT EXISTS social_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    metric_date DATE NOT NULL,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform, metric_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_metrics_user_platform_date ON social_metrics(user_id, platform, metric_date);
CREATE INDEX IF NOT EXISTS idx_social_metrics_date ON social_metrics(metric_date);

-- Enable RLS
ALTER TABLE social_metrics ENABLE ROW LEVEL SECURITY;

-- Metrics policies
CREATE POLICY "Users can view own metrics" ON social_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own metrics" ON social_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON social_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 11: campaign_reports (PDF reports)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type TEXT DEFAULT 'standard',
    file_name TEXT,
    file_url TEXT,
    file_size INTEGER,
    pdf_status TEXT DEFAULT 'pending',
    error_message TEXT,
    generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_reports_campaign_id ON campaign_reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_reports_user_id ON campaign_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_reports_pdf_status ON campaign_reports(pdf_status);

-- Enable RLS
ALTER TABLE campaign_reports ENABLE ROW LEVEL SECURITY;

-- Report policies
CREATE POLICY "Users can view own reports" ON campaign_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports" ON campaign_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_phases_updated_at BEFORE UPDATE ON campaign_phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_posts_updated_at BEFORE UPDATE ON campaign_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_post_platforms_updated_at BEFORE UPDATE ON campaign_post_platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_comments_updated_at BEFORE UPDATE ON social_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_metrics_updated_at BEFORE UPDATE ON social_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_reports_updated_at BEFORE UPDATE ON campaign_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled where needed
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Count policies
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- SUCCESS!
-- Your production database schema is now complete.
-- Next steps:
-- 1. Update .env.production with your new Supabase credentials
-- 2. Test authentication signup/login
-- 3. Test creating a campaign
-- 4. Deploy your production app
