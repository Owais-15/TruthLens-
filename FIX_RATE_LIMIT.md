# 🔧 FIX: Gemini API Rate Limit (429 Error)

## The Problem
You are hitting the rate limit for model `gemini-2.5-flash` on the free tier.
Error: `[429 Too Many Requests] You exceeded your current quota`

## The Solution
Switch to `gemini-1.5-flash`, which is stable and has generous free tier limits.

---

## Step 1: Update Render Environment Variable (IMMEDIATE FIX)

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Select **`truthlens-backend`** service
3. Click **"Environment"** tab
4. Find **`GEMINI_MODEL`**
   - **If it exists**: Edit it to `gemini-1.5-flash`
   - **If missing**: Add new variable
     - Key: `GEMINI_MODEL`
     - Value: `gemini-1.5-flash`
5. Click **"Save Changes"**

Render will redeploy automatically. This is the fastest fix!

---

## Step 2: Code Update (Long-term Fix)

I have also updated the backend code to default to `gemini-1.5-flash` if the environment variable is missing.
- **Changed**: `gemini-2.5-flash` → `gemini-1.5-flash`
- **Action**: I'm pushing this change to GitHub now.

---

## ⏱️ Timeline

1. **Update Render Env Var**: Takes ~2 mins to redeploy.
2. **Push Code**: Backup measure.

**DO STEP 1 NOW!** It will fix the verification timeout.
