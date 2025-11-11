-- Fix RLS policies for campaigns table to work with session_id architecture
-- campaigns.user_id stores session_id (not auth.uid)

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaigns;

-- 2. Create new policies that understand session_id mapping

-- SELECT: Users can see campaigns linked to their sessions OR admins can see all
CREATE POLICY "campaigns_select_policy" ON campaigns
FOR SELECT
TO authenticated
USING (
    -- User's campaigns (via session_id)
    user_id IN (
        SELECT session_id 
        FROM nova_user_sessions 
        WHERE user_id = auth.uid()
    )
    OR
    -- Admin can see all
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- INSERT: Users can create campaigns with their session_id OR admins
CREATE POLICY "campaigns_insert_policy" ON campaigns
FOR INSERT
TO authenticated
WITH CHECK (
    -- User can insert if user_id matches their session_id
    user_id IN (
        SELECT session_id 
        FROM nova_user_sessions 
        WHERE user_id = auth.uid()
    )
    OR
    -- Admin can insert anything
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- UPDATE: Users can update their own campaigns OR admins
CREATE POLICY "campaigns_update_policy" ON campaigns
FOR UPDATE
TO authenticated
USING (
    user_id IN (
        SELECT session_id 
        FROM nova_user_sessions 
        WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- DELETE: Users can delete their own campaigns OR admins
CREATE POLICY "campaigns_delete_policy" ON campaigns
FOR DELETE
TO authenticated
USING (
    user_id IN (
        SELECT session_id 
        FROM nova_user_sessions 
        WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Verify policies are created
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaigns';
