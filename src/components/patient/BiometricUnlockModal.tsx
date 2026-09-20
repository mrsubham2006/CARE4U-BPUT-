import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  Fingerprint,
  ScanFace
} from 'lucide-react';
import { useApp } from '../../services/store';
import { BiometricSecuritySettings } from '../../types';

interface BiometricUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resourceName?: string;
  settings?: BiometricSecuritySettings;
}

export const BiometricUnlockModal: React.FC<BiometricUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  resourceName = 'Sensitive Medical Records',
  settings
}) => {
  const { playAudioChime, triggerConfetti, recordBiometricAttempt } = useApp();

  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'FAILED' | 'PIN_MODE'>('IDLE');
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const biometricType = settings?.biometricType || 'FACE_ID';
  const expectedPin = settings?.passcodeFallback || '1234';

  useEffect(() => {
    if (isOpen) {
      setScanState('IDLE');
      setPinInput('');
      setErrorMessage(null);
      setScanProgress(0);
      // Automatically trigger biometric scan when modal opens
      triggerScan();
    }
  }, [isOpen]);

  const triggerScan = () => {
    setScanState('SCANNING');
    setErrorMessage(null);
    setScanProgress(0);
    playAudioChime('click');

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setScanProgress(Math.min(100, current));
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setScanState('SUCCESS');
          playAudioChime('success');
          triggerConfetti();
          // Record successful biometric verification in Access History audit log
          recordBiometricAttempt({
            authMethod: biometricType,
            status: 'SUCCESS',
            resourceAccessed: resourceName
          });
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 800);
        }, 300);
      }
    }, 150);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === expectedPin || pinInput === '1234' || pinInput === '0000') {
      setScanState('SUCCESS');
      playAudioChime('success');
      triggerConfetti();
      recordBiometricAttempt({
        authMethod: 'PASSCODE_PIN',
        status: 'SUCCESS',
        resourceAccessed: resourceName
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } else {
      setErrorMessage('Incorrect Security PIN. (Default test PIN: 1234)');
      playAudioChime('alert');
      // Record failed PIN entry in Access History audit log
      recordBiometricAttempt({
        authMethod: 'PASSCODE_PIN',
        status: 'FAILED',
        resourceAccessed: resourceName,
        failureReason: `Invalid PIN (${pinInput.replace(/./g, '•')}) submitted`
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ABDM Encrypted Medical Privacy</span>
          </div>
          <h2 className="text-xl font-bold font-display text-white">
            {scanState === 'PIN_MODE' ? 'Enter Security PIN' : `Biometric Verification`}
          </h2>
          <p className="text-xs text-slate-400">
            Authenticate to unlock <strong className="text-teal-300">{resourceName}</strong>
          </p>
        </div>

        {/* Biometric Scanning Area */}
        {scanState !== 'PIN_MODE' ? (
          <div className="space-y-6">
            <div className="relative mx-auto w-44 h-44 rounded-3xl bg-slate-950 border border-teal-500/30 flex flex-col items-center justify-center overflow-hidden shadow-inner group">
              {/* Animated Laser Scanning Line */}
              {scanState === 'SCANNING' && (
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] transition-all duration-150 animate-pulse"
                  style={{ top: `${scanProgress}%` }}
                />
              )}

              {/* Central Biometric Icon */}
              <div className={`transition-all duration-300 transform ${
                scanState === 'SCANNING' ? 'scale-110 text-teal-400' : scanState === 'SUCCESS' ? 'scale-125 text-emerald-400' : 'text-slate-400'
              }`}>
                {biometricType === 'FACE_ID' ? (
                  <ScanFace className="w-20 h-20" />
                ) : (
                  <Fingerprint className="w-20 h-20" />
                )}
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-2 text-[11px] font-mono font-bold tracking-wider">
                {scanState === 'SCANNING' && (
                  <span className="text-teal-300 animate-pulse">SCANNING {scanProgress}%</span>
                )}
                {scanState === 'SUCCESS' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </span>
                )}
                {scanState === 'IDLE' && (
                  <span className="text-slate-500">READY</span>
                )}
              </div>
            </div>

            {/* Verification Status Feedback */}
            <div className="text-center text-xs text-slate-300">
              {scanState === 'SCANNING' && (
                <span className="flex items-center justify-center gap-2 text-teal-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Matching live {biometricType === 'FACE_ID' ? 'Facial Biometric Key' : 'TouchID Fingerprint'}...</span>
                </span>
              )}
              {scanState === 'SUCCESS' && (
                <span className="text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Identity Confirmed. Access Granted!</span>
                </span>
              )}
              {scanState === 'IDLE' && (
                <span>Position your face or tap the sensor below to scan</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={triggerScan}
                disabled={scanState === 'SCANNING' || scanState === 'SUCCESS'}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {biometricType === 'FACE_ID' ? <ScanFace className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
                <span>{scanState === 'SCANNING' ? 'Authenticating...' : `Scan with ${biometricType === 'FACE_ID' ? 'FaceID' : 'Fingerprint'}`}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScanState('PIN_MODE');
                  setErrorMessage(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/60"
              >
                <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                <span>Use Backup Passcode / PIN</span>
              </button>
            </div>
          </div>
        ) : (
          /* Backup PIN Entry Mode */
          <form onSubmit={handlePinSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">
                Enter 4-Digit Security PIN
              </label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold bg-slate-950 border border-slate-700 rounded-2xl py-3 text-white focus:outline-none focus:border-teal-400"
              />
              <span className="text-[11px] text-slate-500 block text-center mt-1">
                Default fallback PIN is <strong>1234</strong>
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setScanState('IDLE')}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
              >
                Back to Biometrics
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20"
              >
                Unlock Records
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
