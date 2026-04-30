/* ============================================================
 * NutriSync v2 — Gemini AI Client
 * ============================================================
 * Initializes the Google Generative AI client for server-side use.
 * This replaces the old Python Vertex AI backend entirely.
 *
 * Usage (in API routes only):
 *   import { generateAIResponse } from "@/lib/gemini";
 *
 * Environment variable required:
 *   - GEMINI_API_KEY  (get free from https://aistudio.google.com)
 * ============================================================ */

import { GoogleGenAI } from "@google/genai";

/**
 * Google Generative AI client instance.
 * API key is sourced from server-side environment variable.
 */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/** Model name — Gemini 2.5 Flash for speed and free-tier availability */
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Generate a response from Gemini.
 * Handles the API call and extracts the text response.
 *
 * @param prompt - The full prompt string to send to Gemini
 * @returns The raw text response from the model
 * @throws Error if the API call fails or returns empty
 */
export async function generateAIResponse(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

/**
 * Generate a response and parse it as JSON.
 * Strips markdown code fences if the model wraps its response.
 * Includes one automatic retry on parse failure.
 *
 * @param prompt - The full prompt string (must request JSON output)
 * @returns Parsed JSON object
 * @throws Error if JSON parsing fails after retry
 */
export async function generateAIJsonResponse<T>(prompt: string): Promise<T> {
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;

    const text = await generateAIResponse(prompt);

    /* Strip markdown code fences if present */
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      if (attempts >= maxAttempts) {
        throw new Error(
          `Failed to parse AI response as JSON after ${maxAttempts} attempts. Raw: ${cleaned.substring(0, 200)}`
        );
      }
      /* Retry with a slightly modified prompt hint */
      console.warn(`JSON parse failed (attempt ${attempts}), retrying...`);
    }
  }

  /* TypeScript requires this, but the while loop handles it */
  throw new Error("Unexpected: exceeded retry loop");
}

export async function generateMultimodalJsonResponse<T>(prompt: string, imageBase64: string, mimeType: string): Promise<T> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType } }
        ]
      }
    ]
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty multimodal response");

  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(`Failed to parse multimodal AI response as JSON. Raw: ${cleaned.substring(0, 200)}`);
  }
}

export default ai;
