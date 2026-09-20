import React from 'react';
import {
  QrCode,
  ShieldCheck,
  Printer,
  Download,
  Phone,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { useApp } from '../../services/store';

export const SecureQRHealthIDView: React.FC = () => {
  const { activePatient, playAudioChime, triggerConfetti } = useApp();

  const handlePrint = () => {
    playAudioChime('click');
    window.print();
  };

  const handleCopyHealthId = () => {
    navigator.clipboard.writeText(activePatient.healthId);
    playAudioChime('success');
    alert(`Copied Health ID: ${activePatient.healthId} to clipboard.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Digital Health ID & Emergency QR Pass</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              National Health Authority
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Your tamper-proof digital ABHA citizen card for zero-wait registration at any district hospital or clinic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Print ID Card</span>
          </button>

          <button
            onClick={handleCopyHealthId}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy ABHA</span>
          </button>
        </div>
      </div>

      {/* Main ABHA Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 border-2 border-teal-500/50 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Top bar with Govt Crest & Card Title */}
        <div className="flex items-center justify-between pb-4 border-b border-teal-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 text-teal-200 flex items-center justify-center text-xl font-bold">
              🏛️
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Government of India • Ministry of Health
              </div>
              <div className="text-xs text-teal-300 font-semibold">
                Ayushman Bharat Digital Mission (ABDM)
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
            VERIFIED CITIZEN
          </span>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Details */}
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500 text-slate-950 font-bold text-2xl flex items-center justify-center shadow-lg">
                {activePatient.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{activePatient.name}</h2>
                <div className="text-xs text-slate-300 mt-0.5">
                  DOB: {activePatient.dob || '1999-05-14'} • {activePatient.gender} ({activePatient.age} Yrs)
                </div>
                <div className="text-xs font-mono text-teal-300 mt-1">
                  ABHA: {activePatient.abhaNumber || '91-4412-8821-9923'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-teal-500/20">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group</div>
                <div className="text-rose-300 font-bold font-mono text-sm mt-0.5">{activePatient.bloodGroup || 'B+'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-teal-500/20">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Contact</div>
                <div className="text-amber-300 font-bold truncate mt-0.5">{activePatient.emergencyContact}</div>
              </div>
            </div>

            {/* Critical Allergies Badge */}
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Critical Clinical Allergies: </strong>
                {activePatient.allergies && activePatient.allergies.length > 0 ? activePatient.allergies.join(', ') : 'None'}
              </span>
            </div>
          </div>

          {/* Large QR Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/40 text-center space-y-3 shadow-xl">
            <div className="w-36 h-36 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <QrCode className="w-32 h-32 text-slate-900" />
            </div>
            <div className="text-xs font-mono text-teal-300 font-bold tracking-wider">
              {activePatient.healthId}
            </div>
            <div className="text-[10px] text-slate-400">
              Scan at Hospital Entrance Kiosk
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-teal-500/20 flex items-center justify-between text-[11px] text-slate-400">
          <span>CARE4U NEXUS Health Card #NX-9821-MH</span>
          <span>Secured with SHA-256 Digital Signature</span>
        </div>
      </div>
    </div>
  );
};
