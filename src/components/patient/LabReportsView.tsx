import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  RefreshCw,
  Info,
  HelpCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../services/store';

export const LabReportsView: React.FC = () => {
  const { labOrders, activePatient, runAILabReportExplainer, playAudioChime, triggerConfetti } = useApp();

  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const myLabOrders = labOrders.filter(
    l => l.patientId === activePatient.id || l.patientName === activePatient.name
  );

  const activeLab = selectedLabId
    ? myLabOrders.find(l => l.id === selectedLabId) || myLabOrders[0]
    : myLabOrders[0];

  const handleExplainAI = async () => {
    if (!activeLab) return;
    setIsExplaining(true);
    playAudioChime('click');
    try {
      const expl = await runAILabReportExplainer(activeLab.testName, activeLab.parameters || []);
      setAiExplanation(expl);
      setIsExplaining(false);
      playAudioChime('success');
      triggerConfetti();
    } catch (err) {
      setIsExplaining(false);
    }
  };

  const handleDownloadPDF = (labId: string) => {
    playAudioChime('click');
    alert(`Verified Laboratory Report PDF for ${labId} downloaded.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Diagnostic Laboratory Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/30">
              Pathology & Molecular Lab
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified hematology, biochemistry, and pathology reports with Gemini AI plain-language interpretations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lab Tests List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnostic Tests ({myLabOrders.length})</h2>
          {myLabOrders.map(order => (
            <button
              key={order.id}
              onClick={() => {
                setSelectedLabId(order.id);
                setAiExplanation(null);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                activeLab?.id === order.id
                  ? 'bg-slate-900 border-teal-500 shadow-xl shadow-teal-950/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{order.testName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {order.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{order.facilityName}</div>
              <div className="text-[10px] text-teal-400 mt-2 flex items-center justify-between font-mono">
                <span>By {order.orderedByDoctorName}</span>
                <span>{new Date(order.createdAt || order.orderedAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Lab Report Details & AI Explainer (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeLab ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{activeLab.testName}</h3>
                  <div className="text-xs text-slate-400">{activeLab.facilityName} • Ordered by {activeLab.orderedByDoctorName}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExplainAI}
                    disabled={isExplaining}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
                  >
                    {isExplaining ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Explaining...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>AI Lab Explainer</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(activeLab.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Download Official Lab Report"
                  >
                    <Download className="w-4 h-4 text-teal-400" />
                  </button>
                </div>
              </div>

              {/* AI Explanation Box if Loaded */}
              {aiExplanation && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/50 to-indigo-950/50 border border-purple-500/40 space-y-4 shadow-xl animate-scale-in">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Gemini AI Plain-Language Interpretation</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {aiExplanation.plainLanguageSummary}
                  </p>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Smart Questions to Ask Your Doctor:</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {aiExplanation.suggestedQuestionsToDoctor?.map((q: string, idx: number) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[10px] text-slate-400 italic pt-2 border-t border-purple-900/40">
                    {aiExplanation.clinicalDisclaimer}
                  </div>
                </div>
              )}

              {/* Lab Parameters Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Parameter Readings & Biometrics</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Test Parameter</th>
                        <th className="p-3">Result Value</th>
                        <th className="p-3">Reference Range</th>
                        <th className="p-3">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {activeLab.parameters?.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/50">
                          <td className="p-3 font-semibold text-white">{p.parameterName}</td>
                          <td className="p-3 font-mono font-bold text-slate-200">{p.value} {p.unit}</td>
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{p.normalRange} {p.unit}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.flag === 'NORMAL' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                            }`}>
                              {p.flag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl">
              No lab report on file.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
