# NutriSync

An AI-powered clinical nutrition assistant that identifies foods to address your nutritional deficiencies and syncs them directly to your Google Tasks as a shopping checklist.

## What it does

1. User logs in with their Google account
2. Types a nutritional deficiency (e.g. "Iron", "Vitamin D", "Biotin")
3. AI dietitian agent returns 5 specific foods to address it
4. One click adds all foods to Google Tasks as a to-do/shopping list

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, NextAuth.js |
| Backend | FastAPI (Python) |
| AI | Vertex AI - Gemini 2.5 Flash |
| Database | Cloud SQL (PostgreSQL 15) |
| Auth | Google OAuth 2.0 + Google Tasks API |
| Hosting | Google Cloud Run (fully serverless) |

## Live Demo

- Frontend: https://nutrisync-frontend-428451287285.asia-south1.run.app
- Backend API: https://nutrisync-backend-428451287285.asia-south1.run.app

## Architecture

User → Next.js Frontend (Cloud Run)
↓ Google OAuth (NextAuth)
↓ POST /api/consult
FastAPI Backend (Cloud Run)
↓ Vertex AI Gemini 2.5 Flash
↓ Cloud SQL PostgreSQL
↓ Google Tasks API

## Problems Solved During Build

- Switched from AlloyDB to Cloud SQL (cost: $150/mo → $15/mo)
- Upgraded Dockerfile from Node 18 to Node 20 (Next.js 16 requirement)
- Discovered `gemini-2.5-flash` is the accessible model on trial accounts
- Fixed OAuth redirect URI mismatch after Cloud Run deployment
- Fixed IAM permissions for Cloud Build service account

## Project Structure
nutrisync/
├── backend/
│   ├── main.py          # FastAPI app + Vertex AI + Cloud SQL
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
├── app/
│   ├── page.tsx              # Landing page + chatbot UI
│   ├── layout.tsx
│   ├── providers.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── tasks/route.ts
└── Dockerfile
