-- Update email in auth.users table
-- User ID: d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

-- 1. Check current email
SELECT id, email, created_at 
FROM auth.users 
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 2. Update email to demo email in auth.users
UPDATE auth.users 
SET 
    email = 'demo@marketingmanager.com',
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{email}',
        '"demo@marketingmanager.com"'
    ),
    updated_at = NOW()
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 3. Update profile to Demo User
UPDATE profiles 
SET 
    email = 'demo@marketingmanager.com',
    first_name = 'Demo',
    last_name = 'User',
    updated_at = NOW()
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 4. Verify updates (email is just for display, we use user_id for queries)
SELECT 'auth.users' as table_name, id, email FROM auth.users WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
UNION ALL
SELECT 'profiles' as table_name, id, email FROM profiles WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 5. Verify data exists for this user_id
SELECT 
    'Sessions' as type, COUNT(*) as count
FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
UNION ALL
SELECT 
    'Campaigns' as type, COUNT(*) as count
FROM campaigns 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';
