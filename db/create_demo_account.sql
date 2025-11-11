-- Create Demo Account with Admin Access
-- Email: demo@priorityonetech.ca
-- Password: DemoUser20&25 (set this when you create the account in Supabase Auth)

-- Step 1: Create the user in Supabase Authentication Dashboard
-- Go to: Authentication > Users > Add User
-- Email: demo@priorityonetech.ca
-- Password: DemoUser20&25
-- Auto Confirm User: YES (so they don't need email verification)
-- After creating, copy the UUID and use it below

-- Step 2: Create profile for demo user (replace USER_ID_HERE with the UUID from step 1)
INSERT INTO profiles (id, first_name, last_name, company, role, created_at, updated_at)
VALUES (
    '8339a350-8c1b-44c0-8c7a-16d958092b7f',  -- Replace with UUID from Supabase Auth
    'Demo',
    'User',
    'Priority One Tech',
    'admin',  -- This makes them see ALL data
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    first_name = 'Demo',
    last_name = 'User',
    company = 'Priority One Tech',
    updated_at = NOW();

-- Step 3: Verify the demo user
SELECT * FROM profiles WHERE first_name = 'Demo' AND last_name = 'User';

-- Step 4: Check what campaigns they can see (should be ALL 3 campaigns)
-- This query will work once you log in as demo user
-- SELECT COUNT(*) FROM campaigns;  -- Should show 3
