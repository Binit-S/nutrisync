/* ============================================================
 * NutriSync v2 — Explain API Route
 * ============================================================
 * POST /api/explain
 *
 * Takes a deficiency and list of foods, returns a plain-text
 * explanation of why each food helps address the deficiency.
 * ============================================================ */

import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/gemini";
import { buildExplainPrompt } from "@/lib/prompts";
import type { ExplainRequest } from "@/types";

export async function POST(req: Request) {
  try {
    const body: ExplainRequest = await req.json();
    const { deficiency, foods } = body;

    /* Validate */
    if (!deficiency || !foods || foods.length === 0) {
      return NextResponse.json(
        { error: "Deficiency and foods are required" },
        { status: 400 }
      );
    }

    /* Build prompt and call Gemini */
    const prompt = buildExplainPrompt(deficiency, foods);
    const explanation = await generateAIResponse(prompt);

    return NextResponse.json({ explanation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Explain error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
