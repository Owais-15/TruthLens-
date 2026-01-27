# 🔵 VERCEL FRONTEND DEPLOYMENT

## ✅ Backend Status
Your Render backend is LIVE! 🎉

## 📋 Vercel Deployment Steps

### Step 1: Go to Vercel
Open: https://vercel.com/new

### Step 2: Import Your Repository
1. Click **"Import Project"** or **"Add New..."** → **"Project"**
2. If not connected, click **"Connect Git Provider"** → Select **GitHub**
3. Find and select: **`Owais-15/TruthLens-`**
4. Click **"Import"**

### Step 3: Configure Project Settings

Vercel should auto-detect Vite. Verify these settings:

```
Framework Preset: Vite (auto-detected)
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**IMPORTANT**: Click **"Edit"** next to Root Directory and set it to: `frontend`

### Step 4: Add Environment Variable

Click **"Environment Variables"** section and add:

**Variable Name:**
```
VITE_API_URL
```

**Variable Value:**
```
https://YOUR-RENDER-BACKEND-URL.onrender.com/api
```

⚠️ **REPLACE** `YOUR-RENDER-BACKEND-URL` with your actual Render URL!

**Example:**
If your Render URL is `https://truthlens-backend.onrender.com`, then use:
```
https://truthlens-backend.onrender.com/api
```

**CRITICAL**: Make sure it ends with `/api`

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will show you the deployment URL
4. **COPY YOUR FRONTEND URL** (e.g., `https://truthlens.vercel.app` or `https://truthlens-xyz.vercel.app`)

---

## 🔗 Step 6: Connect Frontend and Backend

After Vercel deployment completes:

1. **Go to Render**: https://dashboard.render.com
2. **Select**: `truthlens-backend` service
3. **Click**: "Environment" tab
4. **Find**: `FRONTEND_URL` variable
5. **Update** value to your Vercel URL (e.g., `https://truthlens-xyz.vercel.app`)
6. **Click**: "Save Changes"
7. **Wait**: ~2 minutes for Render to redeploy

---

## 🎉 Test Your App!

1. Open your Vercel URL in browser
2. Click **"Register"** and create an account
3. Login with your credentials
4. Submit some text for verification
5. Watch real-time verification happen!

---

## 🆘 Troubleshooting

**Build fails on Vercel?**
- Check Root Directory is set to `frontend`
- Verify Build Command is `npm run build`

**Can't connect to backend?**
- Check `VITE_API_URL` ends with `/api`
- Verify your Render backend URL is correct
- Open browser console (F12) to see errors

**CORS errors?**
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
- No trailing slash on URLs
- Wait for Render to finish redeploying

---

## 📝 What You Need

**Before starting, tell me:**
1. What is your Render backend URL? (e.g., `https://truthlens-backend-xyz.onrender.com`)

I'll give you the exact `VITE_API_URL` value to use!
