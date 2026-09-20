import React from 'react';
import { useApp } from '../../services/store';
import {
  Server,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface IntegrationDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationDashboardModal: React.FC<IntegrationDashboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const { integrations, testIntegrationConnection, playAudioChime } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Healthcare External API & Service Integration Registry
              </h2>
              <p className="text-xs text-slate-400">
                Live Status, Environment Credentials & Service Adapters
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

        {/* Integration List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map(item => (
              <div
                key={item.service}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.status}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.details}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {item.setupInstructions}
                  </span>
                  <button
                    onClick={async () => {
                      playAudioChime('click');
                      await testIntegrationConnection(item.service);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-[11px] transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ping Adapter</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>All API secrets remain server-side in accordance with HIPAA & ISO-27001 constraints.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};
