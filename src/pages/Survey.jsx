import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiMinus, 
  FiPlay, 
  FiUsers, 
  FiCheckCircle, 
  FiFileText, 
  FiHelpCircle,
  FiLoader
} from 'react-icons/fi';
import api from '../services/api';

export default function Survey() {

  const [scenario, setScenario] = useState('Premium Subscription Service: A premium software or content subscription with exclusive features and advanced analysis tools.');
  const [questions, setQuestions] = useState([
    'What is your primary hesitation when buying a premium subscription service?',
    'What features would make you recommend this product to colleagues?'
  ]);
  const [loadingStage, setLoadingStage] = useState(''); // 'generating' | 'surveying' | ''
  const [surveyResults, setSurveyResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, '']);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleRunSurvey = async () => {
    const validQuestions = questions.filter(q => q.trim() !== '');

    if (!scenario || !scenario.trim()) {
      setError('Please enter a survey scenario/product domain description.');
      return;
    }
    if (validQuestions.length === 0) {
      setError('Please enter at least one survey question.');
      return;
    }

    setIsLoading(true);
    setLoadingStage('generating');
    setError(null);
    setSurveyResults([]);

    try {
      const parts = scenario.split(':');
      const pName = parts[0]?.trim() || 'Survey Product';
      const pDesc = parts.slice(1).join(':')?.trim() || scenario;

      // 1. Generate cohort personas
      const responseGen = await api.post('/api/generate', {
        productName: pName,
        productDescription: pDesc,
        industry: 'General Technology & Services',
        targetGender: 'Both',
        targetAudienceAge: { min: 18, max: 65 },
        numberOfPersonas: 4,
        researchObjective: `Gather feedback on the following questions: ${validQuestions.join(', ')}`
      });

      if (!responseGen || !responseGen.success || !responseGen.personas || responseGen.personas.length === 0) {
        throw new Error('Failed to generate persona cohort.');
      }

      // 2. Run the survey
      setLoadingStage('surveying');
      const responseSurvey = await api.post('/api/survey', {
        personas: responseGen.personas,
        questions: validQuestions
      });

      if (responseSurvey && responseSurvey.success) {
        setSurveyResults(responseSurvey.results);
      } else {
        throw new Error('Failed to run survey across cohort.');
      }
    } catch (err) {
      console.error('Survey flow error:', err);
      setError('Failed to run cohort survey. Make sure your backend server is running and your Gemini API key is configured correctly.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-start py-8 px-4 overflow-y-auto bg-blue-50 dark:bg-transparent transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#4F46E5]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#06B6D4]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl z-10 flex flex-col gap-8">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Survey Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-xl mx-auto">
            Run survey questions across multiple personas simultaneously and compare their responses side-by-side.
          </p>
        </div>

        {/* Survey Input Setup */}
        <div className="w-full glass-card p-6 rounded-3xl flex flex-col gap-5 justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiFileText className="text-[#8B5CF6]" />
              Survey Scenario / Product Domain
            </h3>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe the product or subscription service (e.g. A premium vacuum-insulated coffee mug with temp control)"
              className="w-full px-3 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-xs focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all resize-none h-16"
            />

            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 pt-2">
              <FiHelpCircle className="text-[#06B6D4]" />
              Survey Questions
            </h3>

            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-500 font-semibold w-6">Q{idx + 1}</span>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleQuestionChange(idx, e.target.value)}
                    placeholder="Enter survey question..."
                    className="flex-grow px-3 py-2 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-xs focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                  />
                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    disabled={questions.length <= 1}
                    className="p-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    title="Remove question"
                  >
                    <FiMinus size={13} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 text-xs text-[#06B6D4] hover:text-cyan-400 font-semibold transition-colors cursor-pointer"
            >
              <FiPlus />
              <span>Add Question</span>
            </button>
          </div>

          {/* AI-Generated Persona Cohort Info Banner */}
          <div className="border-t border-white/5 pt-4 mt-2">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
              <FiUsers className="text-[#4F46E5]" />
              AI-Generated Persona Cohort
            </h4>
            <p className="text-xs text-gray-500 bg-white/5 p-3.5 rounded-xl border border-white/5 leading-relaxed">
              Personas will be automatically generated based on your survey scenario and questions to collect diverse, context-aware perspectives.
            </p>
          </div>

          {/* Run Button / Error Message */}
          <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            {error ? (
              <span className="text-xs text-rose-500 font-medium">{error}</span>
            ) : (
              <span className="text-xs text-gray-500">Click run to generate personas and collect opinions.</span>
            )}

            <button
              onClick={handleRunSurvey}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl glass-button-primary flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>
                    {loadingStage === 'generating' 
                      ? 'Generating AI Personas...' 
                      : 'Running Survey Across Personas...'}
                  </span>
                </>
              ) : (
                <>
                  <FiPlay />
                  <span>Run Cohort Survey</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Survey Comparative Side-by-Side Results Grid */}
        <AnimatePresence>
          {surveyResults.length > 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full border border-gray-200 dark:border-white/5 bg-white/40 dark:bg-[#0B0F19]/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-400" />
                    Cohort Comparison Board
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Compare responses side-by-side across all variables.
                  </p>
                </div>
              </div>

              {/* Grid Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start overflow-x-auto">
                {surveyResults.map(({ persona, answers }) => (
                  <div
                    key={persona.id}
                    className="glass-card rounded-2xl flex flex-col h-full border border-white/5 overflow-hidden flex-shrink-0 min-w-[260px]"
                  >
                    {/* Header profile block */}
                    <div className="p-4 bg-white/5 border-b border-white/5 flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#4F46E5]/30 to-[#06B6D4]/30 text-white text-base font-bold uppercase border border-white/10 flex-shrink-0 select-none">
                        {persona.name ? persona.name.charAt(0) : ''}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{persona.name}</h4>
                        <p className="text-[10px] text-[#06B6D4] font-medium truncate">{persona.occupation}</p>
                        <span className="text-[9px] uppercase font-bold text-[#8B5CF6] mt-1 inline-block">
                          {persona.archetype}
                        </span>
                      </div>
                    </div>

                    {/* Question Answers Block */}
                    <div className="p-4 space-y-4 flex-grow">
                      {answers.map((ans, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-start gap-1">
                            <FiFileText className="text-gray-400 mt-0.5 flex-shrink-0" size={11} />
                            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              Q{idx + 1}: {ans.question}
                            </h5>
                          </div>
                          <p className="text-xs text-gray-800 dark:text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 italic">
                            "{ans.answer}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
