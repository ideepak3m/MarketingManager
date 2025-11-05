# Multi-Platform Campaign Posts Migration Guide

## Overview
This migration introduces a new normalized database schema to support posting the same content to multiple social media platforms.

## New Schema Design

### Before (Single Platform)
```
campaign_posts
├── id
├── user_id
├── campaign_id
├── campaign_phase_id
├── platform ⚠️ (only one platform per post)
├── scheduled_time
├── asset_url
├── asset_name
├── status
└── ...
```

### After (Multi-Platform)
```
campaign_posts (Platform-agnostic)
├── id
├── user_id
├── campaign_id
├── campaign_phase_id
├── scheduled_time
├── asset_url
├── asset_name
├── asset_type
└── caption

campaign_post_platforms (One-to-Many)
├── id
├── campaign_post_id → references campaign_posts(id)
├── user_id
├── platform ✅ (Facebook, Instagram, etc.)
├── platform_caption
├── hashtags[]
├── status
├── platform_post_id
├── published_at
└── ...
```

## Benefits

1. **Single Upload, Multiple Platforms**: Upload an asset once, publish to multiple platforms
2. **Platform-Specific Customization**: Different captions, hashtags per platform
3. **Independent Publishing Status**: Track success/failure per platform
4. **Better Analytics**: Aggregate performance across platforms
5. **Cleaner n8n Workflow**: Process each platform independently

## Migration Steps

### Step 1: Backup Existing Data
```sql
-- Backup existing campaign_posts table (if exists)
CREATE TABLE campaign_posts_backup AS 
SELECT * FROM campaign_posts;
```

### Step 2: Run Migration Script
```bash
# From project root
psql -h YOUR_SUPABASE_HOST \
     -U postgres \
     -d postgres \
     -f db/create_campaign_posts_tables.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `create_campaign_posts_tables.sql`
3. Run the script

### Step 3: Migrate Existing Data (if applicable)
```sql
-- If you have existing campaign_posts data, migrate it
INSERT INTO campaign_posts (
    id, user_id, campaign_id, campaign_phase_id, 
    scheduled_time, asset_url, asset_name, asset_type, caption
)
SELECT 
    id, user_id, campaign_id, campaign_phase_id,
    scheduled_time, asset_url, asset_name, 
    'image' as asset_type, -- default to image
    caption
FROM campaign_posts_backup;

-- Create corresponding platform entries
INSERT INTO campaign_post_platforms (
    campaign_post_id, user_id, platform, 
    platform_caption, status, published_at
)
SELECT 
    id, user_id, platform,
    caption, status, published_at
FROM campaign_posts_backup;
```

### Step 4: Update Application Code

#### Updated database.js Functions:
- ✅ `getCampaignPosts(userId, campaignId, platform)` - Now returns posts with nested platforms
- ✅ `createCampaignPost(postData, platforms)` - Accepts array of platforms
- ✅ `updateCampaignPost(id, updates)` - Updates post details
- ✅ `addPlatformToPost(campaignPostId, userId, platformData)` - Add new platform
- ✅ `updatePlatformEntry(platformEntryId, updates)` - Update publishing status
- ✅ `getPostsReadyToPublish()` - For n8n workflow

#### Example Usage:
```javascript
// Upload asset and create post for multiple platforms
const { data: post } = await createCampaignPost(
    {
        user_id: user.id,
        campaign_id: campaignId,
        campaign_phase_id: phaseId,
        scheduled_time: scheduledDate,
        asset_url: uploadedUrl,
        asset_name: fileName,
        asset_type: 'image',
        caption: 'Check out our new product!'
    },
    ['Facebook', 'Instagram', 'Pinterest'] // Publish to 3 platforms
);

// Later, add another platform
await addPlatformToPost(post.id, user.id, {
    platform: 'LinkedIn',
    caption: 'Professional version of caption',
    hashtags: ['#business', '#innovation']
});
```

### Step 5: Update n8n Workflow

#### Old Workflow Query:
```sql
SELECT * FROM campaign_posts 
WHERE platform = 'Facebook' 
AND scheduled_time <= NOW() 
AND status = 'pending'
```

#### New Workflow Query:
```sql
SELECT 
    cpp.id as platform_entry_id,
    cpp.platform,
    cpp.platform_caption,
    cpp.hashtags,
    cp.asset_url,
    cp.asset_name,
    cp.scheduled_time
FROM campaign_post_platforms cpp
INNER JOIN campaign_posts cp ON cpp.campaign_post_id = cp.id
WHERE cpp.status = 'pending'
  AND cp.scheduled_time <= NOW()
  AND cpp.retry_count < 3
ORDER BY cp.scheduled_time, cpp.platform
```

#### Update Status After Publishing:
```javascript
// In n8n, after successful publish to Facebook:
await updatePlatformEntry(platformEntryId, {
    status: 'published',
    platform_post_id: fbResponse.id,
    platform_url: fbResponse.permalink_url,
    published_at: new Date().toISOString()
});

// On failure:
await updatePlatformEntry(platformEntryId, {
    status: 'failed',
    error_message: error.message,
    retry_count: currentRetryCount + 1,
    last_retry_at: new Date().toISOString()
});
```

## Frontend Updates Needed

### Content.js Changes:
1. **Multi-Platform Selection**:
   ```javascript
   const [selectedPlatforms, setSelectedPlatforms] = useState([]);
   
   // User can select multiple platforms
   <MultiSelect
       options={PLATFORMS}
       value={selectedPlatforms}
       onChange={setSelectedPlatforms}
   />
   ```

2. **Upload to Multiple Platforms**:
   ```javascript
   // When uploading
   await createCampaignPost(postData, selectedPlatforms);
   ```

3. **Grid Display**:
   - Show platform badges for each post
   - Display status per platform (Published on FB, Pending on IG)
   - Allow adding/removing platforms after upload

### CampaignPostsGrid.js Updates:
```javascript
// Show which platforms a post is scheduled for
<div className="platform-badges">
    {post.platforms.map(p => (
        <Badge 
            key={p.platform} 
            status={p.status}
            platform={p.platform}
        />
    ))}
</div>
```

## Testing Checklist

- [ ] Run migration script successfully
- [ ] Verify RLS policies work
- [ ] Test creating post with single platform
- [ ] Test creating post with multiple platforms
- [ ] Test adding platform to existing post
- [ ] Test n8n workflow with new queries
- [ ] Test platform-specific publishing status
- [ ] Test frontend grid display
- [ ] Test multi-platform upload UI
- [ ] Verify analytics queries work

## Rollback Plan

If migration fails:
```sql
-- Drop new tables
DROP TABLE IF EXISTS campaign_post_platforms CASCADE;
DROP TABLE IF EXISTS campaign_posts CASCADE;

-- Restore from backup
ALTER TABLE campaign_posts_backup RENAME TO campaign_posts;
```

## Support

For issues or questions:
1. Check logs in Supabase Dashboard → Database → Logs
2. Verify RLS policies are enabled
3. Check n8n workflow logs
4. Review migration guide examples

## Next Steps After Migration

1. **Update n8n workflow** to use new schema
2. **Update frontend** for multi-platform selection
3. **Test with real data** in staging environment
4. **Monitor performance** with new indexes
5. **Add analytics** for platform comparison

---

**Created**: 2025-11-04
**Author**: AI Assistant
**Version**: 1.0
