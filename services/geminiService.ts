
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Product } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

const recommendProductsDeclaration: FunctionDeclaration = {
  name: 'recommendProducts',
  parameters: {
    type: Type.OBJECT,
    description: 'Recommend specific perfumes from the catalog.',
    properties: {
      productIds: {
        type: Type.ARRAY,
        description: 'Array of product IDs.',
        items: { type: Type.STRING },
      },
      reason: { type: Type.STRING, description: 'Brief expert justification.' },
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

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `You are 'Flora', the Signature Scent Consultant for Immense Perfumery in Ghana. 

STRICT BEHAVIORAL RULES:
1. **CONVERSATIONAL MEMORY**: You MUST mention the names of the perfumes you recommend in your text response. If you don't name them in text, you will forget them in the next turn. 
2. **CONSISTENCY**: Once you recommend a set of perfumes, those are your "picks". If the user asks "Why these?" or follows up, you MUST refer to the specific perfumes you previously named. Do not suggest different ones unless the user explicitly asks for a new search.
3. **CONCISENESS**: Limit your preamble/text to 2 sentences. Be warm but professional.
4. **CLIMATE EXPERTISE**: You understand Accra's humidity and heat. Prioritize "longevity" and "sillage" (staying power).

RESPONSE PATTERN:
- User asks for a scent -> You say: "I recommend **[Name 1]** and **[Name 2]** for [Occasion/Reason]. They handle the heat beautifully." -> You call 'recommendProducts'.
- User asks "Why these?" -> You say: "I chose **[Name 1]** because [Specific Note Reason] and **[Name 2]** due to its [Specific Note Reason] in our humidity."

CATALOG DATA:
${JSON.stringify(productList)}`,
        tools: [{ functionDeclarations: [recommendProductsDeclaration] }],
        thinkingConfig: { thinkingBudget: 0 }
      },
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    for await (const chunk of result) {
      const cand = chunk.candidates?.[0];
      if (!cand) continue;
      const text = cand.content?.parts?.find(p => p.text)?.text || "";
      const fCalls = cand.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
      onChunk(text, cand.groundingMetadata, fCalls);
    }
  } catch (error) {
    onChunk("\n✦ *Pardon me, the connection is slightly misty. Let me try that again.* ✦");
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
          { text: `You are Flora. Analyze this image mood in 1 sentence. Suggest 2 perfumes from CATALOG: ${JSON.stringify(productList)}. Mention their names in your description.` },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "One sentence mood analysis naming the picks." },
            recommendedProductIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text || '{"description": "A sophisticated vibe that deserves a matching signature scent.", "recommendedProductIds": []}';
    return JSON.parse(text);
  } catch (error) {
    return { description: "✦ I'll take another look in a second. ✦", recommendedProductIds: [] };
  }
};
