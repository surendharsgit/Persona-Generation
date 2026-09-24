import React from 'react';

const ReportTemplate = ({ insights, projectName }) => {
  if (!insights) return null;

  const reportData = insights.reportData || {};
  const personas = reportData.personas || [];
  const surveys = reportData.surveyResults || [];
  const interviews = reportData.interviewMemories || {};

  return (
    <div id="pdf-report-content" className="bg-white text-black p-10 font-sans" style={{ minHeight: '1056px', width: '816px' }}>
      
      {/* Page 1: Cover Page */}
      <div className="flex flex-col items-center justify-center min-h-[900px] border-b-2 border-gray-200">
        <h1 className="text-5xl font-extrabold mb-4 text-[#4F46E5]">Synthetic User Generation Platform</h1>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Research Report</h2>
        <div className="text-xl text-gray-600 mb-2">Project: {projectName || 'Synthetic Research Experiment'}</div>
        <div className="text-lg text-gray-500">Date: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="page-break" style={{ pageBreakBefore: 'always' }} />

      {/* Page 2: Executive Summary & Overview */}
      <div className="pt-8">
        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Experiment Overview</h2>
        
        {insights.stats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Personas</div>
              <div className="text-3xl font-black text-[#4F46E5]">{insights.stats.numPersonas}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Survey Responses</div>
              <div className="text-3xl font-black text-[#06B6D4]">{insights.stats.numSurveyResponses}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Interview Sessions</div>
              <div className="text-3xl font-black text-amber-500">{insights.stats.numInterviewSessions}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Interview Messages</div>
              <div className="text-3xl font-black text-emerald-500">{insights.stats.numInterviewMessages}</div>
            </div>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Executive Summary</h2>
        <p className="text-lg leading-relaxed text-gray-800 mb-10">{insights.executiveSummary}</p>

        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Product Validation</h2>
        <div className="flex items-center gap-8 mb-6">
          <div className="flex-shrink-0 flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
             <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Adoption Score</div>
             <div className="text-5xl font-black text-[#4F46E5]">{insights.overallAdoptionScore}/100</div>
          </div>
          <div className="w-full">
            <h3 className="font-bold text-xl mb-2">Reasoning</h3>
            <p className="text-gray-800 leading-relaxed mb-4">{insights.overallValidationReasoning || 'Based on aggregated persona responses and behaviors.'}</p>
            
            {insights.adoptionBreakdown && (
              <div className="grid grid-cols-5 gap-2 mt-4 text-center">
                <div className="bg-emerald-50 rounded p-2"><div className="font-bold text-emerald-600">{insights.adoptionBreakdown.definitelyYes}%</div><div className="text-[10px] uppercase">Def. Yes</div></div>
                <div className="bg-green-50 rounded p-2"><div className="font-bold text-green-600">{insights.adoptionBreakdown.probablyYes}%</div><div className="text-[10px] uppercase">Prob. Yes</div></div>
                <div className="bg-gray-100 rounded p-2"><div className="font-bold text-gray-600">{insights.adoptionBreakdown.unsure}%</div><div className="text-[10px] uppercase">Unsure</div></div>
                <div className="bg-orange-50 rounded p-2"><div className="font-bold text-orange-600">{insights.adoptionBreakdown.probablyNo}%</div><div className="text-[10px] uppercase">Prob. No</div></div>
                <div className="bg-rose-50 rounded p-2"><div className="font-bold text-rose-600">{insights.adoptionBreakdown.definitelyNo}%</div><div className="text-[10px] uppercase">Def. No</div></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-break" style={{ pageBreakBefore: 'always' }} />

      {/* Page 3: Persona Overview */}
      <div className="pt-8">
        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Persona Overview</h2>
        <div className="grid grid-cols-2 gap-6">
          {personas.map((p, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
              <h3 className="font-bold text-xl text-[#4F46E5] mb-1">{p.name}</h3>
              <div className="text-sm font-semibold text-gray-600 mb-3">{p.archetype}</div>
              <div className="mb-2">
                <strong className="text-xs uppercase text-gray-500">Goals:</strong>
                <ul className="list-disc pl-4 text-sm text-gray-800 mt-1">
                  {[].concat(p.goals || []).map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
              <div>
                <strong className="text-xs uppercase text-gray-500">Pain Points:</strong>
                <ul className="list-disc pl-4 text-sm text-gray-800 mt-1">
                  {[].concat(p.painPoints || []).map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-break" style={{ pageBreakBefore: 'always' }} />

      {/* Page 4: Survey & Interview Results Summary */}
      <div className="pt-8">
        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Survey Results</h2>
        <div className="space-y-6 mb-10">
          {surveys.length > 0 ? surveys.map((s, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{s.personaName}</h3>
              <div className="space-y-2">
                {s.answers?.map((ans, i) => (
                  <div key={i} className="text-sm border-l-2 border-gray-300 pl-3">
                    <strong className="block text-gray-600 text-xs">{ans.question}</strong>
                    <span className="text-gray-900">{ans.answer}</span>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <p className="text-gray-500 italic">No survey data available.</p>
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Interview Results</h2>
        <div className="space-y-6 mb-10">
          {Object.entries(interviews).length > 0 ? Object.entries(interviews).map(([id, mem], idx) => {
            const p = personas.find(x => x.id === id);
            const msgs = mem.history?.filter(m => m.role === 'model') || [];
            return (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{p?.name || 'Unknown Persona'}</h3>
                <p className="text-sm text-gray-600 mb-2">Total messages: {mem.history?.length || 0}</p>
                {msgs.slice(0, 2).map((m, i) => (
                  <div key={i} className="text-sm italic text-gray-700 bg-gray-50 p-2 rounded mb-1">
                    "{m.parts[0].text.substring(0, 150)}..."
                  </div>
                ))}
              </div>
            )
          }) : (
            <p className="text-gray-500 italic">No interview data available.</p>
          )}
        </div>
      </div>

      <div className="page-break" style={{ pageBreakBefore: 'always' }} />

      {/* Page 5: Insight Extraction */}
      <div className="pt-8">
        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Insight Extraction: Top Themes</h2>
        <div className="space-y-6 mb-10">
          {insights.themes?.map((theme, idx) => (
            <div key={idx} className="p-5 border border-gray-200 rounded-xl bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-[#4F46E5]">{theme.name}</h3>
                <span className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-700 rounded-full">Freq: {theme.frequency} | Conf: {theme.confidence || 'Medium'}</span>
              </div>
              <p className="text-gray-700 italic mb-3">"{theme.evidence}"</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <strong className="text-gray-800">Segments:</strong>
                {[].concat(theme.affectedSegments || []).join(', ')}
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Sentiment Breakdown</h2>
        {insights.sentiment && (
          <div className="grid grid-cols-4 gap-4 mb-10 text-center">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-3xl font-black text-emerald-600">{insights.sentiment.positive}%</div>
              <div className="text-xs font-bold text-emerald-800 uppercase mt-1">Positive</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-3xl font-black text-gray-600">{insights.sentiment.neutral}%</div>
              <div className="text-xs font-bold text-gray-800 uppercase mt-1">Neutral</div>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="text-3xl font-black text-rose-600">{insights.sentiment.negative}%</div>
              <div className="text-xs font-bold text-rose-800 uppercase mt-1">Negative</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-3xl font-black text-amber-600">{insights.sentiment.mixed}%</div>
              <div className="text-xs font-bold text-amber-800 uppercase mt-1">Mixed</div>
            </div>
          </div>
        )}
      </div>

      <div className="page-break" style={{ pageBreakBefore: 'always' }} />

      {/* Page 6: Agreements, Disagreements, Behaviors */}
      <div className="pt-8">
        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Agreement Patterns</h2>
        <div className="space-y-4 mb-10">
          {insights.agreements?.map((agr, idx) => (
            <div key={idx} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-black text-emerald-500 w-16">{agr.percentage}%</div>
              <div>
                <div className="font-bold text-gray-900">{agr.pattern}</div>
                <div className="text-sm text-gray-600 mt-1">Evidence: {agr.evidence}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Contrasting Opinions</h2>
        <div className="space-y-4 mb-10">
          {insights.disagreements?.map((dis, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="font-bold text-gray-900 mb-2">{dis.pattern}</div>
              <div className="flex gap-2 mb-2">
                 {[].concat(dis.groups || []).map((g, i) => (
                   <span key={i} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded">{g}</span>
                 ))}
              </div>
              <div className="text-sm text-gray-600">Evidence: {dis.evidence}</div>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Behavioral Trends</h2>
        <div className="space-y-4 mb-10">
          {insights.behavioralTrends?.map((bt, idx) => (
            <div key={idx} className="p-4 border-l-4 border-blue-500 bg-gray-50">
              <div className="font-bold text-gray-900 mb-1">{bt.trend}</div>
              <div className="text-sm text-gray-600">Evidence: {bt.evidence}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="page-break" style={{ pageBreakBefore: 'always' }} />
      
      {/* Page 7: Persona-Level Validation */}
      <div className="pt-8">
        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Persona-Level Validation</h2>
        <div className="space-y-6">
          {insights.personaScoring?.map((score, idx) => (
            <div key={idx} className="p-5 border border-gray-200 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{score.personaName}</h3>
                  <div className={`font-bold text-sm mt-1 ${
                    (score.wouldUse || '').includes('Yes') ? 'text-emerald-600' :
                    (score.wouldUse || '').includes('No') ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {score.wouldUse || 'Unknown'}
                  </div>
                </div>
                <div className="text-3xl font-black text-[#4F46E5]">{score.score}/100</div>
              </div>
              <p className="text-gray-800 text-sm mb-3"><strong>Reasoning:</strong> {score.reasoning}</p>
              <p className="text-gray-600 text-sm italic"><strong>Evidence:</strong> {score.evidence}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="page-break" style={{ pageBreakBefore: 'always' }} />

      {/* Page 8: Key Insights & Recommendations */}
      <div className="pt-8">
        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Key Insights</h2>
        <div className="space-y-6 mb-10">
          {insights.keyInsights?.map((ki, idx) => (
            <div key={idx} className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-blue-900">Insight {idx + 1}: {ki.insight}</h3>
                <span className="text-xs font-bold px-2 py-1 bg-white text-blue-800 rounded">Conf: {ki.confidence}</span>
              </div>
              <p className="text-blue-800 text-sm"><strong>Evidence:</strong> {ki.evidence}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Product Recommendations</h2>
        <ul className="list-disc pl-6 space-y-3 mb-10">
          {[].concat(insights.productRecommendations || []).map((rec, idx) => (
            <li key={idx} className="text-gray-800 text-lg">{rec}</li>
          ))}
        </ul>

        <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-6">Final Summary</h2>
        {insights.finalSummary && (
          <div className="space-y-4 text-gray-800">
            <p><strong>What Users Liked:</strong> {insights.finalSummary.liked}</p>
            <p><strong>What Users Disliked:</strong> {insights.finalSummary.disliked}</p>
            <p><strong>Main Adoption Barriers:</strong> {insights.finalSummary.adoptionBarriers}</p>
            <p><strong>Main Product Opportunities:</strong> {insights.finalSummary.opportunities}</p>
            <div className="mt-6 p-6 bg-gray-50 border-l-4 border-[#4F46E5] rounded">
              <strong className="block text-lg mb-2">Overall Validation Result:</strong>
              <p className="text-gray-900">{insights.finalSummary.conclusion}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ReportTemplate;
