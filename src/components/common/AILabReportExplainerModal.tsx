import React, { useState, useEffect } from 'react';
import { useApp } from '../../services/store';
import { LabOrder } from '../../types';
import {
  Sparkles,
  X,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface AILabReportExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  labOrder: LabOrder | null;
}

export const AILabReportExplainerModal: React.FC<AILabReportExplainerModalProps> = ({
  isOpen,
  onClose,
  labOrder
}) => {
  const { runAILabReportExplainer, playAudioChime } = useApp();
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && labOrder) {
      setIsLoading(true);
      runAILabReportExplainer(labOrder).then(text => {
        setExplanation(text);
        setIsLoading(false);
        playAudioChime('success');
      });
    }
  }, [isOpen, labOrder, runAILabReportExplainer, playAudioChime]);

  if (!isOpen || !labOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Clinical Lab Report Explainer
              </h2>
              <p className="text-xs text-slate-400">
                Patient-friendly explanations of medical lab parameters & questions to ask your doctor
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Test Meta Info */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Laboratory Test</span>
              <strong className="text-white text-sm">{labOrder.testName}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Patient</span>
              <span className="text-slate-200 font-semibold">{labOrder.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Status</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {labOrder.status}
              </span>
            </div>
          </div>

          {/* Observed Parameters */}
          {labOrder.reportValues && (
            <div className="space-y-2">
              <h3 className="font-bold text-white text-sm">Pathology Measured Values:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {labOrder.reportValues.map((val, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-white block">{val.parameter}</strong>
                      <span className="text-[11px] text-slate-400 font-mono">Ref: {val.referenceRange} {val.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-white block">
                        {val.value} {val.unit}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          val.flag === 'Normal' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {val.flag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation Content */}
          <div className="space-y-2">
            <h3 className="font-bold text-teal-300 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AI Clinical Breakdown:</span>
            </h3>

            {isLoading ? (
              <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-3 text-slate-400">
                <Activity className="w-5 h-5 animate-spin text-teal-400" />
                <span>Analyzing pathology parameters...</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-line text-xs font-sans">
                {explanation}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            For educational guidance. Consult your clinician for therapeutic adjustments.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
