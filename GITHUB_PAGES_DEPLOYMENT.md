# GitHub Pages Deployment Guide

## Overview
This guide walks you through deploying the Marketing Manager app to GitHub Pages at `https://ideepak3m.github.io/MarketingManager`.

## Prerequisites
- [x] Repository exists: `ideepak3m/MarketingManager`
- [x] GitHub Actions workflow created: `.github/workflows/deploy.yml`
- [x] Production environment file created: `.env.production`
- [x] Package.json configured with homepage and gh-pages scripts

## Step 1: Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: https://github.com/ideepak3m/MarketingManager
2. Click on **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar under "Code and automation")
4. Under **Source**, select: **GitHub Actions**
5. Save the settings

## Step 2: Commit and Push Deployment Files

```powershell
# Add the workflow and production env files
git add .github/workflows/deploy.yml
git add .env.production
git add GITHUB_PAGES_DEPLOYMENT.md

# Commit the changes
git commit -m "Add GitHub Pages deployment workflow and production config"

# Push to main branch
git push origin main
```

## Step 3: Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Click on it to see the progress
4. Wait for both "build" and "deploy" jobs to complete (green checkmarks)

The deployment typically takes 2-5 minutes.

## Step 4: Access Your Deployed App

Once deployment is complete, visit:
- **GitHub Pages URL**: https://ideepak3m.github.io/MarketingManager

## Step 5: Test the Deployment

1. **Login with Admin Account**:
   - Email: `info@priorityonetech.ca`
   - Password: (your existing password)
   
2. **Or Login with Demo Account** (after creating it):
   - Email: `demo@priorityonetech.ca`
   - Password: `DemoUser20&25`

3. **Verify Features**:
   - [ ] Login works correctly
   - [ ] Dashboard loads with campaigns
   - [ ] Admin can see all 3 campaigns
   - [ ] Campaign posts and phases display correctly
   - [ ] n8n chat widget loads and functions
   - [ ] Navigation between pages works (Home, Campaigns, Content, Analytics, etc.)

## Step 6: Configure Custom Domain (After Testing)

Once you've verified the GitHub Pages deployment works:

1. Go to **Settings → Pages** in your GitHub repository
2. Under **Custom domain**, enter: `marketing.priorityonetech.ca`
3. Click **Save**

4. Configure DNS at your domain provider:
   - Add a **CNAME** record:
     - Name: `marketing`
     - Value: `ideepak3m.github.io`
     - TTL: 3600 (or default)

5. Wait for DNS propagation (can take a few minutes to 48 hours)
6. GitHub will automatically provision an SSL certificate
7. Access your app at: https://marketing.priorityonetech.ca

## Troubleshooting

### Deployment Fails
- Check the Actions tab for error messages
- Common issues:
  - GitHub Pages not enabled in Settings
  - Workflow file has syntax errors
  - Build errors (check console output in Actions)

### App Loads But Shows Blank Page
- Open browser console (F12) to check for errors
- Verify `.env.production` has correct Supabase credentials
- Check that homepage in package.json matches deployment URL

### Login Doesn't Work
- Verify Supabase URL in `.env.production` is correct
- Check that demo account exists in Supabase Auth
- Verify RLS policies are properly configured

### Campaigns Don't Load
- Verify admin profile exists in Supabase profiles table
- Check browser console for API errors
- Verify RLS policies allow admin access

## Environment Files

### `.env.production` (Used by GitHub Pages)
```bash
REACT_APP_SUPABASE_URL=https://dgixdsalyudglthesnxp.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_N8N_CHAT_URL=https://n8n.srv1043251.hstgr.cloud/webhook/...
```

### `.env.local` (Used for local development)
Same values as production, but includes additional development flags.

## Automatic Deployments

After initial setup, deployments happen automatically:
- Every push to `main` branch triggers a new deployment
- You can also manually trigger deployment from Actions tab → Deploy to GitHub Pages → Run workflow

## Manual Deployment (Alternative)

If you prefer to deploy manually from your local machine:

```powershell
# Build and deploy
npm run deploy
```

This runs the `gh-pages` package which builds and pushes to the `gh-pages` branch.

## Notes

- **HashRouter**: The app uses HashRouter with `basename="/MarketingManager"`, so URLs will have `/#/` in them (e.g., `https://ideepak3m.github.io/MarketingManager/#/campaigns`)
- **Supabase**: Using the same Supabase instance for both dev and production
- **Admin Access**: Both `info@priorityonetech.ca` and `demo@priorityonetech.ca` have admin role and can see all campaigns
- **Session Architecture**: Campaigns use session_id (not auth.uid) due to n8n integration requirements

## Support

If you encounter issues:
1. Check the Actions tab for build/deploy logs
2. Check browser console for runtime errors
3. Verify Supabase connection and RLS policies
4. Review this guide's troubleshooting section
