# 🎉 TruthLens Setup Complete!

## ✅ What's Been Done

### 1. Dependencies Installed
- ✅ Backend: 347 packages
- ✅ Frontend: 266 packages

### 2. Environment Configuration
- ✅ Database: PostgreSQL connected to `TruthLens` database
- ✅ Gemini API: Configured with **gemini-2.5-flash** model
- ✅ Exa Search API: Configured and ready
- ✅ JWT Secrets: Generated secure keys
- ✅ All environment variables set

### 3. Database Initialized
Created 4 tables in PostgreSQL:
- ✅ `users` - User accounts and authentication
- ✅ `verifications` - Verification history and results
- ✅ `claims` - Individual claim analysis
- ✅ `metrics` - Performance monitoring

### 4. Servers Running
- ✅ **Backend**: http://localhost:3000 (Express + TypeScript)
- ✅ **Frontend**: http://localhost:5173 (React + Vite)

---

## 🚀 How to Use TruthLens

### Step 1: Open the Application

Open your web browser and go to:
```
http://localhost:5173
```

You should see the TruthLens login page with a dark, glassmorphism design.

### Step 2: Create an Account

1. Click **"Sign up"** or **"Create Account"**
2. Fill in:
   - **Name**: Your name
   - **Email**: Your email address
   - **Password**: At least 8 characters
   - **Confirm Password**: Same password
3. Click **"Create Account"**

### Step 3: Login

1. Enter your email and password
2. Click **"Login"**
3. You'll be redirected to the Dashboard

### Step 4: Verify AI-Generated Text

1. In the text area, paste some AI-generated content
2. Example text to try:
   ```
   The Eiffel Tower was completed in 1889 and stands 324 meters tall. 
   It was designed by Gustave Eiffel for the 1889 World's Fair in Paris. 
   The tower receives approximately 7 million visitors annually, making it 
   the most visited paid monument in the world.
   ```
3. Click **"Verify Text"**
4. Wait 3-5 seconds for the analysis

### Step 5: Review Results

You'll see:
- **Trust Score** (0-100) with a circular gauge
- **Highlighted Text** with color-coded claims:
  - 🟢 **Green** = Verified (evidence supports)
  - 🔴 **Red** = Contradicted (evidence contradicts)
  - 🟡 **Yellow** = Unverified (insufficient evidence)
- **Click any highlighted claim** to see:
  - Detailed analysis
  - Evidence sources with links
  - Confidence scores
  - Reasoning

### Step 6: View History

- Click **"History"** in the navigation
- See all your past verifications
- Click any verification to view details

---

## 🎨 Features to Explore

### Interactive Text Highlighting
- Claims are highlighted in real-time
- Click any claim to see evidence
- Color-coded by verification status

### Evidence Panel
- Shows source articles
- Includes relevance scores
- Links to original sources
- Displays reasoning

### Trust Score
- Overall reliability percentage
- Summary statistics
- Processing time
- Visual gauge

### User Dashboard
- Shows your verification count
- Displays tier limits (Free: 100/month)
- Quick access to history

---

## 🔧 Server Management

### To Stop Servers
Press `Ctrl + C` in each terminal window

### To Restart Servers

**Backend:**
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project\backend
npm run dev
```

**Frontend:**
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project\frontend
npm run dev
```

### Check Server Status
- Backend health: http://localhost:3000/health
- Frontend: http://localhost:5173

---

## 📊 What Happens During Verification

### Three-Stage Pipeline

**Stage 1: Claim Extraction** (Gemini 2.5 Flash)
- Decomposes text into atomic claims
- Identifies claim types
- Tracks character positions

**Stage 2: Evidence Retrieval** (Exa Search)
- Searches for relevant sources
- Retrieves top 5 articles per claim
- Scores relevance

**Stage 3: Entailment Classification** (Gemini 2.5 Flash)
- Compares claims against evidence
- Classifies: entailment, contradiction, neutral
- Calculates confidence scores

**Final: Trust Score Calculation**
- Aggregates all verdicts
- Weights by confidence
- Returns 0-100 score

---

## 🎯 Tips for Best Results

1. **Text Length**: 10-5000 characters works best
2. **Factual Content**: Works best with verifiable facts
3. **Clear Claims**: Simple, declarative statements
4. **Wait Time**: Allow 3-5 seconds for processing
5. **API Limits**: Free tier = 100 verifications/month

---

## 🐛 Troubleshooting

### Frontend Won't Load
- Check if frontend server is running
- Verify http://localhost:5173 is accessible
- Check browser console (F12) for errors

### Backend Errors
- Check backend terminal for error messages
- Verify database connection
- Ensure API keys are correct

### Verification Fails
- Check API key validity
- Verify internet connection
- Check rate limits

### Database Issues
- Ensure PostgreSQL is running
- Verify database name: `TruthLens`
- Check connection string in `.env`

---

## 📁 Project Structure

```
FInal_year_project/
├── backend/           # Express API server
│   ├── src/
│   │   ├── db/       # Database schema
│   │   ├── services/ # Verification pipeline
│   │   ├── routes/   # API endpoints
│   │   └── server.ts # Entry point
│   └── .env          # Configuration
│
└── frontend/         # React application
    ├── src/
    │   ├── components/ # UI components
    │   ├── pages/      # Page views
    │   └── services/   # API client
    └── package.json
```

---

## 🎓 Next Steps

1. **Try Different Content**: Test with various AI-generated texts
2. **Explore History**: Review past verifications
3. **Check Evidence**: Click claims to see sources
4. **Monitor Usage**: Track your verification count
5. **Read Documentation**: Check README.md for more details

---

## 🌟 You're All Set!

Your TruthLens MVP is fully operational and ready to detect AI hallucinations!

**Quick Start:**
1. Open http://localhost:5173
2. Create an account
3. Paste AI-generated text
4. Click "Verify Text"
5. Explore the results!

Enjoy using TruthLens! 🚀
