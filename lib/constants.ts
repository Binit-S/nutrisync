/* ============================================================
 * NutriSync v2 — App Constants
 * ============================================================
 * Centralized constants used throughout the application.
 * ============================================================ */

/** Predefined symptom options for the symptom tracker */
export const SYMPTOM_OPTIONS = [
  "Fatigue",
  "Brain fog",
  "Hair loss",
  "Brittle nails",
  "Muscle cramps",
  "Dizziness",
  "Pale skin",
  "Headaches",
  "Insomnia",
  "Joint pain",
  "Numbness/tingling",
  "Mood changes",
  "Poor appetite",
  "Slow wound healing",
] as const;

/** Grocery aisle categories for smart bundling */
export const AISLE_CATEGORIES = {
  vegetables: { label: "Produce — Vegetables", emoji: "🥦", order: 1 },
  fruits: { label: "Produce — Fruits", emoji: "🍎", order: 2 },
  proteins: { label: "Meat & Proteins", emoji: "🥩", order: 3 },
  dairy: { label: "Dairy & Eggs", emoji: "🥛", order: 4 },
  grains: { label: "Bread & Grains", emoji: "🍞", order: 5 },
  spices: { label: "Spices & Condiments", emoji: "🌿", order: 6 },
  others: { label: "Other Items", emoji: "🛒", order: 7 },
} as const;

/** Days of the week for meal planner */
export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Navigation items for the dashboard sidebar */
export const DASHBOARD_NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "home" },
  { label: "Consult AI", href: "/dashboard/consult", icon: "sparkles" },
  { label: "Meal Planner", href: "/dashboard/meal-planner", icon: "calendar" },
  { label: "Grocery List", href: "/dashboard/grocery-list", icon: "cart" },
  { label: "Symptoms", href: "/dashboard/symptoms", icon: "activity" },
  { label: "Profile", href: "/dashboard/profile", icon: "user" },
] as const;
