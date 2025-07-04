
import { GoogleGenAI } from "@google/genai";
import { ServiceCategory, ChatMessage } from "../types";

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  return apiKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getArtisanChatReply = async (
    customerMessage: string, 
    specialization: ServiceCategory,
    history: ChatMessage[]
) => {
  if (!customerMessage) {
    throw new Error("Customer message cannot be empty.");
  }

  const systemInstruction = `You are a helpful and polite Moroccan artisan ('M3allem'). Your specialization is ${specialization}. 
  A customer is asking you a question. Respond in a friendly and professional manner. 
  You can mix some simple Moroccan Darija or French words into your English response to sound authentic (e.g., "Insha'Allah", "safi", "mabrouk", "pas de problème", "bien sûr"). 
  Keep your answers concise and to the point. The customer's latest message is: "${customerMessage}"`;

  // Convert our app's chat history format to the Gemini API's format
  const geminiHistory = history.map(msg => ({
      role: msg.sender,
      parts: [{ text: msg.text }]
  }));

  try {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash-preview-04-17",
        config: { systemInstruction },
        history: geminiHistory,
    });
    
    const response = await chat.sendMessageStream({ message: customerMessage });
    return response;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get response from Gemini API.");
  }
};