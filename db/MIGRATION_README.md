# Production Database Migration Guide

## Overview

This guide will help you set up a NEW production Supabase database from scratch. Your current demo database remains unchanged and separate.

## Architecture

- **Demo Version**: Current Supabase project (keep as-is)
  - Auto-login enabled
  - Demo banner displayed
  - Fake data safe for public viewing
  
- **Production Version**: NEW Supabase project (to be created)
  - Normal authentication required
  - Real user data
  - Production deployment

## Prerequisites

- [ ] Supabase account
- [ ] Access to create new Supabase projects
- [ ] Your production app deployed (or ready to deploy)

---

## Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name**: `MarketingManager Production` (or your choice)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Select appropriate plan
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to initialize

---

## Step 2: Run Migration Script

1. In your new Supabase project, go to **SQL Editor**
2. Click **"New Query"**
3. Open the file `PRODUCTION_MIGRATION.sql` from this directory
4. Copy the ENTIRE contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
7. Wait for completion (should take 10-30 seconds)

### Expected Results

You should see:
- ✅ 11 tables created
- ✅ Multiple indexes created
- ✅ RLS policies applied
- ✅ Triggers created
- ✅ Verification queries showing all tables

### Verification

Run these queries separately to confirm:

```sql
-- Check all tables exist (should show 11 tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

---

## Step 3: Configure Production Environment

1. Copy `.env.production` to `.env` (or create `.env.production.local`)
2. Get your production Supabase credentials:
   - Go to **Settings** → **API** in Supabase dashboard
   - Copy **Project URL** (starts with `https://`)
   - Copy **anon/public** key (long string)
3. Update `.env.production`:

```env
REACT_APP_DEMO_MODE=false
REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

4. Remove or comment out `REACT_APP_DEMO_USER_ID` (not needed in production)

---

## Step 4: Test Production Setup

### Local Testing

1. Stop your development server if running
2. Ensure `.env` or `.env.production.local` has production credentials
3. Start development server:
   ```bash
   npm start
   ```
4. You should see:
   - ❌ NO demo banner
   - ✅ Login screen appears
   - ✅ Can create new account
   - ✅ Can log in with test account

### Test Authentication

1. Click **"Sign Up"** or **"Create Account"**
2. Enter test credentials:
   - Email: `test@yourcompany.com`
   - Password: `TestPassword123!`
3. Should receive email confirmation (check Supabase Email settings)
4. Log in with test account
5. Verify dashboard loads (will be empty - no campaigns yet)

### Test Campaign Creation

1. Create a test campaign:
   - Name: "Test Campaign 1"
   - Add some phases
   - Add some posts
2. Check Supabase dashboard → **Table Editor** → `campaigns`
3. Should see your test campaign with:
   - Your `user_id` (from `auth.users`)
   - Status: `draft`
   - All data properly saved

### Test Analytics

1. Create a campaign with posts
2. Manually add some engagement data in Supabase:
   - Go to `campaign_post_platforms` table
   - Edit a row
   - Set `likes_count`, `comments_count`, etc.
3. Go to Analytics page in app
4. Should see metrics displayed

---

## Step 5: Deploy Production App

### Option A: Vercel Deployment

1. Push your code to GitHub (already done!)
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure **Environment Variables**:
   - `REACT_APP_DEMO_MODE` = `false`
   - `REACT_APP_SUPABASE_URL` = (your production URL)
   - `REACT_APP_SUPABASE_ANON_KEY` = (your production key)
6. Click **"Deploy"**
7. Wait for build to complete
8. Visit your production URL

### Option B: Netlify Deployment

1. Go to [Netlify Dashboard](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Add **Environment Variables**:
   - `REACT_APP_DEMO_MODE` = `false`
   - `REACT_APP_SUPABASE_URL` = (your production URL)
   - `REACT_APP_SUPABASE_ANON_KEY` = (your production key)
7. Click **"Deploy site"**
8. Visit your production URL

---

## Step 6: Deploy Demo Version

Your demo should use `.env.demo` configuration:

```env
REACT_APP_DEMO_MODE=true
REACT_APP_DEMO_USER_ID=d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed
REACT_APP_SUPABASE_URL=https://your-demo-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-demo-anon-key
```

Deploy separately (same steps as above, but use demo environment variables).

---

## Database Schema Overview

### Core Tables

| Table | Purpose | RLS Enabled |
|-------|---------|-------------|
| `profiles` | User profile data | ✅ Yes |
| `nova_user_sessions` | AI session tracking | ✅ Yes |
| `campaigns` | Campaign master data | ✅ Yes |
| `campaign_phases` | Campaign phases | ✅ Yes |
| `campaign_posts` | Post content | ✅ Yes |
| `campaign_post_platforms` | Platform-specific posts | ❌ No (for analytics) |
| `social_comments` | Comments from platforms | ❌ No (for analytics) |
| `content` | Content library | ✅ Yes |
| `posts` | Legacy posts | ✅ Yes |
| `social_metrics` | Platform metrics | ✅ Yes |
| `campaign_reports` | PDF reports | ✅ Yes |

### Important Notes

- **RLS Disabled on Analytics Tables**: `campaign_post_platforms` and `social_comments` have RLS disabled to allow cross-user analytics queries. This is intentional.
- **Session-Based Access**: Campaigns use `session_id` for linking to AI conversations
- **Engagement Metrics**: 10 metrics columns in `campaign_post_platforms` for tracking performance

---

## Common Issues & Solutions

### Issue: "relation does not exist"

**Solution**: Run the migration script again. Ensure you're in the correct Supabase project.

### Issue: Can't see data in app

**Solution**: 
1. Check RLS policies are correct
2. Verify your user_id matches data in tables
3. Check browser console for errors
4. Use Supabase SQL Editor to query directly

### Issue: Demo banner shows in production

**Solution**: 
1. Check `REACT_APP_DEMO_MODE=false` in your `.env`
2. Rebuild your app: `npm run build`
3. Redeploy

### Issue: Authentication not working

**Solution**:
1. Verify Supabase credentials in `.env`
2. Check Supabase Authentication settings (email auth enabled?)
3. Check email templates (confirm email working?)
4. Review Supabase logs: **Settings** → **Logs**

### Issue: Analytics showing zero data

**Solution**:
1. Verify campaigns exist with your `user_id`
2. Check `session_id` is properly set in campaigns
3. Run verification query:
   ```sql
   SELECT c.id, c.name, c.session_id, 
          (SELECT COUNT(*) FROM campaign_post_platforms cpp 
           WHERE cpp.campaign_post_id IN 
                 (SELECT id FROM campaign_posts WHERE campaign_id = c.id)) as platform_posts
   FROM campaigns c
   WHERE c.user_id = 'your-user-id-here';
   ```

---

## Data Population Tips

### For Production

- Users will create their own data through the UI
- No need to seed any data
- Consider creating a "Welcome Campaign" tutorial

### For Demo

Your demo already has data! Keep it as-is.

---

## Maintenance

### Regular Tasks

- **Weekly**: Check Supabase usage/limits
- **Monthly**: Review user activity logs
- **Quarterly**: Backup production database

### Backup Strategy

1. In Supabase dashboard: **Database** → **Backups**
2. Enable automatic backups (available on paid plans)
3. Or use `pg_dump` for manual backups:
   ```bash
   pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
   ```

### Monitoring

- Supabase dashboard: **Logs** section
- Set up alerts for:
  - Database usage
  - API usage
  - Error rates

---

## Security Checklist

- [ ] Production Supabase password is strong and stored securely
- [ ] API keys are in environment variables (NOT in code)
- [ ] RLS policies tested and working
- [ ] Email confirmation enabled (Supabase Auth settings)
- [ ] Rate limiting configured (Supabase Auth settings)
- [ ] CORS configured properly (if using custom domain)
- [ ] Demo and production databases are completely separate

---

## Support

If you encounter issues:

1. Check Supabase status: https://status.supabase.com
2. Review Supabase docs: https://supabase.com/docs
3. Check browser console for errors
4. Review Supabase logs in dashboard
5. Test queries directly in SQL Editor

---

## Success! 🎉

Your production database is now ready. You should have:

- ✅ Separate demo and production Supabase projects
- ✅ Complete database schema in production
- ✅ RLS policies protecting user data
- ✅ Demo version with auto-login
- ✅ Production version with normal auth

**Next Steps:**
1. Create your first real user account
2. Build your first real campaign
3. Monitor performance and user feedback
4. Iterate and improve!

---

## Quick Reference

### Demo Environment
- URL: (your demo deployment URL)
- Supabase: (current/demo project)
- Mode: Auto-login, demo banner visible
- Data: Fake, safe for public

### Production Environment
- URL: (your production deployment URL)
- Supabase: (new production project)
- Mode: Normal authentication required
- Data: Real user data, private

### Commands

```bash
# Start with demo mode
REACT_APP_DEMO_MODE=true npm start

# Start with production mode
REACT_APP_DEMO_MODE=false npm start

# Build for production
npm run build
```
