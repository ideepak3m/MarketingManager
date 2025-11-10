# Quick Start: Generate Phase-Based Comments

## Step 1: Check Your Phase Names

First, verify your actual campaign phase names in the database:

```sql
SELECT DISTINCT name, phase_order, start_date, end_date 
FROM campaign_phases 
WHERE campaign_id = 'YOUR_CAMPAIGN_ID'
ORDER BY phase_order;
```

Example output:
- Awareness (Nov 11-17)
- Consideration (Nov 18-24)
- Conversion (Nov 25-Dec 1)

## Step 2: Generate Templates with AI

Copy this prompt to ChatGPT/Claude (replace the bracketed sections):

```
Generate realistic social media comments and replies for a marketing campaign demo.

**Campaign Phases:**

Phase 1: Awareness (Nov 11-17)
- Goal: Introduce product, build curiosity
- Content: Educational, "what is this?", first impressions

Phase 2: Consideration (Nov 18-24)
- Goal: Show features, answer questions, build trust
- Content: Comparisons, pricing questions, integration details

Phase 3: Conversion (Nov 25-Dec 1)
- Goal: Drive signups, support onboarding
- Content: Testimonials, signup confirmations, getting started questions

Generate 8-10 comment/reply pairs for EACH phase. Format as JSON:

{
  "Awareness": [
    {"comment": "text", "reply": "text", "sentiment": "positive|question|neutral|negative"}
  ],
  "Consideration": [...],
  "Conversion": [...]
}

Campaign Details:
- Product: [AI-powered marketing automation platform]
- Audience: [Small business owners, marketers]
- Brand Voice: [Professional, helpful, friendly]

Sentiment Mix:
- 40% positive (excited, appreciative)
- 40% questions (curious, seeking info)
- 15% neutral (observational)
- 5% negative (concerns, but constructive)
```

## Step 3: Use the HTML Tool

1. Open `tools/generate-comments.html` in your browser
2. Enter Supabase credentials:
   - URL: Your project URL
   - Key: Service role key (not anon key!)
3. Paste the AI-generated JSON into the textarea
4. Set parameters:
   - Min comments: 3-5 per post
   - Max comments: 8-12 per post
   - Reply rate: 70%
5. Click "Generate Comments"

## What Happens:

- Tool fetches all posts with their phase information
- For each post, picks random templates from the matching phase
- Generates timestamps between that phase's start_date and end_date
- Creates replies 1-24 hours after comments (still within phase)
- Inserts all data into `social_comments` table

## Expected Results:

For a campaign with:
- 3 phases × 9 posts per phase = 27 total posts
- 3 platforms per post = 81 platform entries
- Average 5-6 comments per platform entry
- 70% reply rate

You'll get approximately:
- **400-500 total comments**
- **280-350 replies**
- All timestamped realistically within phase boundaries

## Troubleshooting:

**Error: "No templates found for phase X"**
- Your JSON phase names don't match database phase names exactly
- Check spelling and capitalization

**Error: "Templates must be an object"**
- Format should be `{"Phase1": [...], "Phase2": [...]}`
- Not a flat array

**No comments appearing:**
- Check browser console for errors
- Verify service key has insert permissions
- Confirm campaign_post_platforms has data

## Sample Output Log:

```
📊 Fetching campaign posts with phase data...
✅ Found 81 platform posts
  📍 Awareness: 27 posts
  📍 Consideration: 27 posts
  📍 Conversion: 27 posts
Processed 81/81 platforms
✅ Generation complete!
📊 Total comments: 456
💬 Total replies: 319
📈 Reply rate: 70%
```

## Next Steps:

After generating comments:
1. Verify in Supabase: `SELECT COUNT(*) FROM social_comments;`
2. Check timestamp distribution: `SELECT DATE(timestamp), COUNT(*) FROM social_comments GROUP BY DATE(timestamp);`
3. Move on to building the Analytics dashboard!
