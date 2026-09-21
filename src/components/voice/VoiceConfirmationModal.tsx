import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';
import { useVoice } from '../../services/voice/VoiceContext';

export const VoiceConfirmationModal: React.FC = () => {
  const { pendingConfirmation, confirmAction, cancelAction } = useVoice();

  if (!pendingConfirmation) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-teal-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-teal-950/50 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-amber-400">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-base font-bold text-white">
              {pendingConfirmation.title}
            </h3>
            <p className="text-xs text-amber-300/80">Consequential Healthcare Action</p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed">
          {pendingConfirmation.description}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Say: <strong className="text-teal-300 font-bold">"Yes"</strong> to confirm</span>
          <span>Say: <strong className="text-rose-300 font-bold">"Cancel"</strong> to abort</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={cancelAction}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>{pendingConfirmation.cancelLabel || 'Cancel (No)'}</span>
          </button>

          <button
            onClick={confirmAction}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4 font-black" />
            <span>{pendingConfirmation.confirmLabel || 'Confirm (Yes)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
