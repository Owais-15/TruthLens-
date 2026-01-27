# TruthLens

Real-Time AI Hallucination Detection & Verification System

## Project Structure

```
FInal_year_project/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── db/             # Database schema and connection
│   │   ├── middleware/     # Auth, rate limiting, validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── store/         # State management
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── README.md              # Main documentation
└── SETUP.md              # Setup instructions
```

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Technology Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Drizzle ORM
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **APIs**: Google Gemini 2.0 Flash, Exa Search API
- **Auth**: JWT with bcrypt

## License

MIT
