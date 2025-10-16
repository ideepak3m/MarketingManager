# Troubleshooting "Failed to fetch" Error

## 🔍 **Common Causes & Solutions**

### 1. **Environment Variables Issue**
**Check:** Is your `.env.local` file correctly configured?

**Location:** `d:\Documents\Business\Software\PriorityOneTechService\MarketingManager\.env.local`

**Should contain:**
```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Fix:**
- Ensure no spaces around the `=` sign
- No quotes around the values
- File must be named `.env.local` (not `.env`)
- Restart the dev server after changing env variables

### 2. **Supabase Project Configuration**
**Check:** Is your Supabase project set up correctly?

**Verify in Supabase Dashboard:**
- Go to Settings → API
- Confirm Project URL matches your env variable
- Confirm anon/public key matches your env variable
- Check if your project is paused or has issues

### 3. **Network/CORS Issues**
**Check:** Browser network tab for actual error

**Common issues:**
- Corporate firewall blocking Supabase
- VPN interfering with connection
- Browser blocking third-party requests

### 4. **Authentication Settings**
**Check:** Supabase Auth configuration

**In Supabase Dashboard:**
- Go to Authentication → Settings
- Ensure "Enable email confirmations" is configured
- Check Site URL (should include localhost:3000 for development)

## 🚀 **Quick Debugging Steps**

### Step 1: Check Environment
```bash
# Stop the dev server (Ctrl+C)
# Then restart to reload env variables
npm start
```

### Step 2: Check Browser Console
1. Open browser Dev Tools (F12)
2. Look at Console tab for errors
3. Look at Network tab for failed requests
4. Check what the actual error message is

### Step 3: Verify Supabase Credentials
1. Go to your Supabase dashboard
2. Settings → API
3. Copy URL and Key again
4. Make sure they match your `.env.local` exactly

### Step 4: Test Connection
The debug component should now show in the top-right corner of your app. It will tell you:
- ✅ Environment variables are set correctly
- ✅ Supabase connection is working
- ❌ What specifically is failing

## 📋 **What to check right now:**

1. **Restart your dev server** - Environment variables need a restart
2. **Check the debug panel** in the top-right corner
3. **Look at browser console** for specific error messages
4. **Verify your `.env.local` file** exists and has correct format

## 🔧 **If still failing:**

Share with me:
1. What the debug panel shows
2. Any console error messages
3. Your `.env.local` format (hide the actual key values)
4. Your Supabase project URL from dashboard

The debug component will show exactly what's wrong!