# Analytics Dashboard Guide

## 🎯 Overview

The Analytics Dashboard provides comprehensive insights into your marketing campaign performance with real-time data visualization.

## 📊 Features

### 1. **Campaign Selector**
- Select any active or completed campaign from the dropdown
- Click "🔄 Refresh" to reload data
- Dashboard updates automatically when campaign is changed

### 2. **Overview Metrics (6 Cards)**

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Posts │ Total Reach │ Engagement  │ Response    │   Total     │   Active    │
│             │             │    Rate     │    Rate     │  Comments   │  Platforms  │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

**Metrics Explained:**
- **Total Posts**: Number of posts published across all platforms
- **Total Reach**: Sum of unique users reached
- **Engagement Rate**: (Likes + Comments + Shares) / Impressions × 100%
- **Response Rate**: Percentage of comments that received replies
- **Total Comments**: All comments received on posts
- **Active Platforms**: Number of platforms used in campaign

### 3. **Engagement Over Time** (Line Chart)
- Shows daily comment and like trends
- X-axis: Dates
- Y-axis: Count
- Lines:
  - **Purple Line**: Comments per day
  - **Green Line**: Likes per day
- Hover to see exact numbers

### 4. **Platform Performance** (Bar Chart)
- Compares engagement rate across platforms
- X-axis: Platforms (Facebook, Instagram, WhatsApp, etc.)
- Y-axis: Engagement Rate (%)
- Higher bars indicate better performance

### 5. **Phase Performance** (Cards)
- Shows performance for each campaign phase
- Displays:
  - Phase name
  - Number of posts
  - Total engagement (likes + comments + shares)
  - Response rate percentage

### 6. **Comment Sentiment** (Pie Chart)
- Distribution of comment types:
  - **Green**: Positive comments (love, great, awesome, etc.)
  - **Blue**: Questions (contains "?")
  - **Purple**: Neutral comments
  - **Red**: Negative comments (worry, concern, etc.)
- Percentages shown on chart

### 7. **Top Performing Posts** (Table)
Ranked list of best-performing posts showing:
- **Rank**: Position (1-5)
- **Platform**: Where it was posted
- **Phase**: Campaign phase
- **Posted**: Publication date
- **Likes**: Number of likes
- **Comments**: Number of comments
- **Engagement**: Engagement rate percentage

## 🚀 How to Use

### Step 1: Populate Engagement Data (First Time Only)

Before viewing analytics, you need to populate engagement metrics:

1. Open Supabase SQL Editor
2. Copy the content from `db/populate_engagement_metrics.sql`
3. Run the SQL script
4. This adds realistic likes, comments, shares, views, reach, and impressions

**What the script does:**
- Adds random engagement metrics (likes: 50-500, comments: 5-50, etc.)
- Calculates engagement rate automatically
- Calculates response rate based on actual replied comments
- Updates metrics_captured_at timestamp

### Step 2: View Analytics

1. Navigate to **Analytics** page in the app
2. Select your campaign from dropdown
3. Wait for data to load
4. Explore the different visualizations

### Step 3: Refresh Data

- Click "🔄 Refresh" button to reload latest data
- Useful after:
  - New comments are added
  - Engagement metrics are updated
  - Campaign status changes

## 📈 Understanding the Data

### Engagement Rate Formula
```
Engagement Rate = (Likes + Comments + Shares) / Impressions × 100%
```

**Example:**
- Likes: 120
- Comments: 15
- Shares: 25
- Impressions: 2,500
- Engagement Rate = (120 + 15 + 25) / 2,500 × 100% = **6.4%**

**Good Benchmarks:**
- 1-3%: Average
- 3-6%: Good
- 6%+: Excellent

### Response Rate Formula
```
Response Rate = Replied Comments / Total Comments × 100%
```

**Example:**
- Total Comments: 100
- Replied Comments: 68
- Response Rate = 68 / 100 × 100% = **68%**

**Good Benchmarks:**
- 50-60%: Average
- 60-75%: Good
- 75%+: Excellent

## 🎨 Color Coding

### Metric Cards
- **Blue**: Posts-related metrics
- **Green**: Reach-related metrics
- **Purple**: Engagement-related metrics
- **Indigo**: Response-related metrics
- **Pink**: Comments-related metrics
- **Orange**: Platform-related metrics

### Charts
- **Purple (#8b5cf6)**: Primary data (comments, engagement rate)
- **Green (#10b981)**: Secondary data (likes)
- **Blue (#3b82f6)**: Tertiary data
- **Red (#ef4444)**: Negative sentiment

## 🔧 Troubleshooting

### "No data available" messages

**Possible causes:**
1. Engagement metrics not populated
   - **Solution**: Run `populate_engagement_metrics.sql`

2. No comments generated yet
   - **Solution**: Run the comment generator tool

3. Campaign has no posts
   - **Solution**: Launch the campaign first

4. Wrong campaign selected
   - **Solution**: Select an active/completed campaign

### Charts not displaying

**Check:**
1. Campaign has posts in database
2. Posts have engagement metrics
3. Comments exist in social_comments table
4. Browser console for errors

### Numbers showing as 0

**Causes:**
1. SQL script not run yet
2. Campaign_post_platforms missing data
3. Social_comments table empty

**Solution:**
```sql
-- Check if engagement metrics exist
SELECT
    COUNT(*) as posts_with_metrics
FROM campaign_post_platforms
WHERE likes_count IS NOT NULL;

-- Check if comments exist
SELECT COUNT(*) FROM social_comments;
```

## 📊 Data Flow

```
campaigns
    ↓
campaign_phases
    ↓
campaign_posts
    ↓
campaign_post_platforms (has engagement metrics)
    ↓
social_comments (has comment/reply data)
```

**Analytics queries join these tables to:**
- Calculate overview metrics
- Generate time-series data
- Compare platform performance
- Analyze sentiment
- Rank top posts

## 🎯 Best Practices

1. **Run metrics script after generating comments**
   - Ensures accurate response rates
   - Matches comments_count with actual data

2. **Refresh data periodically**
   - Click refresh button to see updates
   - Analytics don't auto-refresh (intentional for performance)

3. **Compare campaigns**
   - Switch between campaigns to compare performance
   - Look for patterns in successful campaigns

4. **Use for demo purposes**
   - Data is randomly generated for demo
   - In production, would come from actual social media APIs

## 📝 Future Enhancements

Possible additions:
- Date range selector
- Export to PDF/CSV
- Goal tracking vs. targets
- Comparison with previous campaigns
- Real-time auto-refresh
- Comment activity feed
- Platform-specific deep dives
- ROI calculator
- AI-generated insights

## 🔗 Related Files

- `src/pages/Analytics.js` - Main dashboard component
- `db/populate_engagement_metrics.sql` - Metrics population script
- `tools/generate-comments.html` - Comment generation tool
- `src/services/database.js` - Database service layer

## 💡 Tips

1. **Run comment generator first** before populating metrics
2. **Use realistic data** - the SQL script generates random but realistic numbers
3. **Check phase dates** - engagement over time chart respects phase boundaries
4. **Sentiment is automatic** - detected from comment text keywords
5. **Top posts ranked** by engagement rate, not absolute numbers

---

**Last Updated:** November 10, 2024  
**Version:** 1.0 (MVP)
