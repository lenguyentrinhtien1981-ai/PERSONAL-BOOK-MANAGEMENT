import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeBookCover = async (base64Image: string): Promise<{ title: string; author: string; genre: string; description: string }> => {
  const client = getClient();
  if (!client) {
    // Mock response if no API key for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: "Tiêu đề sách",
          author: "Tác giả",
          genre: "Tiểu thuyết",
          description: "Đây là mô tả mô phỏng bằng tiếng Việt vì không tìm thấy khóa API."
        });
      }, 1500);
    });
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix
            }
          },
          {
            text: "Identify the book title, author, and guess the genre (in Vietnamese) from this book cover. Also provide a short 1-sentence description in Vietnamese."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            genre: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "author", "genre"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Error analyzing book cover:", error);
    throw error;
  }
};