import { NextResponse } from "next/server";
import { generateAIJsonResponse } from "@/lib/gemini";
import { buildKnownGapPrompt, buildSymptomConsultPrompt } from "@/lib/prompts";
import type { ConsultRequest, ConsultationResult } from "@/types";

export async function POST(req: Request) {
  try {
    const body: ConsultRequest & { uid?: string } = await req.json();
    const { mode, deficiency, symptoms, constraints, uid } = body;

    if (mode === "known" && !deficiency) {
      return NextResponse.json(
        { error: "Deficiency is required for known gap mode" },
        { status: 400 }
      );
    }

    if (mode === "consult" && !symptoms) {
      return NextResponse.json(
        { error: "Symptoms are required for consultation mode" },
        { status: 400 }
      );
    }

    const prompt =
      mode === "consult"
        ? buildSymptomConsultPrompt(symptoms!, constraints || "")
        : buildKnownGapPrompt(deficiency!, constraints || "");

    const result = await generateAIJsonResponse<ConsultationResult>(prompt);
    let consultationId: string | null = null;

    if (uid) {
      try {
        const { adminDb } = await import("@/lib/firebase-admin");
        const created = await adminDb
          .collection("users")
          .doc(uid)
          .collection("consultations")
          .add({
            uid,
            mode,
            input: mode === "consult" ? symptoms : deficiency,
            constraints: constraints || "",
            result,
            nutrientScores: result.nutrient_scores || null,
            createdAt: new Date(),
          });
        consultationId = created.id;
      } catch (dbError) {
        console.error("Failed to store consultation in Firestore:", dbError);
      }
    }

    return NextResponse.json({ ...result, consultationId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Consultation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
