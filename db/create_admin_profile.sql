-- Check what's in auth.users for info@priorityonetech.ca
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'info@priorityonetech.ca';

-- Check what columns exist in profiles table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check existing profiles to see structure
SELECT * FROM profiles LIMIT 1;

-- Create profile for info@priorityonetech.ca (adjust columns based on above results)
INSERT INTO profiles (id, first_name, last_name, company, role, created_at, updated_at)
VALUES (
    '44242ffc-40b5-40d6-8732-c2dae5c9d8b5',
    'Admin',
    'User',
    'Priority One Tech',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    first_name = 'Admin',
    last_name = 'User',
    company = 'Priority One Tech',
    updated_at = NOW();

-- Verify the profile was created
SELECT * FROM profiles WHERE id = '44242ffc-40b5-40d6-8732-c2dae5c9d8b5';

-- Also check what campaigns exist
SELECT 
    id, 
    name, 
    status, 
    user_id,
    created_at
FROM campaigns
ORDER BY created_at DESC
LIMIT 10;
