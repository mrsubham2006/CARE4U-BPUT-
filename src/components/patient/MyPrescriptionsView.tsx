import React, { useState } from 'react';
import {
  Pill,
  Download,
  Share2,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../services/store';

interface MyPrescriptionsViewProps {
  onNavigateToMedicines: () => void;
}

export const MyPrescriptionsView: React.FC<MyPrescriptionsViewProps> = ({
  onNavigateToMedicines
}) => {
  const { prescriptions, activePatient, playAudioChime, triggerConfetti } = useApp();

  const [selectedRxId, setSelectedRxId] = useState<string | null>(null);

  const myPrescriptions = prescriptions.filter(
    p => p.patientId === activePatient.id || p.patientName === activePatient.name
  );

  const activeRx = selectedRxId
    ? myPrescriptions.find(p => p.id === selectedRxId) || myPrescriptions[0]
    : myPrescriptions[0];

  const handleDownloadRx = (rxId: string) => {
    playAudioChime('click');
    alert(`Digital E-Prescription ${rxId} with ABDM QR code downloaded (PDF).`);
  };

  const handleSharePharmacy = () => {
    playAudioChime('success');
    triggerConfetti();
    alert(`Prescription shared with District Health Centre Jan Aushadhi Pharmacy. Medicines flagged for express dispensing.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Digital E-Prescriptions & Rx Passes</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              Doctor Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Legally signed digital prescriptions with dosage regimens, stock availability, and Jan Aushadhi routing.
          </p>
        </div>

        <button
          onClick={onNavigateToMedicines}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all"
        >
          <Clock className="w-4 h-4" />
          <span>My Medication Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Prescriptions List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prescription Records ({myPrescriptions.length})</h2>
          {myPrescriptions.map(rx => (
            <button
              key={rx.id}
              onClick={() => setSelectedRxId(rx.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                activeRx?.id === rx.id
                  ? 'bg-slate-900 border-teal-500 shadow-xl shadow-teal-950/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{rx.doctorName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  {rx.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{rx.facilityName}</div>
              <div className="text-[10px] text-teal-400 mt-2 font-mono flex items-center justify-between">
                <span>{rx.items.length} Medicines</span>
                <span>{new Date(rx.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Digital Prescription Card (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeRx ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Rx Header with Hospital & Doctor Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">℞</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{activeRx.facilityName}</h3>
                      <div className="text-xs text-slate-400">Department of General Medicine & Pulmonology</div>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                  <div className="text-xs font-bold text-white">{activeRx.doctorName}</div>
                  <div className="text-[10px] text-teal-400">Registration #MCI-2016-8812</div>
                  <div className="text-[10px] text-slate-400">{new Date(activeRx.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Patient: </span>
                  <strong className="text-white">{activePatient.name}</strong> ({activePatient.age} Yrs / {activePatient.gender})
                </div>
                <div>
                  <span className="text-slate-400">Health ID: </span>
                  <strong className="text-teal-300 font-mono">{activePatient.healthId}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Blood Group: </span>
                  <strong className="text-rose-300 font-mono">{activePatient.bloodGroup}</strong>
                </div>
              </div>

              {/* Diagnosis / Notes */}
              {activeRx.notes && (
                <div className="p-3.5 rounded-2xl bg-teal-950/20 border border-teal-500/20 text-xs text-teal-200">
                  <strong className="text-teal-300">Clinical Diagnosis & Instructions: </strong>
                  {activeRx.notes}
                </div>
              )}

              {/* Medicines Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Prescribed Medications</h4>
                <div className="space-y-2">
                  {activeRx.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <Pill className="w-4 h-4 text-teal-400" />
                          <span>{item.medicineName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                            {item.dosage}
                          </span>
                        </div>
                        <div className="text-slate-300 text-xs">
                          Frequency: <strong className="text-teal-300">{item.frequency}</strong> • Instructions: <span className="text-slate-400">{item.instructions}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-200">Duration: {item.durationDays} Days</div>
                        <div className="text-[10px] text-slate-400">Total Qty: {item.quantity} Units</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Stamp & Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Digitally certified by CARE4U National Health Gateway</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSharePharmacy}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send to Pharmacy</span>
                  </button>

                  <button
                    onClick={() => handleDownloadRx(activeRx.id)}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-900/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl">
              No prescription selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
