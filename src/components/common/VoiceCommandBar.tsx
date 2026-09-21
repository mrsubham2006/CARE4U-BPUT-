import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  X,
  CheckCircle2,
  Globe,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Pill,
  FileText,
  Building2,
  User,
  Activity,
  Truck,
  FlaskConical,
  Stethoscope,
  Video,
  Layers,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../services/store';
import { voiceCommandService, VoiceCommandAction } from '../../services/voiceCommandService';
import { getTranslation } from '../../i18n/translations';

export const VoiceCommandBar: React.FC = () => {
  const { selectedLanguage, setSelectedLanguage, playAudioChime, currentUser } = useApp();
  const t = getTranslation(selectedLanguage);

  const [isListening, setIsListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastAction, setLastAction] = useState<VoiceCommandAction | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const actionTimeoutRef = useRef<any>(null);

  useEffect(() => {
    voiceCommandService.setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    // Subscribe to speech recognition status
    const unsubStatus = voiceCommandService.onStatus(listening => {
      setIsListening(listening);
    });

    // Subscribe to live transcript
    const unsubTranscript = voiceCommandService.onTranscript((text, isFinal) => {
      setCurrentTranscript(text);
      if (isFinal) {
        setTimeout(() => {
          setCurrentTranscript('');
        }, 3000);
      }
    });

    // Subscribe to executed actions
    const unsubAction = voiceCommandService.subscribe(action => {
      setLastAction(action);
      const feedback = action.feedbackText[selectedLanguage] || action.feedbackText.en;
      setActionNotice(feedback);

      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
      actionTimeoutRef.current = setTimeout(() => {
        setActionNotice(null);
      }, 4500);
    });

    return () => {
      unsubStatus();
      unsubTranscript();
      unsubAction();
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    };
  }, [selectedLanguage]);

  const handleToggleMic = () => {
    playAudioChime('click');
    if (isListening) {
      voiceCommandService.stop();
      setContinuousMode(false);
    } else {
      voiceCommandService.start();
    }
  };

  const handleToggleContinuous = () => {
    playAudioChime('click');
    const next = !continuousMode;
    setContinuousMode(next);
    voiceCommandService.setContinuousMode(next);
    if (next) {
      voiceCommandService.speak(
        selectedLanguage === 'or'
          ? 'ହ୍ୟାଣ୍ଡସ୍-ଫ୍ରି ନିରନ୍ତର ଭଏସ୍ ମୋଡ୍ ସକ୍ରିୟ ହେଲା।'
          : selectedLanguage === 'hi'
          ? 'हैंड्स-फ्री निरंतर वॉयस मोड सक्रिय हो गया है।'
          : 'Hands-free ambient voice mode activated. Speak any command anytime.'
      );
    }
  };

  const handleToggleMute = () => {
    playAudioChime('click');
    const next = !isMuted;
    setIsMuted(next);
    voiceCommandService.setMuted(next);
  };

  const handleExecuteSample = (sampleCommand: string) => {
    playAudioChime('click');
    setCurrentTranscript(sampleCommand);
    voiceCommandService.processCommand(sampleCommand);
    setShowCheatSheet(false);
  };

  // Role-Aware Curated Voice Commands
  const role = currentUser?.role || 'PATIENT';

  const getRoleCommands = () => {
    if (role === 'DOCTOR') {
      return [
        { icon: <UserCheck className="w-3.5 h-3.5 text-teal-400" />, label: 'Call Next Patient', command: 'call next patient', category: 'OPD Queue' },
        { icon: <Stethoscope className="w-3.5 h-3.5 text-blue-400" />, label: 'Start Consultation', command: 'start consultation', category: 'Clinical Workspace' },
        { icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />, label: 'View OPD Queue', command: 'opd queue', category: 'Patients' },
        { icon: <Calendar className="w-3.5 h-3.5 text-indigo-400" />, label: 'Appointments', command: 'appointment', category: 'Schedule' },
        { icon: <Pill className="w-3.5 h-3.5 text-amber-400" />, label: 'e-Prescriptions', command: 'prescription', category: 'Clinical Rx' },
        { icon: <Building2 className="w-3.5 h-3.5 text-purple-400" />, label: 'Switch to Patient', command: 'patient portal', category: 'Role Portal' }
      ];
    }

    if (role === 'PHARMACY_STAFF') {
      return [
        { icon: <Pill className="w-3.5 h-3.5 text-amber-400" />, label: 'Dispense Prescription', command: 'dispense prescription', category: 'Dispensing' },
        { icon: <Activity className="w-3.5 h-3.5 text-teal-400" />, label: 'Check Stock', command: 'scroll down', category: 'Inventory' },
        { icon: <Building2 className="w-3.5 h-3.5 text-blue-400" />, label: 'Switch to Doctor', command: 'doctor portal', category: 'Role Portal' },
        { icon: <User className="w-3.5 h-3.5 text-cyan-400" />, label: 'Switch to Patient', command: 'patient portal', category: 'Role Portal' }
      ];
    }

    if (role === 'AMBULANCE_OPERATOR') {
      return [
        { icon: <Truck className="w-3.5 h-3.5 text-red-400" />, label: 'Advance Trip Status', command: 'accept trip next status', category: 'Dispatch' },
        { icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />, label: 'Emergency 108', command: 'sos emergency ambulance', category: 'Emergency' },
        { icon: <Building2 className="w-3.5 h-3.5 text-blue-400" />, label: 'Switch to Hospital', command: 'hospital portal', category: 'Role Portal' }
      ];
    }

    if (role === 'LAB_STAFF') {
      return [
        { icon: <FlaskConical className="w-3.5 h-3.5 text-purple-400" />, label: 'Process Lab Order', command: 'process lab order', category: 'Diagnostics' },
        { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, label: 'Complete Test', command: 'complete lab test', category: 'Pathology' },
        { icon: <Building2 className="w-3.5 h-3.5 text-blue-400" />, label: 'Switch to Doctor', command: 'doctor portal', category: 'Role Portal' }
      ];
    }

    if (role === 'ASHA_WORKER') {
      return [
        { icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />, label: 'Register Citizen', command: 'register citizen', category: 'Rural Registration' },
        { icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />, label: 'Sync Offline Data', command: 'sync offline data', category: 'FHIR Sync' },
        { icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />, label: 'Emergency 108 SOS', command: 'sos emergency ambulance', category: 'Emergency' }
      ];
    }

    // Default: Patient Care Services
    return [
      { icon: <Pill className="w-3.5 h-3.5 text-emerald-400" />, label: 'Take My Medicine', command: 'take my medicine', category: 'Medication' },
      { icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />, label: 'Emergency 108 SOS', command: 'call 108 ambulance', category: 'Emergency' },
      { icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" />, label: 'AI Health Intake', command: 'symptom triage ai check', category: 'Clinical AI' },
      { icon: <Calendar className="w-3.5 h-3.5 text-blue-400" />, label: 'Book Appointment', command: 'book appointment', category: 'Consultation' },
      { icon: <Pill className="w-3.5 h-3.5 text-amber-400" />, label: 'Medicine Schedule', command: 'show my medicines', category: 'Pharmacy' },
      { icon: <FileText className="w-3.5 h-3.5 text-purple-400" />, label: 'Diagnostic Reports', command: 'lab report', category: 'Diagnostics' },
      { icon: <Video className="w-3.5 h-3.5 text-indigo-400" />, label: 'Video Consultation', command: 'video consultation', category: 'Telehealth' },
      { icon: <Building2 className="w-3.5 h-3.5 text-teal-400" />, label: 'Switch to Doctor', command: 'doctor portal', category: 'Role Portal' },
      { icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />, label: 'Change to Odia', command: 'odia', category: 'Language' },
      { icon: <Globe className="w-3.5 h-3.5 text-amber-400" />, label: 'Change to Hindi', command: 'hindi', category: 'Language' }
    ];
  };

  const sampleCommands = getRoleCommands();

  return (
    <>
      {/* Floating Voice Command Dock at Bottom Center */}
      <div id="voice-command-hud" className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none max-w-[95vw] sm:max-w-xl w-full">
        {/* Action / Feedback Toast Banner */}
        {actionNotice && (
          <div className="pointer-events-auto mb-2 px-4 py-2 rounded-2xl bg-slate-900/95 border border-teal-500/50 shadow-2xl backdrop-blur-xl text-xs font-semibold text-teal-200 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 animate-bounce" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Main Floating Voice HUD Card */}
        <div className="pointer-events-auto w-full bg-slate-950/95 backdrop-blur-2xl border border-teal-500/40 hover:border-teal-400/60 rounded-3xl shadow-2xl shadow-teal-950/80 p-2 sm:p-2.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Interactive Mic Button with Audio Pulse Wave */}
            <div className="flex items-center gap-2">
              <button
                id="voice-mic-btn"
                onClick={handleToggleMic}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-lg ${
                  isListening
                    ? 'bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 text-white shadow-red-600/40 animate-pulse ring-4 ring-red-500/30'
                    : 'bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 text-slate-950 shadow-teal-500/30 hover:scale-105'
                }`}
                title={isListening ? 'Click to stop voice listening' : 'Click or speak commands'}
              >
                {isListening ? (
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-6 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
                  </div>
                ) : (
                  <Mic className="w-5 h-5 font-bold text-slate-950" />
                )}
                {continuousMode && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-slate-950 animate-ping" />
                )}
              </button>

              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-tight">Voice Command</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                      continuousMode
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : isListening
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}
                  >
                    {continuousMode ? 'Hands-Free ON' : isListening ? 'Listening...' : 'Ready'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                  {selectedLanguage.toUpperCase()} • {role.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Center: Live Transcript Ticker with Soundwave */}
            <div className="flex-1 min-w-0 px-2 sm:px-3 text-center">
              {currentTranscript ? (
                <div className="bg-slate-900/90 border border-teal-500/40 rounded-xl px-2.5 py-1 text-xs font-medium text-teal-300 truncate animate-pulse flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">"{currentTranscript}"</span>
                </div>
              ) : isListening ? (
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-400 ml-1">
                    {continuousMode ? 'Hands-Free listening... speak any command' : 'Say a command...'}
                  </span>
                </div>
              ) : (
                <button
                  id="voice-sample-btn"
                  onClick={() => setShowCheatSheet(true)}
                  className="text-[11px] text-slate-400 hover:text-teal-300 transition truncate max-w-full cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span className="hidden md:inline">Try:</span>
                  <span className="italic truncate text-slate-300">"{sampleCommands[0]?.command}"</span>
                </button>
              )}
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Hands-Free Continuous Mode Toggle */}
              <button
                id="voice-continuous-btn"
                onClick={handleToggleContinuous}
                className={`p-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                  continuousMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-800'
                }`}
                title={
                  continuousMode
                    ? 'Hands-Free Mode: ON (always listening without clicking)'
                    : 'Turn on Hands-Free Ambient Voice Mode'
                }
              >
                <Radio className={`w-3.5 h-3.5 ${continuousMode ? 'text-amber-400 animate-spin' : ''}`} />
                <span className="hidden xl:inline text-[10px] font-mono">
                  {continuousMode ? 'HANDS-FREE' : 'AUTO'}
                </span>
              </button>

              {/* TTS Voice Mute Toggle */}
              <button
                id="voice-mute-btn"
                onClick={handleToggleMute}
                className={`p-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-800'
                }`}
                title={isMuted ? 'Unmute Voice Responses' : 'Mute Voice Responses'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
              </button>

              {/* Cheat sheet trigger button */}
              <button
                id="voice-commands-btn"
                onClick={() => {
                  playAudioChime('click');
                  setShowCheatSheet(prev => !prev);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                title="View Voice Commands for this Portal"
              >
                <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden lg:inline text-[11px]">Commands</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Commands Cheat Sheet Modal / Drawer */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Voice Commands ({role.replace(/_/g, ' ')})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Speak in {selectedLanguage.toUpperCase()} or tap to execute automatically
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCheatSheet(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Clickable Voice Command Chips */}
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sampleCommands.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteSample(cmd.command)}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 text-left transition group cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 group-hover:bg-teal-500/20 flex items-center justify-center shrink-0">
                        {cmd.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-teal-300 truncate">
                          {cmd.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Say: <span className="text-teal-400/90 font-mono">"{cmd.command}"</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                ))}
              </div>

              {/* Navigation & Controls Helper */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-400">
                  <strong className="text-slate-200 block mb-1">Page Controls:</strong>
                  <span>"Scroll down", "Scroll up", "Go to top", "Click [button]"</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-400">
                  <strong className="text-slate-200 block mb-1">AI Assistant:</strong>
                  <span>"Ask AI [question]", "Check symptoms [detail]"</span>
                </div>
              </div>

              {/* Supported Languages Tip */}
              <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/20 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-teal-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Multilingual Hands-Free Engine Active</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Turn on <strong>Hands-Free Mode</strong> to keep the microphone listening continuously. All commands work in English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), Marathi (मराठी), Bengali, Telugu, Tamil, and other regional dialects.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Web Speech API • Real-Time Voice Automation
              </span>
              <button
                onClick={() => setShowCheatSheet(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
