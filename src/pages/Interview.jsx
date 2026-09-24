import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiTrash2, 
  FiCpu, 
  FiUser, 
  FiBriefcase, 
  FiTarget, 
  FiActivity, 
  FiArrowLeft
} from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../services/api';

export default function Interview() {
  const { personas } = useApp();
  const navigate = useNavigate();

  const [selectedPersona, setSelectedPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [memoryContext, setMemoryContext] = useState({});
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Load chat memory when persona is selected
  useEffect(() => {
    if (selectedPersona) {
      loadPersonaMemory(selectedPersona.id);
    }
  }, [selectedPersona]);

  const loadPersonaMemory = async (personaId) => {
    try {
      const response = await api.get(`/api/memory/${personaId}`);
      if (response && response.memory) {
        setMessages(response.memory.history || []);
        setMemoryContext(response.memory.dynamicContext || {});
      }
    } catch (err) {
      console.error('Failed to load memory:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending || !selectedPersona) return;

    const userText = inputMessage;
    setInputMessage('');
    
    // Optimistic UI update
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsSending(true);

    try {
      const response = await api.post('/api/chat', {
        persona: selectedPersona,
        message: userText
      });

      if (response && response.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: response.reply }
        ]);
        if (response.memory) {
          setMemoryContext(response.memory.dynamicContext || {});
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Error: Failed to reach the persona forge engine. Please make sure the backend is active.' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearMemory = async () => {
    if (!selectedPersona) return;
    if (!window.confirm(`Are you sure you want to clear ${selectedPersona.name}'s memory?`)) return;

    try {
      const response = await api.delete(`/api/memory/${selectedPersona.id}/clear`);
      if (response && response.success) {
        setMessages([]);
        setMemoryContext({});
      }
    } catch (err) {
      console.error('Failed to clear memory:', err);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-start py-8 px-4 overflow-y-auto bg-blue-50 dark:bg-transparent transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#4F46E5]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#06B6D4]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl z-10 flex flex-col flex-grow">
        
        {/* Header */}
        <div className="text-center mb-8 flex-shrink-0">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Interview Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Converse directly with personas using dynamic multi-turn memory to test user interview scenarios.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedPersona ? (
            /* SELECT PERSONA VIEW */
            <motion.div
              key="select-persona"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl mx-auto"
            >
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">
                Select a Persona to Interview
              </h3>
              
              {personas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                    <FiUser className="text-2xl text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No personas available yet.
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Generate personas in the Generator tab to start interviewing your synthetic users.
                  </p>
                  <button
                    onClick={() => navigate('/generator')}
                    className="px-6 py-3 rounded-xl glass-button-primary font-bold shadow-lg shadow-[#4F46E5]/20 flex items-center gap-2"
                  >
                    <FiBriefcase />
                    Generate Personas
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {personas.map((persona) => (
                    <div
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona)}
                      className="glass-card p-6 rounded-2xl hover:border-[#8B5CF6]/40 cursor-pointer group transition-all flex gap-4 items-start relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#4F46E5]/5 to-[#06B6D4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#4F46E5]/30 to-[#06B6D4]/30 text-white text-xl font-bold uppercase border border-white/10 flex-shrink-0 select-none">
                        {persona.name ? persona.name.charAt(0) : ''}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#06B6D4] transition-colors truncate">
                            {persona.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-[#8B5CF6] px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                            {persona.archetype}
                          </span>
                        </div>
                        <p className="text-xs text-[#06B6D4] font-medium mt-0.5">{persona.occupation}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic leading-relaxed line-clamp-2">
                          "{persona.quote}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* CONVERSATION VIEW */
            <motion.div
              key="chat-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow"
            >
              
              {/* SIDEBAR - Persona Profile Card */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* Back Button */}
                <button
                  onClick={() => setSelectedPersona(null)}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-start transition-colors cursor-pointer"
                >
                  <FiArrowLeft />
                  <span>Select Another Persona</span>
                </button>

                {/* Info Card */}
                <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#4F46E5]/10 blur-[40px] pointer-events-none" />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#4F46E5]/30 to-[#06B6D4]/30 text-white text-2xl font-bold uppercase border border-white/10 flex-shrink-0 select-none">
                      {selectedPersona.name ? selectedPersona.name.charAt(0) : ''}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{selectedPersona.name}</h3>
                      <p className="text-xs text-[#06B6D4] font-medium">{selectedPersona.occupation}</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">{selectedPersona.gender}</span>
                        <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">Age {selectedPersona.age}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                    <p className="italic mb-2">"{selectedPersona.quote}"</p>
                    <p>{selectedPersona.bio}</p>
                  </div>

                  <div className="space-y-3 border-t border-white/5 pt-3">
                    {/* Goals */}
                    <div>
                      <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                        <FiTarget size={12} />
                        Goals
                      </h5>
                      <ul className="text-[11px] text-gray-700 dark:text-gray-400 space-y-1 list-disc list-inside">
                        {selectedPersona.goals?.slice(0, 3).map((g, i) => (
                          <li key={i} className="truncate">{g}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Pain Points */}
                    <div>
                      <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-1.5">
                        <FiActivity size={12} />
                        Pain Points
                      </h5>
                      <ul className="text-[11px] text-gray-700 dark:text-gray-400 space-y-1 list-disc list-inside">
                        {selectedPersona.painPoints?.slice(0, 3).map((p, i) => (
                          <li key={i} className="truncate">{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* MEMORY VIEWER */}
                <div className="glass-card p-5 rounded-2xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] flex items-center gap-2">
                    <FiCpu className="animate-pulse" />
                    Dynamic Persona Memory
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    This tracks what facts the persona has synthesized about you from this session's context.
                  </p>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5 font-mono text-[11px] min-h-[100px] text-[#06B6D4] overflow-y-auto">
                    {Object.keys(memoryContext).length === 0 ? (
                      <span className="text-gray-500 italic">No stored memories yet. Start chatting to trigger context learning.</span>
                    ) : (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(memoryContext, null, 2)}</pre>
                    )}
                  </div>
                </div>
              </div>

              {/* CHAT LOG COLUMN */}
              <div className="lg:col-span-2 flex flex-col glass-card rounded-3xl h-[650px] relative overflow-hidden">
                {/* Chat Top Info Banner */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Live Interview Session</span>
                  </div>
                  <button
                    onClick={handleClearMemory}
                    disabled={messages.length === 0}
                    className="p-2 rounded-xl text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-semibold"
                    title="Reset memory and clear chat history"
                  >
                    <FiTrash2 />
                    <span>Reset Memory</span>
                  </button>
                </div>

                {/* Message Log */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4 flex flex-col min-h-0">
                  {messages.length === 0 && (
                    <div className="my-auto flex flex-col items-center justify-center text-center p-8">
                      <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center border border-[#4F46E5]/20 mb-4">
                        <FiCpu className="text-xl text-[#4F46E5]" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Start the Interview</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
                        Say hello or ask how they currently solve the problems related to your business sector!
                      </p>
                    </div>
                  )}

                  {messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={index}
                        className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm border font-bold ${
                          isUser 
                            ? 'bg-[#4F46E5]/20 border-[#4F46E5]/30 text-[#4F46E5] dark:text-[#06B6D4]' 
                            : 'bg-white/10 border-white/10 text-white'
                        }`}>
                          {isUser ? <FiUser size={14} /> : selectedPersona.name[0]}
                        </div>

                        {/* Text bubble */}
                        <div className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white rounded-tr-none'
                            : 'bg-white/5 border border-white/5 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}

                  {isSending && (
                    <div className="flex gap-3 max-w-[85%] self-start">
                      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                        {selectedPersona.name[0]}
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs md:text-sm rounded-tl-none flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-white/5 bg-white/5 flex gap-2 items-center flex-shrink-0"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask ${selectedPersona.name} something...`}
                    disabled={isSending}
                    className="flex-grow px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-xs md:text-sm focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isSending}
                    className="px-5 py-3 rounded-xl glass-button-primary flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Send</span>
                    <FiSend />
                  </button>
                </form>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
