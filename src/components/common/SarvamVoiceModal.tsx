import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../services/store';
import { Language } from '../../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../../i18n/translations';
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
  const t = getTranslation(selectedLanguage);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [recordedResult, setRecordedResult] = useState<{
    transcript: string;
    translatedEnglish: string;
    intake: any;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      // Cleanup recognition on unmount
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const SPEECH_LANG_MAP: Record<string, string> = {
    en: 'en-IN', hi: 'hi-IN', or: 'or-IN', mr: 'mr-IN',
    bn: 'bn-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN',
    gu: 'gu-IN', pa: 'pa-IN', ml: 'ml-IN'
  };

  // Keep a ref to latest liveTranscript so recognition.onend closure can read it
  const liveTranscriptRef = useRef('');
  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
  }, [liveTranscript]);

  if (!isOpen) return null;

  const handleStartVoiceIntake = async () => {
    if (isRecording || isProcessing) return;
    playAudioChime('click');
    setMicError(null);
    setLiveTranscript('');
    setRecordedResult(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setLiveTranscript(final || interim);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicError('Microphone access was denied. Please allow microphone permissions and try again.');
      } else if (event.error === 'no-speech') {
        setMicError('No speech detected. Please speak clearly and try again.');
      } else {
        setMicError(`Speech recognition error: ${event.error}. Please try again.`);
      }
    };

    recognition.onend = async () => {
      setIsRecording(false);
      const capturedTranscript = liveTranscriptRef.current;
      if (!capturedTranscript.trim()) {
        if (!micError) setMicError('No speech was captured. Please try again and speak clearly.');
        return;
      }
      setIsProcessing(true);
      try {
        const res = await runSarvamVoiceAI(selectedLanguage);
        // Merge the real transcript into the result
        setRecordedResult({
          ...res,
          transcript: capturedTranscript
        });
      } catch (err) {
        setMicError('Failed to process voice intake. Please try again.');
      }
      setIsProcessing(false);
      playAudioChime('success');
      triggerConfetti();
    };

    try {
      recognition.start();
    } catch (err) {
      setMicError('Failed to start microphone. Please check your browser permissions.');
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
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
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>{t.selectLanguage || 'Select Spoken Language'}:</span>
              </span>
              <span className="text-[10px] text-slate-400">{SUPPORTED_LANGUAGES.length} Indian Languages</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    setSelectedLanguage(item.code);
                    playAudioChime('click');
                  }}
                  className={`p-2 rounded-xl border text-center font-bold text-xs transition cursor-pointer flex items-center justify-between gap-1.5 ${
                    selectedLanguage === item.code
                      ? 'bg-teal-600 text-white border-teal-400 shadow-md shadow-teal-900/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">{item.nativeName}</span>
                  <span className="text-[10px] font-mono text-teal-300/80 uppercase shrink-0">{item.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Record Sphere */}
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={isRecording ? handleStopRecording : handleStartVoiceIntake}
              disabled={isProcessing}
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
                  <span className="text-[10px] font-bold uppercase mt-1">Tap to Stop</span>
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

            {/* Live transcript ticker */}
            {liveTranscript && (
              <div className="bg-slate-950 border border-teal-500/30 rounded-xl px-4 py-2 text-xs text-teal-300 max-w-sm text-center animate-pulse">
                🎙️ &quot;{liveTranscript}&quot;
              </div>
            )}

            {/* Mic error message */}
            {micError && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl px-4 py-2 text-xs text-rose-300 max-w-sm text-center">
                ⚠️ {micError}
              </div>
            )}

            <p className="text-xs text-slate-400 text-center max-w-sm">
              {isRecording
                ? 'Speak clearly about your symptoms. Tap again to stop.'
                : isProcessing
                ? 'Sarvam Indic AI structuring your intake...'
                : 'Tap to start voice intake. Your mic captures live speech in your selected language.'}
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
