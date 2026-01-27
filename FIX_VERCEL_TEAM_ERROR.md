# 🔧 FIX: Vercel "Not a Member of Team" Error

## The Problem
Vercel deployment failed with "you are not the member of the team" error.

This happens when:
- The project is connected to a different Vercel account
- The GitHub repo is linked to a team you don't have access to
- The Vercel project was created under a different account

---

## ✅ SOLUTION: Create New Vercel Project

The easiest fix is to create a fresh Vercel project under YOUR account.

### Step 1: Delete Old Project (Optional)
If you have access to the old project:
1. Go to: https://vercel.com/dashboard
2. Find `truth-lens-xi` project
3. Settings → Delete Project

If you don't have access, just skip this step.

### Step 2: Create New Vercel Project

1. **Go to Vercel**: https://vercel.com/new

2. **Import Repository**:
   - Click "Import Project" or "Add New..."
   - Select "Import Git Repository"
   - Find: `Owais-15/TruthLens-`
   - Click "Import"

3. **Configure Project**:
   ```
   Project Name: truthlens (or any name you want)
   Framework Preset: Vite (should auto-detect)
   Root Directory: frontend ⚠️ IMPORTANT - Click "Edit" and set this!
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add ONE variable:
     - Key: `VITE_API_URL`
     - Value: `https://truthlens-backend-ztfa.onrender.com/api`
     - Select all environments (Production, Preview, Development)
   - Click "Add"

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - **Copy your new frontend URL** (e.g., `https://truthlens-abc.vercel.app`)

---

## Step 3: Update Backend CORS

After Vercel deployment completes:

1. **Go to Render**: https://dashboard.render.com
2. **Select**: `truthlens-backend` service
3. **Environment** tab
4. **Update** `FRONTEND_URL` to your NEW Vercel URL
5. **Save Changes**
6. Wait for Render to redeploy (~2 minutes)

---

## Step 4: Test Your App

1. Open your NEW Vercel URL
2. Hard refresh: `Ctrl + Shift + R`
3. Register an account
4. Login
5. Submit text for verification
6. Everything should work!

---

## 🔍 Verify Environment Variable is Set

After deployment, check that the env var is embedded:

1. Open your Vercel URL
2. Open browser console (F12)
3. Type: `import.meta.env.VITE_API_URL`
4. Should show: `https://truthlens-backend-ztfa.onrender.com/api`

---

## 📋 Deployment Checklist

- [ ] Go to https://vercel.com/new
- [ ] Import `Owais-15/TruthLens-` repository
- [ ] Set Root Directory to `frontend`
- [ ] Add `VITE_API_URL` environment variable
- [ ] Deploy and wait for completion
- [ ] Copy new Vercel URL
- [ ] Update `FRONTEND_URL` in Render
- [ ] Wait for Render redeploy
- [ ] Test the app!

---

## 🎯 What You'll Get

After completing these steps:
- **New Vercel URL**: `https://truthlens-[random].vercel.app`
- **Working frontend** connected to your Render backend
- **No more team permission errors**
- **Fully functional TruthLens app!**

---

## 💡 Pro Tip

When creating the new project, make sure you're logged into YOUR personal Vercel account, not a team account. You can check this in the top-right corner of Vercel dashboard.

---

**Let me know your new Vercel URL once deployment completes, and I'll help you update the backend!** 🚀
