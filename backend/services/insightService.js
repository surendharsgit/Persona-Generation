import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export const extractInsights = async ({ personas, surveyResults, interviewMemories, experimentContext = 'General usage testing' }) => {
  const prompt = `
You are an expert UX Researcher and Insight Extraction Agent.
Analyze the provided persona data, survey responses, and interview session logs to extract meaningful, evidence-grounded insights.
You must NOT hallucinate opinions or fabricate data. Every insight MUST be grounded in the provided evidence.

Experiment Context: ${experimentContext}

DATA SUMMARY:
Total Personas: ${personas.length}
Personas: ${JSON.stringify(personas.map(p => ({id: p.id, name: p.name, archetype: p.archetype, goals: p.goals})))}

Survey Responses:
${JSON.stringify(surveyResults)}

Interview Memories & Chat Histories:
${JSON.stringify(interviewMemories)}

YOUR TASK:
Generate a structured JSON output with the following analysis.

JSON Schema:
{
  "executiveSummary": "String (2-3 sentences max)",
  "overallAdoptionScore": Number (0-100),
  "overallValidationReasoning": "String (Explain WHY this overall score was given based on collected evidence)",
  "adoptionBreakdown": {
    "definitelyYes": Number (percentage 0-100),
    "probablyYes": Number (percentage 0-100),
    "unsure": Number (percentage 0-100),
    "probablyNo": Number (percentage 0-100),
    "definitelyNo": Number (percentage 0-100)
  },
  "themes": [
    {
      "name": "String (Theme title)",
      "frequency": "High" | "Medium" | "Low",
      "affectedSegments": ["String (Archetype or Persona name)"],
      "evidence": "String (Quoted evidence or summary from data)",
      "confidence": "High" | "Medium" | "Low"
    }
  ],
  "sentiment": {
    "positive": Number (percentage 0-100),
    "neutral": Number (percentage 0-100),
    "negative": Number (percentage 0-100),
    "mixed": Number (percentage 0-100)
  },
  "personaQuotes": [
    {
      "personaName": "String",
      "personaRole": "String (Occupation/Archetype)",
      "quote": "String",
      "relatedTheme": "String"
    }
  ],
  "agreements": [
    {
      "pattern": "String (What do they agree on?)",
      "percentage": Number (percentage 0-100),
      "evidence": "String"
    }
  ],
  "disagreements": [
    {
      "pattern": "String (What is the disagreement?)",
      "groups": ["String (e.g. Budget vs Premium)"],
      "evidence": "String"
    }
  ],
  "behavioralTrends": [
    {
      "trend": "String",
      "evidence": "String"
    }
  ],
  "segmentScoring": [
    {
      "segmentName": "String (e.g. Budget Conscious, Innovators)",
      "score": Number (0-100)
    }
  ],
  "personaScoring": [
    {
      "personaId": "String",
      "personaName": "String",
      "score": Number (0-100),
      "wouldUse": "Definitely Yes" | "Probably Yes" | "Unsure" | "Probably No" | "Definitely No" | "Insufficient Evidence",
      "reasoning": "String",
      "evidence": "String"
    }
  ],
  "keyInsights": [
    {
      "insight": "String (Actual insight)",
      "evidence": "String (Actual evidence from data)",
      "confidence": "High" | "Medium" | "Low"
    }
  ],
  "productRecommendations": [
    "String (Practical recommendation based ONLY on extracted insights)"
  ],
  "finalSummary": {
    "liked": "String (What users liked)",
    "disliked": "String (What users disliked)",
    "adoptionBarriers": "String (Main adoption barriers)",
    "opportunities": "String (Main product opportunities)",
    "conclusion": "String (Overall validation result)"
  }
}

Ensure the output is valid JSON format. Only return the JSON object, no other markdown wrappers. If there is insufficient data, reflect that in the "confidence" fields and "Insufficient Evidence" values instead of making things up.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let responseText = response.text;
    
    // Extract JSON block
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      responseText = responseText.substring(startIdx, endIdx + 1);
    }
    
    const insights = JSON.parse(responseText);
    return insights;
  } catch (error) {
    console.error("Insight Extraction Error:", error);
    throw new Error("Failed to extract insights using AI");
  }
};
