-- Setup Demo User Profile
-- User ID: d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

-- 1. Check if profile exists
SELECT * FROM profiles WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 2. If no profile exists, create one (run this if above returns no rows)
INSERT INTO profiles (id, email, first_name, last_name, company_name, role)
VALUES (
    'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed',
    'demo@marketingmanager.com',
    'Demo',
    'User',
    'Marketing Manager Demo',
    'admin'
)
ON CONFLICT (id) DO UPDATE
SET 
    email = 'demo@marketingmanager.com',
    first_name = 'Demo',
    last_name = 'User',
    company_name = 'Marketing Manager Demo',
    updated_at = NOW();

-- 3. Verify the data for demo user
SELECT 
    'Campaigns' as data_type,
    COUNT(*) as count
FROM campaigns 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
UNION ALL
SELECT 
    'Sessions' as data_type,
    COUNT(*) as count
FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
UNION ALL
SELECT 
    'Campaign Phases' as data_type,
    COUNT(*) as count
FROM campaign_phases 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
UNION ALL
SELECT 
    'Campaign Posts' as data_type,
    COUNT(*) as count
FROM campaign_posts 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 4. Get detailed campaign info
SELECT 
    id,
    name,
    status,
    start_date,
    end_date,
    created_at
FROM campaigns 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
ORDER BY created_at DESC;
