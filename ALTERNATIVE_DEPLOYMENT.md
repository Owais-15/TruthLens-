# 🔧 ALTERNATIVE SOLUTION - Fresh Vercel Project

Since manual redeploy isn't working, let's create a **completely fresh Vercel project**.

## Option 1: Delete and Recreate Vercel Project (RECOMMENDED)

### Step 1: Delete Current Project
1. Go to: https://vercel.com/dashboard
2. Find project: `truth-lens-jm5j`
3. Click on it
4. **Settings** (bottom left)
5. Scroll to bottom → **"Delete Project"**
6. Type project name to confirm
7. Click **"Delete"**

### Step 2: Create Fresh Project
1. Go to: https://vercel.com/new
2. **Import Git Repository**
3. Find: `Owais-15/TruthLens-`
4. Click **"Import"**

### Step 3: Configure (CRITICAL SETTINGS)
```
Project Name: truthlens-frontend (or any name)
Framework Preset: Vite
Root Directory: frontend ⚠️ MUST SET THIS!
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 4: Environment Variables
Click **"Environment Variables"** and add:
- Key: `VITE_API_URL`
- Value: `https://truthlens-backend-ztfa.onrender.com/api`
- Environments: **Select ALL** (Production, Preview, Development)

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Get your new URL (e.g., `https://truthlens-frontend-xyz.vercel.app`)

### Step 6: Update Backend CORS
1. Go to: https://dashboard.render.com
2. Select: `truthlens-backend`
3. Environment → Edit `FRONTEND_URL`
4. Set to your NEW Vercel URL
5. Save and wait for redeploy

---

## Option 2: Use Netlify Instead

If Vercel keeps having issues, deploy to Netlify:

### Step 1: Go to Netlify
1. Open: https://app.netlify.com
2. Sign up/Login with GitHub
3. Click **"Add new site"** → **"Import an existing project"**

### Step 2: Connect GitHub
1. Select **"Deploy with GitHub"**
2. Find: `Owais-15/TruthLens-`
3. Click on it

### Step 3: Configure
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### Step 4: Environment Variables
Click **"Show advanced"** → **"New variable"**:
- Key: `VITE_API_URL`
- Value: `https://truthlens-backend-ztfa.onrender.com/api`

### Step 5: Deploy
1. Click **"Deploy site"**
2. Wait for deployment
3. Get your Netlify URL

### Step 6: Update Backend
Update `FRONTEND_URL` in Render to your Netlify URL

---

## Option 3: Manual Deploy (If All Else Fails)

Build locally and upload to Vercel manually:

### Step 1: Build Locally
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project\frontend
npm run build
```

### Step 2: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 3: Deploy
```bash
cd dist
vercel --prod
```

Follow prompts and it will deploy your built files.

---

## Recommended: Option 1 (Fresh Vercel Project)

This is the cleanest solution:
1. ✅ Deletes all cached/old deployments
2. ✅ Fresh start with correct settings
3. ✅ Environment variable properly embedded
4. ✅ Should work immediately

**Try Option 1 first!** 🚀
