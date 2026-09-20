import React, { useState } from 'react';
import {
  Stethoscope,
  Sparkles,
  Mic,
  MicOff,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  Upload,
  Globe,
  RefreshCw,
  Info,
  Activity,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Language, StructuredIntakeData, TriageUrgency } from '../../types';

interface AIHealthIntakeViewProps {
  onProceedToBooking: (department?: string, urgency?: TriageUrgency) => void;
  onProceedToMedRoute?: (department: string) => void;
  onViewFacilities?: () => void;
}

const COMMON_SYMPTOM_TAGS = [
  'High Fever with Chills',
  'Dry Persistent Cough',
  'Shortness of Breath',
  'Severe Headache',
  'Chest Tightness',
  'Abdominal Cramps & Nausea',
  'Skin Rash / Redness',
  'Joint Pain & Fatigue',
  'Sore Throat',
  'Dizziness on Standing'
];

export const AIHealthIntakeView: React.FC<AIHealthIntakeViewProps> = ({
  onProceedToBooking,
  onProceedToMedRoute,
  onViewFacilities
}) => {
  const {
    runAIIntake,
    runSarvamVoiceAI,
    selectedLanguage,
    setSelectedLanguage,
    activePatient,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState('3');
  const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE'>('MODERATE');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [intakeResult, setIntakeResult] = useState<StructuredIntakeData | null>(null);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleVoiceInput = async () => {
    setIsRecording(true);
    playAudioChime('click');
    try {
      const { transcript, translatedEnglish } = await runSarvamVoiceAI(selectedLanguage);
      setInputText(prev => (prev ? `${prev}. ${translatedEnglish}` : translatedEnglish));
      setIsRecording(false);
      playAudioChime('success');
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const combinedPrompt = [
      inputText,
      selectedTags.length > 0 ? `Selected symptoms: ${selectedTags.join(', ')}` : '',
      `Duration: ${durationDays} days`,
      `Reported Severity: ${severity}`
    ]
      .filter(Boolean)
      .join('. ');

    if (!combinedPrompt.trim()) return;

    setIsLoading(true);
    playAudioChime('click');
    try {
      const result = await runAIIntake(combinedPrompt, selectedLanguage);
      setIntakeResult(result);
      setIsLoading(false);
      playAudioChime('success');
      triggerConfetti();
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold font-display text-white">AI Health Intake & Smart Triage</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                  Gemini Clinical AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Describe your symptoms in your native language or choose preset symptoms for intelligent care routing.
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <Globe className="w-4 h-4 text-teal-400 ml-2" />
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as Language)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none pr-3 py-1 cursor-pointer"
            >
              <option value="en" className="bg-slate-900">English (EN)</option>
              <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
              <option value="mr" className="bg-slate-900">मराठी (Marathi)</option>
              <option value="or" className="bg-slate-900">ଓଡ଼ିଆ (Odia)</option>
              <option value="bn" className="bg-slate-900">বাংলা (Bengali)</option>
              <option value="te" className="bg-slate-900">తెలుగు (Telugu)</option>
              <option value="ta" className="bg-slate-900">தமிழ் (Tamil)</option>
              <option value="kn" className="bg-slate-900">ಕನ್ನಡ (Kannada)</option>
              <option value="gu" className="bg-slate-900">ગુજરાતી (Gujarati)</option>
              <option value="pa" className="bg-slate-900">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleAnalyze} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            {/* Symptom Tag Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Select Symptoms</span>
                <span className="text-[10px] text-teal-400 lowercase">{selectedTags.length} selected</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOM_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Freeform / Voice Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Describe How You Feel
                </label>
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isRecording}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    isRecording
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                      : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{isRecording ? 'Listening in Native Language...' : 'Sarvam Indic Voice'}</span>
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                rows={4}
                placeholder="E.g., I have had a high fever for 3 days with intense headache, dry cough, and weakness. I am also experiencing slight breathlessness on exertion..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Duration & Severity Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  How many days has this lasted?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={durationDays}
                    onChange={e => setDurationDays(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold font-mono focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-xs text-slate-400">Days</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MILD', 'MODERATE', 'SEVERE'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        severity === lvl
                          ? lvl === 'SEVERE'
                            ? 'bg-red-500 text-white'
                            : lvl === 'MODERATE'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Attachment preview / simulation */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  Optional: Attach photo or clinical note
                </span>
                <label className="cursor-pointer px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
                  <span>{attachedFile ? 'Change File' : 'Upload Image/Doc'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachedFile(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>
              {attachedFile && (
                <div className="mt-2 text-xs font-mono text-teal-300 bg-slate-950 p-2 rounded-xl border border-teal-500/20 flex items-center justify-between">
                  <span>📎 {attachedFile}</span>
                  <button onClick={() => setAttachedFile(null)} className="text-rose-400 text-xs">Remove</button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && selectedTags.length === 0)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-teal-900/40 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Clinical Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Health Triage Analysis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Assessment (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {intakeResult ? (
            <div className="bg-slate-900/90 border border-teal-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Clinical Assessment</span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    intakeResult.triageUrgency === 'EMERGENCY'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : intakeResult.triageUrgency === 'URGENT'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  Urgency: {intakeResult.triageUrgency}
                </span>
              </div>

              {/* Chief Complaint */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Chief Complaint</div>
                <div className="text-white font-bold text-sm">{intakeResult.chiefComplaint}</div>
                <div className="text-xs text-teal-300 mt-1">Duration: {intakeResult.duration} • Severity: {intakeResult.severity}</div>
              </div>

              {/* Red-flag Alerts */}
              {((intakeResult.redFlagDetails && intakeResult.redFlagDetails.length > 0) || ((intakeResult as any).redFlags && (intakeResult as any).redFlags.length > 0)) && (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Red-Flag Warning Symptoms Detected:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-red-100/90 text-[11px]">
                    {(intakeResult.redFlagDetails || (intakeResult as any).redFlags || []).map((flag: string, idx: number) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Department */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Recommended Specialty</div>
                <div className="text-base font-bold text-teal-300">{intakeResult.recommendedDepartment || 'General Medicine'}</div>
                <div className="text-xs text-slate-300">{(intakeResult as any).reasoning || intakeResult.chiefComplaint}</div>
              </div>

              {/* Next Steps Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onProceedToBooking(intakeResult.recommendedDepartment || 'General Medicine', (intakeResult.triageUrgency || 'SAME_DAY') as TriageUrgency)}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-900/30"
                >
                  <Clock className="w-4 h-4" />
                  <span>Book OPD with {intakeResult.recommendedDepartment || 'General Medicine'}</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>

                <button
                  onClick={() => {
                    if (onProceedToMedRoute) {
                      onProceedToMedRoute(intakeResult.recommendedDepartment || 'General Medicine');
                    } else if (onViewFacilities) {
                      onViewFacilities();
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-900/30"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Find Least-Crowded Hospital (MedRoute)</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>
              </div>

              {/* Clinical Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical Notice:</strong> This preliminary assessment is generated using clinical heuristics and AI. It is intended to guide you to the right department and is not a substitute for formal diagnosis by a registered medical practitioner.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-white">Awaiting Symptom Input</div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Fill in your symptoms on the left to see instant triage urgency, specialty recommendation, and automated hospital routing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
