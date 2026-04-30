/* ============================================================
 * NutriSync v2 — Firebase Client SDK Configuration
 * ============================================================
 * Initializes the Firebase client SDK for use in React components.
 * Uses the singleton pattern to prevent re-initialization.
 *
 * Usage:
 *   import { auth, db } from "@/lib/firebase";
 *
 * Environment variables required (NEXT_PUBLIC_ prefix = safe for browser):
 *   - NEXT_PUBLIC_FIREBASE_API_KEY
 *   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   - NEXT_PUBLIC_FIREBASE_APP_ID
 * ============================================================ */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration object.
 * All values are sourced from environment variables.
 * The NEXT_PUBLIC_ prefix makes them available client-side.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id",
};

/**
 * Singleton Firebase app instance.
 * Checks if an app already exists before initializing to prevent
 * "Firebase App already exists" errors during hot reloading.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/** Firebase Authentication instance */
export const auth = getAuth(app);

/** Google OAuth provider for quick sign-in */
export const googleProvider = new GoogleAuthProvider();

/** Cloud Firestore database instance */
export const db = getFirestore(app);

export default app;
