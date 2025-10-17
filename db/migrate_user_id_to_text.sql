-- Migration Script: Change user_id from UUID to TEXT
-- This script handles RLS policies that prevent direct column type changes

-- Step 1: Drop all RLS policies that reference user_id columns
-- Drop existing policies (using actual policy names from error message)
DROP POLICY IF EXISTS "Users can manage own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaigns;

DROP POLICY IF EXISTS "Users can manage own campaign_phases" ON campaign_phases;
DROP POLICY IF EXISTS "Users can view own campaign_phases" ON campaign_phases;
DROP POLICY IF EXISTS "Users can insert own campaign_phases" ON campaign_phases;
DROP POLICY IF EXISTS "Users can update own campaign_phases" ON campaign_phases;
DROP POLICY IF EXISTS "Users can delete own campaign_phases" ON campaign_phases;

DROP POLICY IF EXISTS "Users can manage own campaign_reports" ON campaign_reports;
DROP POLICY IF EXISTS "Users can view own campaign_reports" ON campaign_reports;
DROP POLICY IF EXISTS "Users can insert own campaign_reports" ON campaign_reports;
DROP POLICY IF EXISTS "Users can update own campaign_reports" ON campaign_reports;
DROP POLICY IF EXISTS "Users can delete own campaign_reports" ON campaign_reports;

DROP POLICY IF EXISTS "Users can manage own content" ON content;
DROP POLICY IF EXISTS "Users can view own content" ON content;
DROP POLICY IF EXISTS "Users can insert own content" ON content;
DROP POLICY IF EXISTS "Users can update own content" ON content;
DROP POLICY IF EXISTS "Users can delete own content" ON content;

DROP POLICY IF EXISTS "Users can manage own posts" ON posts;
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Drop any other possible policy variations
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on tables that have user_id columns
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('campaigns', 'campaign_phases', 'campaign_reports', 'content', 'posts')
    )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
    END LOOP;
END $$;

-- Step 2: Drop foreign key constraints that reference user_id columns
-- These constraints link user_id (UUID) to profiles.id, but we're changing user_id to text (email)
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_user_id_fkey;
ALTER TABLE campaign_phases DROP CONSTRAINT IF EXISTS campaign_phases_user_id_fkey;
ALTER TABLE campaign_reports DROP CONSTRAINT IF EXISTS campaign_reports_user_id_fkey;
ALTER TABLE content DROP CONSTRAINT IF EXISTS content_user_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Step 3: Alter column types from UUID to TEXT
ALTER TABLE campaigns ALTER COLUMN user_id TYPE text;
ALTER TABLE campaign_phases ALTER COLUMN user_id TYPE text;
ALTER TABLE campaign_reports ALTER COLUMN user_id TYPE text;
ALTER TABLE content ALTER COLUMN user_id TYPE text;
ALTER TABLE posts ALTER COLUMN user_id TYPE text;

-- Step 4: Recreate RLS policies with text-based user_id (using email addresses)
-- Note: These policies assume user_id will contain email addresses

-- Campaigns table policies
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own campaigns" ON campaigns
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own campaigns" ON campaigns
    FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Campaign phases table policies
CREATE POLICY "Users can view own campaign_phases" ON campaign_phases
    FOR SELECT USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own campaign_phases" ON campaign_phases
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own campaign_phases" ON campaign_phases
    FOR UPDATE USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own campaign_phases" ON campaign_phases
    FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Campaign reports table policies
CREATE POLICY "Users can view own campaign_reports" ON campaign_reports
    FOR SELECT USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own campaign_reports" ON campaign_reports
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own campaign_reports" ON campaign_reports
    FOR UPDATE USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own campaign_reports" ON campaign_reports
    FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Content table policies
CREATE POLICY "Users can view own content" ON content
    FOR SELECT USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own content" ON content
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own content" ON content
    FOR UPDATE USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own content" ON content
    FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Posts table policies
CREATE POLICY "Users can view own posts" ON posts
    FOR SELECT USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own posts" ON posts
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Success message
SELECT 'Migration completed: user_id columns changed from UUID to TEXT and RLS policies updated' as status;

-- Note: Foreign key constraints between user_id and profiles.id were removed
-- because user_id now stores email addresses (text) instead of UUID references to profiles.
-- If you need to maintain referential integrity, consider:
-- 1. Adding email column to profiles table and creating FK to that, OR
-- 2. Creating a lookup function to validate emails against profiles.email