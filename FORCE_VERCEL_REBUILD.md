# 🔧 COMPLETE FIX: Vercel Environment Variable Not Working

## The Problem
Your frontend keeps connecting to `localhost:3000` even after setting `VITE_API_URL` in Vercel.

**Why?** Vite environment variables are **embedded at build time**, not runtime. Simply adding the env var in Vercel's dashboard doesn't update the already-deployed code.

---

## ✅ SOLUTION: Force Vercel to Rebuild

I've just pushed a small change to GitHub to trigger a rebuild. Here's what's happening:

### What I Did:
1. Created `frontend/README.md` with deployment info
2. Committed and pushed to GitHub
3. Vercel will automatically detect the push and rebuild

### What You Need to Do:

#### Step 1: Verify Environment Variable in Vercel
1. Go to: https://vercel.com/dashboard
2. Click your project: `truth-lens-xi`
3. **Settings** → **Environment Variables**
4. Verify `VITE_API_URL` is set to:
   ```
   https://truthlens-backend-ztfa.onrender.com/api
   ```
5. If not, add it now with all environments selected (Production, Preview, Development)

#### Step 2: Wait for Automatic Rebuild
1. Go to **Deployments** tab
2. You should see a new deployment starting (triggered by the git push)
3. Wait 2-3 minutes for it to complete
4. Status should change to "Ready"

#### Step 3: Test Your App
1. Open: https://truth-lens-xi.vercel.app
2. **Hard refresh**: Press `Ctrl + Shift + R` (clears cache)
3. Open browser console (F12) → Network tab
4. Try to register or login
5. Check the network request URL - should be:
   ```
   ✅ https://truthlens-backend-ztfa.onrender.com/api/auth/register
   ```
   NOT:
   ```
   ❌ http://localhost:3000/api/auth/register
   ```

---

## 🔍 How to Verify It's Fixed

### In Browser Console (F12):

**Network Tab:**
- Look for requests to `truthlens-backend-ztfa.onrender.com`
- Should NOT see any requests to `localhost:3000`

**Console Tab:**
- Type: `import.meta.env.VITE_API_URL`
- Should show: `https://truthlens-backend-ztfa.onrender.com/api`
- If it shows `undefined` or `localhost`, the rebuild didn't work

---

## 🆘 If It Still Doesn't Work

### Option 1: Manual Redeploy
1. Vercel Dashboard → Deployments
2. Click latest deployment → Three dots → "Redeploy"
3. **Important**: Check "Use existing Build Cache" is UNCHECKED
4. Confirm redeploy

### Option 2: Check Environment Variable Scope
1. Settings → Environment Variables
2. Click on `VITE_API_URL`
3. Make sure it's enabled for **Production** environment
4. If not, edit and select Production
5. Save and redeploy

### Option 3: Delete and Re-add Variable
1. Delete the `VITE_API_URL` variable
2. Add it again:
   - Key: `VITE_API_URL`
   - Value: `https://truthlens-backend-ztfa.onrender.com/api`
   - Environments: All (Production, Preview, Development)
3. Trigger redeploy

---

## 📋 Deployment Checklist

- [x] Git push triggered (I did this)
- [ ] Vercel detected push and started rebuild
- [ ] `VITE_API_URL` is set in Vercel to: `https://truthlens-backend-ztfa.onrender.com/api`
- [ ] Deployment completed successfully
- [ ] Hard refresh browser (Ctrl + Shift + R)
- [ ] Test registration/login
- [ ] Verify network requests go to Render backend

---

## 🎯 Expected Result

After the rebuild completes:
1. Registration should work
2. Login should work
3. Text verification should work
4. All requests go to `https://truthlens-backend-ztfa.onrender.com/api/*`
5. No more `localhost:3000` errors

---

## ⏱️ Timeline

- **Now**: Git push sent, Vercel detecting changes
- **+1 min**: Vercel starts building
- **+3 min**: Build completes, new version deployed
- **+3.5 min**: Test your app!

**Check Vercel dashboard now to see the deployment progress!**
