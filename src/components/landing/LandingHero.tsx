import React from 'react';
import { useApp } from '../../services/store';
import {
  Sparkles,
  Compass,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
  Zap,
  Globe2,
  Users
} from 'lucide-react';

interface LandingHeroProps {
  onStartDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartDemo }) => {
  const { setCurrentUserRole, playAudioChime } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold shadow-lg">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>CARE4U NEXUS — Production-Grade Connected Health Network</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-tight">
          One Patient.{' '}
          <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            One Connected Care Journey.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          An AI-powered healthcare coordination and live capacity intelligence ecosystem connecting rural citizens, ASHA workers, clinicians, diagnostic labs, pharmacies, and regional command centers into one unbroken care continuum.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              playAudioChime('click');
              setCurrentUserRole('PATIENT');
              onStartDemo();
            }}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition cursor-pointer flex items-center gap-2"
          >
            <span>Experience Interactive Care Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playAudioChime('click');
              setCurrentUserRole('SUPER_ADMIN');
            }}
            className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm shadow-lg transition cursor-pointer flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>View Command Center</span>
          </button>
        </div>
      </div>

      {/* The Three Strategic Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Pillar 1: CARE4U */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-teal-500/30 shadow-2xl space-y-3 relative overflow-hidden group hover:border-teal-400/60 transition">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xl mb-4">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-display">1. CARE4U</h3>
          <p className="text-xs font-mono uppercase text-teal-400 tracking-wider">Connected Patient Care Journey</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminates fragmented records and lost referrals. Unifies patient registration, digital tokens (A-027), electronic prescriptions, diagnostic test orders, and proactive follow-up schedules into one continuous loop.
          </p>
        </div>

        {/* Pillar 2: MedRoute AI */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl space-y-3 relative overflow-hidden group hover:border-cyan-400/60 transition">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-display">2. MedRoute AI™</h3>
          <p className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Intelligent Capacity Routing</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Nearest ≠ Appropriate. MedRoute scores live clinical capability, active doctor duty status, OPD queues, diagnostic availability, and emergency overload to route patients with complete explainability.
          </p>
        </div>

        {/* Pillar 3: HealthAI */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-2xl space-y-3 relative overflow-hidden group hover:border-blue-400/60 transition">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xl mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-display">3. HealthAI</h3>
          <p className="text-xs font-mono uppercase text-blue-400 tracking-wider">Clinical & Decision Intelligence</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Powers multilingual voice symptom intake (English, Hindi, Marathi), red-flag emergency screening, doctor clinical copilot summaries, and diagnostic document parameter extraction.
          </p>
        </div>
      </div>
    </div>
  );
};
