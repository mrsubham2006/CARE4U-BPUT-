import React from 'react';
import { Settings, X, Volume2, Globe, Shield, Gauge, Check } from 'lucide-react';
import { useVoice } from '../../services/voice/VoiceContext';
import { SUPPORTED_LANGUAGES } from '../../i18n/translations';
import { Language } from '../../types';

export const VoiceSettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings } = useVoice();

  if (!isSettingsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 id="settings-modal-title" className="text-base font-bold text-white">
                HealthAI Voice Assistant Settings
              </h3>
              <p className="text-xs text-slate-400">Configure speech rate, feedback & privacy</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-300">
          {/* 1. Voice Assistant ON / OFF */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="voice-assistant-toggle" className="font-bold text-white block">Voice Assistant</label>
              <span className="text-xs text-slate-400">Enable voice recognition and spoken navigation</span>
            </div>
            <input
              id="voice-assistant-toggle"
              type="checkbox"
              checked={settings.voiceAssistantEnabled}
              onChange={e => updateSettings({ voiceAssistantEnabled: e.target.checked })}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          {/* 2. Voice Feedback (TTS) ON / OFF */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="voice-feedback-toggle" className="font-bold text-white block">Voice Feedback (Spoken Responses)</label>
              <span className="text-xs text-slate-400">Speak status confirmations aloud using Text-to-Speech</span>
            </div>
            <input
              id="voice-feedback-toggle"
              type="checkbox"
              checked={settings.voiceFeedbackEnabled}
              onChange={e => updateSettings({ voiceFeedbackEnabled: e.target.checked })}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          {/* 3. Language Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>Voice Recognition Language</span>
            </div>
            <select
              value={settings.language}
              onChange={e => updateSettings({ language: e.target.value as Language })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Speech Speed (0.5x to 2.0x) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Speech Speed</span>
              </span>
              <span className="text-xs font-mono text-teal-400">{settings.speechSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speechSpeed}
              onChange={e => updateSettings({ speechSpeed: parseFloat(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          {/* 5. Auto-Read Responses */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="auto-read-toggle" className="font-bold text-white block">Auto Read AI Responses</label>
              <span className="text-xs text-slate-400">Automatically speak answers from HealthAI Copilot</span>
            </div>
            <input
              id="auto-read-toggle"
              type="checkbox"
              checked={settings.autoReadResponses}
              onChange={e => updateSettings({ autoReadResponses: e.target.checked })}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          {/* 6. Command Confirmation */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="confirmation-toggle" className="font-bold text-white block">Command Confirmation</label>
              <span className="text-xs text-slate-400">Always ask confirmation before cancellations & logout</span>
            </div>
            <input
              id="confirmation-toggle"
              type="checkbox"
              checked={settings.commandConfirmation}
              onChange={e => updateSettings({ commandConfirmation: e.target.checked })}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          {/* 7. Privacy Guard Note */}
          <div className="p-3.5 rounded-2xl bg-teal-950/20 border border-teal-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-400">
              <strong className="text-slate-200">Strict Privacy Guarantee:</strong> Voice recordings are processed in real-time in your browser and are never stored or sold.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
