# NutriSync v2 — Changelog

All notable changes to this project are documented here.
This file is maintained for hackathon code review purposes.

---

## [Phase 1] — Foundation & Auth
**Date:** 2026-04-29

### What was built:
- **Project initialization**: Next.js 16 project with TypeScript, Tailwind CSS v4, standalone output for Cloud Run
- **Type system**: Complete TypeScript interfaces for all data models (User, Consultation, MealPlan, GroceryList, SymptomLog, NutrientScores)
- **Firebase integration**:
  - Client SDK (`lib/firebase.ts`) — singleton pattern, Google OAuth provider with Tasks scope
  - Admin SDK (`lib/firebase-admin.ts`) — server-side only, supports both local dev and Cloud Run ADC
- **Authentication**:
  - `AuthContext` provider — Google OAuth + email/password sign-in/sign-up
  - Login page (`/login`) — Google button + email form, error handling, loading states
  - Register page (`/register`) — form validation, password confirmation
  - Auto-creates Firestore user document on first login
- **AI Client**: Gemini 2.5 Flash via `@google/genai` SDK with JSON parsing + auto-retry
- **Prompt Templates**: 5 centralized, documented prompt templates in `lib/prompts.ts`
- **Utilities**: Date formatting, BMI calculator, week ID generator, ID generation
- **Constants**: Symptom options, grocery aisle categories, navigation items
- **Environment**: `.env.local.example` with step-by-step setup instructions

### Design decisions:
- **No Python backend**: Replaced FastAPI + Vertex AI with `@google/genai` Node.js SDK (same model, zero Python)
- **Firebase over Cloud SQL**: Free tier, no schema management, trivial auth setup
- **Singleton pattern for Firebase**: Prevents re-initialization errors during Next.js hot reload
- **Centralized prompts**: All AI prompts in one auditable file for hackathon review

---

## [Phase 2] — Landing Page & Design System
**Date:** 2026-04-29

### What was built:
- **Design system** (`globals.css`):
  - Dark mode with `#0a0a0a` base background
  - Sage green accent (`#8fbc8f`) with glow effects
  - Secondary accents: lavender (`#c4b5e0`) and warm coral (`#e8a87c`)
  - Rounded corners via CSS variables (`--radius-sm` through `--radius-full`)
  - Custom scrollbar, glass morphism utility, loading skeletons
  - Animations: fade-in, slide-up, slide-in-right, pulse-glow, shimmer
  - Component classes: `.card`, `.btn-primary`, `.btn-secondary`, `.input-field`, `.badge-*`
- **Landing page** (`app/page.tsx`):
  - Glass navbar with conditional auth state (Sign In vs. Welcome back)
  - Hero section with badge, headline, subtitle, and CTA buttons
  - 6-card feature grid showcasing all capabilities
  - "How It Works" 3-step flow
  - Dashboard preview mockup with fake stats
  - Bottom CTA + footer
- **Root layout**: Google Fonts (Inter), AuthProvider wrapper, SEO metadata

### Design decisions:
- **CSS custom properties over Tailwind classes**: Design tokens as CSS variables enable consistent theming across all components
- **No component library**: Raw HTML + CSS for maximum control and minimal bundle size
- **Conditional landing page**: Shows different CTAs based on auth state (new user vs. returning)

---

## [Phase 3] — Dashboard & AI Consultation
**Date:** 2026-04-29

### What was built:
- **Dashboard Layout** (`app/dashboard/layout.tsx`):
  - Responsive sidebar with active state styling
  - Mobile hamburger menu overlay
  - Top bar with dynamic greeting based on user's display name
- **Overview Page** (`app/dashboard/page.tsx`):
  - 4-card stats grid (Deficiency, Nutrient Score, Symptom Logs, BMI)
  - Today's meal plan widget (pulls from latest generated plan)
  - Quick action links to key features
  - Symptom trend mini-chart
  - Recommended foods display
- **AI Consultation API** (`app/api/consult/route.ts`):
  - Handles both Known Gap and Symptom inference modes
  - Extracts structured JSON protocol from Gemini using SDK
  - Persists consultation data to Firestore
- **Explain API** (`app/api/explain/route.ts`):
  - Provides natural language justification for recommended foods
- **Consultation Page** (`app/dashboard/consult/page.tsx`):
  - Interactive form with dietary constraints
  - Renders AI output beautifully (foods, severity, meal plan, dos/donts, shopping list)
  - "Explain Why" button for deeper understanding

---

## [Phase 4] — Meal Planner & Grocery List
**Date:** 2026-04-29

### What was built:
- **Meal Planner API** (`app/api/meal-plan/route.ts`):
  - Generates a full 7-day meal plan based on the latest consultation
  - Stores the plan with an ISO week ID (`YYYY-Www`)
- **Meal Planner Page** (`app/dashboard/meal-planner/page.tsx`):
  - Horizontal day selector (Monday-Sunday)
  - Displays breakfast, lunch, dinner, and snacks with calories and key nutrients
- **Grocery List Page** (`app/dashboard/grocery-list/page.tsx`):
  - Automatically groups items by supermarket aisle (Produce, Dairy, Proteins, etc.)
  - Interactive checkboxes with local state management
  - Progress bar tracking completion
- **Google Tasks Sync API** (`app/api/tasks/route.ts`):
  - Uses Google Tasks REST API to create a new list ("NutriSync — YYYY-Www")
  - Adds category headers as tasks
  - Adds individual grocery items as tasks

---

## [Phase 5] — Symptom Tracker
**Date:** 2026-04-29

### What was built:
- **Symptom Tracker Page** (`app/dashboard/symptoms/page.tsx`):
  - Pre-defined chips for common nutritional symptoms (fatigue, brain fog, etc.)
  - 1-5 severity slider with color-coded labels
  - One-entry-per-day enforcement
  - 7-day trend visualization (color-coded bar chart)
  - **AI Insight Generator**: Analyzes the last 7 days of logs to provide an encouraging, actionable insight via Gemini.

---

## [Phase 6] — Health Profile
**Date:** 2026-04-29

### What was built:
- **Profile Page** (`app/dashboard/profile/page.tsx`):
  - Edit height, weight, age, sex, goals, and comma-separated dietary restrictions
  - Auto-calculates BMI
  - Displays a visual color-coded BMI scale
  - Saves directly to the `healthProfile` object in the Firestore user document

---

## [Phase 7] — Production Deployment Setup
**Date:** 2026-04-29

### What was built:
- **Standalone Build Configuration**: Updated `next.config.ts` with `output: 'standalone'`
- **Dockerfile**:
  - Multi-stage build (deps, builder, runner) based on `node:20-alpine`
  - Runs Next.js as a non-root user (`nextjs`)
  - Optimized for Google Cloud Run (exposes port 8080)
- **Middleware**: Added basic `middleware.ts` to secure routing paths if needed
- **Documentation**: Finalized `CHANGELOG.md` and prepared `README.md`
