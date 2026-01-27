# TruthLens Setup Status

## ✅ Completed Steps

1. **Dependencies Installed**
   - ✅ Backend: 347 packages installed
   - ✅ Frontend: 266 packages installed

2. **Configuration Files Created**
   - ✅ Backend `.env` file created
   - ✅ Configuration guide created

3. **Security Keys Generated**
   ```
   JWT_SECRET=9f6cd44154394466d2fbaa435591ae35a9752054ba005a6f0f77b6c8fcb5655a
   JWT_REFRESH_SECRET=7c071ddd57baece3d8d79fd64c63b7db57063d1af27419efa687806d210e62eb
   ```

## ⚠️ Required Before Running

### 1. Install PostgreSQL

**Download and Install:**
- Go to: https://www.postgresql.org/download/windows/
- Download PostgreSQL 14 or higher
- Run the installer
- **Remember the password you set for the `postgres` user!**
- Default port: 5432

**Create Database:**
After installation, open Command Prompt and run:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (in psql prompt)
CREATE DATABASE truthlens;

# Exit
\q
```

### 2. Get API Keys

#### Google Gemini API
1. Go to: https://ai.google.dev/
2. Sign in with Google account
3. Click "Get API Key"
4. Create new API key
5. Copy the key (starts with `AIza...`)

#### Exa Search API
1. Go to: https://exa.ai/
2. Sign up for account
3. Navigate to API Keys
4. Generate new API key
5. Copy the key

### 3. Update .env File

Edit: `C:\Users\Admin\OneDrive\Documents\FInal_year_project\backend\.env`

Update these lines:
```env
# Replace with your PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/truthlens

# Add your Gemini API key
GEMINI_API_KEY=AIza...your-actual-key

# Add your Exa API key
EXA_API_KEY=your-actual-exa-key

# Use the generated secrets (already done for you!)
JWT_SECRET=9f6cd44154394466d2fbaa435591ae35a9752054ba005a6f0f77b6c8fcb5655a
JWT_REFRESH_SECRET=7c071ddd57baece3d8d79fd64c63b7db57063d1af27419efa687806d210e62eb
```

## 🚀 After Configuration

### Initialize Database
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project\backend
npm run db:push
```

### Start Backend Server
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project\backend
npm run dev
```

### Start Frontend Server (in new terminal)
```bash
cd C:\Users\Admin\OneDrive\Documents\FInal_year_project\frontend
npm run dev
```

### Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📝 Quick Checklist

- [ ] Install PostgreSQL
- [ ] Create `truthlens` database
- [ ] Get Gemini API key from https://ai.google.dev/
- [ ] Get Exa API key from https://exa.ai/
- [ ] Update DATABASE_URL in .env with your PostgreSQL password
- [ ] Add GEMINI_API_KEY to .env
- [ ] Add EXA_API_KEY to .env
- [ ] Run `npm run db:push` in backend folder
- [ ] Run `npm run dev` in backend folder
- [ ] Run `npm run dev` in frontend folder (new terminal)
- [ ] Open http://localhost:5173 and create account!

## 🆘 Need Help?

See detailed guides:
- `SETUP.md` - Complete setup instructions
- `CONFIG.md` - Configuration help
- `README.md` - Project overview

## 🎯 What's Next?

Once you complete the checklist above:
1. Open http://localhost:5173
2. Click "Sign up" to create an account
3. Login with your credentials
4. Try verifying some AI-generated text!

**Sample text to verify:**
```
The Eiffel Tower was completed in 1889 and stands 324 meters tall. 
It was designed by Gustave Eiffel for the 1889 World's Fair in Paris.
```
