# 🔧 FIX CORS ERROR - Update Backend URL

## The Problem
```
Access-Control-Allow-Origin' header has a value 'https://truth-lens-xi.vercel.app' 
that is not equal to the supplied origin 'https://truth-lens-jm5j.vercel.app'
```

Your backend is configured for the OLD Vercel URL, but you have a NEW Vercel URL.

**Old URL**: `https://truth-lens-xi.vercel.app`  
**New URL**: `https://truth-lens-jm5j.vercel.app` ✅

---

## ✅ SOLUTION: Update Render Environment Variable

### Step 1: Go to Render
1. Open: https://dashboard.render.com
2. Click on your service: `truthlens-backend`

### Step 2: Update FRONTEND_URL
1. Click **"Environment"** tab in the left sidebar
2. Find the variable: `FRONTEND_URL`
3. Click the **pencil/edit icon** next to it
4. Change value from:
   ```
   https://truth-lens-xi.vercel.app
   ```
   To:
   ```
   https://truth-lens-jm5j.vercel.app
   ```
   ⚠️ **No trailing slash!**

5. Click **"Save Changes"**

### Step 3: Wait for Redeploy
- Render will automatically redeploy (takes ~2 minutes)
- Watch for the status to change from "Deploying" to "Live"

### Step 4: Test Your App
1. Go to: https://truth-lens-jm5j.vercel.app
2. **Hard refresh**: `Ctrl + Shift + R`
3. Try to register an account
4. Should work now! ✅

---

## 🎉 After This Fix

Everything should work:
- ✅ Registration
- ✅ Login  
- ✅ Text verification
- ✅ Real-time results
- ✅ No more CORS errors!

---

## Your Final URLs

- **Frontend**: https://truth-lens-jm5j.vercel.app
- **Backend**: https://truthlens-backend-ztfa.onrender.com
- **Database**: Neon PostgreSQL

**Let me know once Render finishes redeploying and we'll test together!** 🚀
