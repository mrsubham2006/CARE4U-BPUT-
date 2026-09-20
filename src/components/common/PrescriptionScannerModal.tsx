import React, { useState } from 'react';
import { useApp } from '../../services/store';
import { OCRScanResult } from '../../types';
import {
  FileSearch,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';

interface PrescriptionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionScannerModal: React.FC<PrescriptionScannerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { runPrescriptionOCR, uploadDocument, playAudioChime, triggerConfetti } = useApp();

  const [selectedFile, setSelectedFile] = useState<string>('sample_prescription_dr_kulkarni.jpg');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<OCRScanResult | null>(null);
  const [verifiedMedicines, setVerifiedMedicines] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleScan = async () => {
    setIsScanning(true);
    playAudioChime('click');
    const res = await runPrescriptionOCR(selectedFile);
    setScanResult(res);
    setVerifiedMedicines(res.extractedMedicines);
    setIsScanning(false);
    playAudioChime('success');
  };

  const handleConfirmAndSaveToWallet = async () => {
    if (!scanResult) return;
    await uploadDocument({
      patientId: 'pat-1',
      title: `OCR Verified Rx - ${scanResult.extractedDoctor}`,
      recordType: 'PRESCRIPTION',
      facilityName: scanResult.extractedFacility,
      doctorName: scanResult.extractedDoctor,
      recordDate: scanResult.extractedDate,
      fileSize: '1.8 MB',
      tags: ['OCR_DIGITIZED', 'VERIFIED_BY_PATIENT', 'ANTIBIOTIC']
    });
    playAudioChime('success');
    triggerConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-teal-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Document AI Prescription Scanner & OCR Digitizer
              </h2>
              <p className="text-xs text-slate-400">
                Upload handwritten / printed doctor prescriptions • AI extracts medicines with confidence scores
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Upload / File selection box */}
          {!scanResult && (
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center space-y-4 bg-slate-950/50">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Drop Prescription Image or PDF
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPEG, PNG, HEIC, and PDF documents (Max 15MB)
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isScanning ? 'Document AI Scanning...' : 'Scan Sample Prescription'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Scanned Results */}
          {scanResult && (
            <div className="space-y-5">
              {/* Top Meta info */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Doctor Identified</span>
                  <strong className="text-white text-xs">{scanResult.extractedDoctor}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Facility</span>
                  <span className="text-slate-300 text-xs">{scanResult.extractedFacility}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Date</span>
                  <span className="text-slate-300 text-xs">{scanResult.extractedDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Overall Confidence</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">{scanResult.confidenceScore}%</span>
                </div>
              </div>

              {/* Extracted Medicines list */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm">
                  Extracted Medication Regimen ({verifiedMedicines.length})
                </h3>

                <div className="space-y-2">
                  {verifiedMedicines.map((med, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        med.isUncertain
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm">{med.name}</strong>
                          {med.isUncertain ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Needs Patient Review ({med.confidence}%)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>High Confidence ({med.confidence}%)</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-slate-400 text-xs">
                          <span>Dosage: <strong className="text-slate-200">{med.dosage}</strong></span>
                          <span>•</span>
                          <span>Frequency: <strong className="text-teal-400">{med.frequency}</strong></span>
                          <span>•</span>
                          <span>Duration: <strong className="text-slate-200">{med.duration}</strong></span>
                        </div>
                      </div>

                      {med.isUncertain && (
                        <button
                          onClick={() => {
                            setVerifiedMedicines(prev =>
                              prev.map((m, i) => (i === idx ? { ...m, isUncertain: false } : m))
                            );
                            playAudioChime('click');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Reading</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          {scanResult && (
            <button
              onClick={handleConfirmAndSaveToWallet}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-lg shadow-teal-600/30 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Digitized Rx to Medical History Wallet</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
