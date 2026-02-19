import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Language } from "../types";

// --- API CONFIGURATION ---
const API_KEY = process.env.API_KEY;

const getSystemPrompt = (language: Language) => {
  const langName = language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'English';
  
  return `
Module-ID: You are "Midad AI", an intelligent academic assistant for students. Your task is to transform lectures and notes into effective review tools.

Guiding Principles:
1. Academic Summarization: Extract "Golden Points", definitions, and laws.
2. Quiz Engineering: Craft smart questions (Understanding, Application, Analysis).
3. Formatting: Output must be strict JSON.
4. **LANGUAGE**: The 'document_summary' and 'quiz_data' MUST be in ${langName}.

Module-OUTPUT: Output EXCLUSIVELY a valid JSON object:
{
  "action_performed": "academic_analysis",
  "document_summary": "Summary in ${langName}...",
  "quiz_data": {
    "title": "Quiz Title in ${langName}",
    "questions": [
      {
        "id": 1,
        "question": "Question in ${langName}",
        "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
        "correct_answer": "Opt1",
        "explanation": "Why correct in ${langName}"
      }
    ]
  },
  "metadata": {
    "word_count": 0,
    "language": "${language}",
    "complexity_level": "Beginner/University/Advanced"
  }
}

Module-LOGIC:
- Questions: Generate exactly 10 questions.
`;
};

// Generic file processor
const readFileToBase64 = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 1. GEMINI (Native Support)
const callGemini = async (fileData: { data: string; mimeType: string }, systemPrompt: string, userPrompt: string) => {
    if (!API_KEY) throw new Error("Gemini API Key is missing");

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Gemini supports "Multimodal" input (File + Text) natively.
    // Switched to 'gemini-2.0-flash' as it is the stable release for 2.x Flash series.
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: {
        parts: [
            { inlineData: { data: fileData.data, mimeType: fileData.mimeType } },
            { text: userPrompt }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return text;
};

export const analyzeDocument = async (file: File, language: Language, additionalPrompt?: string): Promise<AnalysisResult> => {
  try {
    const fileData = await readFileToBase64(file);
    const systemPrompt = getSystemPrompt(language);
    const userPrompt = additionalPrompt || `Analyze this document and provide a summary and quiz in ${language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'English'}.`;

    const rawText = await callGemini(fileData, systemPrompt, userPrompt);

    const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonString) as AnalysisResult;

    // Shuffle options for each question so the correct answer isn't always first
    if (result.quiz_data && result.quiz_data.questions) {
      result.quiz_data.questions.forEach(q => {
        if (q.options && Array.isArray(q.options)) {
          // Fisher-Yates shuffle
          for (let i = q.options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
          }
        }
      });
    }

    return result;

  } catch (error) {
    console.error("Gemini Service Failed:", error);
    throw error;
  }
};