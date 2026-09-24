import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiCopy, 
  FiCheck, 
  FiChevronDown, 
  FiChevronUp, 
  FiMapPin, 
  FiBookOpen, 
  FiBriefcase, 
  FiStar, 
  FiTarget, 
  FiCpu,
  FiShoppingBag,
  FiActivity
} from 'react-icons/fi';

export default function PersonaCard({ persona, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('persona_favs') || '{}');
      return !!favs[persona.id];
    } catch {
      return false;
    }
  });

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    setIsFavorite(prev => {
      const newVal = !prev;
      try {
        const favs = JSON.parse(localStorage.getItem('persona_favs') || '{}');
        if (newVal) {
          favs[persona.id] = true;
        } else {
          delete favs[persona.id];
        }
        localStorage.setItem('persona_favs', JSON.stringify(favs));
      } catch (err) {
        console.error(err);
      }
      return newVal;
    });
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    const textToCopy = `
Name: ${persona.name}
Age: ${persona.age}
Gender: ${persona.gender}
Occupation: ${persona.occupation}
Location: ${persona.demographics?.location}
Education: ${persona.demographics?.education}
Income: ${persona.demographics?.income}

Summary: ${persona.bio}
Quote: ${persona.quote}

Archetype: ${persona.archetype} - ${persona.archetypeDesc}
Goals:
${persona.goals?.map(g => `- ${g}`).join('\n')}
Pain Points:
${persona.painPoints?.map(p => `- ${p}`).join('\n')}

Buying Behaviour: ${persona.buyingBehaviour}
Technology Usage: ${persona.technologyUsage}
Rating: ${persona.rating}/5
Decision: ${persona.decision}
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Star Rating elements
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<FiStar key={i} className="text-amber-400 fill-amber-400" size={12} />);
      } else if (i - 0.5 <= rating) {
        stars.push(
          <div key={i} className="relative inline-block" style={{ width: 12, height: 12 }}>
            <FiStar className="text-gray-600 absolute top-0 left-0" size={12} />
            <div className="absolute top-0 left-0 w-[50%] overflow-hidden">
              <FiStar className="text-amber-400 fill-amber-400" size={12} />
            </div>
          </div>
        );
      } else {
        stars.push(<FiStar key={i} className="text-gray-600" size={12} />);
      }
    }
    return <div className="flex gap-0.5 items-center">{stars} <span className="ml-1 text-[10px] text-gray-400">({rating})</span></div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="glass-card hover:border-[#8B5CF6]/30 overflow-hidden relative group rounded-2xl flex flex-col h-full"
    >
      {/* Background card overlay hover glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#4F46E5]/5 to-[#06B6D4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4]" />

      <div className="p-5 flex flex-col flex-grow">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar Area */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4F46E5]/20 to-[#06B6D4]/20 border border-white/10 flex items-center justify-center overflow-hidden p-1">
              <div className="w-full h-full rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#4F46E5]/30 to-[#06B6D4]/30 text-white text-2xl font-bold uppercase select-none">
                {persona.name ? persona.name.charAt(0) : ''}
              </div>
            </div>
            {/* Status dot / Decision badge */}
            <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full border border-[#0B0F19] ${
              persona.decision === 'Yes' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-rose-500 text-white'
            }`}>
              {persona.decision === 'Yes' ? 'Target: Yes' : 'Target: No'}
            </span>
          </div>

          {/* Identity details */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-wide truncate">{persona.name}</h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Favorite Button */}
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isFavorite 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                      : 'bg-white/5 border-white/5 text-gray-600 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5'
                  }`}
                  title="Favorite Persona"
                >
                  <FiHeart className={isFavorite ? 'fill-rose-500' : ''} size={13} />
                </button>
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isCopied 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-white/5 border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                  }`}
                  title="Copy Persona"
                >
                  {isCopied ? <FiCheck size={13} /> : <FiCopy size={13} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 font-medium truncate mt-0.5">
              <FiBriefcase className="text-[#06B6D4] flex-shrink-0" />
              {persona.occupation}
            </p>

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-gray-700 dark:text-gray-300">
                {persona.gender}
              </span>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-gray-700 dark:text-gray-300">
                Age {persona.age}
              </span>
              {persona.demographics?.income && (
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-[#06B6D4] font-semibold">
                  {persona.demographics.income}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Short Summary (Quote / Bio) */}
        <div className="mb-3">
          <p className="text-xs text-gray-700 dark:text-gray-300 italic bg-white/5 p-3 rounded-xl border border-white/5 relative">
            <span className="absolute -top-2 left-2 px-1 text-[8px] uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-[#0F1424] rounded">Quote</span>
            {persona.quote}
          </p>
        </div>

        {/* Bio / Summary */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">
          {persona.bio}
        </p>

        {/* Basic demographics tags */}
        <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3 mb-3">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 min-w-0">
            <FiMapPin className="text-[#4F46E5] flex-shrink-0" size={12} />
            <span className="truncate">{persona.demographics?.location || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 min-w-0">
            <FiBookOpen className="text-[#8B5CF6] flex-shrink-0" size={12} />
            <span className="truncate">{persona.demographics?.education || 'N/A'}</span>
          </div>
        </div>

        {/* Archetype / Personality trait */}
        <div className="mb-4 bg-gradient-to-r from-[#4F46E5]/10 to-[#8B5CF6]/5 p-3 rounded-xl border border-[#4F46E5]/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#8B5CF6] font-bold">Archetype</span>
            {renderStars(persona.rating || 4.5)}
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{persona.archetype}</h4>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">{persona.archetypeDesc}</p>
        </div>

        {/* Accordion/Expanded Details */}
        <div className="mt-auto">
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4 pt-1 pb-4 border-t border-white/5 mt-3"
              >
                {/* Goals */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <FiTarget size={12} />
                    Goals & Objectives
                  </h5>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 pl-4 list-disc list-outside">
                    {persona.goals?.map((goal, idx) => (
                      <li key={idx} className="leading-normal">{goal}</li>
                    ))}
                  </ul>
                </div>

                {/* Pain Points */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <FiActivity size={12} />
                    Pain Points & Challenges
                  </h5>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 pl-4 list-disc list-outside">
                    {persona.painPoints?.map((pain, idx) => (
                      <li key={idx} className="leading-normal">{pain}</li>
                    ))}
                  </ul>
                </div>

                {/* Buying Behaviour */}
                {persona.buyingBehaviour && (
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-[#06B6D4] flex items-center gap-1.5">
                      <FiShoppingBag size={12} />
                      Buying Behaviour
                    </h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-normal pl-4 border-l border-[#06B6D4]/30">
                      {persona.buyingBehaviour}
                    </p>
                  </div>
                )}

                {/* Technology Usage */}
                {persona.technologyUsage && (
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5">
                      <FiCpu size={12} />
                      Technology Usage
                    </h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-normal pl-4 border-l border-[#8B5CF6]/30">
                      {persona.technologyUsage}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Expand Button */}
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="w-full mt-2 py-2.5 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Collapse Persona Details</span>
                <FiChevronUp />
              </>
            ) : (
              <>
                <span>Expand Persona Details</span>
                <FiChevronDown />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
