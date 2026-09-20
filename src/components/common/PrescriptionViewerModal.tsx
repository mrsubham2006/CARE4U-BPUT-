import React from 'react';
import { useApp } from '../../services/store';
import { Prescription } from '../../types';
import {
  FileText,
  Printer,
  Download,
  X,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  HeartPulse
} from 'lucide-react';

interface PrescriptionViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

export const PrescriptionViewerModal: React.FC<PrescriptionViewerModalProps> = ({
  isOpen,
  onClose,
  prescription
}) => {
  const { playAudioChime } = useApp();

  if (!isOpen || !prescription) return null;

  const handlePrint = () => {
    playAudioChime('click');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:border-none print:shadow-none print:max-w-none print:max-h-none print:bg-white print:text-black">
        {/* Action Header (Hidden in Print) */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-4 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <FileText className="w-5 h-5 text-teal-400" />
            <span>Digital Medical Prescription & Verification</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Paper Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-900 text-slate-200 print:bg-white print:text-slate-950 space-y-6">
          {/* Hospital & Doctor Header */}
          <div className="pb-6 border-b-2 border-teal-500/40 print:border-teal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-6 h-6 text-teal-400 print:text-teal-700" />
                <h1 className="text-xl font-black text-white print:text-slate-950 tracking-tight">
                  {prescription.facilityName || 'CARE4U District Health Hospital'}
                </h1>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Department of Internal Medicine & Infectious Pyrexia • Sub-District Central
              </p>
              <p className="text-[11px] text-slate-500 print:text-slate-500 font-mono">
                Govt Reg # MH-DHC-88219 • 24x7 Casualty & Molecular Diagnostic Facility
              </p>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <h2 className="text-base font-bold text-teal-300 print:text-teal-900">
                {prescription.doctorName}
              </h2>
              <p className="text-xs text-slate-300 print:text-slate-700">MD (Medicine), MBBS</p>
              <p className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
                Reg No: <strong>MCI-2014-98712</strong>
              </p>
            </div>
          </div>

          {/* Patient Details Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-100 print:border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Patient Name</span>
              <strong className="text-white print:text-black">{prescription.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Rx ID / Token</span>
              <span className="font-mono text-teal-400 print:text-teal-800 font-bold">{prescription.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date & Time</span>
              <span className="text-slate-300 print:text-black">
                {new Date(prescription.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Dispense Status</span>
              <span className={`font-bold ${prescription.status === 'DISPENSED' ? 'text-emerald-400 print:text-emerald-700' : 'text-amber-400 print:text-amber-700'}`}>
                {prescription.status}
              </span>
            </div>
          </div>

          {/* Clinical Impression & Rx Symbol */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-serif font-black text-teal-400 print:text-teal-800">℞</span>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-teal-500/40 to-transparent print:bg-teal-700"></div>
            </div>

            {/* Prescribed Medicines Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600 text-[11px] uppercase">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">Medicine / Strength</th>
                    <th className="py-2.5 px-2">Dosage</th>
                    <th className="py-2.5 px-2">Frequency</th>
                    <th className="py-2.5 px-2">Duration</th>
                    <th className="py-2.5 px-2">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                  {prescription.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-3 px-2 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-2 font-bold text-white print:text-black">
                        {item.medicineName}
                      </td>
                      <td className="py-3 px-2 text-slate-300 print:text-slate-700">{item.dosage}</td>
                      <td className="py-3 px-2 text-teal-300 print:text-teal-800 font-medium">{item.frequency}</td>
                      <td className="py-3 px-2 text-slate-300 print:text-slate-700">{item.durationDays} Days</td>
                      <td className="py-3 px-2 font-mono text-slate-300 print:text-slate-700">{item.quantity} Tabs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions & Dietary Advice */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 print:bg-slate-50 print:border-slate-300 text-xs space-y-1.5">
            <h3 className="font-bold text-teal-300 print:text-teal-900">Physician's Special Instructions:</h3>
            <p className="text-slate-300 print:text-slate-700">
              1. Take antipyretics after meals with plenty of boiled drinking water.
              <br />
              2. Maintain strict rest and monitor body temperature twice daily.
              <br />
              3. Review CBC pathology report upon release; visit hospital casualty if breathing distress develops.
            </p>
          </div>

          {/* Footer: Digital Stamp, QR code & Verification */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center border border-slate-700 print:border-slate-300 shadow">
                <QrCode className="w-full h-full text-slate-950" />
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600 space-y-0.5">
                <span className="font-mono text-teal-400 print:text-teal-800 font-bold block">
                  DIGITALLY SIGNED & VERIFIED
                </span>
                <p>Scan to verify authenticity on CARE4U National Health Registry.</p>
                <p className="font-mono text-[10px]">SHA256: 7f8a92b1049281c8...</p>
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="inline-block px-4 py-1.5 rounded-lg border-2 border-dashed border-teal-500/60 print:border-teal-800 text-center">
                <span className="text-[10px] text-teal-400 print:text-teal-800 font-mono font-bold block uppercase tracking-wider">
                  ✓ Validated E-Signature Stamp
                </span>
                <strong className="text-xs text-white print:text-slate-950">
                  {prescription.doctorName}
                </strong>
              </div>
              <p className="text-[10px] text-slate-500 print:text-slate-500">
                Generated via CARE4U Secure Clinical Gateway
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
