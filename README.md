Markdown
# NutriSync v2

NutriSync is an AI-powered clinical nutritionist built to analyze dietary symptoms or known deficiencies, provide personalized nutrition protocols, generate 7-day meal plans, and synchronize smart grocery lists directly to Google Tasks. 

Author: Binit

## Key Features

* AI Consultation: Inters deficiencies from symptoms and provides structured protocols (severity, foods, dos/donts) using Gemini 2.5 Flash.
* Weekly Meal Planner: Generates comprehensive 7-day meal plans based on AI consultations and dietary constraints.
* Smart Grocery List: Groups items by supermarket aisle automatically. Flags recurring items for bulk purchasing.
* Google Tasks Synchronization: One-click synchronization to Google Tasks for native mobile access while shopping.
* Symptom Tracker: Logs daily symptoms, tracks severity on a 7-day trend chart, and generates AI-driven progress insights.
* Nutrient Scorecard: Tracks core nutrient levels and estimates overall health scores.

## Architecture & Tech Stack

This application is built as a serverless Next.js monolith.

* Frontend: Next.js 16.2 (App Router), React 19.1, Tailwind CSS 3.4
* Backend: Next.js API Routes 
* AI Integration: @google/genai Node.js SDK (Gemini 2.5 Flash), Vercel AI SDK
* Authentication: Firebase Auth 11.6 (Google OAuth, Email/Password), NextAuth 4.24
* Database: Cloud Firestore (NoSQL)
* Deployment: Dockerized for Google Cloud Run (output: standalone)

## Local Development Setup

1. Install Dependencies
```bash
npm install
Environment Configuration
Copy the example environment file and populate the required keys:

Bash
cp .env.local.example .env.local
Required variables:

Firebase configuration & Service Account JSON

Gemini API Key

Google OAuth credentials (for Tasks API)

Run Development Server

Bash
npm run dev
Navigate to http://localhost:3000 in your browser.

Docker Deployment
The project utilizes a multi-stage Dockerfile optimized for Google Cloud Run deployments.

Build the container image:

Bash
docker build -t nutrisync .
Execute the container locally:

Bash
docker run -p 8080:8080 --env-file .env.local nutrisync

---
*Built for the 2026 Hackathon.*
