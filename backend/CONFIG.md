# TruthLens Backend Configuration Guide

## Required Configuration

Before running the backend, you need to configure the following in your `.env` file:

### 1. Database Configuration
You need PostgreSQL installed. Update this line:
```
DATABASE_URL=postgresql://username:password@localhost:5432/truthlens
```

Replace:
- `username` with your PostgreSQL username (default: `postgres`)
- `password` with your PostgreSQL password

### 2. API Keys (CRITICAL - Application won't work without these)

#### Google Gemini API Key
Get your key from: https://ai.google.dev/
```
GEMINI_API_KEY=your-actual-gemini-key-here
```

#### Exa Search API Key
Get your key from: https://exa.ai/
```
EXA_API_KEY=your-actual-exa-key-here
```

### 3. JWT Secrets
Generate random strings for security (at least 32 characters):
```
JWT_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=your-random-refresh-secret-here
```

You can generate random strings using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Quick Setup Checklist

- [ ] Install PostgreSQL
- [ ] Create database: `CREATE DATABASE truthlens;`
- [ ] Get Gemini API key
- [ ] Get Exa API key
- [ ] Update DATABASE_URL in .env
- [ ] Add GEMINI_API_KEY in .env
- [ ] Add EXA_API_KEY in .env
- [ ] Generate and add JWT_SECRET in .env
- [ ] Generate and add JWT_REFRESH_SECRET in .env
- [ ] Run: `npm run db:push` to create tables
- [ ] Run: `npm run dev` to start server

## Need Help?

See SETUP.md for detailed instructions on getting API keys and setting up PostgreSQL.
