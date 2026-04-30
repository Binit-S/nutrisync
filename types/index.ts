/* ============================================================
 * NutriSync v2 — TypeScript Type Definitions
 * ============================================================
 * Central type definitions for the entire application.
 * Every data structure that flows through the app is defined here
 * so there's a single source of truth.
 * ============================================================ */

// ─── User & Profile ──────────────────────────────────────────

/** User health profile stored in Firestore `users/{uid}` */
export interface HealthProfile {
  height: number;        // cm
  weight: number;        // kg
  age: number;
  sex: "male" | "female" | "other";
  goals: string;         // e.g., "Lose weight", "Build muscle", "Improve energy"
  dietaryRestrictions: string[]; // e.g., ["vegan", "gluten-free"]
}

/** User document stored in Firestore `users/{uid}` */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  healthProfile: HealthProfile | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── AI Consultation ─────────────────────────────────────────

/** Meal within a meal plan */
export interface MealEntry {
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  items: string[];
}

/** Structured response from the AI consultation */
export interface ConsultationResult {
  deficiency: string;
  severity: "mild" | "moderate" | "severe";
  foods: string[];
  meal_plan: MealEntry[];
  dos: string[];
  donts: string[];
  buy_list: {
    vegetables?: string[];
    fruits?: string[];
    proteins?: string[];
    dairy?: string[];
    grains?: string[];
    spices?: string[];
    others?: string[];
  };
  nutrient_scores?: NutrientScores;
}

/** Consultation document stored in Firestore `users/{uid}/consultations/{id}` */
export interface Consultation {
  id: string;
  uid: string;
  mode: "known" | "consult";
  input: string;          // deficiency text or symptoms description
  constraints: string;    // dietary constraints
  result: ConsultationResult;
  nutrientScores: NutrientScores | null;
  createdAt: Date;
}

/** Request body for the /api/consult endpoint */
export interface ConsultRequest {
  mode: "known" | "consult";
  deficiency?: string;
  symptoms?: string;
  constraints?: string;
}

/** Request body for the /api/explain endpoint */
export interface ExplainRequest {
  deficiency: string;
  foods: string[];
}

// ─── Meal Planning ───────────────────────────────────────────

/** Single day's meal plan */
export interface DayPlan {
  day: string;            // "Monday", "Tuesday", etc.
  breakfast: MealDetail;
  lunch: MealDetail;
  dinner: MealDetail;
  snack?: MealDetail;
}

/** Detailed meal with nutritional info */
export interface MealDetail {
  items: string[];
  calories: number;
  keyNutrients: string[]; // e.g., ["Iron 5mg", "Vitamin C 30mg"]
}

/** Weekly meal plan stored in Firestore `users/{uid}/mealPlans/{id}` */
export interface MealPlan {
  id: string;
  uid: string;
  weekId: string;         // "2026-W18" format
  days: DayPlan[];
  consultationId: string; // source consultation
  sourceDeficiency?: string;
  sourceFoods?: string[];
  createdAt: Date;
}

// ─── Grocery List ────────────────────────────────────────────

/** Single grocery item */
export interface GroceryItem {
  id: string;
  name: string;
  category: GroceryCategory;
  aisle: string;          // e.g., "Produce", "Dairy", "Aisle 3"
  checked: boolean;
  inMultipleWeeks: boolean; // flag for "buy in bulk" badge
  quantity?: string;
}

/** Grocery categories for smart bundling */
export type GroceryCategory =
  | "vegetables"
  | "fruits"
  | "proteins"
  | "dairy"
  | "grains"
  | "spices"
  | "others";

/** Grocery list stored in Firestore `users/{uid}/groceryLists/{id}` */
export interface GroceryList {
  id: string;
  uid: string;
  weekId: string;
  items: GroceryItem[];
  consultationId?: string;
  sourceDeficiency?: string;
  sourceMode?: "known" | "consult";
  createdAt: Date;
  updatedAt: Date;
}

// ─── Symptom Tracking ────────────────────────────────────────

/** Symptom log stored in Firestore `users/{uid}/symptomLogs/{id}` */
export interface SymptomLog {
  id: string;
  uid: string;
  date: string;           // "YYYY-MM-DD" format
  symptoms: string[];     // e.g., ["brain fog", "fatigue", "hair loss"]
  severity: number;       // 1-5 scale
  notes: string;
  createdAt: Date;
}

// ─── Nutrient Scorecard ──────────────────────────────────────

/** 9 key nutrients tracked on the radar chart */
export interface NutrientScores {
  iron: number;           // 0-100 scale
  vitaminB12: number;
  vitaminD: number;
  magnesium: number;
  calcium: number;
  zinc: number;
  folate: number;
  omega3: number;
  vitaminK: number;
}

/** Labels for the radar chart axes (matches NutrientScores keys) */
export const NUTRIENT_LABELS: (keyof NutrientScores)[] = [
  "iron",
  "vitaminB12",
  "vitaminD",
  "magnesium",
  "calcium",
  "zinc",
  "folate",
  "omega3",
  "vitaminK",
];

/** Human-readable names for nutrients */
export const NUTRIENT_DISPLAY_NAMES: Record<keyof NutrientScores, string> = {
  iron: "Iron",
  vitaminB12: "Vitamin B12",
  vitaminD: "Vitamin D",
  magnesium: "Magnesium",
  calcium: "Calcium",
  zinc: "Zinc",
  folate: "Folate",
  omega3: "Omega-3",
  vitaminK: "Vitamin K",
};
