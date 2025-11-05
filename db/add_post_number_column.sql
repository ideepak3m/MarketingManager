-- =====================================================
-- ALTER: Add post_number column to campaign_posts
-- =====================================================
-- This adds a sequential post number within each phase
-- =====================================================

-- Add the column (allow NULL initially)
ALTER TABLE campaign_posts 
ADD COLUMN post_number INTEGER;

-- Update existing rows with sequential numbers per phase
-- This will number posts within each phase based on scheduled_time
WITH numbered_posts AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY campaign_phase_id 
            ORDER BY scheduled_time
        ) as seq_num
    FROM campaign_posts
)
UPDATE campaign_posts cp
SET post_number = np.seq_num
FROM numbered_posts np
WHERE cp.id = np.id;

-- Now make it NOT NULL since all rows have values
ALTER TABLE campaign_posts 
ALTER COLUMN post_number SET NOT NULL;
