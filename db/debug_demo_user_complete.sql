-- COMPREHENSIVE CHECK FOR DEMO USER DATA
-- User ID: d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

-- 1. Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 2. Check profile
SELECT * FROM profiles 
WHERE id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 3. Check sessions with ALL columns
SELECT * FROM nova_user_sessions 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 4. Check if sessions exist with ANY user_id
SELECT COUNT(*) as total_sessions FROM nova_user_sessions;
SELECT * FROM nova_user_sessions LIMIT 5;

-- 5. Check campaigns by user_id
SELECT id, name, status, user_id, session_id, created_at 
FROM campaigns 
WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';

-- 6. Check if campaigns exist with ANY user_id
SELECT COUNT(*) as total_campaigns FROM campaigns;
SELECT user_id, COUNT(*) as campaign_count 
FROM campaigns 
GROUP BY user_id;

-- 7. Check campaigns by session_id (if sessions exist)
-- First, get the session_ids
DO $$
DECLARE
    session_ids text[];
BEGIN
    SELECT ARRAY_AGG(session_id) INTO session_ids
    FROM nova_user_sessions 
    WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed';
    
    RAISE NOTICE 'Session IDs: %', session_ids;
END $$;

-- 8. Check campaigns that match session_ids
SELECT c.id, c.name, c.status, c.session_id, c.user_id
FROM campaigns c
WHERE c.session_id IN (
    SELECT session_id 
    FROM nova_user_sessions 
    WHERE user_id = 'd902b3e3-a230-4bfa-ace4-cafc1a5bd5ed'
);

-- 9. Check ALL campaigns to see what session_ids exist
SELECT DISTINCT session_id, user_id 
FROM campaigns 
WHERE session_id IS NOT NULL
LIMIT 10;

-- 10. Cross-check: Do session_ids in campaigns match any in nova_user_sessions?
SELECT 
    c.session_id as campaign_session_id,
    c.user_id as campaign_user_id,
    CASE 
        WHEN s.session_id IS NOT NULL THEN 'MATCH FOUND'
        ELSE 'NO MATCH'
    END as session_match
FROM campaigns c
LEFT JOIN nova_user_sessions s ON s.session_id = c.session_id
LIMIT 20;
