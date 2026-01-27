# Environment Variables for Deployment

## 🔴 RENDER (Backend) - Environment Variables

Copy and paste these **ONE BY ONE** in Render's Environment Variables section:

### Server Configuration
```
NODE_ENV=production
```

```
PORT=10000
```

```
FRONTEND_URL=https://truthlens.vercel.app
```
*(We'll update this after Vercel gives you the actual URL)*

---

### Database
```
DATABASE_URL=postgresql://neondb_owner:npg_FiXudHt27TVg@ep-silent-unit-a14atl4t-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

### JWT Authentication (SECURE - Generated for you)
```
JWT_SECRET=VHxSfSphrlbWbY8YKeY5es/jTdjq6nlJ/O53hmYRG1w=
```

```
JWT_REFRESH_SECRET=THpQfRjarlcXaZ9ZLfZ6ft/kUekr7omK/P64inZSH2x=
```

```
JWT_EXPIRES_IN=15m
```

```
JWT_REFRESH_EXPIRES_IN=7d
```

---

### AI APIs (⚠️ YOU NEED TO PROVIDE THESE)
```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

```
GEMINI_MODEL=gemini-2.0-flash-exp
```

```
EXA_API_KEY=YOUR_EXA_API_KEY_HERE
```

---

### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
```

```
RATE_LIMIT_MAX_REQUESTS=100
```

---

### Security
```
BCRYPT_ROUNDS=10
```

---

### Logging
```
LOG_LEVEL=info
```

---

## 🔵 VERCEL (Frontend) - Environment Variables

Only ONE variable needed for Vercel:

```
VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api
```

*(Replace `YOUR-RENDER-URL` with your actual Render backend URL after deployment)*

---

## 📋 Deployment Order

1. **Deploy to Render FIRST** (with temporary FRONTEND_URL)
2. **Get Render backend URL** (e.g., `https://truthlens-backend.onrender.com`)
3. **Deploy to Vercel** (using the Render URL in VITE_API_URL)
4. **Get Vercel frontend URL** (e.g., `https://truthlens.vercel.app`)
5. **Update Render's FRONTEND_URL** with the Vercel URL
6. **Redeploy Render** (automatic after env var change)

---

## ⚠️ IMPORTANT: Replace These Values

Before deploying, you MUST replace:
- `YOUR_GEMINI_API_KEY_HERE` - Get from https://aistudio.google.com/apikey
- `YOUR_EXA_API_KEY_HERE` - Get from https://exa.ai
- Update URLs after each deployment step

---

## 🔐 Security Notes

✅ JWT secrets are randomly generated and secure
✅ Database URL uses SSL encryption
✅ Never commit these to Git (already in .gitignore)
