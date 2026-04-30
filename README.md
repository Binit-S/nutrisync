#  NutriSync v2

NutriSync is an AI-powered clinical nutritionist built for the hackathon. It analyzes your dietary symptoms or known deficiencies, provides highly personalized nutrition protocols, generates 7-day meal plans, and syncs your smart grocery lists directly to Google Tasks.

##  Key Features

- **AI Consultation**: Powered by Gemini 2.5 Flash, it infers deficiencies from symptoms and provides structured protocols (severity, foods, dos/don'ts).
- **Weekly Meal Planner**: Generates full 7-day meal plans based on your AI consultation and dietary constraints.
- **Smart Grocery List**: Automatically groups items by supermarket aisle. Items appearing multiple times are flagged for bulk buying.
- **Google Tasks Sync**: One-click sync to your Google Tasks. Access your shopping list natively on your phone while at the store.
- **Symptom Tracker**: Log daily symptoms, track severity on a 7-day trend chart, and get AI insights on your progress.
- **Nutrient Scorecard**: Tracks your core nutrient levels and estimates your overall health score.

##  Architecture & Tech Stack

This project is a modern, serverless Next.js monolith replacing the legacy Python/Node split architecture.

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS v4.
- **Backend (API Routes)**: Next.js API Routes (`/api/consult`, `/api/meal-plan`, `/api/tasks`, etc.)
- **AI Integration**: `@google/genai` Node.js SDK (Gemini 2.5 Flash).
- **Authentication**: Firebase Auth (Google OAuth + Email/Password).
- **Database**: Cloud Firestore (NoSQL) for user profiles, logs, and meal plans.
- **Deployment**: Dockerized for Google Cloud Run (`output: standalone`).

##  Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.local.example` to `.env.local` and fill in the required keys:
   - Firebase config & Service Account JSON
   - Gemini API Key (from Google AI Studio)
   - Google OAuth credentials (for Tasks API)

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

##  Docker Deployment

This project uses a multi-stage Dockerfile optimized for Cloud Run.

```bash
# Build the image
docker build -t nutrisync .

# Run the container locally (requires .env.local)
docker run -p 8080:8080 --env-file .env.local nutrisync
```


---
*Built for the 2026 Hackathon.*
