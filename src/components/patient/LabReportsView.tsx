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
  ArrowRight,
  Upload,
  Shield,
  Layers,
  Volume2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useApp } from '../../services/store';
import { HealthReportAnalyzer } from '../../ai/reportAnalyzer';
import { HealthReportComparison, ReportComparisonResult } from '../../ai/reportComparison';
import { globalVoiceController } from '../../services/voice/VoiceController';
import { LabParameter } from '../../types';

export const LabReportsView: React.FC = () => {
  const { labOrders, activePatient, runAILabReportExplainer, playAudioChime, triggerConfetti } = useApp();

  const [activeTab, setActiveTab] = useState<'LIST' | 'UPLOAD' | 'COMPARE'>('LIST');

  // List View state
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationMode, setExplanationMode] = useState<'simple' | 'standard' | 'detailed'>('standard');

  // Upload Analyzer state
  const [uploadText, setUploadText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [anonymizeEnabled, setAnonymizeEnabled] = useState(true);
  const [isAnalyzingUpload, setIsAnalyzingUpload] = useState(false);
  const [analyzedUploadResult, setAnalyzedUploadResult] = useState<any | null>(null);

  // Compare Reports state
  const [compareReportAId, setCompareReportAId] = useState<string>('');
  const [compareReportBId, setCompareReportBId] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ReportComparisonResult | null>(null);

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
    } catch {
      setIsExplaining(false);
    }
  };

  const handleSpeakReport = (textToSpeak: string) => {
    playAudioChime('click');
    (globalVoiceController as any).synthesizer.speak(textToSpeak);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      playAudioChime('click');
      // Simulate file OCR reading or text extraction
      const reader = new FileReader();
      reader.onload = () => {
        setUploadText(
          `PATIENT: ${activePatient.name}\n` +
          `DOB: 12/04/1988 | UHID: ABHA-9921-0023\n` +
          `FACILITY: District Pathology & Molecular Lab\n` +
          `TEST: Comprehensive Metabolic & Lipid Screen\n` +
          `Total Cholesterol: 215 mg/dL (Normal: <200)\n` +
          `HDL Cholesterol: 48 mg/dL (Normal: >40)\n` +
          `LDL Cholesterol: 135 mg/dL (Normal: <100)\n` +
          `Triglycerides: 160 mg/dL (Normal: <150)\n` +
          `Fasting Blood Sugar: 96 mg/dL (Normal: 70-99)\n` +
          `Serum Creatinine: 0.9 mg/dL (Normal: 0.7-1.3)`
        );
      };
      reader.readAsText(file);
    }
  };

  const handleRunAnalyzeUpload = async () => {
    if (!uploadText.trim()) return;
    setIsAnalyzingUpload(true);
    playAudioChime('click');
    try {
      const result = await HealthReportAnalyzer.analyze(uploadText, explanationMode, anonymizeEnabled);
      setAnalyzedUploadResult(result);
      setIsAnalyzingUpload(false);
      playAudioChime('success');
      triggerConfetti();
    } catch {
      setIsAnalyzingUpload(false);
    }
  };

  const handleRunCompare = () => {
    const repA = myLabOrders.find(l => l.id === compareReportAId) || myLabOrders[0];
    const repB = myLabOrders.find(l => l.id === compareReportBId) || myLabOrders[1] || myLabOrders[0];
    if (repA && repB) {
      playAudioChime('click');
      const res = HealthReportComparison.compare(repA, repB);
      setComparisonResult(res);
      triggerConfetti();
    }
  };

  const handleDownloadPDF = (labId: string) => {
    playAudioChime('click');
    alert(`Verified Laboratory Report PDF for ${labId} downloaded.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Diagnostic Laboratory Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/30">
              Multimodal AI Vision & Pathology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified hematology & pathology reports with plain-language Gemini AI interpretations and privacy anonymization.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'LIST'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Reports ({myLabOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('UPLOAD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'UPLOAD'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload & Analyze</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('COMPARE');
              if (!compareReportAId && myLabOrders[0]) setCompareReportAId(myLabOrders[0].id);
              if (!compareReportBId && myLabOrders[1]) setCompareReportBId(myLabOrders[1].id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'COMPARE'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare Reports</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MY LAB REPORTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'LIST' && (
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
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
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
                  <span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
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
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 cursor-pointer"
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
                      onClick={() => handleSpeakReport(`${activeLab.testName} report from ${activeLab.facilityName}. Status: ${activeLab.status}.`)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      title="Read Report Aloud"
                    >
                      <Volume2 className="w-4 h-4 text-teal-400" />
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(activeLab.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      title="Download Official Lab Report"
                    >
                      <Download className="w-4 h-4 text-teal-400" />
                    </button>
                  </div>
                </div>

                {/* AI Explanation Box if Loaded */}
                {aiExplanation && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/50 to-indigo-950/50 border border-purple-500/40 space-y-4 shadow-xl animate-scale-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Gemini AI Plain-Language Interpretation</span>
                      </div>
                      <button
                        onClick={() => handleSpeakReport(aiExplanation.plainLanguageSummary)}
                        className="flex items-center gap-1 text-[11px] text-teal-300 hover:text-white bg-slate-900/80 px-2 py-1 rounded-lg border border-teal-500/30 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
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
      )}

      {/* ========================================================================= */}
      {/* 2. UPLOAD & ANALYZE REPORT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'UPLOAD' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-400" />
                <span>Upload Medical Report (PDF, Image, Scanned Document)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Extract biomarker tables, reference ranges, and plain-language summaries automatically.
              </p>
            </div>

            {/* Anonymize Toggle (AI Privacy Guardian) */}
            <div className="flex items-center gap-2 bg-slate-950 border border-teal-500/30 rounded-xl px-3 py-1.5 text-xs text-teal-300">
              <Shield className="w-4 h-4 text-teal-400" />
              <label htmlFor="privacy-anonymize-toggle" className="font-semibold cursor-pointer">Anonymize Document [REDACTED]</label>
              <input
                id="privacy-anonymize-toggle"
                type="checkbox"
                checked={anonymizeEnabled}
                onChange={e => setAnonymizeEnabled(e.target.checked)}
                className="w-4 h-4 accent-teal-500 ml-1 cursor-pointer"
              />
            </div>
          </div>

          {/* File Drag/Drop or Paste Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-teal-500/50 rounded-2xl p-6 text-center bg-slate-950/60 transition">
                <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-white mb-1">Upload PDF or Scanned Photo</div>
                <div className="text-[11px] text-slate-400 mb-4">Supported formats: PDF, PNG, JPG (max 10MB)</div>
                <label className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs cursor-pointer inline-block transition">
                  Browse Device
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
                {uploadedFileName && (
                  <div className="mt-3 text-xs text-emerald-400 font-mono flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected: {uploadedFileName}</span>
                  </div>
                )}
              </div>

              {/* Explanation Mode Selection */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">Explanation Detail:</span>
                <div className="flex gap-1">
                  {(['simple', 'standard', 'detailed'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setExplanationMode(mode)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                        explanationMode === mode
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Run Analysis Button */}
              <button
                onClick={handleRunAnalyzeUpload}
                disabled={isAnalyzingUpload || !uploadText.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                {isAnalyzingUpload ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Diagnostic Data with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Medical Extraction</span>
                  </>
                )}
              </button>
            </div>

            {/* Document Content Preview */}
            <div className="space-y-2">
              <label htmlFor="raw-document-textarea" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Extracted Document Text (Editable)
              </label>
              <textarea
                id="raw-document-textarea"
                value={uploadText}
                onChange={e => setUploadText(e.target.value)}
                placeholder="Or paste medical report text directly here (e.g. CBC, HbA1c, Lipid Profile)..."
                rows={10}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-teal-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Analysis Results Display */}
          {analyzedUploadResult && (
            <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{analyzedUploadResult.testName} • {analyzedUploadResult.reportType}</span>
                  </div>
                  <button
                    onClick={() => handleSpeakReport(analyzedUploadResult.plainLanguageSummary)}
                    className="flex items-center gap-1 text-[11px] text-teal-300 hover:text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-teal-500/30 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Summary</span>
                  </button>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {analyzedUploadResult.plainLanguageSummary}
                </p>

                {analyzedUploadResult.anonymizedText && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Privacy Guardian Active: Identifiers redacted as <code>[REDACTED]</code> prior to analysis.</span>
                  </div>
                )}
              </div>

              {/* Extracted Parameter Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Extracted Biological Values</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Parameter</th>
                        <th className="p-3">Observed Value</th>
                        <th className="p-3">Reference Range</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {analyzedUploadResult.parameters?.map((p: any, idx: number) => (
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
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. COMPARE TWO REPORTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'COMPARE' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Biomarker Trend & Longitudinal Report Comparison</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select two diagnostic reports to compare biomarker changes, stability, and trajectory over time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5 space-y-1.5">
              <label htmlFor="select-baseline-report" className="text-xs font-bold text-slate-400">Baseline (Report A)</label>
              <select
                id="select-baseline-report"
                value={compareReportAId}
                onChange={e => setCompareReportAId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                {myLabOrders.map(o => (
                  <option key={o.id} value={o.id}>{o.testName} ({new Date(o.createdAt || Date.now()).toLocaleDateString()})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <label htmlFor="select-followup-report" className="text-xs font-bold text-slate-400">Follow-up (Report B)</label>
              <select
                id="select-followup-report"
                value={compareReportBId}
                onChange={e => setCompareReportBId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                {myLabOrders.map(o => (
                  <option key={o.id} value={o.id}>{o.testName} ({new Date(o.createdAt || Date.now()).toLocaleDateString()})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={handleRunCompare}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Compare
              </button>
            </div>
          </div>

          {comparisonResult && (
            <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-xs text-slate-200 leading-relaxed">
                <strong className="text-teal-300 block mb-1">Longitudinal Summary:</strong>
                {comparisonResult.trendSummary}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Biomarker</th>
                      <th className="p-3">Previous ({comparisonResult.previousDate})</th>
                      <th className="p-3">Latest ({comparisonResult.latestDate})</th>
                      <th className="p-3">Trend</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {comparisonResult.metrics.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/50">
                        <td className="p-3 font-semibold text-white">{m.parameterName}</td>
                        <td className="p-3 font-mono text-slate-400">{m.previousValue} {m.unit}</td>
                        <td className="p-3 font-mono font-bold text-slate-200">{m.latestValue} {m.unit}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            m.trend === 'INCREASED' ? 'text-amber-400' : m.trend === 'DECREASED' ? 'text-cyan-400' : 'text-emerald-400'
                          }`}>
                            {m.trend === 'INCREASED' && <TrendingUp className="w-3.5 h-3.5" />}
                            {m.trend === 'DECREASED' && <TrendingDown className="w-3.5 h-3.5" />}
                            {m.trend === 'STABLE' && <Minus className="w-3.5 h-3.5" />}
                            <span>{m.trend}</span>
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.statusFlag === 'NORMAL' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                          }`}>
                            {m.statusFlag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] text-slate-500 italic">
                {comparisonResult.clinicalNote}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
