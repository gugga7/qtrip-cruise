# QTrip - Travel Planning Platform

## Overview
QTrip is a modern travel planning platform built with React, TypeScript, and Supabase.

## Tech Stack
- Frontend: React + TypeScript + Vite
- State Management: Zustand
- Styling: TailwindCSS
- Backend: Supabase
- Database: PostgreSQL (via Supabase)

## Getting Started

### Prerequisites
- Node.js >= 16
- npm or yarn
- Supabase account

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/qtrip.git

# Install dependencies
cd qtrip
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm run dev
```

### Environment Variables
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure
```
qtrip/
├── docs/               # Documentation
├── public/            # Static assets
└── src/
    ├── components/    # Reusable components
    ├── hooks/         # Custom hooks
    ├── lib/           # Utilities and configurations
    ├── pages/         # Page components
    ├── store/         # Zustand store
    └── types/         # TypeScript definitions
```

## Documentation
- [Roadmap](docs/ROADMAP.md)
- [Supabase Migration](docs/SUPABASE_MIGRATION.md)
- [Contributing](docs/CONTRIBUTING.md) 

## Local Supabase (this repo)

- App URL: `http://localhost:5197`
- API URL: `http://127.0.0.1:56321`
- DB URL: `postgresql://postgres:postgres@127.0.0.1:56320/postgres`
- Studio: `http://127.0.0.1:56323`