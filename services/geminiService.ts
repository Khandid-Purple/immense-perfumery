
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

// Helper to ensure we have a valid key before trying to initialize
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

export const streamChatResponse = async (
  history: { role: string; text: string }[],
  newMessage: string,
  products: Product[],
  onChunk: (text: string, groundingMetadata?: any, functionCalls?: any[]) => void
): Promise<void> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    onChunk("\n✦ *Pardon me, the concierge is currently away. Please check your API configuration.* ✦");
    return;
  }

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
1. **CONVERSATIONAL MEMORY**: You MUST mention the names of the perfumes you recommend in your text response.
2. **CONSISTENCY**: Once you recommend a set of perfumes, those are your "picks".
3. **CONCISENESS**: Limit your preamble/text to 2 sentences. Be warm but professional.
4. **CLIMATE EXPERTISE**: Prioritize "longevity" and "sillage" for Ghana's climate.

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
  const apiKey = getApiKey();
  if (!apiKey) {
    return { description: "✦ API Key is missing. Please configure it in your environment. ✦", recommendedProductIds: [] };
  }

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
