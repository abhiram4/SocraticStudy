import { generateAudio } from './audioService';
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY: string | undefined =
  (import.meta as any)?.env?.GEMINI_API_KEY ||
  (globalThis as any)?.process?.env?.GEMINI_API_KEY ||
  (globalThis as any)?.process?.env?.API_KEY;

let ai: GoogleGenAI | undefined;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("GEMINI_API_KEY not set. Features requiring Gemini will be disabled.");
}

export const genAIInstance = ai;

export interface SpeechResult {
    audioUrl: string;
    base64: string;
    mimeType?: string;
}

export const generateSpeech = async (text: string): Promise<SpeechResult> => {
    if (!ai) {
      throw new Error("GoogleGenAI is not initialized. Set GEMINI_API_KEY.");
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const inlinePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData as { data?: string; mimeType?: string } | undefined;
        const base64Audio = inlinePart?.data || "";
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        const mimeType = inlinePart?.mimeType;
        const audioUrl = generateAudio(base64Audio, mimeType);
        return { audioUrl, base64: base64Audio, mimeType };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error generating speech:", error);
        throw new Error(`Could not generate speech from Gemini API: ${message}`);
    }
};
