/* ============================================================
 * NutriSync v2 — AI Prompt Templates
 * ============================================================
 * Centralized prompt templates for all AI interactions.
 * Keeping prompts in one file makes them easy to review,
 * iterate on, and audit during hackathon code review.
 *
 * Each function returns a prompt string. No logic, no side effects.
 * ============================================================ */

/**
 * Build prompt for KNOWN DEFICIENCY mode.
 * User knows their deficiency (e.g., "Iron") and wants a protocol.
 *
 * @param deficiency - The specific nutrient deficiency
 * @param constraints - Dietary restrictions (e.g., "vegan, gluten-free")
 * @returns Formatted prompt string requesting strict JSON output
 */
export function buildKnownGapPrompt(
  deficiency: string,
  constraints: string
): string {
  return `You are a clinical dietitian AI assistant.

User's nutritional deficiency: ${deficiency}
User's dietary restrictions: ${constraints || "None"}

Analyze this deficiency and provide a comprehensive nutrition protocol.
Respect ALL dietary restrictions strictly — never suggest restricted foods.

Return ONLY valid JSON in this exact structure:

{
  "deficiency": "${deficiency}",
  "severity": "mild | moderate | severe",
  "foods": ["food1", "food2", "food3", "food4", "food5"],
  "meal_plan": [
    {"meal": "Breakfast", "items": ["item1", "item2"]},
    {"meal": "Lunch", "items": ["item1", "item2"]},
    {"meal": "Dinner", "items": ["item1", "item2"]},
    {"meal": "Snack", "items": ["item1"]}
  ],
  "dos": ["recommendation1", "recommendation2", "recommendation3"],
  "donts": ["avoid1", "avoid2", "avoid3"],
  "buy_list": {
    "vegetables": ["veg1", "veg2"],
    "fruits": ["fruit1"],
    "proteins": ["protein1", "protein2"],
    "dairy": ["dairy1"],
    "grains": ["grain1"],
    "spices": ["spice1"],
    "others": ["item1", "item2"]
  },
  "nutrient_scores": {
    "iron": 0,
    "vitaminB12": 0,
    "vitaminD": 0,
    "magnesium": 0,
    "calcium": 0,
    "zinc": 0,
    "folate": 0,
    "omega3": 0,
    "vitaminK": 0
  }
}

STRICT RULES:
- Return ONLY valid JSON, no markdown, no explanation, no preamble
- "severity" must be exactly one of: "mild", "moderate", "severe"
- "foods" array must contain exactly 5 items
- "nutrient_scores" values are 0-100 (0 = severely deficient, 100 = optimal)
  Set the deficient nutrient low (10-30) and estimate others based on typical diet
- Keep response concise`;
}

/**
 * Build prompt for SYMPTOM CONSULTATION mode.
 * User describes symptoms and the AI infers potential deficiencies.
 *
 * @param symptoms - User's symptom description
 * @param constraints - Dietary restrictions
 * @returns Formatted prompt string requesting strict JSON output
 */
export function buildSymptomConsultPrompt(
  symptoms: string,
  constraints: string
): string {
  return `You are a clinical dietitian AI assistant performing a nutritional assessment.

User's reported symptoms: ${symptoms}
User's dietary restrictions: ${constraints || "None"}

Based on these symptoms, infer the most likely nutritional deficiency,
assess severity, and create a personalized nutrition protocol.
Respect ALL dietary restrictions strictly.

Return ONLY valid JSON in this exact structure:

{
  "deficiency": "inferred deficiency name",
  "severity": "mild | moderate | severe",
  "foods": ["food1", "food2", "food3", "food4", "food5"],
  "meal_plan": [
    {"meal": "Breakfast", "items": ["item1", "item2"]},
    {"meal": "Lunch", "items": ["item1", "item2"]},
    {"meal": "Dinner", "items": ["item1", "item2"]},
    {"meal": "Snack", "items": ["item1"]}
  ],
  "dos": ["recommendation1", "recommendation2", "recommendation3"],
  "donts": ["avoid1", "avoid2", "avoid3"],
  "buy_list": {
    "vegetables": ["veg1", "veg2"],
    "fruits": ["fruit1"],
    "proteins": ["protein1", "protein2"],
    "dairy": ["dairy1"],
    "grains": ["grain1"],
    "spices": ["spice1"],
    "others": ["item1", "item2"]
  },
  "nutrient_scores": {
    "iron": 0,
    "vitaminB12": 0,
    "vitaminD": 0,
    "magnesium": 0,
    "calcium": 0,
    "zinc": 0,
    "folate": 0,
    "omega3": 0,
    "vitaminK": 0
  }
}

STRICT RULES:
- Return ONLY valid JSON, no markdown, no explanation, no preamble
- "severity" must be exactly one of: "mild", "moderate", "severe"
- "foods" array must contain exactly 5 items
- "nutrient_scores" values are 0-100 (0 = severely deficient, 100 = optimal)
- Keep response concise`;
}

/**
 * Build prompt for food explanation.
 * Explains WHY specific foods help address a deficiency.
 *
 * @param deficiency - The nutrient deficiency
 * @param foods - Array of recommended foods
 * @returns Formatted prompt string
 */
export function buildExplainPrompt(
  deficiency: string,
  foods: string[]
): string {
  return `You are a clinical dietitian. Explain concisely why each of these foods 
helps address ${deficiency} deficiency: ${foods.join(", ")}.

For each food, mention the specific nutrient content and bioavailability.
Keep your explanation under 150 words total. Use plain language.
Do not use markdown formatting.`;
}

/**
 * Build prompt for weekly meal plan generation.
 * Creates a detailed 7-day plan based on consultation results.
 *
 * @param deficiency - Target deficiency to address
 * @param foods - Recommended foods to incorporate
 * @param constraints - Dietary restrictions
 * @returns Formatted prompt string requesting strict JSON output
 */
export function buildMealPlanPrompt(
  deficiency: string,
  foods: string[],
  constraints: string,
  existingPlan?: string
): string {
  let mergeContext = "";
  if (existingPlan) {
    mergeContext = `\nCRITICAL MERGE INSTRUCTION: The user already has an active meal plan for other deficiencies. You MUST NOT overwrite it. Instead, you MUST MERGE your new recommendations into the existing plan.\nFor example, if the existing breakfast has "Meal A (for Vit D)", you should output "Meal A (for Vit D) AND Meal B (for ${deficiency})". Keep the existing items intact and just add the new ones to the same meal slot.\n\nEXISTING PLAN (Merge with this):\n${existingPlan}\n`;
  }

  return `You are a clinical dietitian creating a 7-day meal plan.

Target deficiency: ${deficiency}
Recommended foods to incorporate: ${foods.join(", ")}
Dietary restrictions: ${constraints || "None"}${mergeContext}

Create a detailed weekly meal plan that incorporates the recommended foods.
Each meal should include estimated calories and key nutrients.

Return ONLY valid JSON in this exact structure:

{
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "items": ["item1", "item2"],
        "calories": 400,
        "keyNutrients": ["Iron 5mg", "Vitamin C 30mg"]
      },
      "lunch": {
        "items": ["item1", "item2"],
        "calories": 550,
        "keyNutrients": ["Iron 8mg"]
      },
      "dinner": {
        "items": ["item1", "item2"],
        "calories": 600,
        "keyNutrients": ["Iron 10mg"]
      },
      "snack": {
        "items": ["item1"],
        "calories": 200,
        "keyNutrients": ["Iron 3mg"]
      }
    }
  ]
}

STRICT RULES:
- Return ONLY valid JSON, no markdown, no explanation
- Include all 7 days (Monday through Sunday)
- Each meal must have items, calories, and keyNutrients
- Respect dietary restrictions strictly
- Vary meals across days — avoid repetition
- If merging with an existing plan, DO NOT delete the existing meals, just append to them!`;
}

export function buildFridgePrompt(deficiencies: string[]): string {
  const defText = deficiencies.length > 0 ? deficiencies.join(", ") : "general health optimization";
  return `You are a clinical dietitian. The user has uploaded an image of their fridge/pantry. 
They have a history of the following nutritional deficiencies: ${defText}.

TASK:
1. Identify the ingredients visible in the image.
2. Build a 7-day meal plan that addresses their deficiencies using ONLY (or primarily) the ingredients found in the image. If absolutely necessary, you may add basic staples (like salt, oil, or water).

Return ONLY valid JSON in this exact structure:

{
  "identifiedIngredients": ["item1", "item2"],
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "items": ["item1", "item2"],
        "calories": 400,
        "keyNutrients": ["Iron 5mg", "Vitamin C 30mg"]
      },
      "lunch": {
        "items": ["item1", "item2"],
        "calories": 550,
        "keyNutrients": ["Iron 8mg"]
      },
      "dinner": {
        "items": ["item1", "item2"],
        "calories": 600,
        "keyNutrients": ["Iron 10mg"]
      },
      "snack": {
        "items": ["item1"],
        "calories": 200,
        "keyNutrients": ["Iron 3mg"]
      }
    }
  ]
}

STRICT RULES:
- Return ONLY valid JSON, no markdown, no explanation.
- Include all 7 days (Monday through Sunday).
- Each meal must have items, calories, and keyNutrients.`;
}

/**
 * Build prompt for symptom trend insight.
 * Analyzes symptom changes over time and correlates with dietary changes.
 *
 * @param symptoms - Array of recent symptom logs with dates
 * @param recentFoods - Foods the user has been eating
 * @returns Formatted prompt string
 */
export function buildSymptomInsightPrompt(
  symptoms: { date: string; symptoms: string[]; severity: number }[],
  recentFoods: string[]
): string {
  const symptomSummary = symptoms
    .map((s) => `${s.date}: ${s.symptoms.join(", ")} (severity: ${s.severity}/5)`)
    .join("\n");

  return `You are a clinical dietitian analyzing a patient's symptom trends.

Symptom log (last 7 days):
${symptomSummary}

Foods the patient has been incorporating: ${recentFoods.join(", ")}

Provide a brief, encouraging insight about their progress.
Note any improvements or concerns. Suggest one specific actionable tip.
Keep response under 100 words. Do not use markdown formatting.`;
}
