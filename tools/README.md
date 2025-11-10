# Phase-Based Comment Generation System

## Overview

The comment generator tool has been upgraded to generate phase-aware comments with timestamps that fall within each campaign phase's date range. This creates realistic demo data that reflects the customer journey progression.

## Key Changes

### 1. Phase-Based Template Organization
- **Before:** Flat array of templates applied randomly to all posts
- **After:** Templates organized by phase name (e.g., Awareness, Consideration, Conversion)
- **Benefit:** Comments match the customer journey stage

### 2. Date-Aware Timestamp Generation
- **Before:** Random timestamps within 72 hours of post scheduled time
- **After:** Timestamps generated within the phase's start_date to end_date range
- **Benefit:** All comments fall within the correct campaign period

### 3. Smart Reply Timing
- **Before:** Reply timestamps generated the same way as comments
- **After:** Replies timestamped 1-24 hours after comment, still within phase boundaries
- **Benefit:** Realistic response timing while respecting phase constraints

## File Structure

```
tools/
├── generate-comments.html          # Main HTML tool (updated)
├── sample-phase-templates.json     # Example phase-based templates
├── sample-templates.json           # OLD: Flat template format (deprecated)
├── AI-PROMPT-GUIDE.md             # How to use AI to generate templates
├── SAMPLE-PROMPT.md               # Ready-to-use prompt for ChatGPT/Claude
├── QUICK-START.md                 # Step-by-step usage guide
└── README.md                      # This file
```

## How It Works

### Data Flow

1. **Fetch Posts with Phase Info**
   ```javascript
   campaign_post_platforms → campaign_posts → campaign_phases
   ```
   Retrieves: post ID, scheduled time, platform, phase name, phase dates

2. **Match Templates to Phases**
   ```javascript
   templates = {
     "Awareness": [...],
     "Consideration": [...],
     "Conversion": [...]
   }
   ```
   For each post, selects templates from the matching phase

3. **Generate Timestamps**
   ```javascript
   commentTime = random(phase.start_date, phase.end_date)
   replyTime = random(commentTime + 1hr, phase.end_date)
   ```
   Ensures all activity stays within phase boundaries

4. **Insert Comments**
   ```javascript
   social_comments.insert({
     comment_id, post_id, platform,
     username, text, timestamp,
     like_count, replied, reply_text,
     replied_at, campaign_post_platform_id
   })
   ```

### Database Schema

The tool populates the `social_comments` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `comment_id` | text | Platform-specific comment ID |
| `post_id` | text | Platform-specific post ID |
| `platform` | text | Social platform name |
| `username` | text | Commenter username |
| `text` | text | Comment text |
| `timestamp` | timestamptz | When comment was posted (within phase) |
| `like_count` | integer | Random likes (0-100) |
| `is_spam` | boolean | Always false for demo |
| `replied` | boolean | Whether brand replied |
| `reply_text` | text | Brand's reply (if replied) |
| `replied_at` | timestamptz | Reply timestamp (1-24hrs after comment) |
| `campaign_post_platform_id` | uuid | FK to campaign_post_platforms |

## Usage Workflow

### Step 1: Identify Your Phases

Query your database:
```sql
SELECT name, start_date, end_date 
FROM campaign_phases 
WHERE campaign_id = 'your-campaign-id'
ORDER BY phase_order;
```

Example result:
- Awareness: Nov 11-17
- Consideration: Nov 18-24
- Conversion: Nov 25-Dec 1

### Step 2: Generate Templates

Use the provided `SAMPLE-PROMPT.md` with ChatGPT or Claude:
- Copy the entire prompt
- Customize the campaign context section
- Paste into AI chat
- Get JSON output with phase-based templates

### Step 3: Run the Tool

1. Open `generate-comments.html` in browser
2. Enter Supabase credentials (URL + service key)
3. Paste AI-generated JSON into textarea
4. Configure settings:
   - Min/Max comments per post (e.g., 3-8)
   - Reply rate (e.g., 70%)
5. Click "Generate Comments"
6. Watch progress and logs

### Step 4: Verify Results

```sql
-- Check total comments
SELECT COUNT(*) FROM social_comments;

-- Check comments per phase
SELECT 
  cp.name as phase,
  COUNT(sc.id) as comment_count
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id
JOIN campaign_posts p ON cpp.campaign_post_id = p.id
JOIN campaign_phases cp ON p.campaign_phase_id = cp.id
GROUP BY cp.name, cp.phase_order
ORDER BY cp.phase_order;

-- Verify timestamps are within phase boundaries
SELECT 
  cp.name,
  cp.start_date,
  cp.end_date,
  MIN(sc.timestamp) as earliest_comment,
  MAX(sc.timestamp) as latest_comment
FROM social_comments sc
JOIN campaign_post_platforms cpp ON sc.campaign_post_platform_id = cpp.id
JOIN campaign_posts p ON cpp.campaign_post_id = p.id
JOIN campaign_phases cp ON p.campaign_phase_id = cp.id
GROUP BY cp.name, cp.start_date, cp.end_date, cp.phase_order
ORDER BY cp.phase_order;
```

## Expected Output

For a typical campaign:
- **3 phases** × **9 posts/phase** = 27 posts
- **3 platforms** per post = 81 platform entries
- **5-6 comments** per platform entry = ~450 comments
- **70% reply rate** = ~315 replies

**Timeline Distribution:**
- Awareness phase: ~150 comments (Nov 11-17)
- Consideration phase: ~150 comments (Nov 18-24)
- Conversion phase: ~150 comments (Nov 25-Dec 1)

All timestamps fall naturally within their respective phase boundaries.

## Template Guidelines

### Awareness Phase
- **Customer Mindset:** "What is this?"
- **Comment Types:** Discovery, curiosity, first impressions
- **Examples:**
  - "First time seeing this! What exactly does it do?"
  - "This looks interesting. Adding to my watchlist."
  - "How is this different from [competitor]?"

### Consideration Phase
- **Customer Mindset:** "Is this right for me?"
- **Comment Types:** Comparisons, pricing questions, feature inquiries
- **Examples:**
  - "Do you integrate with [tool]?"
  - "What's the pricing like?"
  - "How does the AI content generation work?"

### Conversion Phase
- **Customer Mindset:** "I'm in! / How do I...?"
- **Comment Types:** Signups, testimonials, onboarding questions
- **Examples:**
  - "Just signed up! The onboarding was smooth."
  - "Quick question - how do I connect my Instagram?"
  - "Already seeing great results!"

## Technical Details

### Functions

**`generateRandomDateInPhase(phaseStartDate, phaseEndDate, isReply = false)`**
- Generates random timestamp between phase start and end
- For replies, adds 1-24 hour delay but stays within phase bounds
- Returns ISO timestamp string

**`generateComments()`**
- Main async function
- Fetches posts with nested phase data
- Validates template-phase matching
- Generates comments with phase-appropriate templates
- Inserts in batches to database
- Tracks progress and logs stats

### Error Handling

The tool provides detailed logging:
- ✅ Success: Green messages for completed actions
- ℹ️ Info: Blue messages for progress updates
- ⚠️ Warning: Yellow messages for skipped posts (no matching templates)
- ❌ Error: Red messages for failures

Common errors and solutions:
- **"No templates found for phase X"**: Phase name mismatch - check spelling
- **"Templates must be an object"**: Wrong JSON format - use object not array
- **"Invalid JSON format"**: Syntax error - validate JSON before pasting
- **Insert error**: Check Supabase permissions and table schema

## Benefits

1. **Realistic Customer Journey**: Comments progress naturally from awareness to conversion
2. **Accurate Timestamps**: All activity falls within correct campaign periods
3. **Analytics-Ready Data**: Phase-segmented data perfect for analytics dashboard
4. **Cost-Effective**: Generate 20-30 templates once, create 1000s of comments
5. **Repeatable**: Save templates for similar campaigns in the future

## Next Steps

After generating comments:
1. ✅ Verify data in Supabase
2. ✅ Check timestamp distribution
3. 🔄 Populate engagement metrics (likes, shares, views)
4. 🔄 Build Analytics dashboard to visualize the data
5. 🔄 Test complete demo flow

## Future Enhancements

Possible improvements:
- Add username variety (pull from list of realistic usernames)
- Generate profile pictures/avatars for commenters
- Support multiple campaigns simultaneously
- Export comments to CSV for backup
- Add sentiment analysis visualization
- Generate comment threads (replies to replies)

---

**Created:** November 10, 2024  
**Last Updated:** November 10, 2024  
**Version:** 2.0 (Phase-aware)
