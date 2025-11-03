import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

const chat: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: `You are Kisan AI, an expert agricultural assistant for Indian farmers. 
    - Your name is Kisan Dost (Farmer's Friend).
    - Provide advice on crop diseases, real-time market prices from Indian mandis, and details on government schemes. 
    - Communicate in simple language, as if you are talking to a farmer.
    - When asked for market prices, ask for the specific crop and market (mandi) if not provided.
    - For government schemes, explain eligibility and application processes clearly.
    - Format responses in markdown for readability.`,
  },
});

export const getApiKeyError = (): string | null => {
  return API_KEY ? null : "API_KEY environment variable not set. Please configure it to use the AI assistant.";
}

export const streamChat = (message: string) => {
  if (!API_KEY) {
    throw new Error("API key is not configured.");
  }
  return chat.sendMessageStream({ message });
};

// Helper function to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}


export const diagnoseCropDisease = async (imageFile: File): Promise<GenerateContentResponse> => {
    if (!API_KEY) {
      throw new Error("API key is not configured.");
    }
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
        text: `
        Analyze the provided image of a plant leaf. 
        Identify the disease, describe its symptoms in simple terms, and suggest 2-3 affordable, organic or low-cost chemical remedies available in India.
        Provide the output in JSON format.
        `
    };

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    disease: {
                        type: Type.STRING,
                        description: "Name of the plant disease."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A simple, one-sentence description of the disease symptoms visible in the image."
                    },
                    remedy: {
                        type: Type.STRING,
                        description: "A step-by-step guide for 2-3 remedies, formatted with markdown for clarity (e.g., using bullet points)."
                    }
                }
            }
        }
    });

    return result;
}
