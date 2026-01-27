# Deployment Guide for TruthLens 🚀

This guide will help you deploy the TruthLens application to the internet.

## Prerequisites
- A GitHub account.
- **Vercel** account (for Frontend).
- **Render** or **Railway** account (for Backend).
- **Neon** or **Supabase** account (for PostgreSQL database).

---

## 1. Database Setup (Neon / Supabase)
1.  Create a new PostgreSQL database.
2.  Copy the **Connection String** (e.g., `postgresql://user:pass@host/dbname`).
3.  In your local terminal (backend folder), run:
    ```bash
    npm run db:push
    ```
    *Note: You'll need to update your local `.env` with the production DB URL temporarily or use flags if supported, but typically for Drizzle, you verify the schema locally and then apply it.*
    *Better approach:* set the `DATABASE_URL` environment variable in your deployment platform (Render) and let the app migrate on start if configured, or run migration script.

---

## 2. Backend Deployment (Render.com)
1.  Push your code to GitHub.
2.  Log in to Render and click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    - **Root Directory**: `backend`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
5.  **Environment Variables**:
    - `NODE_ENV`: `production`
    - `PORT`: `10000` (Render default)
    - `GEMINI_API_KEY`: (Your Google Gemini API Key)
    - `EXA_API_KEY`: (Your Exa.ai API Key)
    - `DATABASE_URL`: (Your connection string from Step 1)
    - `JWT_SECRET`: (Generate a strong random string)
    - `FRONTEND_URL`: `https://your-frontend-project.vercel.app` (You'll update this after deploying frontend)
6.  Click **Deploy**.

---

## 3. Frontend Deployment (Vercel)
1.  Log in to Vercel and **Add New Project**.
2.  Import your GitHub repository.
3.  **Project Settings**:
    - **Root Directory**: Edit this -> Select `frontend`.
    - **Framework Preset**: Vite.
    - **Build Command**: `npm run build` (default)
    - **Output Directory**: `dist` (default)
4.  **Environment Variables**:
    - `VITE_API_URL`: (The URL of your deployed Backend, e.g., `https://truthlens-backend.onrender.com/api`)
5.  Click **Deploy**.
6.  ✨ Visits the URL!

---

## 4. Final Configuration
1.  Copy the **Frontend URL** (e.g., `https://truthlens.vercel.app`).
2.  Go back to **Render (Backend)** -> Environment Variables.
3.  Update (or add) `FRONTEND_URL` with your actual Vercel URL.
4.  Redeploy the Backend (manual deploy or push a commit).
5.  This ensures CORS allows your frontend to talk to the backend.

## Troubleshooting
- **Build Fails**: Check `npm run build` output in the dashboard logs.
- **CORS Errors**: Ensure `FRONTEND_URL` in backend matches exactly (no trailing slash usually preferred, but code handles it).
- **Database Connection**: Ensure your database allows connections from anywhere (0.0.0.0/0) or whitelists Render IPs.
