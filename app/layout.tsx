/* NutriSync v2 — Root Layout
 * The root layout wraps the entire app with:
 *   - Google Fonts (Inter)
 *   - Global CSS design system
 *   - Auth context provider
 *   - HTML metadata for SEO*/

import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriSync — AI Clinical Nutrition Assistant",
  description:
    "Identify nutritional deficiencies, get personalized meal plans, and build an AI-analyzed grocery checklist. Powered by Gemini AI.",
  keywords: [
    "nutrition",
    "AI dietitian",
    "meal planner",
    "deficiency tracker",
    "grocery checklist",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — Inter for clean modern typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
