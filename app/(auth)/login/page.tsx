/* NutriSync v2 — Login Page
 * Authentication page with Google sign-in and email/password.
 * Redirects to /dashboard on successful login.*/

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, loading } = useAuth();

  /* Form state */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handle Google sign-in.
   * On success, redirect to dashboard.
   */
  async function handleGoogleSignIn() {
    try {
      setError("");
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
    }
  }

  /**
   * Handle email/password sign-in.
   */
  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background gradient accent */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(143,188,143,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Login card */}
      <div
        className="w-full max-w-md animate-slide-up"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              🥬 NutriSync
            </h1>
          </Link>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Sign in to access your nutrition dashboard
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 text-sm rounded-lg"
            style={{
              background: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              color: "var(--error)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {error}
          </div>
        )}

        {/* Google sign-in button */}
        <button
          id="google-sign-in-btn"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 p-3 mb-6 font-semibold text-sm transition-all"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-visible)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.background = "var(--bg-hover)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "var(--border-visible)";
            e.currentTarget.style.background = "var(--bg-elevated)";
          }}
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            or sign in with email
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email-input"
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Email
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password-input"
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              autoComplete="current-password"
            />
          </div>

          <button
            id="email-sign-in-btn"
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
            style={{ padding: "0.875rem", fontSize: "0.875rem" }}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Register link */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
