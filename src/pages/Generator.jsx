import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, 
  FiFileText, 
  FiTrendingUp, 
  FiUserCheck, 
  FiCalendar, 
  FiUsers, 
  FiTarget, 
  FiRefreshCw, 
  FiLoader,
  FiCheckCircle
} from 'react-icons/fi';
import api from '../services/api';
import PersonaCard from '../components/PersonaCard';

const INDUSTRIES = [
  'Technology & SaaS',
  'E-commerce & Retail',
  'Healthcare & Wellness',
  'Finance & Fintech',
  'Education & Edtech',
  'Travel & Hospitality',
  'Entertainment & Media',
  'Real Estate',
  'Other',
];

const enrichPersona = (persona) => {
  const hash = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };
  const seed = hash(persona.name || 'persona');
  
  const buyingBehaviours = [
    'Research-heavy consumer. Relies on reviews and case studies before purchase.',
    'Value-driven buyer. Focused on ROI, efficiency, and long-term cost benefits.',
    'Early adopter. Eager to purchase new technologies and try new features first.',
    'Convenience seeker. Prioritizes quick integration, setup speed, and user experience.',
    'Budget-conscious decision maker. Prefers flexible tier structures and clear discount policies.'
  ];
  
  const techUsages = [
    'Heavy user of SaaS tools (Notion, Slack, Jira). Prefers web apps.',
    'Mobile-first workflow. Dependent on notifications and cross-device sync.',
    'Traditional office ecosystem (Excel, Email). Prefers minimal external software.',
    'Multi-device professional (Mac, iPad, iPhone). Values ecosystem integration.',
    'Developer-centric environment. High usage of command line, APIs, and GitHub.'
  ];
  
  const ratings = [4.5, 4.8, 5.0, 4.2, 4.7];
  const decisions = ['Yes', 'Yes', 'Yes', 'No', 'Yes'];
  
  let genderType = 'lego';
  const genderLower = (persona.gender || '').toLowerCase();
  if (genderLower.includes('female') || genderLower === 'woman') {
    genderType = 'women';
  } else if (genderLower.includes('male') || genderLower === 'man') {
    genderType = 'men';
  }

  // Use randomuser.me for guaranteed male/female photos, fallback to dicebear initials if neither
  const avatarUrl = (genderType === 'women' || genderType === 'men')
    ? `https://randomuser.me/api/portraits/${genderType}/${seed % 100}.jpg`
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(persona.name)}`;

  return {
    ...persona,
    buyingBehaviour: buyingBehaviours[seed % buyingBehaviours.length],
    technologyUsage: techUsages[seed % techUsages.length],
    rating: ratings[seed % ratings.length],
    decision: decisions[seed % decisions.length],
    avatarUrl,
  };
};

export default function Generator() {
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    industry: '',
    gender: 'Both',
    ageMin: 18,
    ageMax: 65,
    numPersonas: 3,
    objective: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isSuccess, setIsSuccess] = useState(false);
  const { personas, setPersonas } = useApp();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!formData.productDescription.trim()) {
      newErrors.productDescription = 'Product description is required';
    } else if (formData.productDescription.trim().length < 20) {
      newErrors.productDescription = 'Please provide a more detailed description (min 20 chars)';
    }
    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }
    if (formData.ageMin < 1 || formData.ageMin > 100) {
      newErrors.age = 'Age must be between 1 and 100';
    }
    if (formData.ageMax < formData.ageMin) {
      newErrors.age = 'Max age cannot be less than min age';
    }
    if (!formData.objective.trim()) {
      newErrors.objective = 'Research objective is required';
    }
    if (
      formData.numPersonas === '' ||
      isNaN(formData.numPersonas) ||
      formData.numPersonas < 1 ||
      formData.numPersonas > 100 ||
      !Number.isInteger(Number(formData.numPersonas))
    ) {
      newErrors.numPersonas = 'Please enter a valid number of personas between 1 and 100.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const latestRequestId = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setIsSuccess(false);
    setProgress({ current: 0, total: formData.numPersonas });

    // Completely clear the previous persona generation results
    setPersonas([]);

    const reqId = Date.now();
    latestRequestId.current = reqId;

    try {
      const targetCount = formData.numPersonas;
      const CHUNK_SIZE = 10;
      let generatedCount = 0;
      let allGeneratedPersonas = [];

      while (generatedCount < targetCount) {
        if (latestRequestId.current !== reqId) break; // aborted

        const countForThisChunk = Math.min(CHUNK_SIZE, targetCount - generatedCount);
        
        let success = false;
        let retries = 0;
        
        while (!success && retries < 3) {
          try {
            const response = await api.post('/api/generate', {
              productName: formData.productName,
              productDescription: formData.productDescription,
              industry: formData.industry,
              targetGender: formData.gender,
              targetAudienceAge: {
                min: formData.ageMin,
                max: formData.ageMax
              },
              numberOfPersonas: countForThisChunk,
              researchObjective: formData.objective,
            });

            if (response && response.personas) {
              const enriched = response.personas.map(enrichPersona);
              allGeneratedPersonas = [...allGeneratedPersonas, ...enriched];
              generatedCount += countForThisChunk;
              setProgress({ current: generatedCount, total: targetCount });
              
              // Update state progressively so UI shows them appearing
              setPersonas(prev => [...prev, ...enriched]);
              success = true;
            }
          } catch (chunkErr) {
            retries++;
            console.warn(`Chunk generation failed, retrying (${retries}/3)...`, chunkErr);
            if (retries >= 3) {
              throw new Error(`Failed to generate batch after 3 attempts. Last error: ${chunkErr.message}`);
            }
          }
        }
      }

      if (latestRequestId.current === reqId && generatedCount === targetCount) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (err) {
      if (latestRequestId.current !== reqId) return;
      console.error('Failed to generate personas:', err);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || err.response?.data?.error || 'An error occurred while generating personas. Make sure the backend server is running.'
      }));
    } finally {
      if (latestRequestId.current === reqId) {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      productName: '',
      productDescription: '',
      industry: '',
      gender: 'Both',
      ageMin: 18,
      ageMax: 65,
      numPersonas: 3,
      objective: '',
    });
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-start py-12 px-4 overflow-y-auto bg-blue-50 dark:bg-transparent transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#4F46E5]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#06B6D4]/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl z-10"
      >
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Persona Forge Engine
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Provide key parameters to craft data-driven target profiles for your product.
          </p>
        </div>

        {/* Main Glass Form Card */}
        <div className="bg-white/80 dark:bg-[#0B0F19]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 md:p-10 rounded-3xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="min-h-[400px] flex flex-col items-center justify-center text-center py-12"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center animate-pulse">
                    <FiLoader className="text-white text-3xl animate-spin" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#06B6D4] animate-ping" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Forging Personas...</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-4">
                  {progress.current > 0 ? "Analyzing market vectors and expanding cohort size." : "Analyzing market vectors, configuring psychographics, and setting up character dialog channels."}
                </p>
                <div className="text-lg font-bold text-[#4F46E5] mb-2">
                  Generated: {progress.current} / {progress.total}
                </div>
                {/* Real Progress Bar */}
                <div className="w-64 h-2 bg-gray-200 dark:bg-white/10 rounded-full mt-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-[#4F46E5] to-[#06B6D4]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Success Notification Banner */}
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 text-sm"
                  >
                    <FiCheckCircle className="text-lg flex-shrink-0" />
                    <span>Personas successfully generated!</span>
                  </motion.div>
                )}

                {/* API Submit Error Banner */}
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-sm"
                  >
                    <span>{errors.submit}</span>
                  </motion.div>
                )}

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Product Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiPackage className="text-[#4F46E5]" />
                      Product / Project Name
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="e.g. FitTrack Sync"
                      className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                    />
                    {errors.productName && (
                      <span className="text-xs text-rose-500">{errors.productName}</span>
                    )}
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiTrendingUp className="text-[#06B6D4]" />
                      Industry Sector
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white">Select Industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} className="bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white">
                          {ind}
                        </option>
                      ))}
                    </select>
                    {errors.industry && (
                      <span className="text-xs text-rose-500">{errors.industry}</span>
                    )}
                  </div>

                  {/* Product Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiFileText className="text-[#8B5CF6]" />
                      Product / Service Description
                    </label>
                    <textarea
                      value={formData.productDescription}
                      onChange={(e) => handleInputChange('productDescription', e.target.value)}
                      placeholder="Describe what your product does, its main value proposition, and the core problem it solves..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all resize-none"
                    />
                    {errors.productDescription && (
                      <span className="text-xs text-rose-500">{errors.productDescription}</span>
                    )}
                  </div>

                  {/* Gender Choice */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiUserCheck className="text-[#4F46E5]" />
                      Target Gender
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Male', 'Female', 'Both'].map((genderOption) => (
                        <button
                          key={genderOption}
                          type="button"
                          onClick={() => handleInputChange('gender', genderOption)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            formData.gender === genderOption
                              ? 'bg-[#4F46E5] text-white border-transparent'
                              : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10 dark:text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          {genderOption}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience Age Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiCalendar className="text-[#06B6D4]" />
                      Target Age Range ({formData.ageMin} - {formData.ageMax})
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.ageMin}
                          min={1}
                          max={100}
                          onChange={(e) => handleInputChange('ageMin', parseInt(e.target.value) || 0)}
                          placeholder="Min"
                          className="w-full px-3 py-2 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-center text-sm focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                        />
                      </div>
                      <span className="text-gray-400">to</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.ageMax}
                          min={1}
                          max={100}
                          onChange={(e) => handleInputChange('ageMax', parseInt(e.target.value) || 0)}
                          placeholder="Max"
                          className="w-full px-3 py-2 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-center text-sm focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    {errors.age && (
                      <span className="text-xs text-rose-500 block">{errors.age}</span>
                    )}
                  </div>

                  {/* Number of Personas */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiUsers className="text-[#8B5CF6]" />
                      Number of Personas to Generate
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.numPersonas}
                      onChange={(e) => handleInputChange('numPersonas', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      placeholder="e.g. 10 (Up to 100 for stress testing)"
                      className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                    />
                    {errors.numPersonas && (
                      <span className="text-xs text-rose-500">{errors.numPersonas}</span>
                    )}
                  </div>

                  {/* Research Objective */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiTarget className="text-[#4F46E5]" />
                      Research Objective
                    </label>
                    <textarea
                      value={formData.objective}
                      onChange={(e) => handleInputChange('objective', e.target.value)}
                      placeholder="e.g. Map out pain points when using fitness apps, identify subscription barriers, define communication preferences."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all resize-none"
                    />
                    {errors.objective && (
                      <span className="text-xs text-rose-500">{errors.objective}</span>
                    )}
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl glass-button-secondary flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <FiRefreshCw />
                    <span>Reset Form</span>
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-xl glass-button-primary flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>Generate Personas</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Generated Personas Grid */}
      {personas.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-6xl mt-16 z-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Generated Personas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-xl mx-auto">
              Review and expand the detailed profiles of target buyers synthesized for your product parameters.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona, index) => (
              <PersonaCard key={persona.id} persona={persona} index={index} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

