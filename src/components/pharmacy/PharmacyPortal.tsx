import React, { useState } from 'react';
import { useApp } from '../../services/store';
import {
  Pill,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Minus,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export const PharmacyPortal: React.FC = () => {
  const {
    medicines,
    prescriptions,
    dispensePrescription,
    updateMedicineStock,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [selectedRxId, setSelectedRxId] = useState<string>(prescriptions[0]?.id || '');
  const selectedRx = prescriptions.find(p => p.id === selectedRxId) || prescriptions[0];

  const handleDispense = (rxId: string) => {
    playAudioChime('click');
    dispensePrescription(rxId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Pharmacy Header Bar */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-teal-950/60 border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xl">
            💊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/40">
                PHARMACY & DISPENSARY PORTAL
              </span>
              <span className="text-xs text-slate-400">District Health Centre (DHC)</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white mt-1">
              E-Prescription & Inventory Management
            </h1>
            <p className="text-xs text-slate-300">
              Closed-Loop Medication Dispensing & Automated Stockout Safeguards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
            <Pill className="w-4 h-4" />
            <span>{prescriptions.filter(p => p.status === 'PENDING').length} Pending Rx</span>
          </span>
        </div>
      </div>

      {/* Main Pharmacy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Incoming e-Prescriptions Queue */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>e-Prescription Queue</span>
              </h3>
              <span className="text-xs text-amber-300 font-mono font-bold">
                {prescriptions.length} Orders
              </span>
            </div>

            <div className="space-y-2.5">
              {prescriptions.map(rx => {
                const isSelected = rx.id === selectedRxId;
                const isDispensed = rx.status === 'DISPENSED';
                return (
                  <div
                    key={rx.id}
                    onClick={() => {
                      playAudioChime('click');
                      setSelectedRxId(rx.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/50 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-amber-300">{rx.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDispensed
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {rx.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{rx.patientName}</h4>
                    <p className="text-xs text-slate-400">Prescribed by {rx.doctorName}</p>

                    <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span>{rx.items.length} Medicines</span>
                      <span className="font-mono text-teal-300">
                        {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Selected Prescription Dispensing Panel */}
        <div className="space-y-6">
          {selectedRx ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400">{selectedRx.id}</span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{selectedRx.patientName}</h2>
                  <p className="text-xs text-slate-400">Doctor: {selectedRx.doctorName}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                    selectedRx.status === 'DISPENSED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {selectedRx.status}
                </span>
              </div>

              {/* Medicines in Prescription */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Prescribed Items & Availability
                </span>

                {selectedRx.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{item.medicineName}</div>
                      <div className="text-slate-400 text-[11px]">{item.dosage} • {item.frequency}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-teal-300 font-bold">{item.quantity} Units</span>
                      <div className="text-[10px] text-emerald-400 font-mono">In Stock ✓</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dispense Action */}
              <button
                disabled={selectedRx.status === 'DISPENSED'}
                onClick={() => handleDispense(selectedRx.id)}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  selectedRx.status === 'DISPENSED'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                {selectedRx.status === 'DISPENSED' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Prescription Dispensed & Patient Notified ✓</span>
                  </>
                ) : (
                  <>
                    <Pill className="w-5 h-5" />
                    <span>Dispense Prescription & Update Inventory</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">Select a prescription to view details.</div>
          )}
        </div>

        {/* Right Column: Live Medicine Inventory */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-400" />
                <span>Live Medicine Inventory</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{medicines.length} Drugs</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {medicines.map(med => {
                const isOut = med.status === 'OUT_OF_STOCK';
                const isLow = med.status === 'LOW_STOCK';

                return (
                  <div
                    key={med.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{med.name}</div>
                        <div className="text-[10px] text-slate-400">{med.category}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {med.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-slate-400 font-mono">
                      <span>Stock: <strong className="text-white">{med.stockCount}</strong></span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateMedicineStock(med.id, Math.max(0, med.stockCount - 10))}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateMedicineStock(med.id, med.stockCount + 50)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
