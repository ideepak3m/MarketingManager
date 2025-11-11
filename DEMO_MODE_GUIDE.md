# Demo Mode vs Production Deployment Guide

## Quick Overview

You now have **two separate versions** of your Marketing Manager app:

| Aspect | Demo Version | Production Version |
|--------|--------------|-------------------|
| **Purpose** | Public showcase | Real business use |
| **Authentication** | Auto-login (no password) | Normal signup/login |
| **Data** | Fake demo data | Real user data |
| **Database** | Current Supabase project | NEW Supabase project |
| **Banner** | Shows "🎭 DEMO MODE" | No banner |
| **URL Example** | demo.yoursite.com | app.yoursite.com |
| **Environment** | `.env.demo` | `.env.production` |

---

## How It Works

### Demo Mode (REACT_APP_DEMO_MODE=true)

1. **AuthContext.js** detects demo mode from environment variable
2. Automatically logs in as demo user (no login screen)
3. **DemoBanner.js** displays purple banner at top
4. All features work normally with fake data
5. Visitors can explore without creating accounts

### Production Mode (REACT_APP_DEMO_MODE=false)

1. Normal Supabase authentication
2. Users must signup/login
3. No demo banner
4. Real user data isolation with RLS
5. Each user only sees their own data

---

## Environment Files

### .env.demo (For Demo Deployment)

```env
# Demo Mode Configuration
REACT_APP_DEMO_MODE=true
REACT_APP_DEMO_USER_ID=d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

# Current Demo Supabase Project
REACT_APP_SUPABASE_URL=https://your-demo-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-demo-anon-key
```

**Use this for**: Public demo site where anyone can explore

### .env.production (For Production Deployment)

```env
# Production Mode Configuration
REACT_APP_DEMO_MODE=false

# NEW Production Supabase Project
REACT_APP_SUPABASE_URL=https://your-production-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key
```

**Use this for**: Real business app with paying customers

---

## Deployment Strategy

### Recommended Setup: Two Separate Deployments

#### Demo Site
- **URL**: demo.marketingmanager.com (or similar)
- **Purpose**: Let prospects try before they buy
- **Environment**: `.env.demo`
- **Features**:
  - No login required
  - Explore all features
  - Demo banner visible
  - Fake data safe to view
  
**Deploy to**: Vercel, Netlify, or any static host

#### Production Site
- **URL**: app.marketingmanager.com (or similar)
- **Purpose**: Real business operations
- **Environment**: `.env.production`
- **Features**:
  - Secure login required
  - User data isolation
  - No demo banner
  - Real campaigns and analytics

**Deploy to**: Vercel, Netlify, or any static host (same process, different env vars)

---

## Deployment Steps

### Deploy Demo Version

#### Vercel
```bash
# From your project directory
vercel --prod

# When prompted, set environment variables:
REACT_APP_DEMO_MODE=true
REACT_APP_DEMO_USER_ID=d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed
REACT_APP_SUPABASE_URL=(your demo Supabase URL)
REACT_APP_SUPABASE_ANON_KEY=(your demo anon key)
```

#### Netlify
1. Go to Netlify dashboard
2. **New site** → **Import from Git**
3. Select your repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Environment variables (from `.env.demo`)
6. Deploy

### Deploy Production Version

Same steps as demo, but:
- Use `.env.production` values
- Set `REACT_APP_DEMO_MODE=false`
- Use your NEW production Supabase credentials
- Point to different domain (app.yoursite.com)

---

## Testing Guide

### Test Demo Mode Locally

1. Copy `.env.demo` to `.env`:
   ```bash
   copy .env.demo .env
   ```

2. Start dev server:
   ```bash
   npm start
   ```

3. Verify:
   - ✅ No login screen (auto-logged in)
   - ✅ Purple demo banner at top
   - ✅ Dashboard shows demo data
   - ✅ Can create/edit campaigns
   - ✅ Analytics shows demo metrics

### Test Production Mode Locally

1. Copy `.env.production` to `.env`:
   ```bash
   copy .env.production .env
   ```

2. Update with your NEW Supabase credentials (from Step 2 of MIGRATION_README.md)

3. Start dev server:
   ```bash
   npm start
   ```

4. Verify:
   - ✅ Login screen appears
   - ✅ NO demo banner
   - ✅ Can signup new account
   - ✅ Can login existing account
   - ✅ Dashboard empty (no data yet)
   - ✅ Can create real campaigns

---

## Code Changes Made

### Files Modified for Demo Mode

1. **src/context/AuthContext.js**
   - Added `isDemoMode` detection
   - Auto-login logic for demo user
   - Bypasses Supabase auth when demo mode enabled

2. **src/components/DemoBanner.js** (NEW FILE)
   - Purple gradient banner
   - Shows demo mode indicator
   - Only renders when `isDemoMode === true`

3. **src/components/Layout.js**
   - Added `<DemoBanner />` component
   - Positioned at top of app

4. **.env.demo** (NEW FILE)
   - Demo mode configuration

5. **.env.production** (NEW FILE)
   - Production mode configuration

### No Other Files Changed

All your existing features work the same in both modes:
- Dashboard (real metrics)
- Campaigns (full lifecycle)
- Analytics (6 visualizations)
- Chat with Nova AI
- All other pages

---

## Common Scenarios

### "I want visitors to try the app before signing up"
→ Use **Demo deployment** with `.env.demo`

### "I want paying customers to use the app"
→ Use **Production deployment** with `.env.production`

### "I want both"
→ Deploy **TWICE** with different configurations:
   - `demo.yoursite.com` → Demo mode
   - `app.yoursite.com` → Production mode

### "Can I switch between modes locally?"
→ Yes! Just swap your `.env` file:
```bash
# Test demo mode
copy .env.demo .env
npm start

# Test production mode
copy .env.production .env
npm start
```

---

## Security Notes

### Demo Mode Security
- ✅ All data is fake (you confirmed this)
- ✅ No real user information exposed
- ✅ Safe to make public
- ⚠️ Anyone can view/edit demo data (that's the point!)

### Production Mode Security
- ✅ RLS policies protect user data
- ✅ Each user only sees their own campaigns
- ✅ Supabase handles authentication
- ✅ Separate database from demo

### Best Practices
- **NEVER** put production credentials in demo deployment
- **NEVER** put real user data in demo database
- **ALWAYS** use separate Supabase projects
- **ALWAYS** use environment variables (never hardcode keys)

---

## Troubleshooting

### Demo banner shows in production
**Fix**: Check `REACT_APP_DEMO_MODE=false` in production environment variables

### Can't login in production
**Fix**: 
1. Verify Supabase URL/key are correct
2. Check Supabase Auth is enabled
3. Try creating new account instead of logging in

### Demo mode not auto-logging in
**Fix**:
1. Verify `REACT_APP_DEMO_MODE=true`
2. Verify demo user ID is correct
3. Check browser console for errors

### Data from demo showing in production (or vice versa)
**Fix**: Verify you're using different Supabase projects. Check environment variables.

---

## Environment Variable Reference

### All Available Variables

```env
# Mode Control (required)
REACT_APP_DEMO_MODE=true|false

# Demo Mode Only (optional, only when DEMO_MODE=true)
REACT_APP_DEMO_USER_ID=d902b3e3-a230-4bfa-ace4-cafc1a5bd5ed

# Supabase Credentials (required)
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...long-key-here
```

### How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

---

## Quick Start Checklist

### For Demo Deployment
- [ ] Create `.env.demo` file
- [ ] Set `REACT_APP_DEMO_MODE=true`
- [ ] Add demo user ID
- [ ] Add demo Supabase credentials (current project)
- [ ] Deploy to hosting (Vercel/Netlify)
- [ ] Test auto-login works
- [ ] Test demo banner shows

### For Production Deployment
- [ ] Create NEW Supabase project
- [ ] Run `PRODUCTION_MIGRATION.sql` script
- [ ] Verify all tables created
- [ ] Create `.env.production` file
- [ ] Set `REACT_APP_DEMO_MODE=false`
- [ ] Add NEW Supabase credentials
- [ ] Deploy to hosting (Vercel/Netlify)
- [ ] Test signup/login works
- [ ] Test NO demo banner shows

---

## Maintenance

### Updating Demo Data
Since demo mode uses real Supabase database, you can:
1. Log into Supabase (demo project)
2. Use Table Editor to update demo data
3. Or create campaigns through the demo UI
4. Consider resetting demo data monthly

### Updating Production
- Users create their own data
- Monitor Supabase usage dashboard
- Set up backups (see MIGRATION_README.md)

---

## Summary

You now have a **flexible deployment strategy**:

✅ **Demo Mode**
- Public showcase
- No barriers to entry
- Fake data safe to share
- Purple banner indicates demo

✅ **Production Mode**
- Real business operations  
- Secure authentication
- User data isolation
- Professional experience

Both modes use the **same codebase** - just different environment variables! 🎉

---

## Next Steps

1. ✅ Read `MIGRATION_README.md` for production database setup
2. ✅ Test demo mode locally
3. ✅ Create production Supabase project
4. ✅ Test production mode locally
5. ✅ Deploy demo version
6. ✅ Deploy production version
7. 🚀 Share demo link with prospects!

---

**Questions?** Review the troubleshooting section or check the console logs for specific errors.
