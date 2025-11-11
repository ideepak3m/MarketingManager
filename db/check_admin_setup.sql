-- Check if profiles table has role column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Check current user's role
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Set user as admin
UPDATE profiles 
SET role = 'admin'
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Verify the update
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';
