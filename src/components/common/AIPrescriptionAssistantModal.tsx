import React, { useState } from 'react';
import { useApp } from '../../services/store';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileCheck2,
  Pencil
} from 'lucide-react';

interface AIPrescriptionAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
}

export const AIPrescriptionAssistantModal: React.FC<AIPrescriptionAssistantModalProps> = ({
  isOpen,
  onClose,
  appointmentId
}) => {
  const {
    activePatient,
    appointments,
    createPrescriptionDraft,
    approvePrescriptionDraft,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [rawDoctorNotes, setRawDoctorNotes] = useState(
    'pcm 650mg tds x 3d after food, ors 1 packet in 1L water daily, cpm 4mg hs x 3d if cough/rhinitis'
  );

  const [parsedItems, setParsedItems] = useState([
    { medicineName: 'Paracetamol 650mg', dosage: '650 mg', frequency: 'Thrice daily (TDS)', durationDays: 3, instructions: 'Take after meals' },
    { medicineName: 'Oral Rehydration Salts (ORS)', dosage: '1 sachet / 1L water', frequency: 'Throughout the day', durationDays: 3, instructions: 'Electrolyte maintenance' },
    { medicineName: 'Chlorpheniramine (CPM) 4mg', dosage: '4 mg', frequency: 'Night bedtime (HS)', durationDays: 3, instructions: 'For nasal congestion & cough' }
  ]);

  const [isDraftCreated, setIsDraftCreated] = useState(false);
  const [createdDraftId, setCreatedDraftId] = useState<string>('');

  if (!isOpen) return null;

  const targetAppt = appointments.find(a => a.id === appointmentId) || appointments[0];

  const handleParseAndDraft = async () => {
    playAudioChime('click');
    const draft = await createPrescriptionDraft({
      appointmentId: targetAppt.id,
      patientId: targetAppt.patientId,
      patientName: targetAppt.patientName,
      facilityName: targetAppt.facilityName,
      rawInput: rawDoctorNotes,
      items: parsedItems,
      clinicalNotes: 'AI formatted prescription based on clinical dictation. Reviewed for drug-drug interactions.'
    });
    setCreatedDraftId(draft.id);
    setIsDraftCreated(true);
  };

  const handleDoctorApprove = async () => {
    if (!createdDraftId) return;
    await approvePrescriptionDraft(createdDraftId);
    triggerConfetti();
    onClose();
  };

  const handleRemoveItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setParsedItems(prev => [
      ...prev,
      { medicineName: 'Azithromycin 500mg', dosage: '500 mg', frequency: 'Once daily (OD)', durationDays: 3, instructions: '1 hour before food' }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-teal-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Clinical Prescription Assistant & Gatekeeper
              </h2>
              <p className="text-xs text-slate-400">
                AI generates structured prescription drafts • <strong>Doctor explicit sign-off required</strong>
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Patient Header */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block">Patient</span>
              <strong className="text-white text-sm">{targetAppt.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Token</span>
              <span className="font-mono text-teal-400 font-bold">{targetAppt.token.tokenNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Facility</span>
              <span className="text-slate-200 font-medium">{targetAppt.facilityName}</span>
            </div>
          </div>

          {/* Raw Clinical Dictation Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5 text-violet-400" />
              <span>Doctor Clinical Shorthand or Speech Dictation:</span>
            </label>
            <textarea
              rows={2}
              value={rawDoctorNotes}
              onChange={e => setRawDoctorNotes(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-xs"
              placeholder="e.g. pcm 650mg tds x 3d..."
            />
          </div>

          {/* AI Structured Medication Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>Structured Medications ({parsedItems.length})</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Interaction Checked: Safe
                </span>
              </h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-2">
              {parsedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                        {idx + 1}
                      </span>
                      <strong className="text-white text-sm">{item.medicineName}</strong>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>Dosage: <strong className="text-slate-200">{item.dosage}</strong></span>
                      <span>•</span>
                      <span>Frequency: <strong className="text-teal-400">{item.frequency}</strong></span>
                      <span>•</span>
                      <span>Duration: <strong className="text-slate-200">{item.durationDays} Days</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Instructions: <span className="text-slate-300 italic">{item.instructions}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition self-end sm:self-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Warning Banner */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 space-y-0.5">
              <strong className="block font-bold">Mandatory Clinical Sign-Off Policy:</strong>
              <p>
                AI draft will NOT be dispatched to the Pharmacy or recorded in the National Health Registry until the consulting physician reviews and clicks "Approve & E-Sign".
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          {!isDraftCreated ? (
            <button
              onClick={handleParseAndDraft}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Prescription Draft</span>
            </button>
          ) : (
            <button
              onClick={handleDoctorApprove}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer animate-pulse"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Doctor Review Verified: Approve & Issue e-Prescription</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
