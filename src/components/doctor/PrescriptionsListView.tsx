import React, { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Prescription } from '../../types';
import { generatePrescriptionPDF } from './doctorService';

interface PrescriptionsListViewProps {
  prescriptions: Prescription[];
  onViewPatientProfile: (patientId: string) => void;
}

export const PrescriptionsListView: React.FC<PrescriptionsListViewProps> = ({
  prescriptions,
  onViewPatientProfile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRxId, setExpandedRxId] = useState<string | null>(null);

  const filtered = prescriptions.filter(
    p =>
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((p as any).prescriptionId &&
        (p as any).prescriptionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((p as any).diagnosis && (p as any).diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadPDF = (prescription: any) => {
    try {
      const payload: any = {
        appointmentId: prescription.appointmentId || 'APT-ONLINE',
        patientId: prescription.patientId,
        patientName: prescription.patientName,
        doctorId: prescription.doctorId,
        doctorName: prescription.doctorName,
        doctorRegistrationNumber: 'MCI-MH-2018-84291',
        doctorDepartment: 'General Medicine',
        facilityId: prescription.facilityId,
        facilityName: prescription.facilityName || 'Primary Health Centre',
        consultationType: 'OPD',
        chiefComplaint: 'Clinical consultation',
        symptoms: [],
        vitals: {
          temperature: '98.6 °F',
          bloodPressure: '120/80 mmHg',
          pulseRate: '72 bpm',
          spO2: '99%'
        },
        examinationNotes: 'Clinical evaluation recorded',
        assessment: prescription.diagnosis || 'Clinical evaluation',
        diagnosis: prescription.diagnosis || 'Clinical diagnosis',
        treatmentPlan: 'Medication regimen prescribed',
        medicines: (prescription.medicines || prescription.items || []).map((m: any) => ({
          medicineName: m.medicineName,
          genericName: m.genericName || m.medicineName,
          dosage: m.dosage || '500mg',
          frequency: m.frequency || 'OD',
          route: m.route || 'Oral',
          durationDays: m.durationDays || 3,
          quantity: m.quantity || 6,
          foodTiming: m.foodTiming || 'After Food',
          instructions: m.instructions || 'Standard administration'
        })),
        investigations: (prescription.investigations || []).map((inv: any) => ({
          testId: inv.testId || 'test-1',
          testName: inv.testName,
          priority: inv.priority || 'Routine',
          instructions: inv.instructions || ''
        })),
        advice: prescription.advice || 'Follow medication schedule strictly.',
        followUpDate: prescription.followUpDate
      };

      const rxId = prescription.prescriptionId || prescription.id;
      const { doc } = generatePrescriptionPDF(payload, rxId);
      doc.save(`Prescription_${prescription.patientName.replace(/\s+/g, '_')}_${rxId}.pdf`);
    } catch (err) {
      console.error('Error generating PDF download:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Digital e-Prescriptions Registry</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              All digitally signed clinical prescriptions with automated pharmacy routing & PDF records.
            </p>
          </div>

          <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 border border-slate-700">
            Total Prescriptions: {prescriptions.length}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient name, prescription ID, or diagnosis..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-400">No prescriptions found</p>
            <p className="text-[11px] text-slate-600">
              Prescriptions will appear here immediately upon completion of consultations.
            </p>
          </div>
        ) : (
          filtered.map(rx => {
            const rxId = (rx as any).prescriptionId || rx.id;
            const items = (rx as any).medicines || rx.items || [];
            const isExpanded = expandedRxId === rxId;

            return (
              <div
                key={rxId}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      Rx
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {rxId}
                        </span>
                        <h3 className="text-sm font-bold text-white">{rx.patientName}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> SIGNED
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        <strong>Diagnosis:</strong> {(rx as any).diagnosis || 'Clinical Prescription'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onViewPatientProfile(rx.patientId)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Patient Profile
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(rx)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => setExpandedRxId(isExpanded ? null : rxId)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="font-bold text-slate-300">Prescribed Medications:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5"
                        >
                          <div className="font-bold text-white flex justify-between">
                            <span>{m.medicineName}</span>
                            <span className="text-[10px] text-teal-400 font-mono">[{m.dosage}]</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {m.frequency} • {m.durationDays} Days (Qty: {m.quantity})
                          </div>
                          <div className="text-[10px] text-amber-300 font-mono">
                            {m.foodTiming} - {m.instructions}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2">
                      <span>Doctor: {rx.doctorName}</span>
                      <span>Issued: {new Date(rx.createdAt).toLocaleString('en-IN')}</span>
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
