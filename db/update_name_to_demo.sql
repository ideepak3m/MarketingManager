-- Update only the name to "Demo User" in profiles table
-- Keep the existing email address
-- User ID: d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

-- 1. Check current profile
SELECT id, email, first_name, last_name FROM profiles 
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 2. Update only the name fields
UPDATE profiles 
SET 
    first_name = 'Demo',
    last_name = 'User',
    updated_at = NOW()
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 3. Verify the update (email should remain unchanged)
SELECT id, email, first_name, last_name, updated_at FROM profiles 
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';
