import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  ScanFace,
  Sparkles,
  ArrowRight,
  Eye,
  FileText
} from 'lucide-react';
import { useApp } from '../../services/store';
import { BiometricUnlockModal } from './BiometricUnlockModal';

interface BiometricProtectedGateProps {
  category: 'requireForPrescriptions' | 'requireForLabReports' | 'requireForHealthWallet' | 'requireForMedicalHistory';
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const BiometricProtectedGate: React.FC<BiometricProtectedGateProps> = ({
  category,
  title,
  description,
  icon,
  children
}) => {
  const {
    activePatient,
    isBiometricUnlocked,
    unlockBiometrics,
    lockBiometrics,
    playAudioChime
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const biometricSettings = activePatient.biometricSecurity;
  const isEnabled = biometricSettings?.enabled && biometricSettings[category];

  // If biometric protection is not enabled for this category, or if session is already unlocked, render children
  if (!isEnabled || isBiometricUnlocked) {
    return (
      <div className="space-y-4">
        {isEnabled && isBiometricUnlocked && (
          <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-300">
            <div className="flex items-center gap-2">
              <Unlock className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold">
                Biometric Session Active ({biometricSettings.biometricType === 'FACE_ID' ? 'FaceID' : 'TouchID'} Unlocked)
              </span>
            </div>
            <button
              onClick={() => {
                lockBiometrics();
                playAudioChime('click');
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Lock Now</span>
            </button>
          </div>
        )}
        {children}
      </div>
    );
  }

  // Otherwise render Biometric Privacy Shield
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-300">
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Animated Privacy Shield Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/10">
          <div className="absolute inset-0 rounded-3xl bg-teal-400/10 animate-ping opacity-25" />
          {biometricSettings.biometricType === 'FACE_ID' ? (
            <ScanFace className="w-12 h-12" />
          ) : (
            <Fingerprint className="w-12 h-12" />
          )}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-teal-300 text-xs font-semibold border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Biometric Record Encryption</span>
          </div>

          <h2 className="text-2xl font-black font-display text-white">
            {title} is Protected
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {description}. Please authenticate using your registered {biometricSettings.biometricType === 'FACE_ID' ? 'FaceID' : 'Fingerprint'} to view confidential health data.
          </p>
        </div>

        {/* Big Unlock Button */}
        <div className="pt-2 max-w-sm mx-auto space-y-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition cursor-pointer flex items-center justify-center gap-2.5 hover:scale-[1.02]"
          >
            {biometricSettings.biometricType === 'FACE_ID' ? (
              <ScanFace className="w-5 h-5" />
            ) : (
              <Fingerprint className="w-5 h-5" />
            )}
            <span>Unlock with {biometricSettings.biometricType === 'FACE_ID' ? 'FaceID' : 'Fingerprint'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-slate-400 hover:text-teal-400 transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Use Emergency Passcode PIN</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Compliant with ABDM & HIPAA Patient Data Privacy Guidelines</span>
        </div>
      </div>

      <BiometricUnlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          unlockBiometrics();
        }}
        resourceName={title}
        settings={biometricSettings}
      />
    </div>
  );
};
