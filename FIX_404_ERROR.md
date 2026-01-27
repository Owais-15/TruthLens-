# 🔧 FIX: 404 Error - Missing /api in URL

## Problem
Getting 404 errors when trying to register/login:
```
truthlens-backend-ztfa.onrender.com/auth/register:1 Failed to load resource: the server responded with a status of 404
```

The request is going to `/auth/register` but should go to `/api/auth/register`.

## Root Cause
Your `VITE_API_URL` in Vercel is missing `/api` at the end.

**Current (WRONG)**:
```
https://truthlens-backend-ztfa.onrender.com
```

**Should be (CORRECT)**:
```
https://truthlens-backend-ztfa.onrender.com/api
```

---

## Solution: Update Vercel Environment Variable

### Step 1: Go to Vercel Settings
1. Go to: https://vercel.com/dashboard
2. Click on your project: `truth-lens-xi`
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar

### Step 2: Update VITE_API_URL
1. Find `VITE_API_URL` variable
2. Click the three dots (⋯) → **"Edit"**
3. Change value to: `https://truthlens-backend-ztfa.onrender.com/api`
   - ⚠️ **MUST end with `/api`**
4. Click **"Save"**

### Step 3: Redeploy
1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click three dots (⋯) → **"Redeploy"**
4. Confirm redeploy
5. Wait 2-3 minutes

### Step 4: Test
1. Open: https://truth-lens-xi.vercel.app
2. **Hard refresh**: `Ctrl + Shift + R`
3. Try to register/login
4. Should work now!

---

## Verify in Browser Console

After redeploying, open browser console (F12) and check:

**Network tab should show:**
```
✅ POST https://truthlens-backend-ztfa.onrender.com/api/auth/register
✅ POST https://truthlens-backend-ztfa.onrender.com/api/auth/login
```

**NOT:**
```
❌ POST https://truthlens-backend-ztfa.onrender.com/auth/register
```

---

## Quick Checklist

- [ ] Go to Vercel Settings → Environment Variables
- [ ] Edit `VITE_API_URL`
- [ ] Set to: `https://truthlens-backend-ztfa.onrender.com/api` (with `/api`)
- [ ] Save
- [ ] Redeploy from Deployments tab
- [ ] Wait for deployment
- [ ] Hard refresh browser
- [ ] Test registration/login

---

## Why `/api` is Required

Your backend routes are defined as:
```typescript
app.use('/api/auth', authRoutes);      // Auth endpoints
app.use('/api/verify', verificationRoutes);  // Verification endpoints
```

So all endpoints need the `/api` prefix:
- `/api/auth/register`
- `/api/auth/login`
- `/api/verify`
- etc.

The frontend's `api.ts` already adds `/auth/register`, so the base URL must include `/api`.
