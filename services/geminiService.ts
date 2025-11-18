
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedReceipt } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeReceipt = async (base64Image: string): Promise<ParsedReceipt> => {
  try {
    // Remove header if present (data:image/jpeg;base64,...)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: "Analyze this receipt image. Extract all purchased items with their individual prices. Extract the total tip if explicitly stated. Do not extract tax. Also extract the merchant/store name and the date of the receipt (YYYY-MM-DD format if possible). If multiple people are listed, ignore the people and just list the items. Ensure prices are numbers."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the item" },
                  price: { type: Type.NUMBER, description: "Price of the item" }
                },
                required: ["name", "price"]
              }
            },
            tip: { type: Type.NUMBER, description: "Total tip amount found on receipt" },
            merchantName: { type: Type.STRING, description: "Name of the store or merchant" },
            date: { type: Type.STRING, description: "Date of receipt" }
          },
          required: ["items"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as ParsedReceipt;
    
    // Sanitize data
    return {
      items: data.items || [],
      tip: data.tip || 0,
      merchantName: data.merchantName,
      date: data.date
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
