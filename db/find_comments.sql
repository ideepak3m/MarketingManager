-- Check if social_comments table exists and has data
SELECT COUNT(*) as total_comments
FROM social_comments;

-- Check structure of social_comments
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'social_comments'
ORDER BY ordinal_position;

-- Check if there are any tables with 'comment' in the name
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%comment%';

-- Check the actual campaign_post_platform_id values in social_comments
SELECT campaign_post_platform_id, COUNT(*) as comment_count
FROM social_comments
GROUP BY campaign_post_platform_id
ORDER BY comment_count DESC
LIMIT 10;

-- Verify the platform IDs from Analytics exist
-- Replace these with the 5 IDs from your console log
SELECT id, platform, campaign_post_id
FROM campaign_post_platforms
WHERE id IN (
    '70d4b87b-070a-4436-9536-fce3fd09ad34',
    '4e1ac341-3f82-497f-b558-9e9bd740c141',
    '96944896-0b4b-4178-becf-ebd8683514b3',
    '64053d95-51f2-472e-aac8-14da657aa590',
    '87dd4d4e-b6c9-41ce-aa1d-8b9cfb1686d9'
);

-- Check your Supabase connection string in the app
-- Make sure it matches your SQL editor connection
