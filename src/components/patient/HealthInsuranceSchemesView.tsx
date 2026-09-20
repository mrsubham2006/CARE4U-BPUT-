import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  ExternalLink,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../services/store';

export const HealthInsuranceSchemesView: React.FC = () => {
  const { activePatient, playAudioChime, triggerConfetti } = useApp();

  const [activeTab, setActiveTab] = useState<'PMJAY' | 'PRIVATE_INSURANCE' | 'EMPANELLED_HOSPITALS'>('PMJAY');
  const [aadhaarInput, setAadhaarInput] = useState('9812 **** 4491');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerifyPMJAY = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    playAudioChime('click');
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult('ELIGIBLE: Ayushman Bharat Golden Card #PMJAY-9921-IN Active. Annual Limit ₹5,00,000 available.');
      playAudioChime('success');
      triggerConfetti();
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Ayushman Bharat & Health Insurance</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              Cashless Care
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            PM-JAY Golden Card status, cashless empanelled hospital authorizations, and private claim filings.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('PMJAY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PMJAY'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PM-JAY Scheme
          </button>
          <button
            onClick={() => setActiveTab('PRIVATE_INSURANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PRIVATE_INSURANCE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Private TPA
          </button>
        </div>
      </div>

      {activeTab === 'PMJAY' && (
        <div className="space-y-6">
          {/* PM-JAY Golden Card Display */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-2xl font-bold border border-emerald-500/30">
                  🇮🇳
                </div>
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Ayushman Bharat Pradhan Mantri Jan Arogya Yojana
                  </h2>
                  <div className="text-xs text-emerald-400 font-medium">National Health Authority (NHA) • Golden Health Card</div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono self-start sm:self-auto">
                ACTIVE & ELIGIBLE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <div className="text-xs text-slate-400">Beneficiary Name</div>
                  <div className="text-lg font-bold text-white">{activePatient.name}</div>
                  <div className="text-xs text-slate-400">ABDM Health ID: <span className="text-teal-300 font-mono">{activePatient.healthId}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                    <div className="text-[10px] text-slate-400 uppercase">Annual Family Floater Cover</div>
                    <div className="text-emerald-300 font-black font-mono text-base mt-0.5">₹5,00,000 / Yr</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                    <div className="text-[10px] text-slate-400 uppercase">Remaining Balance</div>
                    <div className="text-white font-black font-mono text-base mt-0.5">₹4,85,000</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2 text-xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Card Verification Hash</div>
                <div className="text-xs font-mono text-emerald-300 break-all">
                  PMJAY-MH-9921-2026-X8829-AUTH
                </div>
                <button
                  onClick={() => alert('Downloading official Ayushman Golden Card PDF...')}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Eligibility Check Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Scheme Eligibility via Aadhaar / Ration Card</span>
            </h3>

            <form onSubmit={handleVerifyPMJAY} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={aadhaarInput}
                onChange={e => setAadhaarInput(e.target.value)}
                placeholder="Enter 12-digit Aadhaar or Ration Card number"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                required
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                {isVerifying ? 'Verifying NHA Database...' : 'Check PM-JAY Status'}
              </button>
            </form>

            {verificationResult && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{verificationResult}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'PRIVATE_INSURANCE' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Private Health Insurance Policy (Star Health / HDFC Ergo)</span>
          </h2>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-base font-bold text-white">Comprehensive Health Optima Policy</div>
                <div className="text-slate-400">Policy #SH-882199-2026 • Valid till 15 Nov 2027</div>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900">
                <div className="text-slate-400">Sum Insured</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">₹10,00,000</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900">
                <div className="text-slate-400">TPA Desk Status</div>
                <div className="text-base font-bold text-emerald-300 mt-0.5">Cashless Pre-Auth Ready</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
