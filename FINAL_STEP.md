# 🎉 FINAL DEPLOYMENT STEP - Connect Frontend & Backend

## ✅ Your Deployed URLs

- **Frontend (Vercel)**: https://truth-lens-xi.vercel.app
- **Backend (Render)**: https://truthlens-backend-ztfa.onrender.com

---

## 🔗 Step 1: Update Backend CORS Settings

Your backend needs to know which frontend URL to allow. Follow these steps:

### Instructions:

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Select Your Service**: Click on `truthlens-backend`

3. **Go to Environment Tab**: Click "Environment" in the left sidebar

4. **Find FRONTEND_URL**: Scroll to find the `FRONTEND_URL` variable

5. **Update the Value**:
   - Current value: `https://truthlens.vercel.app`
   - **New value**: `https://truth-lens-xi.vercel.app`
   - ⚠️ **IMPORTANT**: Remove the trailing slash `/` - use exactly: `https://truth-lens-xi.vercel.app`

6. **Save Changes**: Click "Save Changes" button

7. **Wait for Redeploy**: Render will automatically redeploy (takes ~2 minutes)

---

## 🧪 Step 2: Test Your Application

Once Render shows "Live" status again:

### 1. Open Your App
Go to: https://truth-lens-xi.vercel.app

### 2. Register an Account
- Click "Register"
- Enter email and password
- Create your account

### 3. Login
- Use your credentials to login

### 4. Test Verification
- Submit some text (e.g., "The Earth is flat and vaccines cause autism")
- Watch the real-time verification happen
- See claims being analyzed
- Check the trust score

### 5. Verify Features Work
- ✅ Registration works
- ✅ Login works
- ✅ Text submission works
- ✅ Real-time updates appear
- ✅ Trust score is calculated
- ✅ Evidence is shown

---

## 🆘 Troubleshooting

### "Network Error" or "Failed to fetch"
- Check that `FRONTEND_URL` in Render is exactly: `https://truth-lens-xi.vercel.app`
- No trailing slash
- Wait for Render to finish redeploying

### CORS Errors in Browser Console
- Open browser console (F12)
- If you see CORS errors, verify `FRONTEND_URL` matches your Vercel URL exactly
- Clear browser cache and try again

### Backend Not Responding
- Check Render dashboard - service should show "Live"
- Check Render logs for errors
- Verify all environment variables are set

---

## 🎉 SUCCESS!

Once everything works, you have successfully deployed TruthLens!

**Your live app**: https://truth-lens-xi.vercel.app

Share this URL with others to let them try your AI-powered fact-checking system!

---

## 📊 What's Next?

### Monitor Your App
- **Render Logs**: https://dashboard.render.com (check for errors)
- **Vercel Analytics**: https://vercel.com/dashboard (see usage stats)
- **Neon Database**: https://console.neon.tech (monitor database)

### Optional Improvements
- Add custom domain to Vercel
- Set up monitoring/alerts
- Add more verification sources
- Improve UI/UX based on user feedback

---

## 🎊 Congratulations!

You've successfully deployed a full-stack AI application with:
- ✅ React + TypeScript frontend on Vercel
- ✅ Node.js + Express backend on Render
- ✅ PostgreSQL database on Neon
- ✅ Google Gemini AI integration
- ✅ Exa API for evidence retrieval
- ✅ Real-time SSE streaming
- ✅ JWT authentication
- ✅ Production-ready architecture

**Well done!** 🚀
