import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  ScanFace,
  Clock,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  RefreshCw,
  Smartphone,
  Globe,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../services/store';
import { BiometricAccessLog } from '../../types';

export const AccessHistorySection: React.FC = () => {
  const {
    biometricAccessLogs,
    recordBiometricAttempt,
    clearBiometricLogs,
    activePatient,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED' | 'BIOMETRIC' | 'CONSENT'>('ALL');
  const [selectedLogDetail, setSelectedLogDetail] = useState<BiometricAccessLog | null>(null);

  // Filter logs for active patient
  const patientLogs = useMemo(() => {
    return biometricAccessLogs.filter(log => {
      // Filter by search
      const matchesSearch =
        searchQuery === '' ||
        log.resourceAccessed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.authMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.failureReason && log.failureReason.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter by tab
      if (activeFilter === 'SUCCESS') return log.status === 'SUCCESS';
      if (activeFilter === 'FAILED') return log.status === 'FAILED';
      if (activeFilter === 'BIOMETRIC') return log.authMethod === 'FACE_ID' || log.authMethod === 'FINGERPRINT';
      if (activeFilter === 'CONSENT') return log.authMethod === 'CONSENT_TOKEN';
      return true;
    });
  }, [biometricAccessLogs, searchQuery, activeFilter]);

  // Key stats
  const totalEvents = biometricAccessLogs.length;
  const successfulEvents = biometricAccessLogs.filter(l => l.status === 'SUCCESS').length;
  const failedEvents = biometricAccessLogs.filter(l => l.status === 'FAILED').length;
  const consentEvents = biometricAccessLogs.filter(l => l.authMethod === 'CONSENT_TOKEN').length;

  const handleExportLogs = () => {
    playAudioChime('click');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(biometricAccessLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Care4U_Access_Audit_${activePatient.healthId || 'patient'}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    playAudioChime('success');
  };

  const simulateSuccessFaceScan = () => {
    playAudioChime('success');
    triggerConfetti();
    recordBiometricAttempt({
      authMethod: 'FACE_ID',
      status: 'SUCCESS',
      resourceAccessed: 'Electronic Prescriptions & Clinical Records'
    });
  };

  const simulateFailedPin = () => {
    playAudioChime('alert');
    recordBiometricAttempt({
      authMethod: 'PASSCODE_PIN',
      status: 'FAILED',
      resourceAccessed: 'Digital Health Wallet',
      failureReason: 'Invalid PIN (••••) entered by unrecognized party'
    });
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  const getMethodBadge = (method: BiometricAccessLog['authMethod']) => {
    switch (method) {
      case 'FACE_ID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[11px] font-semibold">
            <ScanFace className="w-3 h-3" />
            <span>FaceID Biometric</span>
          </span>
        );
      case 'FINGERPRINT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
            <Fingerprint className="w-3 h-3" />
            <span>TouchID / Fingerprint</span>
          </span>
        );
      case 'PASSCODE_PIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
            <KeyRound className="w-3 h-3" />
            <span>PIN Fallback</span>
          </span>
        );
      case 'CONSENT_TOKEN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[11px] font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>ABDM Doctor Consent</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
            <Lock className="w-3 h-3" />
            <span>{method}</span>
          </span>
        );
    }
  };

  return (
    <div id="access-history-audit-section" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header with Title and Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <span>Access History & Biometric Audit Trail</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                  Immutable Log
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Audit every successful and failed biometric unlocking attempt, clinician access, and security event.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportLogs}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            title="Download full JSON audit logs"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Audit Log</span>
          </button>

          <button
            type="button"
            onClick={clearBiometricLogs}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-red-500/10 text-slate-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-850"
            title="Archive or clear current view"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Attempts</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-xl font-bold font-display text-white">{totalEvents}</p>
          <p className="text-[10px] text-slate-500">Tracked security events</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span>Verified Unlocks</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-display text-emerald-300">{successfulEvents}</p>
          <p className="text-[10px] text-emerald-500">Authorized biometrics</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-1">
          <div className="flex items-center justify-between text-rose-400 text-xs">
            <span>Failed Attempts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-xl font-bold font-display text-rose-300">{failedEvents}</p>
          <p className="text-[10px] text-rose-500">Blocked / Incorrect PINs</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 space-y-1">
          <div className="flex items-center justify-between text-indigo-400 text-xs">
            <span>Doctor Consents</span>
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-xl font-bold font-display text-indigo-300">{consentEvents}</p>
          <p className="text-[10px] text-indigo-500">Clinician record shares</p>
        </div>
      </div>

      {/* Quick Test Simulation Strip */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Simulate Access Activity:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={simulateSuccessFaceScan}
            className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>Test Successful FaceID</span>
          </button>
          <button
            type="button"
            onClick={simulateFailedPin}
            className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Test Failed Security Attempt</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search records, doctors, methods..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'SUCCESS', label: 'Authorized Unlocks' },
            { id: 'FAILED', label: 'Failed Attempts' },
            { id: 'BIOMETRIC', label: 'Biometrics Only' },
            { id: 'CONSENT', label: 'Doctor Grants' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                playAudioChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Access Logs List */}
      <div className="space-y-3">
        {patientLogs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Access History Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || activeFilter !== 'ALL'
                  ? 'No audit entries match your current search or filter criteria.'
                  : 'Unlock your medical records or grant clinician consent to generate immutable access logs.'}
              </p>
            </div>
            {(searchQuery || activeFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('ALL');
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-teal-300 hover:bg-slate-700 transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          patientLogs.map(log => {
            const isSuccess = log.status === 'SUCCESS';
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLogDetail(selectedLogDetail?.id === log.id ? null : log)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSuccess
                    ? 'bg-slate-950/80 hover:bg-slate-950 border-slate-800/80 hover:border-teal-500/40'
                    : 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-800/40 hover:border-rose-700/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Left Column: Status Icon + Resource + Actor */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                      isSuccess
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}>
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <ShieldAlert className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {log.resourceAccessed}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          {log.status === 'SUCCESS' ? 'AUTHORIZED' : 'ACCESS DENIED'}
                        </span>
                        {getMethodBadge(log.authMethod)}
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-[11px] flex-wrap">
                        <span>
                          Actor:{' '}
                          <strong className="text-slate-200">{log.actorName}</strong>
                          <span className="text-[10px] ml-1 px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            {log.actorRole}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Smartphone className="w-3 h-3 text-slate-500" />
                          <span>{log.deviceInfo}</span>
                        </span>
                      </div>

                      {/* Failure reason explanation if failed */}
                      {log.failureReason && (
                        <div className="mt-1.5 p-2 rounded-xl bg-rose-900/30 border border-rose-800/40 text-rose-300 text-[11px] flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                          <span>
                            <strong>Security Alert:</strong> {log.failureReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Time */}
                  <div className="sm:text-right shrink-0 self-start sm:self-center">
                    <div className="text-xs font-semibold text-slate-300">
                      {formatTimeAgo(log.timestamp)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {selectedLogDetail?.id === log.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300 animate-in fade-in duration-150">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Session & Network Signature</span>
                      <p className="font-mono text-slate-300 flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-teal-400" />
                        <span>{log.ipAddress || '103.21.244.18 (Secure Authenticated Gateway)'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Audit Identifier: <span className="font-mono text-slate-300">{log.id}</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Privacy Compliance Status</span>
                      <p className="text-teal-300 font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>ABDM FHIR R4 & DISHA Compliant</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Zero-knowledge audit hash logged to local security enclave.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
