-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'campaign%'
ORDER BY tablename;

-- Check existing policies on campaign_post_platforms
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'campaign_post_platforms';

-- Test query: Can you see campaign_posts?
SELECT COUNT(*) as total_posts FROM campaign_posts;

-- Test query: Can you see specific campaign's posts?
SELECT cp.id, cp.content_text, cp.campaign_id
FROM campaign_posts cp
WHERE cp.campaign_id IN (
    SELECT id FROM campaigns LIMIT 1
);

-- Check if campaign_post_platforms has data
SELECT COUNT(*) FROM campaign_post_platforms;
