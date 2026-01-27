# 🚀 Deployment Checklist - Follow These Steps

## ✅ STEP 1: Deploy Backend to Render

### 1.1 Create Web Service
- [ ] Go to: https://dashboard.render.com/create?type=web
- [ ] Click "Connect account" (if needed) to link GitHub
- [ ] Find repository: `Owais-15/TruthLens-`
- [ ] Click "Connect"

### 1.2 Configure Service
Fill in these settings:

```
Name: truthlens-backend
Region: Singapore (Southeast Asia)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
```

### 1.3 Add Environment Variables
- [ ] Click "Advanced" button
- [ ] Scroll to "Environment Variables" section
- [ ] Click "Add Environment Variable" for each one
- [ ] Copy from RENDER_VARIABLES_TABLE.md (15 variables total)
- [ ] Make sure to replace GEMINI_API_KEY and EXA_API_KEY with your actual keys

### 1.4 Deploy
- [ ] Click "Create Web Service"
- [ ] Wait 5-10 minutes for build to complete
- [ ] **COPY YOUR BACKEND URL** (e.g., https://truthlens-backend.onrender.com)
- [ ] Save it - you'll need it for Vercel!

---

## ✅ STEP 2: Deploy Frontend to Vercel

### 2.1 Create Project
- [ ] Go to: https://vercel.com/new
- [ ] Click "Import Project"
- [ ] Select: `Owais-15/TruthLens-`
- [ ] Click "Import"

### 2.2 Configure Project
```
Framework Preset: Vite (should auto-detect)
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.3 Add Environment Variable
- [ ] Click "Environment Variables"
- [ ] Add ONE variable:
  - Key: `VITE_API_URL`
  - Value: `https://YOUR-RENDER-URL.onrender.com/api`
  - (Replace YOUR-RENDER-URL with your actual Render URL from Step 1.4)

### 2.4 Deploy
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] **COPY YOUR FRONTEND URL** (e.g., https://truthlens.vercel.app)

---

## ✅ STEP 3: Connect Backend and Frontend

### 3.1 Update Backend CORS
- [ ] Go back to Render: https://dashboard.render.com
- [ ] Select your service: `truthlens-backend`
- [ ] Click "Environment" tab
- [ ] Find variable: `FRONTEND_URL`
- [ ] Update value to your actual Vercel URL (from Step 2.4)
- [ ] Click "Save Changes"
- [ ] Wait for auto-redeploy (~2 minutes)

---

## ✅ STEP 4: Test Your Live App!

- [ ] Open your Vercel URL in browser
- [ ] Click "Register" and create a test account
- [ ] Login with your test account
- [ ] Submit some text for verification
- [ ] Verify you see real-time results streaming in

---

## 🎉 SUCCESS!

Your TruthLens app is now live at:
- Frontend: [Your Vercel URL]
- Backend: [Your Render URL]

Share your frontend URL with others to let them try it!

---

## 🆘 Troubleshooting

**Build fails on Render?**
- Check logs in Render dashboard
- Verify Root Directory is `backend`
- Ensure all environment variables are set

**Frontend can't connect to backend?**
- Check VITE_API_URL ends with `/api`
- Verify Render backend is deployed and running
- Check browser console for CORS errors

**CORS errors?**
- Ensure FRONTEND_URL in Render matches Vercel URL exactly
- No trailing slash on URLs
- Wait for Render to finish redeploying after updating FRONTEND_URL
