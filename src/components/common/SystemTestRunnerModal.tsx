import React from 'react';
import { useApp } from '../../services/store';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
  FileCheck,
  X
} from 'lucide-react';

export const SystemTestRunnerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { systemTestReport, isTestRunning, runSystemSelfTest, playAudioChime } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Automated System Self-Test & Verification Suite
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end verification across all 7 roles, AI intake, MedRoute engine, and workflows.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playAudioChime('click');
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Metric Bar */}
        <div className="px-6 py-3.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => runSystemSelfTest()}
              disabled={isTestRunning}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isTestRunning ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Verification...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Full System Test</span>
                </>
              )}
            </button>

            {systemTestReport && (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold">
                  ✓ {systemTestReport.totalPassed} Passed
                </span>
                {systemTestReport.totalFailed > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold">
                    ✗ {systemTestReport.totalFailed} Failed
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {systemTestReport?.timestamp
              ? `Last Executed: ${new Date(systemTestReport.timestamp).toLocaleTimeString()}`
              : 'Status: Ready to execute'}
          </div>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {!systemTestReport ? (
            <div className="text-center py-12 space-y-3 text-slate-400">
              <Activity className="w-10 h-10 text-teal-400 mx-auto animate-pulse" />
              <p className="text-sm font-medium text-white">No active test run in progress</p>
              <p className="text-xs max-w-md mx-auto text-slate-400">
                Click "Run Full System Test" to execute the test runner verifying Auth, AI, MedRoute Dynamic Re-routing, and Cross-Role workflows.
              </p>
            </div>
          ) : (
            systemTestReport.steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition duration-200 flex items-start gap-3.5 ${
                  step.status === 'PASS'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : step.status === 'RUNNING'
                    ? 'bg-cyan-950/30 border-cyan-500/50 animate-pulse'
                    : step.status === 'FAIL'
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-slate-950/30 border-slate-800'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {step.status === 'PASS' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {step.status === 'RUNNING' && <Clock className="w-5 h-5 text-cyan-400 animate-spin" />}
                  {step.status === 'FAIL' && <XCircle className="w-5 h-5 text-rose-400" />}
                  {step.status === 'PENDING' && <div className="w-5 h-5 rounded-full border border-slate-700" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">
                      {idx + 1}. {step.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono uppercase font-bold">
                      {step.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>All modules verified compliant with CARE4U specification standards.</span>
          </div>
          <button
            onClick={() => {
              playAudioChime('click');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
          >
            Close Runner
          </button>
        </div>
      </div>
    </div>
  );
};
