-- FIX: social_comments has RLS enabled but NO policies (blocking all access)

-- Option 1: Disable RLS completely (simplest for analytics)
ALTER TABLE social_comments DISABLE ROW LEVEL SECURITY;

-- Option 2: Keep RLS enabled but add a permissive policy (if you want security)
-- Uncomment these lines if you prefer this approach:
-- CREATE POLICY "allow_authenticated_read" ON social_comments
--     FOR SELECT
--     TO authenticated, anon
--     USING (true);

-- Verify the fix
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'social_comments';

-- Test query (should now return data)
SELECT COUNT(*) as total_comments FROM social_comments;
