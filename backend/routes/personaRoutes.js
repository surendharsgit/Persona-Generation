import express from 'express';
import { 
  handleGeneratePersonas, 
  handleChatWithPersona, 
  handleRunSurvey,
  handleGetMemory,
  handleClearMemory
} from '../controllers/personaController.js';
import { handleGenerateInsights, handleGetInsights } from '../controllers/insightController.js';

const router = express.Router();

// Generate Persona Endpoint
router.post('/generate', handleGeneratePersonas);

// Persona Memory and Chat Endpoint
router.post('/chat', handleChatWithPersona);

// Survey Mode Endpoint
router.post('/survey', handleRunSurvey);

// Memory Management Endpoints
router.get('/memory/:personaId', handleGetMemory);
router.delete('/memory/:personaId/clear', handleClearMemory);

// Insight Endpoints
router.post('/insights/generate', handleGenerateInsights);
router.get('/insights', handleGetInsights);

export default router;
