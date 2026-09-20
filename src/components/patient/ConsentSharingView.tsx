import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Eye,
  FileCheck,
  History,
  Shield,
  Fingerprint
} from 'lucide-react';
import { useApp } from '../../services/store';
import { ConsentToken, MedicalRecordDocument } from '../../types';
import { AccessHistorySection } from './AccessHistorySection';

export const ConsentSharingView: React.FC = () => {
  const { consents, doctors, activePatient, biometricAccessLogs, createConsent, revokeConsent, playAudioChime, triggerConfetti } = useApp();

  const [activePrivacyTab, setActivePrivacyTab] = useState<'ACCESS_HISTORY' | 'CONSENT_GRANTS' | 'ALL'>('ACCESS_HISTORY');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState(doctors[0]?.id || 'doc-1');
  const [durationHours, setDurationHours] = useState(48);
  const [selectedDocTypes, setSelectedDocTypes] = useState<MedicalRecordDocument['recordType'][]>([
    'CLINICAL_NOTE',
    'LAB_REPORT',
    'PRESCRIPTION'
  ]);

  const myConsents = consents.filter(c => c.patientId === activePatient.id);

  const toggleDocType = (type: MedicalRecordDocument['recordType']) => {
    if (selectedDocTypes.includes(type)) {
      setSelectedDocTypes(selectedDocTypes.filter(t => t !== type));
    } else {
      setSelectedDocTypes([...selectedDocTypes, type]);
    }
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === selectedRecipientId) || doctors[0];

    playAudioChime('click');
    await createConsent({
      patientId: activePatient.id,
      recipientRole: 'DOCTOR',
      recipientId: doc.id,
      recipientName: doc.name,
      allowedRecordTypes: selectedDocTypes,
      durationHours
    });

    setIsCreating(false);
    playAudioChime('success');
    triggerConfetti();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Privacy, Consent & Record Access Control</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              ABDM Zero-Trust Enclave
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit who and when your health records are unlocked via biometric verification, and manage time-bound doctor consent grants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Grant Doctor Consent</span>
          </button>
        </div>
      </div>

      {/* Segmented View Switcher */}
      <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-1.5 shadow-md">
        <button
          type="button"
          onClick={() => {
            setActivePrivacyTab('ACCESS_HISTORY');
            playAudioChime('click');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activePrivacyTab === 'ACCESS_HISTORY'
              ? 'bg-teal-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Access History & Biometric Audit</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
            activePrivacyTab === 'ACCESS_HISTORY' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-teal-300'
          }`}>
            {biometricAccessLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActivePrivacyTab('CONSENT_GRANTS');
            playAudioChime('click');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activePrivacyTab === 'CONSENT_GRANTS'
              ? 'bg-teal-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Doctor Consent Grants</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
            activePrivacyTab === 'CONSENT_GRANTS' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-indigo-300'
          }`}>
            {myConsents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActivePrivacyTab('ALL');
            playAudioChime('click');
          }}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition hidden sm:flex ${
            activePrivacyTab === 'ALL'
              ? 'bg-teal-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>All Overview</span>
        </button>
      </div>

      {/* Section 1: Access History Section (Biometric & Record Unlocks) */}
      {(activePrivacyTab === 'ACCESS_HISTORY' || activePrivacyTab === 'ALL') && (
        <AccessHistorySection />
      )}

      {/* Section 2: Active Consent Tokens (Doctor Grants) */}
      {(activePrivacyTab === 'CONSENT_GRANTS' || activePrivacyTab === 'ALL') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-400" />
              <span>Active & Historical Consent Grants ({myConsents.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              ABDM Token-based EHR Sharing
            </span>
          </div>

          <div className="space-y-3">
            {myConsents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
                <p className="text-slate-400 text-xs">No active doctor consent tokens granted yet.</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
                >
                  Grant First Consent
                </button>
              </div>
            ) : (
              myConsents.map(token => (
                <div
                  key={token.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:border-slate-700 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{token.recipientName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {token.recipientRole}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        token.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300'
                      }`}>
                        {token.status}
                      </span>
                    </div>

                    <div className="text-slate-400 text-xs">
                      Token: <span className="font-mono text-slate-300">{token.token}</span> • Expires:{' '}
                      <strong className="text-slate-200">{new Date(token.expiresAt).toLocaleString()}</strong> ({token.durationHours}h grant)
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {token.allowedRecordTypes.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {token.status === 'ACTIVE' && (
                    <button
                      onClick={() => revokeConsent(token.id)}
                      className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 self-end sm:self-center transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Grant Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateConsent}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">Grant ABDM Health Record Consent</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Doctor / Recipient</label>
                <select
                  value={selectedRecipientId}
                  onChange={e => setSelectedRecipientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty} ({d.facilityName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Access Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 24, 48, 168].map(hrs => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDurationHours(hrs)}
                      className={`py-2 rounded-xl font-bold font-mono text-xs ${
                        durationHours === hrs
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {hrs === 168 ? '7 Days' : `${hrs} Hours`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Allowed Medical Record Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['CLINICAL_NOTE', 'LAB_REPORT', 'PRESCRIPTION', 'RADIOLOGY'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleDocType(type)}
                      className={`p-2.5 rounded-xl border text-left font-semibold text-xs flex items-center justify-between ${
                        selectedDocTypes.includes(type)
                          ? 'bg-teal-500/15 border-teal-500 text-teal-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{type.replace('_', ' ')}</span>
                      {selectedDocTypes.includes(type) && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
              >
                Issue Signed Consent Token
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

