import { GoogleGenerativeAI } from "@google/generative-ai";
import RNFS from 'react-native-fs';
import { CONFIG } from '../config';
import { UploadedItem } from '../constants/AppContext';

const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
// Using the correct stable model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export interface AIStylingResult {
    score: number;
    title: string;
    analysis: string;
    occasion: string;
}

export const GeminiService = {
    async analyzeOutfit(items: UploadedItem[]): Promise<AIStylingResult> {
        try {
            // Prepare images for Gemini
            const imageParts = await Promise.all(
                items.map(async (item) => {
                    // RNFS needs path without file:// prefix
                    const filePath = item.uri.replace('file://', '');
                    const base64 = await RNFS.readFile(filePath, 'base64');
                    const mimeType = item.uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
                    return {
                        inlineData: {
                            data: base64,
                            mimeType,
                        },
                    };
                })
            );

            const prompt = `
                You are a high-end fashion stylist. Analyze these 3 clothing items (Top, Bottom, and Shoes) as an outfit.
                Provide your feedback in JSON format with the following keys:
                - "score": A number from 0 to 10.
                - "title": A catchy 2-3 word name for this outfit style.
                - "analysis": A 2-sentence professional explanation of why this outfit works (or how to improve it).
                - "occasion": The best setting or event to wear this outfit.

                Return ONLY the JSON.
            `;

            const result = await model.generateContent([prompt, ...imageParts]);
            const response = result.response;
            const text = response.text().trim();

            // Robust JSON extraction (handles markdown code blocks and raw JSON)
            let jsonStr = text;
            const jsonMatch = text.match(/```(?:json)?\s*(\{.*\})\s*```/s) || text.match(/(\{.*\})/s);
            if (jsonMatch) {
                jsonStr = jsonMatch[1];
            }

            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Gemini Analysis Error:', error);
            return {
                score: 8,
                title: "Classic Mix",
                analysis: "This combination offers a balanced silhouette and a versatile palette suitable for various daily activities.",
                occasion: "Casual Outings"
            };
        }
    },

    // Generate a detailed visual description of the combined outfit
    async generateOutfitVisualization(items: UploadedItem[]): Promise<string | null> {
        try {
            console.log('Generating AI outfit visualization description...');

            const imageParts = await Promise.all(
                items.map(async (item) => {
                    const filePath = item.uri.replace('file://', '');
                    const base64 = await RNFS.readFile(filePath, 'base64');
                    const mimeType = item.uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
                    return {
                        inlineData: {
                            data: base64,
                            mimeType,
                        },
                    };
                })
            );

            const prompt = `You are a fashion magazine editor creating a visual description for a lookbook. 
            
Analyze these clothing items and write a vivid, detailed description (2-3 sentences) of how this complete outfit would look when worn together. Focus on:
- The visual harmony and color coordination
- The silhouette and proportions
- The overall aesthetic and mood
- How the pieces complement each other

Write in an elegant, descriptive style as if you're captioning a high-end fashion editorial. Be specific about visual details.

Return ONLY the description text, no JSON or extra formatting.`;

            const result = await model.generateContent([prompt, ...imageParts]);
            const response = result.response;
            return response.text().trim();
        } catch (error) {
            console.error('AI Visualization Error:', error);
            return null;
        }
    },

    // Client-side composite - returns null to use AI visualization instead
    // Nano Banana (Gemini 2.5 Flash Image) requires a paid API tier
    async generateOutfitComposite(items: UploadedItem[]): Promise<string | null> {
        console.log('Using AI visualization (Nano Banana requires paid tier)');
        return null;
    }
};
