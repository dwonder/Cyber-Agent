import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, QuizQuestion, NewsItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean base64 string
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

// --- Schemas ---

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isThreat: { type: Type.BOOLEAN, description: "Whether the image depicts a security threat or violation." },
    threatType: { type: Type.STRING, enum: ['PHISHING', 'CLEAN_DESK_VIOLATION', 'SAFE', 'UNKNOWN'] },
    confidenceScore: { type: Type.INTEGER, description: "Confidence score between 0 and 100." },
    explanation: { type: Type.STRING, description: "A brief explanation of the findings." },
    suggestedPoints: { type: Type.INTEGER, description: "Points to award based on severity (0-100)." }
  },
  required: ['isThreat', 'threatType', 'confidenceScore', 'explanation', 'suggestedPoints']
};

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correctAnswerIndex: { type: Type.INTEGER },
    explanation: { type: Type.STRING }
  },
  required: ['question', 'options', 'correctAnswerIndex', 'explanation']
};

const newsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      summary: { type: Type.STRING },
      severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
      date: { type: Type.STRING }
    },
    required: ['headline', 'summary', 'severity', 'date']
  }
};

// --- API Methods ---

export const analyzePhishingAttempt = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(base64Image) } },
          { text: "Analyze this image of an email. Is it a phishing attempt? Look for suspicious senders, urgent language, bad links, or typos. If it is a photo of a legitimate safe email, mark as SAFE." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      isThreat: data.isThreat,
      confidenceScore: data.confidenceScore,
      threatType: data.threatType === 'PHISHING' ? 'PHISHING' : 'SAFE',
      explanation: data.explanation,
      pointsAwarded: data.isThreat ? data.suggestedPoints : 10 // Award small points for being vigilant even if safe
    };
  } catch (error) {
    console.error("Phishing analysis error:", error);
    throw new Error("Failed to analyze phishing report.");
  }
};

export const analyzeCleanDesk = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(base64Image) } },
          { text: "Analyze this workspace image for Clean Desk Policy violations. Look for: passwords on sticky notes, unlocked unattended screens, sensitive documents left out, USB keys left plugged in. If none, mark as SAFE (Clean)." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      isThreat: data.isThreat,
      confidenceScore: data.confidenceScore,
      threatType: data.isThreat ? 'CLEAN_DESK_VIOLATION' : 'SAFE',
      explanation: data.explanation,
      pointsAwarded: data.isThreat ? data.suggestedPoints : 50 // Reward for keeping a clean desk!
    };
  } catch (error) {
    console.error("Clean desk analysis error:", error);
    throw new Error("Failed to analyze workspace.");
  }
};

export const generateTrainingQuiz = async (): Promise<QuizQuestion> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a single multiple-choice security awareness question for an employee. Topics: Phishing, Password Safety, Social Engineering, or Data Privacy.",
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema
      }
    });
    return JSON.parse(response.text || '{}') as QuizQuestion;
  } catch (error) {
    console.error("Quiz gen error:", error);
    return {
      question: "Which of these is a secure password?",
      options: ["password123", "Admin2024!", "Correct-Horse-Battery-Staple-99", "qwerty"],
      correctAnswerIndex: 2,
      explanation: "Long passphrases with mixed characters are hardest to crack."
    };
  }
};

export const fetchSecurityNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 fictional but realistic cybersecurity news headlines for a corporate internal feed. Focus on recent industry trends like Ransomware, AI Phishing, or zero-day exploits.",
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema
      }
    });
    return JSON.parse(response.text || '[]') as NewsItem[];
  } catch (error) {
    console.error("News gen error:", error);
    return [];
  }
};
