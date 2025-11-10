-- This is the EXACT query that Analytics.js is running for sentiment analysis
-- Replace 'YOUR_CAMPAIGN_ID' with the actual campaign ID for Amazon Returns Sales Boost Campaign

-- Step 1: Get the campaign ID
SELECT id, name, status 
FROM campaigns 
WHERE name = 'Amazon Returns Sales Boost Campaign';

-- Use the ID from above (e.g., 'e01b4524-2185-4b0b-be7d-b54bc473b071')
-- Replace in the queries below

-- Step 2: Get all campaign_posts for this campaign
SELECT id 
FROM campaign_posts
WHERE campaign_id = 'e01b4524-2185-4b0b-be7d-b54bc473b071';

-- Step 3: Get platform IDs for these posts
SELECT cpp.id, cpp.platform, cpp.campaign_post_id
FROM campaign_post_platforms cpp
WHERE cpp.campaign_post_id IN (
    SELECT id FROM campaign_posts WHERE campaign_id = 'e01b4524-2185-4b0b-be7d-b54bc473b071'
);

-- Step 4: Get comments for these platform IDs (THIS IS THE ACTUAL QUERY)
SELECT 
    sc.text,
    sc.campaign_post_platform_id,
    cpp.platform
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id
WHERE sc.campaign_post_platform_id IN (
    SELECT cpp.id 
    FROM campaign_post_platforms cpp
    WHERE cpp.campaign_post_id IN (
        SELECT id FROM campaign_posts WHERE campaign_id = 'e01b4524-2185-4b0b-be7d-b54bc473b071'
    )
);

-- Step 5: Count sentiment (manually categorize)
-- Positive: love, great, awesome, perfect, excellent, fantastic, thank
-- Questions: contains ?
-- Negative: bad, worry, concern, disappointed, not sure, trust
-- Neutral: everything else

SELECT 
    sc.text,
    sc.campaign_post_platform_id,
    cpp.platform,
    CASE 
        WHEN sc.text ILIKE '%?%' THEN 'question'
        WHEN sc.text ~* '(love|great|awesome|perfect|excellent|fantastic|thank)' THEN 'positive'
        WHEN sc.text ~* '(bad|worry|concern|disappointed|not sure|trust)' THEN 'negative'
        ELSE 'neutral'
    END as sentiment
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id
WHERE sc.campaign_post_platform_id IN (
    SELECT cpp.id 
    FROM campaign_post_platforms cpp
    WHERE cpp.campaign_post_id IN (
        SELECT id FROM campaign_posts WHERE campaign_id = 'e01b4524-2185-4b0b-be7d-b54bc473b071'
    )
);

-- Step 6: Count by sentiment
SELECT 
    CASE 
        WHEN sc.text ILIKE '%?%' THEN 'question'
        WHEN sc.text ~* '(love|great|awesome|perfect|excellent|fantastic|thank)' THEN 'positive'
        WHEN sc.text ~* '(bad|worry|concern|disappointed|not sure|trust)' THEN 'negative'
        ELSE 'neutral'
    END as sentiment,
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM social_comments sc2
        JOIN campaign_post_platforms cpp2 ON sc2.campaign_post_platform_id = cpp2.id
        WHERE cpp2.campaign_post_id IN (
            SELECT id FROM campaign_posts WHERE campaign_id = 'e01b4524-2185-4b0b-be7d-b54bc473b071'
        ))), 0) as percentage
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id
WHERE sc.campaign_post_platform_id IN (
    SELECT cpp.id 
    FROM campaign_post_platforms cpp
    WHERE cpp.campaign_post_id IN (
        SELECT id FROM campaign_posts WHERE campaign_id = 'e01b4524-2185-4b0b-be7d-b54bc473b071'
    )
)
GROUP BY sentiment
ORDER BY count DESC;
