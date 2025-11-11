-- Check sessions for demo user ID
SELECT * FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Check what email is stored in sessions
SELECT user_email, session_id, created_at 
FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Check campaigns by user_id directly
SELECT id, name, status, user_id, session_id 
FROM campaigns 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Update session email to match demo email (if needed)
UPDATE nova_user_sessions 
SET user_email = 'demo@marketingmanager.com'
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- Verify the update
SELECT * FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';
