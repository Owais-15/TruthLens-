# Backend Deployment to Render - Step by Step

## Your Repository
✅ GitHub: https://github.com/Owais-15/TruthLens-.git

## Step 1: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** if you haven't connected GitHub yet
4. Find and select: **"Owais-15/TruthLens-"**
5. Click **"Connect"**

## Step 2: Configure Service Settings

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `truthlens-backend` |
| **Region** | `Singapore (Southeast Asia)` (same as your Neon DB) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

## Step 3: Add Environment Variables

Click **"Advanced"** → Scroll to **"Environment Variables"** → Click **"Add Environment Variable"**

Add these **ONE BY ONE**:

### Required Variables

```
NODE_ENV=production
```

```
PORT=10000
```

```
DATABASE_URL=postgresql://neondb_owner:npg_FiXudHt27TVg@ep-silent-unit-a14atl4t-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
```

```
GEMINI_MODEL=gemini-2.0-flash-exp
```

```
EXA_API_KEY=YOUR_EXA_KEY_HERE
```

```
JWT_SECRET=YOUR_RANDOM_SECRET_HERE
```

```
JWT_REFRESH_SECRET=YOUR_RANDOM_REFRESH_SECRET_HERE
```

```
FRONTEND_URL=https://truthlens.vercel.app
```
*(We'll update this after Vercel deployment)*

### Generate JWT Secrets

Run these commands in your terminal to generate secure secrets:

```bash
# For JWT_SECRET
openssl rand -base64 32

# For JWT_REFRESH_SECRET  
openssl rand -base64 32
```

Copy each output and paste as the values above.

## Step 4: Deploy!

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. **Copy your backend URL** when it's ready (e.g., `https://truthlens-backend.onrender.com`)

---

**Let me know when Render deployment is complete and share your backend URL!** 🚀
