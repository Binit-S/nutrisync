/* ============================================================
 * NutriSync v2 — Utility Functions
 * ============================================================
 * General-purpose utility functions used across the app.
 * ============================================================ */

/**
 * Get the current ISO week identifier (e.g., "2026-W18").
 * Used as the key for meal plans and grocery lists.
 */
export function getCurrentWeekId(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

/**
 * Format a Firestore timestamp or Date to a readable string.
 * @param date - Date object or ISO string
 * @returns Formatted string like "Apr 29, 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date to YYYY-MM-DD string for Firestore keys.
 */
export function toDateKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Calculate BMI from height (cm) and weight (kg).
 * @returns BMI value rounded to 1 decimal place
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category label and color class.
 */
export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-yellow-400" };
  if (bmi < 25) return { label: "Normal", color: "text-green-400" };
  if (bmi < 30) return { label: "Overweight", color: "text-orange-400" };
  return { label: "Obese", color: "text-red-400" };
}

/**
 * Generate a unique ID string.
 * Used for local state before Firestore assigns its own ID.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Get today's day name (e.g., "Monday").
 */
export function getTodayName(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}
