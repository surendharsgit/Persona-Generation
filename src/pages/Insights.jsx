import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiTarget, FiMessageCircle, FiActivity, FiCpu, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import html2pdf from 'html2pdf.js';
import ReportTemplate from '../components/ReportTemplate';

export default function Insights() {
  const { personas } = useApp();
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await api.get('/api/insights');
      if (res && res.insights) {
        setInsights(res.insights);
      }
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    }
  };

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/insights/generate', { personas, experimentContext: "General product testing" });
      if (res && res.insights) {
        setInsights(res.insights);
      }
    } catch (err) {
      console.error("Failed to generate insights:", err);
      setError("Failed to generate insights. Ensure you have run surveys and interviews first, and the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!insights) return;
    setIsGeneratingPDF(true);
    setError(null);
    
    try {
      const element = document.getElementById('pdf-report-container');
      const containerWrapper = element.parentElement;
      
      // Temporarily make it visible so html2canvas can read dimensions and styles
      containerWrapper.classList.remove('opacity-0', 'top-[-9999px]', 'left-[-9999px]', 'pointer-events-none');
      containerWrapper.classList.add('opacity-100', 'top-0', 'left-0', 'z-0');

      // Sanitize experiment name for filename
      const expName = 'General_Product_Testing'.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const pdfFilename = `synthetic-user-research-report-${expName}.pdf`;

      const opt = {
        margin: 0,
        filename: pdfFilename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Unable to generate the research report. Please try again.");
    } finally {
      const element = document.getElementById('pdf-report-container');
      if (element) {
        const containerWrapper = element.parentElement;
        containerWrapper.classList.add('opacity-0', 'top-[-9999px]', 'left-[-9999px]', 'pointer-events-none');
        containerWrapper.classList.remove('opacity-100', 'top-0', 'left-0', 'z-0');
      }
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] p-8 overflow-y-auto bg-blue-50 dark:bg-transparent transition-colors duration-300 flex flex-col items-center">
      {/* Background Gradients */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#8B5CF6]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#06B6D4]/10 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-7xl z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Insight Extraction
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl">
              AI-powered analysis of all generated personas, survey responses, and interview transcripts to extract evidence-grounded product adoption metrics.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {insights && (
              <button 
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className="glass-button-secondary px-6 py-3 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-50"
              >
                {isGeneratingPDF ? <span className="animate-spin text-xl">↻</span> : <FiDownload className="text-xl" />}
                {isGeneratingPDF ? "Generating Report..." : "Download Research Report"}
              </button>
            )}
            <button 
              onClick={generateInsights}
              disabled={isLoading || personas.length === 0}
              className="glass-button-primary px-6 py-3 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-50"
            >
              {isLoading ? <span className="animate-spin text-xl">↻</span> : <FiCpu className="text-xl" />}
              {isLoading ? "Analyzing Data..." : "Generate New Insights"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
            <FiAlertTriangle className="text-xl flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!insights && !isLoading && (
          <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20 mb-6">
              <FiBarChart2 className="text-4xl text-[#8B5CF6]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Insights Found</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
              Run surveys and interview your personas, then click "Generate New Insights" to compile a comprehensive UX research report.
            </p>
          </div>
        )}

        {insights && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
          >
            
            {/* Experiment Overview Stats */}
            {insights.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Personas</div>
                  <div className="text-4xl font-black text-[#8B5CF6]">{insights.stats.numPersonas}</div>
                </div>
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Survey Resp.</div>
                  <div className="text-4xl font-black text-[#06B6D4]">{insights.stats.numSurveyResponses}</div>
                </div>
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Interviews</div>
                  <div className="text-4xl font-black text-amber-500">{insights.stats.numInterviewSessions}</div>
                </div>
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Messages</div>
                  <div className="text-4xl font-black text-emerald-500">{insights.stats.numInterviewMessages}</div>
                </div>
              </div>
            )}

            {/* Executive Summary */}
            <div className="glass-card p-6 md:p-8 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] flex items-center gap-2 mb-4">
                <FiTarget /> Executive Summary
              </h3>
              <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                {insights.executiveSummary}
              </p>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Adoption Score */}
              <div className="glass-card p-6 md:p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-[#06B6D4]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">Overall Adoption Score</h3>
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-[#06B6D4] mb-2">
                  {insights.overallAdoptionScore}
                  <span className="text-2xl text-gray-400 ml-1">/100</span>
                </div>
                {insights.overallValidationReasoning && (
                   <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 px-4 italic leading-relaxed">
                     "{insights.overallValidationReasoning}"
                   </p>
                )}
                <div className="w-full h-2 bg-black/10 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-[#06B6D4] rounded-full"
                    style={{ width: `${insights.overallAdoptionScore}%` }}
                  />
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="glass-card p-6 rounded-3xl md:col-span-2">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-2 mb-6">
                  <FiPieChart /> Sentiment Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
                  {[
                    { label: "Positive", value: insights.sentiment?.positive || 0, color: "bg-emerald-500", text: "text-emerald-500" },
                    { label: "Neutral", value: insights.sentiment?.neutral || 0, color: "bg-blue-400", text: "text-blue-400" },
                    { label: "Negative", value: insights.sentiment?.negative || 0, color: "bg-rose-500", text: "text-rose-500" },
                    { label: "Mixed", value: insights.sentiment?.mixed || 0, color: "bg-amber-500", text: "text-amber-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col justify-center bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                      <div className="text-2xl font-bold mb-1 flex items-baseline gap-1">
                        <span className={stat.text}>{stat.value}%</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {stat.label}
                      </div>
                      <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                        <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Themes and Behaviors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-3xl flex flex-col gap-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <FiActivity /> Top Recurring Themes
                </h3>
                <div className="space-y-4">
                  {insights.themes?.map((theme, idx) => (
                    <div key={idx} className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{theme.name}</h4>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          theme.frequency === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                          theme.frequency === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {theme.frequency}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-3">"{theme.evidence}"</p>
                      <div className="flex flex-wrap gap-1">
                        {[].concat(theme.affectedSegments || []).map((seg, i) => (
                          <span key={i} className="text-[9px] bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-gray-600 dark:text-gray-300">
                            {seg}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl flex flex-col gap-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] flex items-center gap-2">
                  <FiTrendingUp /> Behavioral Trends & Agreements
                </h3>
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-black/10 dark:border-white/10 pb-2">Agreements</h4>
                  {insights.agreements?.map((agr, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="text-[#06B6D4] font-bold text-sm mt-0.5">{agr.percentage}%</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{agr.pattern}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Evidence: {agr.evidence}</p>
                      </div>
                    </div>
                  ))}

                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-black/10 dark:border-white/10 pb-2 pt-4">Disagreements</h4>
                  {insights.disagreements?.map((dis, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="text-rose-400 mt-0.5"><FiMessageCircle /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{dis.pattern}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {[].concat(dis.groups || []).map((g, i) => (
                            <span key={i} className="text-[9px] text-rose-500 border border-rose-500/20 bg-rose-500/5 px-1.5 py-0.5 rounded">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Persona Quotes */}
            {insights.personaQuotes && insights.personaQuotes.length > 0 && (
               <div className="glass-card p-6 md:p-8 rounded-3xl">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-2 mb-6">
                   <FiMessageCircle /> Representative Quotes
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {insights.personaQuotes.map((quote, idx) => (
                     <div key={idx} className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border-l-4 border-[#06B6D4]">
                       <p className="text-sm font-medium text-gray-800 dark:text-gray-200 italic mb-4">"{quote.quote}"</p>
                       <div className="flex flex-col gap-1">
                         <span className="text-xs font-bold text-gray-900 dark:text-white">{quote.personaName}</span>
                         <span className="text-[10px] text-gray-500">{quote.personaRole} &mdash; <span className="text-[#8B5CF6] font-semibold">{quote.relatedTheme}</span></span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {/* Per Persona Scoring */}
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2 mb-6">
                <FiTarget /> "Would Use This Product" - Persona Reasoning
              </h3>
              
              {/* Segment Scoring Aggregates */}
              {insights.segmentScoring && insights.segmentScoring.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-4">
                  {insights.segmentScoring.map((seg, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{seg.segmentName}</span>
                      <span className="text-lg font-black text-[#4F46E5]">{seg.score}/100</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.personaScoring?.map((score, idx) => (
                  <div key={idx} className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-black/5 dark:border-white/5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">{score.personaName}</h4>
                        <span className={`text-xs font-bold mt-1 inline-block ${
                          (score.wouldUse || '').includes('Yes') ? 'text-emerald-500' :
                          (score.wouldUse || '').includes('No') ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          {score.wouldUse || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-[#06B6D4]">
                        {score.score}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-4 flex-grow">
                      {score.reasoning}
                    </p>
                    <div className="text-[10px] text-gray-500 border-t border-black/10 dark:border-white/10 pt-3">
                      <strong>Evidence:</strong> {score.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </div>

      {/* Hidden PDF Container */}
      <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
        <div id="pdf-report-container">
          <ReportTemplate insights={insights} projectName="Synthetic User Generation Platform" />
        </div>
      </div>
    </div>
  );
}
