import React, { useState } from 'react';
import { useApp } from '../../services/store';
import { Language } from '../../types';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Volume2,
  CheckCircle2,
  Globe,
  Radio,
  ArrowRight
} from 'lucide-react';

interface SarvamVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIntakeCompleted?: () => void;
}

export const SarvamVoiceModal: React.FC<SarvamVoiceModalProps> = ({
  isOpen,
  onClose,
  onIntakeCompleted
}) => {
  const { runSarvamVoiceAI, selectedLanguage, setSelectedLanguage, playAudioChime, triggerConfetti } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedResult, setRecordedResult] = useState<{
    transcript: string;
    translatedEnglish: string;
    intake: any;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartVoiceIntake = async () => {
    setIsRecording(true);
    playAudioChime('click');

    // Simulate 2 seconds of Indian language speech listening
    setTimeout(async () => {
      setIsRecording(false);
      setIsProcessing(true);
      const res = await runSarvamVoiceAI(selectedLanguage);
      setRecordedResult(res);
      setIsProcessing(false);
      playAudioChime('success');
      triggerConfetti();
    }, 1800);
  };

  const handleApplyAndContinue = () => {
    if (onIntakeCompleted) {
      onIntakeCompleted();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Sarvam Indic Voice AI Intake
              </h2>
              <p className="text-xs text-slate-400">
                Speak in Hindi, Odia, Marathi, Telugu, Tamil, Bengali, or Kannada
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Language selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>Select Spoken Language:</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { code: 'hi' as Language, label: 'हिन्दी (Hindi)' },
                { code: 'or' as Language, label: 'ଓଡ଼ିଆ (Odia)' },
                { code: 'mr' as Language, label: 'मराठी (Marathi)' },
                { code: 'en' as Language, label: 'English' }
              ].map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    setSelectedLanguage(item.code);
                    playAudioChime('click');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    selectedLanguage === item.code
                      ? 'bg-teal-600 text-white border-teal-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Record Sphere */}
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={handleStartVoiceIntake}
              disabled={isRecording || isProcessing}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 transition transform active:scale-95 cursor-pointer shadow-2xl ${
                isRecording
                  ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-red-500/50'
                  : isProcessing
                  ? 'bg-amber-600 border-amber-400 text-white animate-bounce'
                  : 'bg-teal-600 hover:bg-teal-500 border-teal-400 text-white shadow-teal-500/40'
              }`}
            >
              {isRecording ? (
                <>
                  <Radio className="w-10 h-10 animate-ping" />
                  <span className="text-[10px] font-bold uppercase mt-1">Listening...</span>
                </>
              ) : isProcessing ? (
                <>
                  <Sparkles className="w-10 h-10 animate-spin" />
                  <span className="text-[10px] font-bold uppercase mt-1">Translating</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10" />
                  <span className="text-[10px] font-bold uppercase mt-1">Tap to Speak</span>
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center max-w-sm">
              {isRecording
                ? 'Speak clearly into your microphone about your symptoms...'
                : isProcessing
                ? 'Sarvam Indic AI translating speech to medical English...'
                : 'Click to start voice intake. Voice audio is processed locally and via Sarvam Indic Gateway.'}
            </p>
          </div>

          {/* Result Card */}
          {recordedResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-400">
                  Transcribed Audio ({selectedLanguage.toUpperCase()})
                </span>
                <p className="text-sm font-semibold text-white">
                  "{recordedResult.transcript}"
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-indigo-400">
                  Medical Translation (English)
                </span>
                <p className="text-xs text-slate-300 italic">
                  "{recordedResult.translatedEnglish}"
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  ✓ Structured Intake Generated
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  Fever + Body Weakness
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>

          {recordedResult && (
            <button
              onClick={handleApplyAndContinue}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition cursor-pointer"
            >
              <span>Apply Voice Intake & Proceed to Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
