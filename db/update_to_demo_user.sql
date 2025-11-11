-- Update profile to Demo User
-- User ID: d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

-- Check current profile
SELECT * FROM profiles WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Update to Demo User (run this in Supabase SQL Editor)
UPDATE profiles 
SET 
    first_name = 'Demo',
    last_name = 'User',
    email = 'demo@marketingmanager.com',
    company_name = 'Marketing Manager Demo',
    updated_at = NOW()
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Verify the update
SELECT * FROM profiles WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Also check if there's data for this user
SELECT 
    'Campaigns' as type, COUNT(*) as count
FROM campaigns WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
UNION ALL
SELECT 
    'Sessions' as type, COUNT(*) as count
FROM nova_user_sessions WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';
