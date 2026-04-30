/* 
 * NutriSync v2 — Meal Plan API Route
 * ============================================================
 * POST /api/meal-plan
 *
 * Generates a 7-day meal plan based on consultation results.
 * Stores the plan in Firestore under the user's collection.
 */

import { NextResponse } from "next/server";
import { generateAIJsonResponse } from "@/lib/gemini";
import { buildMealPlanPrompt } from "@/lib/prompts";
import { getCurrentWeekId } from "@/lib/utils";
import type { DayPlan } from "@/types";

interface MealPlanRequest {
  uid: string;
  deficiency: string;
  foods: string[];
  constraints?: string;
  consultationId?: string;
}

export async function POST(req: Request) {
  try {
    const body: MealPlanRequest = await req.json();
    const { uid, deficiency, foods, constraints, consultationId } = body;

    /* Validate */
    if (!deficiency || !foods || foods.length === 0) {
      return NextResponse.json(
        { error: "Deficiency and foods are required" },
        { status: 400 }
      );
    }

    /* Check for existing meal plan to merge */
    const weekId = getCurrentWeekId();
    let existingPlanString = "";
    let existingPlanRef = null;
    let combinedDeficiencies = deficiency;
    let combinedFoods = foods;

    if (uid) {
      try {
        const { adminDb } = await import("@/lib/firebase-admin");
        const existingSnap = await adminDb
          .collection("users")
          .doc(uid)
          .collection("mealPlans")
          .where("weekId", "==", weekId)
          .limit(1)
          .get();

        if (!existingSnap.empty) {
          const existingData = existingSnap.docs[0].data();
          existingPlanRef = existingSnap.docs[0].ref;
          if (existingData.days) {
            existingPlanString = JSON.stringify(existingData.days, null, 2);
          }
          if (existingData.sourceDeficiency && !existingData.sourceDeficiency.includes(deficiency)) {
            combinedDeficiencies = `${existingData.sourceDeficiency}, ${deficiency}`;
          }
          if (existingData.sourceFoods) {
            combinedFoods = Array.from(new Set([...existingData.sourceFoods, ...foods]));
          }
        }
      } catch (e) {
        console.error("Failed to check existing plan:", e);
      }
    }

    /* Build prompt and call Gemini */
    const prompt = buildMealPlanPrompt(deficiency, foods, constraints || "", existingPlanString);
    const result = await generateAIJsonResponse<{ days: DayPlan[] }>(prompt);

    /* Store or update in Firestore */
    if (uid) {
      try {
        const { adminDb } = await import("@/lib/firebase-admin");
        const docData = {
          uid,
          weekId,
          days: result.days,
          consultationId: consultationId || "",
          sourceDeficiency: combinedDeficiencies,
          sourceFoods: combinedFoods,
          updatedAt: new Date(),
        };

        if (existingPlanRef) {
          await existingPlanRef.update(docData);
        } else {
          await adminDb
            .collection("users")
            .doc(uid)
            .collection("mealPlans")
            .add({
              ...docData,
              createdAt: new Date(),
            });
        }
      } catch (dbError) {
        console.error("Failed to store meal plan:", dbError);
      }
    }

    return NextResponse.json({ weekId, consultationId: consultationId || "", ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Meal plan error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
