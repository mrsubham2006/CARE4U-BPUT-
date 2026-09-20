import React, { useState } from 'react';
import { useApp } from '../../services/store';
import {
  ShieldCheck,
  X,
  Plus,
  Trash2,
  Clock,
  Key,
  CheckCircle2,
  Ban,
  UserCheck
} from 'lucide-react';

interface ConsentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsentManagerModal: React.FC<ConsentManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { consents, createConsent, revokeConsent, playAudioChime, triggerConfetti } = useApp();

  const [recipientName, setRecipientName] = useState('Dr. S. K. Kulkarni (Civil Hospital)');
  const [recipientRole, setRecipientRole] = useState<'DOCTOR' | 'HOSPITAL' | 'LAB' | 'PHARMACY' | 'ASHA_WORKER' | 'CLINIC'>('DOCTOR');
  const [durationHours, setDurationHours] = useState<number>(24);
  const [selectedTypes, setSelectedTypes] = useState<Array<'PRESCRIPTION' | 'LAB_REPORT' | 'DISCHARGE_SUMMARY'>>([
    'PRESCRIPTION',
    'LAB_REPORT'
  ]);

  if (!isOpen) return null;

  const handleGrantConsent = async () => {
    playAudioChime('click');
    await createConsent({
      patientId: 'pat-1',
      recipientName,
      recipientRole,
      allowedRecordTypes: selectedTypes,
      durationHours
    });
    triggerConfetti();
  };

  const toggleRecordType = (type: 'PRESCRIPTION' | 'LAB_REPORT' | 'DISCHARGE_SUMMARY') => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(prev => prev.filter(t => t !== type));
      }
    } else {
      setSelectedTypes(prev => [...prev, type]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Consent-Based Health Data Sharing
              </h2>
              <p className="text-xs text-slate-400">
                Issue time-bound granular access tokens • Revoke access anytime
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Grant New Consent Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-400" />
              <span>Grant New Access Token</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Recipient Clinician / Staff Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Access Duration</label>
                <select
                  value={durationHours}
                  onChange={e => setDurationHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value={4}>4 Hours (One Consultation)</option>
                  <option value={24}>24 Hours (Same Day Care)</option>
                  <option value={72}>72 Hours (3 Days)</option>
                  <option value={168}>7 Days (1 Week)</option>
                </select>
              </div>
            </div>

            {/* Allowed Record Types */}
            <div>
              <label className="text-slate-400 block mb-1.5">Permitted Health Document Types:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'PRESCRIPTION' as const, label: 'Prescriptions (Rx)' },
                  { id: 'LAB_REPORT' as const, label: 'Pathology Lab Reports' },
                  { id: 'DISCHARGE_SUMMARY' as const, label: 'Hospital Discharge Summaries' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleRecordType(item.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      selectedTypes.includes(item.id)
                        ? 'bg-teal-600 border-teal-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {selectedTypes.includes(item.id) ? '✓ ' : '+ '}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGrantConsent}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow cursor-pointer"
            >
              Generate Secure Time-Bound Token
            </button>
          </div>

          {/* Active & Revoked Consents List */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">
              Issued Consent Tokens ({consents.length})
            </h3>

            <div className="space-y-2">
              {consents.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm">{c.recipientName}</strong>
                      <span className="font-mono text-[10px] text-teal-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {c.token}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-950 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <span>Expires: <strong className="text-slate-200">{new Date(c.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                      <span>•</span>
                      <span>Types: <span className="text-slate-300">{c.allowedRecordTypes.join(', ')}</span></span>
                    </div>
                  </div>

                  {c.status === 'ACTIVE' && (
                    <button
                      onClick={() => revokeConsent(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white font-bold transition text-xs flex items-center gap-1 self-end sm:self-center cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Compliant with ABDM consent manager architecture.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
