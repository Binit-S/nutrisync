import { streamText, convertToModelMessages, generateId } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Chat API received body:", JSON.stringify(body, null, 2));
    const { messages } = body;

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: `You are a clinical dietitian conversational agent. 
Your goal is to help the user identify potential nutritional deficiencies based on their symptoms.
1. Have a friendly, one-on-one conversation with the user.
2. Ask follow-up questions if their symptoms are too vague (e.g., if they say "I'm tired", ask about sleep, diet, or other accompanying symptoms like hair loss or cold hands).
3. Once you have a clear picture, suggest up to 3 major nutritional deficiencies they might be experiencing.
4. IMPORTANT: Finally, explicitly instruct the user to copy these suggested deficiencies and submit them using the "Known Gap" feature on the Dietitian Agent tab to generate their meal plan and grocery list. Do not generate a full meal plan here.

Keep your responses concise, empathetic, and professional.`,
      messages: (messages || []).map((m: any) => ({
        role: m.role,
        content: m.content || (m.parts ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : '')
      })),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      generateMessageId: () => generateId(),
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat", details: (error as any).message }), { status: 500 });
  }
}
