
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Product } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

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

export const streamChatResponse = async (
  history: { role: string; text: string }[],
  newMessage: string,
  products: Product[],
  onChunk: (text: string, groundingMetadata?: any, functionCalls?: any[]) => void
): Promise<void> => {
  try {
    const productList = products.map(p => ({ 
      id: p.id, 
      name: p.name, 
      price: `₵${p.price}`, 
      notes: p.notes?.join(', '),
      category: p.category
    }));

    const cappedHistory = history.slice(-10);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `You are 'Flora', the Senior Scent Consultant at Immense Perfumery in Accra.

COMMUNICATION PROTOCOL:
1. **ALWAYS SPEAK**: You are a consultant, not a database. You MUST always write a conversational response. Never just show products.
2. **THE 'SPEAK FIRST' RULE**: If you recommend products using the 'recommendProducts' tool, you MUST explain your choices in text FIRST. Talk about the notes (e.g., the sharpness of citrus, the depth of oud) and why they fit the user's request.
3. **NO BOT-SPEAK**: Avoid "I'd be happy to," "Certainly," or "Here are your results." Start naturally like a high-end boutique owner.
   - Example: "The afternoon sun in Accra requires something that doesn't just evaporate—I've pulled a few scents with incredible staying power for you..."
4. **LOCAL CONTEXT**: You know we are in ACP Estate, Accra. You understand the Ghanaian climate (Coastal humidity vs. Northern Harmattan).
5. **LANGUAGE**: English only.

CATALOG:
${JSON.stringify(productList)}`,
        tools: [{ functionDeclarations: [recommendProductsDeclaration] }],
      },
      history: cappedHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    for await (const chunk of result) {
      if (!chunk) continue;
      const candidate = chunk.candidates?.[0];
      const text = chunk.text || "";
      const fCalls = chunk.functionCalls;
      const grounding = candidate?.groundingMetadata;
      
      // Pass the text and function calls to the UI
      onChunk(text, grounding, fCalls);
    }
  } catch (error: any) {
    console.error("Flora Connection Error:", error);
    onChunk("\n✦ *Forgive me, the scent trail has gone cold. How else can I assist you?* ✦");
  }
};

export interface AnalysisResponse {
  description: string;
  recommendedProductIds: string[];
}

export const analyzeImage = async (base64Image: string, mimeType: string, products: Product[]): Promise<AnalysisResponse> => {
  try {
    const productList = products.map(p => ({ id: p.id, name: p.name }));
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_NAME, 
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: `Analyze this image mood and suggest 2 perfumes from CATALOG: ${JSON.stringify(productList)}. No French. Be sophisticated.` },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Professional analysis." },
            recommendedProductIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { description: "✦ I am having trouble seeing that clearly. Let's try another image. ✦", recommendedProductIds: [] };
  }
};
