-- =====================================================
-- ALTER: Remove default value from asset_type column
-- =====================================================
-- This changes asset_type from defaulting to 'image' to NULL
-- Run this if you already have the campaign_posts table created
-- =====================================================

ALTER TABLE campaign_posts 
ALTER COLUMN asset_type DROP DEFAULT;

-- Optionally, update existing rows to NULL if they have 'image' as placeholder
-- UPDATE campaign_posts 
-- SET asset_type = NULL 
-- WHERE asset_url IS NULL AND asset_type = 'image';
