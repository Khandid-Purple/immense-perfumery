// ─────────────────────────────────────────────────────────────
// Gemini proxy — server-only. The API key never reaches the client;
// ChatBot/ImageAnalyzer call /api/assistant/* instead of this SDK directly.
// Graceful degradation: hasGemini is false → callers show the same
// in-character fallback copy the original client-side code used.
// ─────────────────────────────────────────────────────────────
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';
import type { Product } from '@/lib/types';

const MODEL_NAME = 'gemini-3-flash-preview';

export const hasGemini = !!process.env.GEMINI_API_KEY;

let _ai: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!hasGemini) throw new Error('GEMINI_API_KEY is not set');
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _ai;
}

const recommendProductsDeclaration: FunctionDeclaration = {
  name: 'recommendProducts',
  parameters: {
    type: Type.OBJECT,
    description: 'Call this to show specific perfume cards from the catalog to the user.',
    properties: {
      productIds: {
        type: Type.ARRAY,
        description: 'Array of product IDs found in the catalog.',
        items: { type: Type.STRING },
      },
      reason: { type: Type.STRING, description: 'A 1-sentence internal reason for these picks.' },
    },
    required: ['productIds'],
  },
};

function systemInstruction(products: Product[]) {
  const productList = products.map((p) => ({
    id: p.id, name: p.name, price: `₵${p.price}`, notes: p.notes?.join(', '), category: p.category,
  }));
  return `You are 'Flora', the Senior Scent Consultant at Immense Perfumery in Accra.

COMMUNICATION PROTOCOL:
1. **ALWAYS SPEAK**: You are a consultant, not a database. You MUST always write a conversational response. Never just show products.
2. **THE 'SPEAK FIRST' RULE**: If you recommend products using the 'recommendProducts' tool, you MUST explain your choices in text FIRST. Talk about the notes (e.g., the sharpness of citrus, the depth of oud) and why they fit the user's request.
3. **NO BOT-SPEAK**: Avoid "I'd be happy to," "Certainly," or "Here are your results." Start naturally like a high-end boutique owner.
   - Example: "The afternoon sun in Accra requires something that doesn't just evaporate—I've pulled a few scents with incredible staying power for you..."
4. **LOCAL CONTEXT**: You know we are in ACP Estate, Accra. You understand the Ghanaian climate (Coastal humidity vs. Northern Harmattan).
5. **LANGUAGE**: English only.

CATALOG:
${JSON.stringify(productList)}`;
}

export type ChatFrame =
  | { type: 'text'; value: string }
  | { type: 'functionCall'; productIds: string[]; reason?: string };

/** Streams NDJSON frames — one JSON object per line — over a ReadableStream. */
export function streamChatResponse(history: { role: string; text: string }[], message: string, products: Product[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const send = (frame: ChatFrame) => controller.enqueue(encoder.encode(JSON.stringify(frame) + '\n'));
      if (!hasGemini) {
        send({ type: 'text', value: '\n✦ *Forgive me, the scent trail has gone cold. How else can I assist you?* ✦' });
        controller.close();
        return;
      }
      try {
        const cappedHistory = history.slice(-10);
        const chat = client().chats.create({
          model: MODEL_NAME,
          config: {
            systemInstruction: systemInstruction(products),
            tools: [{ functionDeclarations: [recommendProductsDeclaration] }],
          },
          history: cappedHistory.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
        });
        const result = await chat.sendMessageStream({ message });
        for await (const chunk of result) {
          if (!chunk) continue;
          if (chunk.text) send({ type: 'text', value: chunk.text });
          const fCalls = chunk.functionCalls;
          if (fCalls) {
            for (const call of fCalls) {
              if (call.name === 'recommendProducts' && call.args?.productIds) {
                const ids = Array.isArray(call.args.productIds) ? call.args.productIds : [call.args.productIds];
                send({ type: 'functionCall', productIds: ids as string[], reason: call.args.reason as string | undefined });
              }
            }
          }
        }
      } catch (error) {
        console.error('Flora Connection Error:', error);
        send({ type: 'text', value: '\n✦ *Forgive me, the scent trail has gone cold. How else can I assist you?* ✦' });
      } finally {
        controller.close();
      }
    },
  });
}

export interface AnalysisResponse {
  description: string;
  recommendedProductIds: string[];
}

export async function analyzeImage(base64Image: string, mimeType: string, products: Product[]): Promise<AnalysisResponse> {
  if (!hasGemini) {
    return { description: '✦ I am having trouble seeing that clearly. Let\'s try another image. ✦', recommendedProductIds: [] };
  }
  try {
    const productList = products.map((p) => ({ id: p.id, name: p.name }));
    const response = await client().models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: `Analyze this image mood and suggest 2 perfumes from CATALOG: ${JSON.stringify(productList)}. No French. Be sophisticated.` },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: 'Professional analysis.' },
            recommendedProductIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Scent Match AI error:', error);
    return { description: '✦ I am having trouble seeing that clearly. Let\'s try another image. ✦', recommendedProductIds: [] };
  }
}
