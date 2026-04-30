import { NextResponse } from "next/server";
import { generateMultimodalJsonResponse } from "@/lib/gemini";
import { buildFridgePrompt } from "@/lib/prompts";
import { getCurrentWeekId } from "@/lib/utils";
import type { DayPlan } from "@/types";

interface FridgePlanRequest {
  uid: string;
  imageBase64: string; // just the base64 string without data prefix
  mimeType: string;
  deficiencies: string[];
}

interface FridgePlanResponse {
  identifiedIngredients: string[];
  days: DayPlan[];
}

export async function POST(req: Request) {
  try {
    const body: FridgePlanRequest = await req.json();
    const { uid, imageBase64, mimeType, deficiencies } = body;

    if (!uid || !imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "UID, image, and mimeType are required" },
        { status: 400 }
      );
    }

    const prompt = buildFridgePrompt(deficiencies || []);
    
    // Call Gemini Vision Multimodal
    const result = await generateMultimodalJsonResponse<FridgePlanResponse>(
      prompt,
      imageBase64,
      mimeType
    );

    const weekId = getCurrentWeekId();

    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      await adminDb
        .collection("users")
        .doc(uid)
        .collection("fridgePlans")
        .add({
          uid,
          weekId,
          days: result.days,
          identifiedIngredients: result.identifiedIngredients,
          deficiencies: deficiencies || [],
          createdAt: new Date(),
        });
    } catch (dbError) {
      console.error("Failed to store fridge plan:", dbError);
    }

    return NextResponse.json({ weekId, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Fridge plan error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
