# VERCEL ENVIRONMENT VARIABLE

## Copy and Paste This Into Vercel

When deploying to Vercel, add this environment variable:

### Variable Name (Key):
```
VITE_API_URL
```

### Variable Value:
```
https://truthlens-backend-ztfa.onrender.com/api
```

---

## Step-by-Step Instructions

1. **Go to Vercel**: https://vercel.com/new

2. **Import Project**:
   - Select: `Owais-15/TruthLens-`
   - Click "Import"

3. **Configure Project**:
   - Framework: Vite (auto-detected)
   - **Root Directory**: `frontend` ⚠️ IMPORTANT!
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Key: `VITE_API_URL`
   - Value: `https://truthlens-backend-ztfa.onrender.com/api`
   - Click "Add"

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes

6. **Copy Your Frontend URL** when deployment completes!

---

## After Vercel Deployment

You'll need to update Render with your Vercel URL:

1. Go to: https://dashboard.render.com
2. Select: `truthlens-backend`
3. Environment tab
4. Update `FRONTEND_URL` to your Vercel URL
5. Save changes

---

## Your URLs

- Backend (Render): https://truthlens-backend-ztfa.onrender.com
- Frontend (Vercel): [You'll get this after deployment]
