-- FUTURE: Re-enable RLS on social_comments with proper policies
-- Only run this if you need to add row-level security later

-- Enable RLS
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for authenticated users
CREATE POLICY "allow_authenticated_read" ON social_comments
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Optional: Restrict by campaign ownership through joins
-- CREATE POLICY "allow_user_campaign_comments" ON social_comments
--     FOR SELECT
--     TO authenticated
--     USING (
--         EXISTS (
--             SELECT 1 FROM campaign_post_platforms cpp
--             JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
--             JOIN campaigns c ON cp.campaign_id = c.id
--             JOIN nova_user_sessions nus ON c.session_id = nus.session_id
--             WHERE cpp.id = social_comments.campaign_post_platform_id
--             AND nus.user_id = auth.uid()
--         )
--     );
