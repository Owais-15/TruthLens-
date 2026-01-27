# TruthLens Setup Guide

Complete step-by-step guide to set up TruthLens locally.

## Prerequisites Installation

### 1. Install Node.js

Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should be v18 or higher
npm --version
```

### 2. Install PostgreSQL

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is 5432

**Verify installation:**
```bash
psql --version
```

### 3. Create Database

Open PostgreSQL command line (psql):
```bash
psql -U postgres
```

Create the database:
```sql
CREATE DATABASE truthlens;
\q
```

### 4. Get API Keys

#### Google Gemini API
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key (starts with `AIza...`)

#### Exa Search API
1. Go to [Exa.ai](https://exa.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project\backend
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Express.js
- TypeScript
- Drizzle ORM
- Google Gemini SDK
- Exa Search SDK
- And more...

### 3. Configure Environment Variables

Copy the example environment file:
```bash
copy .env.example .env
```

Edit `.env` file with your actual values:
```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/truthlens

# JWT Authentication (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY=AIza...your-actual-key
GEMINI_MODEL=gemini-2.0-flash-exp

# Exa Search API
EXA_API_KEY=your-exa-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=info
```

**Important:** Replace:
- `YOUR_PASSWORD` with your PostgreSQL password
- `GEMINI_API_KEY` with your actual Gemini API key
- `EXA_API_KEY` with your actual Exa API key
- `JWT_SECRET` and `JWT_REFRESH_SECRET` with random strings (at least 32 characters)

### 4. Initialize Database Schema

Push the schema to your database:
```bash
npm run db:push
```

This creates all necessary tables (users, verifications, claims, metrics).

### 5. Start Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

You should see:
```
🚀 TruthLens Backend running on http://localhost:3000
📊 Environment: development
🔗 Frontend URL: http://localhost:5173
```

Keep this terminal open!

## Frontend Setup

### 1. Open New Terminal

Navigate to frontend directory:
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project\frontend
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Zustand

### 3. Configure Environment (Optional)

Create `.env` file if you need custom API URL:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Start Frontend Server

```bash
npm run dev
```

You should see:
```
  VITE v6.0.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## First Run

### 1. Open Browser

Navigate to: `http://localhost:5173`

### 2. Create Account

1. Click "Sign up"
2. Enter your email and password
3. Click "Create Account"

### 3. Verify Sample Text

Try this sample AI-generated text:
```
The Eiffel Tower was completed in 1889 and stands 324 meters tall. 
It was designed by Gustave Eiffel for the 1889 World's Fair in Paris. 
The tower receives approximately 7 million visitors annually, making it 
the most visited paid monument in the world.
```

Click "Verify Text" and watch the magic happen!

## Troubleshooting

### Backend won't start

**Error: "Cannot connect to database"**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Test connection: `psql -U postgres -d truthlens`

**Error: "Invalid API key"**
- Verify GEMINI_API_KEY and EXA_API_KEY are correct
- Check for extra spaces in `.env` file

### Frontend won't start

**Error: "Port 5173 is already in use"**
```bash
# Kill the process using the port
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Verification fails

**Error: "Verification limit exceeded"**
- Default free tier allows 100 verifications/month
- Check your usage in the UI header

**Error: "Verification timeout"**
- Text might be too long (max 5000 characters)
- API might be slow - try again

## Development Tips

### View Database

Use Drizzle Studio:
```bash
cd backend
npm run db:studio
```

Opens a web UI at `http://localhost:4983`

### Check Logs

Backend logs appear in the terminal where you ran `npm run dev`

### Reset Database

```bash
cd backend
npm run db:push
```

This recreates all tables (WARNING: deletes all data!)

## Production Deployment

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
```

The `dist` folder contains the production build.

## Next Steps

- Explore the verification interface
- Check out the verification history page
- Read the API documentation
- Customize the UI colors in `tailwind.config.js`
- Add more features!

## Getting Help

- Check the main [README.md](./README.md)
- Review error messages in terminal
- Check browser console (F12) for frontend errors
- Verify all environment variables are set correctly

---

**Happy Verifying! 🎉**
