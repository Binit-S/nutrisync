/* 
 * NutriSync v2 — Authentication Context Provider
 * Wraps the entire app to provide auth state to all components.
 *
 * Features:
 *   - Listens to Firebase onAuthStateChanged
 *   - Provides login (Google + Email), register, and logout methods
 *   - Creates/updates user document in Firestore on login
 *
 * Usage:
 *   import { useAuth } from "@/context/AuthContext";
 *   const { user, signInWithGoogle, signOut } = useAuth();
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────

interface AuthContextType {
  /** Current Firebase user (null if not logged in) */
  user: User | null;
  /** True while checking initial auth state */
  loading: boolean;
  /** Sign in with Google popup */
  signInWithGoogle: () => Promise<void>;
  /** Sign in with email and password */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Register new user with email, password, and display name */
  signUp: (email: string, password: string, name: string) => Promise<void>;
  /** Sign out and clear state */
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => { },
  signInWithEmail: async () => { },
  signUp: async () => { },
  logout: async () => { },
});

// ─── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Listen for auth state changes on mount.
   * Firebase persists the session, so this fires immediately
   * with the cached user on page refresh.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      /* Ensure user document exists in Firestore */
      if (firebaseUser) {
        await ensureUserDocument(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Create or update the user's Firestore document.
   * Uses merge to preserve existing health profile data.
   */
  async function ensureUserDocument(firebaseUser: User) {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      /* First-time user — create document */
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "User",
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || "",
        healthProfile: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      /* Returning user — update last seen */
      await setDoc(
        userRef,
        {
          displayName: firebaseUser.displayName || userSnap.data().displayName,
          photoURL: firebaseUser.photoURL || userSnap.data().photoURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  /**
   * Google OAuth sign-in via popup.
   */
  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  /**
   * Email/password sign-in.
   */
  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  /**
   * Register a new user with email, password, and display name.
   * Updates the Firebase profile with the display name.
   */
  async function signUp(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    /* Re-set user to trigger context update with new displayName */
    setUser({ ...result.user });
  }

  /**
   * Sign out and clear all local state.
   */
  async function logout() {
    await firebaseSignOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

/**
 * Custom hook to access auth state and methods.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
