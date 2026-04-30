/* ============================================================
 * NutriSync v2 — Firebase Admin SDK Configuration
 * ============================================================
 * Server-side only. Used in API routes for secure Firestore access.
 * The Admin SDK bypasses Firestore security rules, so it should
 * NEVER be imported in client components.
 *
 * Usage (in API routes only):
 *   import { adminDb } from "@/lib/firebase-admin";
 *
 * Environment variable required (server-only, no NEXT_PUBLIC_ prefix):
 *   - FIREBASE_SERVICE_ACCOUNT  (JSON string of the service account key)
 * ============================================================ */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initialize Firebase Admin SDK.
 * Uses FIREBASE_SERVICE_ACCOUNT environment variable containing
 * the full service account JSON as a string.
 *
 * Falls back to Application Default Credentials when running on
 * Cloud Run (where the service account is attached automatically).
 */
let adminApp: App;

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccount) {
    /* Local development: parse JSON from environment variable */
    const parsed = JSON.parse(serviceAccount);
    if (parsed.private_key) {
      // Fix literal '\n' characters that may not have been unescaped by dotenv
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    adminApp = initializeApp({
      credential: cert(parsed),
    });
  } else {
    /* Cloud Run: uses Application Default Credentials automatically */
    adminApp = initializeApp();
  }
} else {
  adminApp = getApps()[0];
}

/** Admin Firestore instance — server-side only */
export const adminDb = getFirestore(adminApp);

export default adminApp;
