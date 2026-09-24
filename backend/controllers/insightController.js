import { extractInsights } from '../services/insightService.js';
import { getSurveys, getAllPersonaMemories, getInsights, saveInsights } from '../services/dataStore.js';

export const handleGenerateInsights = async (req, res) => {
  const { personas, experimentContext } = req.body;

  if (!personas || !Array.isArray(personas) || personas.length === 0) {
    return res.status(400).json({ error: 'personas array is required' });
  }

  try {
    const surveyResults = getSurveys();
    const interviewMemories = getAllPersonaMemories();

    const insights = await extractInsights({
      personas,
      surveyResults,
      interviewMemories,
      experimentContext
    });

    // Calculate Experiment Statistics
    const numPersonas = personas.length;
    const numSurveyQuestions = surveyResults.length > 0 ? surveyResults[0].answers.length : 0;
    const numSurveyResponses = surveyResults.reduce((acc, p) => acc + (p.answers ? p.answers.length : 0), 0);
    const numInterviewSessions = Object.keys(interviewMemories).length;
    const numInterviewMessages = Object.values(interviewMemories).reduce((acc, m) => acc + (m.history ? m.history.length : 0), 0);

    insights.stats = {
      numPersonas,
      numSurveyQuestions,
      numSurveyResponses,
      numInterviewSessions,
      numInterviewMessages
    };

    // Add raw data for the report template
    insights.reportData = {
      personas,
      surveyResults,
      interviewMemories
    };

    // Save insights to dataStore
    saveInsights(insights);

    return res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Insight Generation Error:', error);
    return res.status(500).json({ error: 'An error occurred generating insights' });
  }
};

export const handleGetInsights = async (req, res) => {
  try {
    const insights = getInsights();
    return res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Fetch Insights Error:', error);
    return res.status(500).json({ error: 'An error occurred fetching insights' });
  }
};
