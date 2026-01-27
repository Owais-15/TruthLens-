# 🚀 Quick Deployment Guide

## ✅ What's Done
- [x] Database: Neon PostgreSQL setup complete
- [x] GitHub: Code pushed to https://github.com/Owais-15/TruthLens-.git
- [x] Environment Variables: Generated with secure JWT secrets

## 📋 What You Need
1. **Gemini API Key** - Get from: https://aistudio.google.com/apikey
2. **Exa API Key** - Get from: https://exa.ai

## 🎯 Deployment Steps

### Step 1: Deploy Backend to Render (10 minutes)

1. **Go to Render**: https://dashboard.render.com/create?type=web

2. **Connect GitHub**:
   - Select: `Owais-15/TruthLens-`
   - Click "Connect"

3. **Configure Service**:
   ```
   Name: truthlens-backend
   Region: Singapore (Southeast Asia)
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables**:
   - Click "Advanced"
   - Open file: `RENDER_ENV_VARS.txt`
   - Copy each variable ONE BY ONE into Render
   - **IMPORTANT**: Replace these with your actual keys:
     - `GEMINI_API_KEY=your-actual-gemini-key`
     - `EXA_API_KEY=your-actual-exa-key`

5. **Deploy**:
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - **Copy your backend URL** (e.g., `https://truthlens-backend.onrender.com`)

---

### Step 2: Deploy Frontend to Vercel (3 minutes)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Project**:
   - Select: `Owais-15/TruthLens-`
   - Click "Import"

3. **Configure**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build (default)
   Output Directory: dist (default)
   ```

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add ONE variable:
     ```
     Name: VITE_API_URL
     Value: https://YOUR-RENDER-URL.onrender.com/api
     ```
   - Replace `YOUR-RENDER-URL` with your actual Render URL from Step 1

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - **Copy your frontend URL** (e.g., `https://truthlens.vercel.app`)

---

### Step 3: Update Backend CORS (2 minutes)

1. **Go back to Render**: https://dashboard.render.com

2. **Select your service**: `truthlens-backend`

3. **Update Environment Variable**:
   - Go to "Environment" tab
   - Find `FRONTEND_URL`
   - Change from `https://truthlens.vercel.app` to your actual Vercel URL
   - Click "Save Changes"
   - Service will auto-redeploy

---

### Step 4: Test Your App! 🎉

1. Open your Vercel URL in browser
2. Click "Register" and create an account
3. Submit some text for verification
4. Watch the real-time verification happen!

---

## 🆘 Troubleshooting

**Backend won't build?**
- Check Render logs for errors
- Verify all environment variables are set
- Make sure Root Directory is `backend`

**Frontend can't connect?**
- Verify `VITE_API_URL` matches your Render URL exactly
- Check it ends with `/api`

**CORS errors?**
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
- No trailing slash

---

## 📞 Next Steps

Once deployed, let me know:
1. Your Render backend URL
2. Your Vercel frontend URL
3. Any errors you encounter

I'll help you test and verify everything works! 🚀
