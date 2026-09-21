import React from 'react';
import {
  HelpCircle,
  X,
  Stethoscope,
  Compass,
  Sparkles,
  Volume2,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { useVoice } from '../../services/voice/VoiceContext';

export const VoiceHelpModal: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen, executeSampleCommand } = useVoice();

  if (!isHelpOpen) return null;

  const categories = [
    {
      title: 'Healthcare',
      icon: <Stethoscope className="w-4 h-4 text-teal-400" />,
      commands: [
        { label: 'Find a Cardiologist', cmd: 'Find a cardiologist' },
        { label: 'Find Nearby Hospitals', cmd: 'Find nearby hospitals' },
        { label: 'Show My Appointments', cmd: 'Show my appointments' },
        { label: 'Open Health Records', cmd: 'Open my health records' },
        { label: 'Read My Health Report', cmd: 'Read my health report' },
        { label: 'Mark Medicine Dose Taken', cmd: 'Take my medicine' },
        { label: 'Emergency 108 SOS', cmd: 'I need emergency help' }
      ]
    },
    {
      title: 'Navigation',
      icon: <Compass className="w-4 h-4 text-indigo-400" />,
      commands: [
        { label: 'Home Dashboard', cmd: 'Open home' },
        { label: 'Doctor Directory', cmd: 'Open doctors' },
        { label: 'Patient Profile', cmd: 'Show my profile' },
        { label: 'Medicine Schedule', cmd: 'Open medicines' },
        { label: 'Diagnostic Lab Reports', cmd: 'Open health reports' },
        { label: 'OPD Queue Pass', cmd: 'Open queue pass' }
      ]
    },
    {
      title: 'AI Health Assistant',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      commands: [
        { label: 'Explain Diabetes', cmd: 'Ask HealthAI about diabetes' },
        { label: 'Explain Hypertension Simply', cmd: 'Explain hypertension in simple language' },
        { label: 'Common Dehydration Symptoms', cmd: 'What are common symptoms of dehydration?' },
        { label: 'Summarize Information', cmd: 'Summarize this information' },
        { label: 'Symptom Triage Check', cmd: 'Help me understand these symptoms' }
      ]
    },
    {
      title: 'Accessibility & Speech',
      icon: <Volume2 className="w-4 h-4 text-amber-400" />,
      commands: [
        { label: 'Read This Page Aloud', cmd: 'Read this page' },
        { label: 'Stop Speaking', cmd: 'Stop speaking' },
        { label: 'Speak Slower', cmd: 'Speak slower' },
        { label: 'Speak Faster', cmd: 'Speak faster' }
      ]
    },
    {
      title: 'Website Controls',
      icon: <Sliders className="w-4 h-4 text-purple-400" />,
      commands: [
        { label: 'Scroll Down', cmd: 'Scroll down' },
        { label: 'Scroll to Top', cmd: 'Go to top' },
        { label: 'Go Back', cmd: 'Go back' },
        { label: 'Turn on Dark Mode', cmd: 'Turn on dark mode' },
        { label: 'Switch to Hindi', cmd: 'Change language to Hindi' },
        { label: 'Switch to Odia', cmd: 'Change language to Odia' }
      ]
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="help-modal-title" className="text-base font-bold text-white">
                HealthAI Voice Commands
              </h3>
              <p className="text-xs text-slate-400">
                Natural voice controls. Tap any command or speak it naturally.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            aria-label="Close voice help"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                {cat.icon}
                <span>{cat.title}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.commands.map((cmd, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => {
                      executeSampleCommand(cmd.cmd);
                      setIsHelpOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-teal-500/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-white group-hover:text-teal-300 truncate">
                        {cmd.label}
                      </div>
                      <div className="text-[10px] text-teal-400/90 font-mono truncate">
                        "{cmd.cmd}"
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-teal-300">Alt + V</kbd> to activate voice anytime.
          </span>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
