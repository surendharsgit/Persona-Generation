import { generatePersonas, chatWithPersona, runPersonaSurvey } from '../services/personaService.js';
import { getPersonaMemory, savePersonaMemory, clearPersonaMemory } from '../services/dataStore.js';

export const handleGeneratePersonas = async (req, res) => {
  const {
    productName,
    productDescription,
    industry,
    targetGender,
    targetAudienceAge,
    numberOfPersonas,
    researchObjective,
  } = req.body;

  // Basic Validation
  if (!productName || !productName.trim()) {
    return res.status(400).json({ error: 'productName is required' });
  }
  if (!productDescription || !productDescription.trim()) {
    return res.status(400).json({ error: 'productDescription is required' });
  }
  if (!industry) {
    return res.status(400).json({ error: 'industry is required' });
  }
  if (!researchObjective || !researchObjective.trim()) {
    return res.status(400).json({ error: 'researchObjective is required' });
  }

  // Parse age range boundaries
  let ageMin = 18;
  let ageMax = 65;
  if (targetAudienceAge) {
    if (typeof targetAudienceAge === 'object') {
      ageMin = parseInt(targetAudienceAge.min) || 18;
      ageMax = parseInt(targetAudienceAge.max) || 65;
    } else {
      // Handle potential direct string format
      const parsed = String(targetAudienceAge).split('-');
      if (parsed.length === 2) {
        ageMin = parseInt(parsed[0]) || 18;
        ageMax = parseInt(parsed[1]) || 65;
      }
    }
  }

  try {
    const personas = await generatePersonas({
      productName,
      productDescription,
      industry,
      targetGender: targetGender || 'Both',
      targetAudienceAge: { min: ageMin, max: ageMax },
      numberOfPersonas: parseInt(numberOfPersonas) || 3,
      researchObjective,
    });

    const requestedCount = parseInt(numberOfPersonas) || 3;
    const exactPersonas = personas.slice(0, requestedCount);

    return res.status(200).json({
      success: true,
      count: exactPersonas.length,
      personas: exactPersonas,
    });
  } catch (error) {
    console.error('Generation Error:', error);
    return res.status(500).json({ error: 'An error occurred during persona generation' });
  }
};

export const handleChatWithPersona = async (req, res) => {
  const { persona, message } = req.body;

  if (!persona || !persona.id) {
    return res.status(400).json({ error: 'persona with an id is required' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const memory = getPersonaMemory(persona.id);
    
    // Call AI to reply and update context
    const result = await chatWithPersona({
      persona,
      message,
      history: memory.history,
      dynamicContext: memory.dynamicContext
    });

    // Update history
    const updatedHistory = [
      ...memory.history,
      { role: 'user', text: message },
      { role: 'model', text: result.reply }
    ];

    // Save back to memory store
    const updatedMemory = savePersonaMemory(persona.id, {
      history: updatedHistory,
      dynamicContext: result.updatedContext
    });

    return res.status(200).json({
      success: true,
      reply: result.reply,
      memory: updatedMemory
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({ error: 'An error occurred during chat reasoning' });
  }
};

import { saveSurveys } from '../services/dataStore.js';

export const handleRunSurvey = async (req, res) => {
  const { personas, questions } = req.body;

  if (!personas || !Array.isArray(personas) || personas.length === 0) {
    return res.status(400).json({ error: 'personas array is required' });
  }
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'questions array is required' });
  }

  try {
    const surveyResults = await runPersonaSurvey({ personas, questions });
    // Save to data store
    saveSurveys(surveyResults);
    return res.status(200).json({
      success: true,
      results: surveyResults
    });
  } catch (error) {
    console.error('Survey controller error:', error);
    return res.status(500).json({ error: 'An error occurred running the survey' });
  }
};

export const handleGetMemory = async (req, res) => {
  const { personaId } = req.params;
  if (!personaId) {
    return res.status(400).json({ error: 'personaId is required' });
  }
  const memory = getPersonaMemory(personaId);
  return res.status(200).json({ success: true, memory });
};

export const handleClearMemory = async (req, res) => {
  const { personaId } = req.params;
  if (!personaId) {
    return res.status(400).json({ error: 'personaId is required' });
  }
  const memory = clearPersonaMemory(personaId);
  return res.status(200).json({ success: true, memory });
};

