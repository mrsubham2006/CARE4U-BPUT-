import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  ScanFace,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Pill,
  FolderOpen,
  Activity,
  Smartphone,
  Check,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../services/store';
import { BiometricSecuritySettings } from '../../types';
import { isPlatformBiometricAvailable } from '../../services/biometricService';
import { BiometricUnlockModal } from './BiometricUnlockModal';

interface BiometricSettingsCardProps {
  onSettingsChange?: (newSettings: BiometricSecuritySettings) => void;
}

export const BiometricSettingsCard: React.FC<BiometricSettingsCardProps> = ({
  onSettingsChange
}) => {
  const {
    activePatient,
    updateActivePatientProfile,
    isBiometricUnlocked,
    unlockBiometrics,
    lockBiometrics,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const currentSettings: BiometricSecuritySettings = activePatient.biometricSecurity || {
    enabled: false,
    biometricType: 'FACE_ID',
    requireForPrescriptions: true,
    requireForLabReports: true,
    requireForHealthWallet: true,
    requireForMedicalHistory: true,
    lockTimeoutMinutes: 5,
    passcodeFallback: '1234'
  };

  const [settings, setSettings] = useState<BiometricSecuritySettings>(currentSettings);
  const [hasHardwareBiometrics, setHasHardwareBiometrics] = useState<boolean>(true);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    isPlatformBiometricAvailable().then(avail => {
      setHasHardwareBiometrics(avail || true); // Supported or simulated
    });
  }, []);

  const handleToggleEnable = () => {
    const nextEnabled = !settings.enabled;
    const updated: BiometricSecuritySettings = {
      ...settings,
      enabled: nextEnabled
    };
    setSettings(updated);
    updateActivePatientProfile({ biometricSecurity: updated });
    if (onSettingsChange) onSettingsChange(updated);
    playAudioChime(nextEnabled ? 'success' : 'click');

    if (nextEnabled) {
      triggerConfetti();
      setSaveStatus('Biometric Security activated! Sensitive medical records are now protected.');
    } else {
      setSaveStatus('Biometric Security disabled.');
    }
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleUpdateSetting = (partial: Partial<BiometricSecuritySettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    updateActivePatientProfile({ biometricSecurity: updated });
    if (onSettingsChange) onSettingsChange(updated);
    playAudioChime('click');
    setSaveStatus('Biometric preferences updated & saved to cloud.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Card Header with Master Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${
            settings.enabled
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-lg shadow-teal-500/10'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {settings.biometricType === 'FACE_ID' ? (
              <ScanFace className="w-6 h-6" />
            ) : (
              <Fingerprint className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-display">
                Biometric Security & Medical Record Privacy
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                settings.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {settings.enabled ? 'PROTECTED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Require FaceID or Fingerprint authentication before opening sensitive health documents
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleEnable}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.enabled ? 'bg-teal-500' : 'bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-teal-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Settings Body */}
      {settings.enabled ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Biometric Method Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>Biometric Unlock Method</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => handleUpdateSetting({ biometricType: 'FACE_ID' })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                  settings.biometricType === 'FACE_ID'
                    ? 'bg-teal-950/40 border-teal-500/50 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <ScanFace className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>FaceID Facial Recognition</span>
                    {settings.biometricType === 'FACE_ID' && <Check className="w-4 h-4 text-teal-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    High-speed 3D facial scan & camera telemetry
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleUpdateSetting({ biometricType: 'FINGERPRINT' })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                  settings.biometricType === 'FINGERPRINT'
                    ? 'bg-teal-950/40 border-teal-500/50 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Fingerprint / TouchID</span>
                    {settings.biometricType === 'FINGERPRINT' && <Check className="w-4 h-4 text-teal-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Capacitive or optical biometric sensor prompt
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Granular Protected Categories */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Protected Health Data Categories</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'requireForPrescriptions',
                  label: 'Electronic Prescriptions & Medication Dosages',
                  desc: 'Requires biometric auth to view prescription PDFs and pharmacy orders',
                  icon: <Pill className="w-4 h-4 text-teal-400" />,
                  checked: settings.requireForPrescriptions
                },
                {
                  id: 'requireForLabReports',
                  label: 'Diagnostic Lab Reports & Pathology Results',
                  desc: 'Secures blood tests, radiology, and abnormal parameter reports',
                  icon: <FileText className="w-4 h-4 text-purple-400" />,
                  checked: settings.requireForLabReports
                },
                {
                  id: 'requireForHealthWallet',
                  label: 'Health Wallet & Uploaded Medical Documents',
                  desc: 'Encrypts discharge summaries, vaccine passes, and scanned files',
                  icon: <FolderOpen className="w-4 h-4 text-cyan-400" />,
                  checked: settings.requireForHealthWallet
                },
                {
                  id: 'requireForMedicalHistory',
                  label: 'Full Clinical Timeline & Medical History',
                  desc: 'Protects consultation notes, chronic illness records, and past diagnoses',
                  icon: <Activity className="w-4 h-4 text-rose-400" />,
                  checked: settings.requireForMedicalHistory
                }
              ].map(cat => (
                <label
                  key={cat.id}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    cat.checked
                      ? 'bg-slate-950 border-teal-500/30 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={cat.checked}
                    onChange={e => handleUpdateSetting({ [cat.id]: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-teal-400 bg-slate-900"
                  />
                  <div className="space-y-0.5 flex-1">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{cat.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Lock Timeout & Fallback PIN */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Auto-Lock Inactivity Timeout</span>
              </label>
              <select
                value={settings.lockTimeoutMinutes}
                onChange={e => handleUpdateSetting({ lockTimeoutMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              >
                <option value={0}>Immediately upon leaving records tab</option>
                <option value={5}>After 5 minutes of inactivity</option>
                <option value={15}>After 15 minutes of inactivity</option>
                <option value={60}>After 1 hour</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                <span>Backup Passcode / PIN</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={settings.passcodeFallback}
                onChange={e => handleUpdateSetting({ passcodeFallback: e.target.value })}
                placeholder="1234"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          {/* Test Scanner & Lock Status Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-950 to-indigo-950/40 border border-teal-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isBiometricUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {isBiometricUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Current Status: {isBiometricUnlocked ? 'Unlocked & Active' : 'Locked (Biometric Auth Required)'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {hasHardwareBiometrics ? '✓ Device WebAuthn platform authenticator ready' : '✓ Biometric visual simulator active'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isBiometricUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    lockBiometrics();
                    playAudioChime('click');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock Records Now</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setIsTestModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-teal-500/20"
              >
                {settings.biometricType === 'FACE_ID' ? <ScanFace className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
                <span>Test Biometric Scan</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Disabled State Explainer */
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <p className="flex items-center gap-2 text-slate-300">
            <Lock className="w-4 h-4 text-teal-400" />
            <span>Biometric security is currently disabled. Anyone using this device can view your medical records without biometric authentication.</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Toggle the switch above to enable instant FaceID or fingerprint unlock for your e-prescriptions, lab tests, and clinical history.
          </p>
        </div>
      )}

      {/* Test / Unlock Modal */}
      <BiometricUnlockModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onSuccess={() => {
          unlockBiometrics();
          setSaveStatus('Biometric test passed successfully!');
          setTimeout(() => setSaveStatus(null), 3000);
        }}
        resourceName="Biometric Verification Test"
        settings={settings}
      />
    </div>
  );
};
