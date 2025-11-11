# GitHub Pages Deployment - Quick Start Checklist

## ✅ Completed Setup
- [x] GitHub Actions workflow created (`.github/workflows/deploy.yml`)
- [x] Production environment configured (`.env.production`)
- [x] Package.json already has homepage and gh-pages scripts
- [x] Deployment guide created (`GITHUB_PAGES_DEPLOYMENT.md`)

## 📋 Next Steps (Do These Now)

### 1. Enable GitHub Pages (2 minutes)
Go to: https://github.com/ideepak3m/MarketingManager/settings/pages
- Under **Source**, select: **GitHub Actions**
- Click Save

### 2. Commit and Push (1 minute)
```powershell
git add .github/workflows/deploy.yml .env.production GITHUB_PAGES_DEPLOYMENT.md DEPLOYMENT_CHECKLIST.md
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### 3. Monitor Deployment (2-5 minutes)
Go to: https://github.com/ideepak3m/MarketingManager/actions
- Watch the "Deploy to GitHub Pages" workflow run
- Wait for both jobs (build + deploy) to complete

### 4. Test Your App (5 minutes)
Visit: https://ideepak3m.github.io/MarketingManager
- Login with: `info@priorityonetech.ca`
- Verify campaigns load (should see all 3)
- Test navigation and features

### 5. Configure Custom Domain (Optional - After Testing)
If everything works on GitHub domain:
1. Go to repository Settings → Pages
2. Add custom domain: `marketing.priorityonetech.ca`
3. Configure DNS CNAME: `marketing` → `ideepak3m.github.io`
4. Wait for DNS propagation and SSL certificate

## 🎯 URLs

- **Development**: http://localhost:3000
- **GitHub Pages**: https://ideepak3m.github.io/MarketingManager
- **Custom Domain** (future): https://marketing.priorityonetech.ca

## 👤 Test Accounts

### Admin Account (Existing)
- Email: `info@priorityonetech.ca`
- Role: admin
- Can see all campaigns

### Demo Account (To be created)
- Email: `demo@priorityonetech.ca`
- Password: `DemoUser20&25`
- Role: admin (after running SQL script)
- Purpose: For demos and testing

## 🔧 Environment Variables

All configured in `.env.production`:
- ✅ REACT_APP_SUPABASE_URL
- ✅ REACT_APP_SUPABASE_ANON_KEY
- ✅ REACT_APP_N8N_CHAT_URL

## 🚀 Automatic Deployments

Once set up, automatic deployment happens on:
- Every push to `main` branch
- Manual trigger from Actions tab

## 📚 Documentation

For detailed instructions, see: `GITHUB_PAGES_DEPLOYMENT.md`

## ⚠️ Important Notes

1. **HashRouter**: URLs will have `/#/` in them (e.g., `/MarketingManager/#/campaigns`)
2. **Same Database**: Using same Supabase instance as development
3. **Admin Only**: Only admin role accounts can see all campaigns
4. **Session Architecture**: Campaigns use session_id, not auth.uid
5. **No Secrets Needed**: Environment variables are in `.env.production` file

## 🐛 Quick Troubleshooting

### Deployment fails?
- Check Actions tab for error logs
- Verify GitHub Pages is enabled in Settings

### App shows blank page?
- Open browser console (F12)
- Check for JavaScript errors
- Verify Supabase URL in `.env.production`

### Login doesn't work?
- Verify account exists in Supabase Auth
- Check browser console for API errors

### Campaigns don't load?
- Verify admin profile exists in Supabase
- Check RLS policies are configured correctly

## ✨ Success Criteria

You'll know it's working when:
- [x] Actions workflow completes successfully (green checkmark)
- [x] App loads at GitHub Pages URL
- [x] Login with admin account succeeds
- [x] Dashboard shows all 3 campaigns
- [x] Can navigate to different pages
- [x] Campaign posts and phases display
- [x] n8n chat widget loads
