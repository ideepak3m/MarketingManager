-- Check the relationship between tables

-- What's in nova_user_sessions for your admin account?
SELECT * FROM nova_user_sessions 
WHERE user_id = '44242ffc-40b5-40d6-8732-c2dae5c9d8b5';

-- What user_id values are in campaigns?
SELECT DISTINCT user_id FROM campaigns;

-- What's the actual structure?
SELECT 
    c.id,
    c.name,
    c.user_id as campaign_user_id,
    c.session_id as campaign_session_id
FROM campaigns c
LIMIT 5;

-- Check if there's a relationship we're missing
SELECT 
    s.user_id as auth_user_id,
    s.session_id,
    c.name,
    c.user_id as campaign_user_id
FROM nova_user_sessions s
LEFT JOIN campaigns c ON c.session_id = s.session_id
WHERE s.user_id = '44242ffc-40b5-40d6-8732-c2dae5c9d8b5';
