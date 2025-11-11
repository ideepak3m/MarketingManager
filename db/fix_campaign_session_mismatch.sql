-- Debug: Why campaigns aren't matching sessions
-- User ID: d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

-- 1. What session_ids exist for this user?
SELECT session_id, user_email, created_at 
FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 2. What session_ids do the campaigns have?
SELECT id, name, session_id, user_id 
FROM campaigns 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 3. Check if there's a mismatch
SELECT 
    'In nova_user_sessions' as location,
    session_id
FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
UNION ALL
SELECT 
    'In campaigns' as location,
    session_id
FROM campaigns 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 4. FIX: Update campaigns to use valid session_ids from nova_user_sessions
-- Get the first session_id for this user
WITH first_session AS (
    SELECT session_id 
    FROM nova_user_sessions 
    WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
    LIMIT 1
)
UPDATE campaigns 
SET session_id = (SELECT session_id FROM first_session)
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 5. Verify the fix
SELECT c.id, c.name, c.session_id, s.session_id as valid_session
FROM campaigns c
LEFT JOIN nova_user_sessions s ON s.session_id = c.session_id
WHERE c.user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';
