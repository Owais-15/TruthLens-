# RENDER ENVIRONMENT VARIABLES - COPY/PASTE FORMAT

Add these variables ONE BY ONE in Render's Environment Variables section.
For each row: Copy the NAME, then copy the VALUE

## VARIABLE NAME → VALUE

| Variable Name | Value |
|---------------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `FRONTEND_URL` | `https://truthlens.vercel.app` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_FiXudHt27TVg@ep-silent-unit-a14atl4t-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `JWT_SECRET` | `VHxSfSphrlbWbY8YKeY5es/jTdjq6nlJ/O53hmYRG1w=` |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_SECRET` | `QRofC76EdKAC5aQdKzX7SeoYFBZQv2vAIrMxbfs13cc=` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `GEMINI_API_KEY` | `YOUR_GEMINI_KEY_HERE` ⚠️ |
| `GEMINI_MODEL` | `gemini-2.0-flash-exp` |
| `EXA_API_KEY` | `YOUR_EXA_KEY_HERE` ⚠️ |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `BCRYPT_ROUNDS` | `10` |
| `LOG_LEVEL` | `info` |

---

## COPY-PASTE FORMAT (One per line)

```
NODE_ENV
production

PORT
10000

FRONTEND_URL
https://truthlens.vercel.app

DATABASE_URL
postgresql://neondb_owner:npg_FiXudHt27TVg@ep-silent-unit-a14atl4t-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET
VHxSfSphrlbWbY8YKeY5es/jTdjq6nlJ/O53hmYRG1w=

JWT_EXPIRES_IN
15m

JWT_REFRESH_SECRET
QRofC76EdKAC5aQdKzX7SeoYFBZQv2vAIrMxbfs13cc=

JWT_REFRESH_EXPIRES_IN
7d

GEMINI_API_KEY
YOUR_GEMINI_KEY_HERE

GEMINI_MODEL
gemini-2.0-flash-exp

EXA_API_KEY
YOUR_EXA_KEY_HERE

RATE_LIMIT_WINDOW_MS
900000

RATE_LIMIT_MAX_REQUESTS
100

BCRYPT_ROUNDS
10

LOG_LEVEL
info
```

---

## ⚠️ IMPORTANT: Replace These

Before deploying, you MUST replace:
- `YOUR_GEMINI_KEY_HERE` → Your actual Gemini API key
- `YOUR_EXA_KEY_HERE` → Your actual Exa API key

Get them from:
- Gemini: https://aistudio.google.com/apikey
- Exa: https://exa.ai

---

## How to Add in Render

1. Go to: https://dashboard.render.com/create?type=web
2. Connect GitHub repo: `Owais-15/TruthLens-`
3. Configure service settings (see QUICK_DEPLOY_GUIDE.md)
4. Click "Advanced" button
5. Scroll to "Environment Variables"
6. For each variable above:
   - Click "Add Environment Variable"
   - Paste the NAME in the "Key" field
   - Paste the VALUE in the "Value" field
7. Click "Create Web Service"
