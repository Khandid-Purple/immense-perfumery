
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

    // Cap history to keep context clean and avoid token-limit hitches
    const cappedHistory = history.slice(-10);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `You are 'Flora', the Signature Scent Consultant for Immense Perfumery, serving all of Ghana.

STRICT BEHAVIORAL RULES:
1. **CONVERSATIONAL MEMORY**: You MUST mention the names of the perfumes you recommend in your text response.
2. **CLIMATE EXPERTISE**: You are an expert on Ghana's diverse geography. 
   - For the **Dry North** (Tamale/Savannah) or **Harmattan season**: Recommend rich, moisturizing ouds, ambers, and spicy notes that cling to the skin in dry air.
   - For the **Humid Coast** (Accra/Takoradi/Cape Coast): Prioritize high-sillage, fresh, or aquatic scents that don't turn cloying in humidity.
   - For the **Cool Highlands** (Volta/Eastern region): Suggest sophisticated florals and woody notes that bloom beautifully in the mist.
3. **CONCISENESS**: Limit your preamble to 2 sentences. Be warm, professional, and culturally aware.

RESPONSE PATTERN:
- User asks for a scent -> Ask where they are if not specified -> "I recommend **[Name 1]** and **[Name 2]**. In the [Region] heat/cool, these notes will [Reason]." -> You call 'recommendProducts'.

CATALOG DATA:
${JSON.stringify(productList)}`,
        tools: [{ functionDeclarations: [recommendProductsDeclaration] }],
      },
      history: cappedHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    for await (const chunk of result) {
      if (!chunk || !chunk.candidates?.[0]) continue;
      
      const text = chunk.text || "";
      const fCalls = chunk.functionCalls;
      const grounding = chunk.candidates[0].groundingMetadata;
      
      onChunk(text, grounding, fCalls);
    }
  } catch (error) {
    console.error("Flora Connection Hitch:", error);
    onChunk("\n✦ *Pardon me, I lost the trail of that scent for a moment. Let me refocus.* ✦");
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
          { text: `You are Flora. Analyze this image mood. Suggest 2 perfumes from CATALOG: ${JSON.stringify(productList)}. Mention their names. Consider how the mood fits different Ghanaian environments (dry north, humid south, or cool mountains).` },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "One sentence mood analysis naming the picks and the Ghanaian setting they suit best." },
            recommendedProductIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text || '{"description": "A sophisticated vibe that deserves a matching signature scent.", "recommendedProductIds": []}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Image Analysis Hitch:", error);
    return { description: "✦ My apologies, the vision is a bit blurred. Could you try uploading that again? ✦", recommendedProductIds: [] };
  }
};
