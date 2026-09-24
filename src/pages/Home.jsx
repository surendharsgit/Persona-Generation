import { motion } from 'framer-motion';
import { FiCpu, FiUsers, FiSliders, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#4F46E5]/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#06B6D4]/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/10 blur-[150px] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-[#06B6D4] mb-8 border border-cyan-500/20"
        >
          <FiCpu className="animate-spin-slow" />
          <span>Next Generation AI Engine Active</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent"
        >
          Forge Hyper-Realistic <br />
          <span className="bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
            AI Personas
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Craft highly detailed target audiences, buyer personas, and character profiles backed by advanced generative AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button onClick={() => navigate('/generator')} className="w-full sm:w-auto px-8 py-4 rounded-xl glass-button-primary flex items-center justify-center gap-2 text-base cursor-pointer">
            <span>Launch Generator</span>
            <FiArrowRight />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-xl glass-button-secondary flex items-center justify-center gap-2 text-base cursor-pointer">
            <span>Explore Templates</span>
          </button>
        </motion.div>
      </div>

      {/* Feature Cards Grid (Glassmorphism Showcase) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-24 relative z-10"
      >
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center border border-[#4F46E5]/30">
            <FiUsers className="text-[#4F46E5] text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Demographic Profiles</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Generate precise background histories, age brackets, career paths, and lifestyle datasets instantly.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/30">
            <FiSliders className="text-[#8B5CF6] text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Behavioral Control</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Tune specific decision parameters, pain points, motivations, and psychological characteristics.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center border border-[#06B6D4]/30">
            <FiCpu className="text-[#06B6D4] text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Mock Chats</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Directly converse with your created personas using real-time conversational agents to test scenarios.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
