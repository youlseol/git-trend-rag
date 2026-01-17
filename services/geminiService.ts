import { GoogleGenAI, Type } from "@google/genai";
import { Repo, TrendingPeriod } from "../types";

// Initialize Gemini Client
// CRITICAL: Using named export GoogleGenAI and apiKey from process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TRENDING_MODEL = "gemini-3-flash-preview";

export interface TrendingResponse {
  repos: Repo[];
  sources: { title?: string; uri?: string }[];
}

/**
 * Fetches trending repositories using Gemini's Google Search grounding.
 * Since GitHub API doesn't provide "Trending", we use Gemini to search the web (github.com/trending)
 * and structure the data.
 */
export const fetchTrendingReposWithAI = async (
  period: TrendingPeriod,
  language: string
): Promise<TrendingResponse> => {
  try {
    const langQuery = language === "All" ? "" : `written in ${language}`;
    const periodQuery = period.toLowerCase();
    
    // Prompt engineered to get structured data despite using Search tool
    const prompt = `
      Find the current trending GitHub repositories for ${periodQuery} ${langQuery}.
      Search sources like 'github.com/trending' to get real-time data.
      
      Return a list of at least 10 repositories.
      For each repository, provide:
      - Name (format: owner/repo)
      - A short description
      - The main programming language
      - Approximate star count (number)
      - URL to the repository
      
      You must return the data strictly in JSON format matching this schema:
      {
        "repos": [
          {
            "name": "owner/repo",
            "description": "string",
            "language": "string",
            "stars": number,
            "url": "https://github.com/..."
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: TRENDING_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data received from Gemini.");

    const parsed = JSON.parse(jsonText);
    
    // Extract grounding sources
    const sources: { title?: string; uri?: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                sources.push({ title: chunk.web.title, uri: chunk.web.uri });
            }
        });
    }

    // Map to our internal Repo interface
    const repos: Repo[] = parsed.repos.map((r: any, index: number) => ({
      id: `ai-trend-${index}-${Date.now()}`,
      name: r.name,
      description: r.description,
      html_url: r.url,
      language: r.language,
      stargazers_count: r.stars,
      owner: {
        login: r.name.split('/')[0] || "unknown",
        avatar_url: `https://github.com/${r.name.split('/')[0]}.png` // GitHub avatar convention
      }
    }));

    return { repos, sources };

  } catch (error) {
    console.error("Gemini Trending Error:", error);
    return { repos: [], sources: [] };
  }
};

/**
 * Generates a quick insight/summary for a specific repository.
 */
export const generateRepoInsight = async (repoName: string, description: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Explain what the GitHub repository "${repoName}" does in one short, catchy sentence based on this description: "${description}". focus on its value proposition.`,
        });
        return response.text || "No insight available.";
    } catch (error) {
        console.error("Gemini Insight Error:", error);
        return "Could not generate insight.";
    }
}

/**
 * Performs semantic search on a list of repositories using Gemini.
 * Returns a list of Repo IDs that match the natural language query.
 */
export const semanticSearchStars = async (query: string, repos: Repo[]): Promise<string[]> => {
    try {
        // Create a lightweight context to save tokens, only sending necessary fields
        const repoContext = repos.map(r => ({
            id: String(r.id),
            txt: `${r.name}: ${r.description || ''} (Language: ${r.language || 'Unknown'})`
        }));

        const prompt = `
            You are an intelligent search engine for GitHub repositories.
            
            User Query: "${query}"

            Here is the list of repositories the user has starred:
            ${JSON.stringify(repoContext)}

            Analyze the user query and the repository list. 
            Return a JSON object containing an array of 'ids' for the repositories that best match the user's intent.
            Rank them by relevance.
            
            Response format:
            { "ids": ["123", "456"] }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const jsonText = response.text;
        if (!jsonText) return [];

        const parsed = JSON.parse(jsonText);
        return parsed.ids.map((id: string | number) => String(id));

    } catch (error) {
        console.error("Semantic Search Error:", error);
        return [];
    }
};