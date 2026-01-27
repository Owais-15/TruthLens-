# 🔧 FIX: Frontend Connecting to Localhost Instead of Render

## Problem
Your frontend is trying to connect to `localhost:3000` instead of your Render backend:
```
POST http://localhost:3000/api/verify/progressive net::ERR_CONNECTION_REFUSED
```

This means the `VITE_API_URL` environment variable wasn't properly configured in Vercel.

---

## Solution: Update Vercel Environment Variable

### Step 1: Go to Vercel Project Settings
1. Go to: https://vercel.com/dashboard
2. Click on your project: `TruthLens-` or `truth-lens-xi`
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar

### Step 2: Check/Add VITE_API_URL

Look for `VITE_API_URL` variable:

**If it exists but is wrong:**
- Click the three dots (⋯) next to it
- Click "Edit"
- Change value to: `https://truthlens-backend-ztfa.onrender.com/api`
- Click "Save"

**If it doesn't exist:**
- Click "Add New"
- Key: `VITE_API_URL`
- Value: `https://truthlens-backend-ztfa.onrender.com/api`
- Environment: Select all (Production, Preview, Development)
- Click "Save"

### Step 3: Redeploy

**IMPORTANT**: Environment variable changes require a redeploy!

**Option A: Trigger Redeploy from Vercel Dashboard**
1. Go to "Deployments" tab
2. Click on the latest deployment
3. Click the three dots (⋯)
4. Click "Redeploy"
5. Confirm redeploy

**Option B: Push a Small Change to GitHub**
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project

# Make a small change (add a comment)
echo "# Updated" >> frontend/README.md

# Commit and push
git add .
git commit -m "Trigger redeploy with correct API URL"
git push
```

Vercel will automatically redeploy when it detects the push.

### Step 4: Wait for Deployment
- Wait 2-3 minutes for Vercel to rebuild
- Check deployment status at: https://vercel.com/dashboard

### Step 5: Test Again
1. Open: https://truth-lens-xi.vercel.app
2. **Hard refresh**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Login
4. Submit text for verification
5. Should now connect to Render backend!

---

## Verify It's Fixed

Open browser console (F12) and check the network requests:
- Should see: `POST https://truthlens-backend-ztfa.onrender.com/api/verify/progressive`
- NOT: `POST http://localhost:3000/api/verify/progressive`

---

## Why This Happened

Vite environment variables (prefixed with `VITE_`) are **embedded at build time**, not runtime. This means:
- If you added the env var AFTER the first deployment, the build didn't include it
- You must redeploy for the new env var to take effect
- Simply adding the env var doesn't update the already-built code

---

## Quick Checklist

- [ ] Go to Vercel Settings → Environment Variables
- [ ] Add/Update `VITE_API_URL` = `https://truthlens-backend-ztfa.onrender.com/api`
- [ ] Trigger redeploy (via dashboard or git push)
- [ ] Wait for deployment to complete
- [ ] Hard refresh your browser (Ctrl + Shift + R)
- [ ] Test verification - should work!
