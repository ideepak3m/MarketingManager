-- Social Media Marketing Manager Database Setup
-- Run these SQL commands in your Supabase SQL Editor

-- Enable RLS (Row Level Security) for all tables
-- This ensures users can only access their own data

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('awareness', 'engagement', 'conversion', 'retention')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Dates and scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Budget and targeting
  budget DECIMAL(10,2) DEFAULT 0,
  target_audience JSONB,
  
  -- Goals and KPIs
  goals JSONB,
  target_metrics JSONB,
  
  -- Social platforms
  platforms TEXT[] DEFAULT '{}',
  
  -- Performance metrics
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "Users can manage own campaigns" ON campaigns 
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- CAMPAIGN PHASES TABLE
-- =============================================
CREATE TABLE campaign_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  phase_order INTEGER NOT NULL,
  
  -- Timeline
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  
  -- Phase-specific goals
  goals JSONB,
  target_metrics JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campaign_phases ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign phases
CREATE POLICY "Users can manage own campaign phases" ON campaign_phases 
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- CONTENT TABLE
-- =============================================
CREATE TABLE content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  campaign_phase_id UUID REFERENCES campaign_phases(id) ON DELETE SET NULL,
  
  -- Content details
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'story', 'reel', 'video', 'image', 'carousel', 'ad')),
  
  -- Content data
  text_content TEXT,
  media_urls TEXT[],
  hashtags TEXT[],
  mentions TEXT[],
  
  -- Platform-specific content
  platform_content JSONB, -- Different content for different platforms
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  
  -- Platforms
  platforms TEXT[] NOT NULL,
  
  -- Performance metrics
  metrics JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Create policies for content
CREATE POLICY "Users can manage own content" ON content 
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SOCIAL METRICS TABLE
-- =============================================
CREATE TABLE social_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Platform and date
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin')),
  metric_date DATE NOT NULL,
  
  -- Follower metrics
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  -- Reach and impressions
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  -- Click metrics
  profile_visits INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  
  -- Story metrics (for platforms that support it)
  story_views INTEGER DEFAULT 0,
  story_replies INTEGER DEFAULT 0,
  
  -- Video metrics
  video_views INTEGER DEFAULT 0,
  video_completion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Additional platform-specific metrics
  additional_metrics JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per platform per date per user
  UNIQUE(user_id, platform, metric_date)
);

-- Enable RLS
ALTER TABLE social_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for social metrics
CREATE POLICY "Users can manage own social metrics" ON social_metrics 
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- POSTS TABLE (Published content tracking)
-- =============================================
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Platform and post details
  platform TEXT NOT NULL,
  platform_post_id TEXT, -- ID from the actual platform
  post_url TEXT,
  
  -- Performance metrics
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Engagement rate calculation
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Additional metrics
  metrics JSONB,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Users can manage own posts" ON posts 
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_phases_updated_at BEFORE UPDATE ON campaign_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_metrics_updated_at BEFORE UPDATE ON social_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Campaigns indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Campaign phases indexes
CREATE INDEX idx_campaign_phases_campaign_id ON campaign_phases(campaign_id);
CREATE INDEX idx_campaign_phases_user_id ON campaign_phases(user_id);

-- Content indexes
CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_campaign_id ON content(campaign_id);
CREATE INDEX idx_content_scheduled_date ON content(scheduled_date);
CREATE INDEX idx_content_status ON content(status);

-- Social metrics indexes
CREATE INDEX idx_social_metrics_user_platform_date ON social_metrics(user_id, platform, metric_date);
CREATE INDEX idx_social_metrics_date ON social_metrics(metric_date);

-- Posts indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_content_id ON posts(content_id);
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_posts_published_at ON posts(published_at);