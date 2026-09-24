import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export const generatePersonas = async ({
  productName,
  productDescription,
  industry,
  targetGender,
  targetAudienceAge,
  numberOfPersonas = 3,
  researchObjective,
}) => {
  const minAge = targetAudienceAge?.min || 18;
  const maxAge = targetAudienceAge?.max || 65;

  const prompt = `
You are an expert market researcher and persona generator.
I need you to generate ${numberOfPersonas} detailed buyer/user personas for a product.

Product Name: ${productName}
Product Description: ${productDescription}
Industry: ${industry}
Target Gender: ${targetGender}
Target Age Range: ${minAge} - ${maxAge}
Research Objective: ${researchObjective}

For each persona, provide the following fields in a JSON array format (do NOT wrap the array in an object, just return the raw array of objects):
- id (string, unique identifier like p-1-timestamp)
- name (string)
- age (number)
- gender (string)
- occupation (string)
- archetype (string, e.g., "Innovator", "Skeptic", "Pragmatist")
- archetypeDesc (string, short description of why they fit this archetype)
- quote (string, a realistic quote from this persona about their needs/problems)
- bio (string, 2-3 sentences about their professional background and goals)
- painPoints (array of strings, 2-3 specific frustrations related to the industry or product area)
- goals (array of strings, 2-3 specific goals they want to achieve related to the product area)
- demographics (object containing 'location' (string), 'education' (string), and 'income' (string))

Ensure the output is strictly valid JSON format. Only return the JSON array, no other markdown or text.
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
    
    // Extract everything between the first '[' and last ']'
    const startIdx = responseText.indexOf('[');
    const endIdx = responseText.lastIndexOf(']');
    
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      responseText = responseText.substring(startIdx, endIdx + 1);
    }
    
    const personas = JSON.parse(responseText);
    return personas;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate personas using AI");
  }
};

export const chatWithPersona = async ({ persona, message, history = [], dynamicContext = {} }) => {
  const systemPrompt = `
You are roleplaying as this specific persona:
Name: ${persona.name}
Age: ${persona.age}
Gender: ${persona.gender}
Occupation: ${persona.occupation}
Archetype: ${persona.archetype} (${persona.archetypeDesc})
Bio: ${persona.bio}
Quote: ${persona.quote}
Pain Points: ${persona.painPoints ? persona.painPoints.join(', ') : ''}
Goals: ${persona.goals ? persona.goals.join(', ') : ''}
Buying Behaviour: ${persona.buyingBehaviour || ''}
Technology Usage: ${persona.technologyUsage || ''}
Demographics: Location: ${persona.demographics?.location || 'N/A'}, Education: ${persona.demographics?.education || 'N/A'}, Income: ${persona.demographics?.income || 'N/A'}

YOUR INSTRUCTIONS:
1. Respond to the user's message while staying 100% true to your background, archetype, pain points, and opinions.
2. Keep your response conversational, realistic, and concise (2-4 sentences is best).
3. Do NOT break character under any circumstances. Do not speak as an AI model.
4. Recall and respect prior conversation history if provided.

Additionally, maintain a "memory dictionary" representing what you have learned about the user during this conversation so far (e.g., their name, their product idea, their tone). Current memory dictionary: ${JSON.stringify(dynamicContext)}.
If you learn something new about the user (e.g., they share their name, their goals, or details of their project), update this memory dictionary.

Return your response in a JSON object format (only raw JSON, no markdown wrappers):
{
  "reply": "your conversational response here...",
  "updatedContext": {
    "user_name": "value if learned, else keep previous",
    "notes": "any other things you remember about the user or what has been discussed..."
  }
}
`;

  const contents = [];
  
  history.forEach(item => {
    contents.push({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    let text = response.text;
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Chat Generation Error:", error);
    return {
      reply: `Sorry, I'm having trouble responding right now. (Error: ${error.message})`,
      updatedContext: dynamicContext
    };
  }
};

export const runPersonaSurvey = async ({ personas, questions }) => {
  const promises = personas.map(async (persona) => {
    const personaAnswers = [];
    
    for (const q of questions) {
      const prompt = `
You are roleplaying as this specific persona:
Name: ${persona.name}
Age: ${persona.age}
Gender: ${persona.gender}
Occupation: ${persona.occupation}
Archetype: ${persona.archetype} (${persona.archetypeDesc})
Bio: ${persona.bio}
Quote: ${persona.quote}
Pain Points: ${persona.painPoints ? persona.painPoints.join(', ') : ''}
Goals: ${persona.goals ? persona.goals.join(', ') : ''}
Buying Behaviour: ${persona.buyingBehaviour || ''}
Technology Usage: ${persona.technologyUsage || ''}

Question: "${q}"

Respond to this survey question from your perspective. Stay 100% in character. Keep it realistic, honest, and direct (1-3 sentences).
Return a JSON object format (only raw JSON):
{
  "answer": "Your in-character answer here..."
}
`;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        let text = response.text;
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          text = text.substring(startIdx, endIdx + 1);
        }
        const parsed = JSON.parse(text);
        personaAnswers.push({
          question: q,
          answer: parsed.answer
        });
      } catch (err) {
        console.error(`Survey failed for persona ${persona.name} on question ${q}:`, err);
        personaAnswers.push({
          question: q,
          answer: "I don't have a strong opinion on this or had trouble answering."
        });
      }
    }

    return {
      personaId: persona.id,
      personaName: persona.name,
      persona: persona,
      answers: personaAnswers
    };
  });

  return Promise.all(promises);
};

