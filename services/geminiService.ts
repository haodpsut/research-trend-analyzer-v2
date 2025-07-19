import { GoogleGenAI, Type } from "@google/genai";
import type { AnalyzedKeyword, Paper, SuggestedTitle } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts a JSON string from a text that might be wrapped in markdown.
 * @param text The text to parse.
 * @returns A JSON string.
 */
const extractJson = (text: string): string => {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    return text.trim();
};

const titleSuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A novel and trending research paper title." },
            justification: { type: Type.STRING, description: "A brief explanation of why this title is relevant and promising." }
        },
        required: ["title", "justification"]
    }
};

export const analyzeKeywords = async (field: string, initialKeywords: string): Promise<AnalyzedKeyword[]> => {
    const prompt = `You are a research assistant specializing in scientometrics. Analyze top-tier journals and recent conference proceedings in the field of '${field}' related to the keywords: '${initialKeywords}'. Identify the 5 most significant and trending sub-keywords or research concepts. Provide a relevance score for each. Your response MUST be a valid JSON array of objects, where each object has "keyword" (string) and "score" (number between 0 and 1). Do not add any introductory text or markdown formatting.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("The Gemini API returned an empty response. This could be due to content safety filters or an internal error.");
        }

        const jsonText = extractJson(text);
        if (!jsonText) {
            throw new Error("Could not extract valid JSON from the API response for keyword analysis.");
        }
        const keywords: AnalyzedKeyword[] = JSON.parse(jsonText);
        return keywords.sort((a, b) => b.score - a.score);
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error analyzing keywords:", error);
        throw new Error(`Failed to analyze keywords: ${message}`);
    }
};

export const findRecentPapers = async (keywords: string[]): Promise<Paper[]> => {
    const keywordsString = keywords.join(', ');
    const prompt = `Based on these trending keywords: '${keywordsString}', find the 4 most recent and impactful research papers published in the last 12-18 months. Use Google Search to find papers from reputable sources like arXiv, ACM, IEEE, Springer, etc. Your response MUST be a valid JSON array of objects. Each object must have "title" (string), "authors" (array of strings), "summary" (string), and "url" (string). Do not add any introductory text or markdown formatting.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("The Gemini API returned an empty response. This could be due to content safety filters or an internal error.");
        }
        
        const jsonText = extractJson(text);
        if (!jsonText) {
            throw new Error("Could not extract valid JSON from the API response for paper search.");
        }
        return JSON.parse(jsonText);
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error finding recent papers:", error);
        throw new Error(`Failed to find recent papers: ${message}`);
    }
};

export const brainstormTitles = async (papers: Paper[]): Promise<SuggestedTitle[]> => {
    const paperSummaries = papers.map(p => `Title: ${p.title}\nSummary: ${p.summary}`).join('\n\n');
    const systemInstruction = "You are a creative and forward-thinking research strategist with deep expertise in academic trends. Your task is to propose innovative research titles that could lead to high-impact publications.";
    const prompt = `Based on the following summaries of recent cutting-edge papers, brainstorm and propose 5 novel research titles. These titles should synthesize ideas, address gaps, or explore future directions suggested by the provided research. For each title, provide a concise justification.
    
    Recent Papers:
    ${paperSummaries}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: titleSuggestionSchema,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("The Gemini API returned an empty response. This could be due to content safety filters or an internal error.");
        }
        
        const jsonText = text.trim();
        if (!jsonText) {
            throw new Error("API returned an empty JSON string during title brainstorming.");
        }
        return JSON.parse(jsonText);
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error brainstorming titles:", error);
        throw new Error(`Failed to brainstorm titles: ${message}`);
    }
};
