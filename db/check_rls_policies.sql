-- Check RLS status on social_comments table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'social_comments';

-- Check all policies on social_comments
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'social_comments';

-- If RLS is enabled, we need to disable it or create a permissive policy
-- Run this to fix:
-- ALTER TABLE social_comments DISABLE ROW LEVEL SECURITY;

-- OR create a fully permissive policy:
-- DROP POLICY IF EXISTS "Allow read" ON social_comments;
-- CREATE POLICY "Allow read" ON social_comments FOR SELECT USING (true);
