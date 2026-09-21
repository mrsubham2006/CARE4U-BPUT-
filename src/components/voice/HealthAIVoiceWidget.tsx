import React, { useEffect } from 'react';
import {
  Mic,
  Sparkles,
  Check,
  Volume2,
  AlertTriangle,
  Radio,
  VolumeX,
  HelpCircle,
  Settings,
  X
} from 'lucide-react';
import { useVoice } from '../../services/voice/VoiceContext';
import { VoiceWaveform } from './VoiceWaveform';

export const HealthAIVoiceWidget: React.FC = () => {
  const {
    isSupported,
    voiceState,
    transcript,
    feedbackNotice,
    settings,
    isMuted,
    waveformData,
    toggleListening,
    toggleContinuous,
    toggleMute,
    setIsHelpOpen,
    setIsSettingsOpen
  } = useVoice();

  // Keyboard shortcut: Alt + V to toggle voice mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  if (!isSupported) {
    return (
      <div
        role="complementary"
        aria-label="HealthAI Voice Support Notice"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-400 shadow-xl max-w-sm text-center"
      >
        Voice control isn't supported by this browser. You can continue using HealthAI normally.
      </div>
    );
  }

  const isListening = voiceState === 'LISTENING';
  const isUnderstanding = voiceState === 'UNDERSTANDING';
  const isExecuting = voiceState === 'EXECUTING';
  const isSpeaking = voiceState === 'SPEAKING';
  const isError = voiceState === 'ERROR';

  return (
    <aside
      id="healthai-voice-hud"
      aria-label="HealthAI Voice Assistant HUD"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none max-w-[95vw] sm:max-w-xl w-full"
    >
      {/* Toast Notice / Feedback */}
      {feedbackNotice && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto mb-2 px-4 py-2 rounded-2xl bg-slate-900/95 border border-teal-500/50 shadow-2xl backdrop-blur-xl text-xs font-semibold text-teal-200 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Check className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Main HealthAI Floating Dock Card */}
      <div className="pointer-events-auto w-full bg-slate-950/95 backdrop-blur-2xl border border-teal-500/40 hover:border-teal-400/60 rounded-3xl shadow-2xl shadow-teal-950/80 p-2 sm:p-2.5 transition-all">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Global 🎙️ HealthAI Voice Button */}
          <div className="flex items-center gap-2">
            <button
              id="healthai-voice-btn"
              onClick={toggleListening}
              aria-label={isListening ? 'Stop HealthAI Voice listening' : 'Start HealthAI Voice assistant'}
              aria-pressed={isListening}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                isListening
                  ? 'bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 text-white shadow-red-600/40 animate-pulse ring-4 ring-red-500/30'
                  : 'bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 text-slate-950 shadow-teal-500/30 hover:scale-105'
              }`}
              title={isListening ? 'Stop listening (Alt + V)' : 'HealthAI Voice (Alt + V)'}
            >
              {isListening ? (
                <Mic className="w-5 h-5 animate-pulse text-white font-bold" />
              ) : isUnderstanding ? (
                <Sparkles className="w-5 h-5 text-slate-950 animate-spin" />
              ) : isSpeaking ? (
                <Volume2 className="w-5 h-5 text-slate-950 animate-bounce" />
              ) : (
                <Mic className="w-5 h-5 font-bold text-slate-950" />
              )}
              {settings.continuousListening && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-slate-950 animate-ping" />
              )}
            </button>

            {/* Label based on Voice State */}
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight">HealthAI Voice</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                    isListening
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                      : isUnderstanding
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                      : isExecuting
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isSpeaking
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                      : isError
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {isListening
                    ? 'Listening...'
                    : isUnderstanding
                    ? 'Understanding...'
                    : isExecuting
                    ? 'Executing'
                    : isSpeaking
                    ? 'Speaking...'
                    : isError
                    ? 'Error'
                    : 'Ready'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {settings.language.toUpperCase()} • Alt+V
              </span>
            </div>
          </div>

          {/* Center: Live Transcript, Waveform, or State Label */}
          <div className="flex-1 min-w-0 px-2 text-center flex flex-col items-center justify-center">
            {transcript ? (
              <div className="bg-slate-900/90 border border-teal-500/40 rounded-xl px-2.5 py-1 text-xs font-medium text-teal-300 truncate max-w-full flex items-center justify-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">"{transcript}"</span>
              </div>
            ) : isListening ? (
              <div className="flex flex-col items-center justify-center">
                <VoiceWaveform data={waveformData} isActive={true} />
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Listening... speak naturally
                </span>
              </div>
            ) : isUnderstanding ? (
              <div className="flex items-center gap-1.5 text-xs text-purple-300">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Understanding your health command...</span>
              </div>
            ) : isSpeaking ? (
              <div className="flex items-center gap-1.5 text-xs text-cyan-300">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>HealthAI is speaking...</span>
              </div>
            ) : isError ? (
              <div className="text-[11px] text-rose-300 truncate">
                ⚠️ I didn't understand that. Try: "Show my appointments"
              </div>
            ) : (
              <button
                onClick={() => setIsHelpOpen(true)}
                className="text-[11px] text-slate-400 hover:text-teal-300 transition truncate max-w-full cursor-pointer flex items-center justify-center gap-1 mx-auto"
                title="View Voice Commands"
              >
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span className="hidden md:inline">Try:</span>
                <span className="italic truncate text-slate-300">"Find a cardiologist"</span>
              </button>
            )}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Hands-free Toggle */}
            <button
              id="voice-continuous-toggle"
              onClick={toggleContinuous}
              aria-label="Toggle hands-free continuous listening"
              className={`p-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                settings.continuousListening
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-800'
              }`}
              title={settings.continuousListening ? 'Hands-Free Mode: ON' : 'Turn on Hands-Free Mode'}
            >
              <Radio className={`w-3.5 h-3.5 ${settings.continuousListening ? 'text-amber-400 animate-spin' : ''}`} />
              <span className="hidden xl:inline text-[10px] font-mono">
                {settings.continuousListening ? 'HANDS-FREE' : 'AUTO'}
              </span>
            </button>

            {/* Mute TTS Toggle */}
            <button
              id="voice-mute-toggle"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute voice responses' : 'Mute voice responses'}
              className={`p-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-800'
              }`}
              title={isMuted ? 'Unmute Voice Responses' : 'Mute Voice Responses'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
            </button>

            {/* Help ("What can I say?") */}
            <button
              id="voice-help-toggle"
              onClick={() => setIsHelpOpen(true)}
              aria-label="View voice commands help"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              title="What can I say?"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden lg:inline text-[11px]">Help</span>
            </button>

            {/* Voice Settings */}
            <button
              id="voice-settings-toggle"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="HealthAI Voice Settings"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition cursor-pointer"
              title="Voice Settings"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
