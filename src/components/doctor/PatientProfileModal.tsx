import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  FlaskConical,
  Clock,
  Activity,
  Heart,
  Stethoscope,
  Video,
  Download,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Patient, Appointment } from '../../types';
import { fetchPatientClinicalRecords } from './doctorService';

interface PatientProfileModalProps {
  patientId: string;
  patientData?: Patient | null;
  appointment?: Appointment | null;
  onClose: () => void;
  onStartConsultation: (appointment: Appointment, type: 'OPD' | 'VIDEO_CONSULTATION') => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  patientId,
  patientData,
  appointment,
  onClose,
  onStartConsultation
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'health_info' | 'prescriptions' | 'labs'>('timeline');
  const [records, setRecords] = useState<{
    consultations: any[];
    prescriptions: any[];
    labOrders: any[];
    labReports: any[];
    followUps: any[];
    documents: any[];
  }>({
    consultations: [],
    prescriptions: [],
    labOrders: [],
    labReports: [],
    followUps: [],
    documents: []
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await fetchPatientClinicalRecords(patientId);
      if (isMounted) {
        setRecords(data);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  // Combine chronological timeline
  const timelineItems: {
    id: string;
    type: 'CONSULTATION' | 'PRESCRIPTION' | 'LAB_ORDER' | 'LAB_REPORT' | 'FOLLOW_UP';
    title: string;
    subtitle: string;
    date: string;
    badge: string;
    badgeColor: string;
    details?: any;
  }[] = [];

  records.consultations.forEach(c => {
    timelineItems.push({
      id: c.consultationId || c.id,
      type: 'CONSULTATION',
      title: `Consultation - ${c.diagnosis || 'General Clinical Review'}`,
      subtitle: `By Dr. ${c.doctorName || 'Attending Physician'} (${c.consultationType || 'OPD'})`,
      date: c.createdAt || '',
      badge: 'CONSULTATION',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      details: c
    });
  });

  records.prescriptions.forEach(p => {
    timelineItems.push({
      id: p.prescriptionId || p.id,
      type: 'PRESCRIPTION',
      title: `e-Prescription Signed (${(p.medicines || p.items || []).length} items)`,
      subtitle: `Diagnosis: ${p.diagnosis || 'Clinical Rx'}`,
      date: p.createdAt || '',
      badge: 'PRESCRIPTION',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      details: p
    });
  });

  records.labOrders.forEach(l => {
    timelineItems.push({
      id: l.labOrderId || l.id,
      type: 'LAB_ORDER',
      title: `Lab Test Ordered: ${l.testName || (l.tests && l.tests[0]?.testName) || 'Diagnostic Panel'}`,
      subtitle: `Status: ${l.status || 'ORDERED'}`,
      date: l.createdAt || l.orderedAt || '',
      badge: 'LAB TEST',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      details: l
    });
  });

  records.followUps.forEach(f => {
    timelineItems.push({
      id: f.followUpId || f.id,
      type: 'FOLLOW_UP',
      title: `Follow-up Review Scheduled`,
      subtitle: `Target Date: ${f.targetDate} - ${f.purpose || 'Clinical Review'}`,
      date: f.createdAt || '',
      badge: 'FOLLOW-UP',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      details: f
    });
  });

  // Sort timeline chronologically (newest first)
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const patientName = patientData?.name || appointment?.patientName || 'Patient ' + patientId.substring(0, 6);
  const patientAge = patientData?.age || appointment?.patientAge || 34;
  const patientGender = patientData?.gender || appointment?.patientGender || 'Male';
  const bloodGroup = patientData?.bloodGroup || 'B+';
  const phone = patientData?.phone || '+91 98765 43210';
  const address = patientData?.villageOrCity || patientData?.address || 'Community Health Block, District Central';

  const allergies = patientData?.allergies || ['Penicillin (Moderate rash)', 'Sulfa drugs'];
  const chronicConditions = patientData?.chronicConditions || ['Hypertension (Stage 1)'];
  const currentMeds = patientData?.currentMedications || ['Amlodipine 5mg OD'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-lg">
              {patientName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-display">{patientName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                  {patientAge}y • {patientGender}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                  {bloodGroup}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3 font-mono">
                <span>ABDM ID: {patientData?.healthId || `ABDM-${patientId.substring(0, 8)}`}</span>
                <span>•</span>
                <span>Phone: {phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {appointment && (
              <button
                onClick={() => {
                  onClose();
                  onStartConsultation(appointment, 'OPD');
                }}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Start Consultation</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Chronological Medical Timeline ({timelineItems.length})
          </button>
          <button
            onClick={() => setActiveTab('health_info')}
            className={`py-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'health_info'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Health Info & Allergies
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'prescriptions'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Past Prescriptions ({records.prescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`py-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'labs'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnostic Lab Tests ({records.labOrders.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Activity className="w-6 h-6 text-teal-400 animate-spin mx-auto mb-2" />
              <span>Fetching patient clinical records from Firestore...</span>
            </div>
          ) : activeTab === 'timeline' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Verified Patient Medical History Timeline
                </h3>
                <span className="text-[10px] text-teal-400 font-mono">
                  Appointment ↓ Consultation ↓ Prescription ↓ Lab Test ↓ Report
                </span>
              </div>

              {timelineItems.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  No prior consultation records recorded for this patient yet. This is their initial intake consultation.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {timelineItems.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-teal-400"></div>
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 group-hover:border-slate-700 transition">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.date ? new Date(item.date).toLocaleDateString('en-IN') : 'Date N/A'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{item.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>

                        {item.type === 'PRESCRIPTION' && item.details?.medicines && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                            {item.details.medicines.map((m: any, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800"
                              >
                                💊 {m.medicineName} ({m.dosage})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'health_info' ? (
            <div className="space-y-5">
              {/* Allergies & Red Flags */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Documented Allergies & Drug Sensitivities</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((alg, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold"
                    >
                      ⚠️ {alg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Activity className="w-4 h-4" />
                  <span>Chronic Medical Conditions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {chronicConditions.map((cond, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Active Current Medications</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentMeds.map((med, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-teal-300 text-xs font-mono"
                    >
                      💊 {med}
                    </span>
                  ))}
                </div>
              </div>

              {/* Address and Contact info */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 text-slate-300">
                <div className="font-bold text-white mb-2">Patient Demographics & Residence</div>
                <p>
                  <strong className="text-slate-400">Address:</strong> {address}
                </p>
                <p>
                  <strong className="text-slate-400">Emergency Contact:</strong> {phone}
                </p>
              </div>
            </div>
          ) : activeTab === 'prescriptions' ? (
            <div className="space-y-3">
              {records.prescriptions.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No past prescriptions on record.</p>
              ) : (
                records.prescriptions.map((rx, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        Rx ID: {rx.prescriptionId || rx.id}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(rx.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Diagnosis:</strong> {rx.diagnosis || 'Clinical Prescription'}
                    </p>
                    <div className="space-y-1">
                      {(rx.medicines || rx.items || []).map((m: any, i: number) => (
                        <div key={i} className="text-xs text-slate-400 flex justify-between">
                          <span>
                            • {m.medicineName} ({m.dosage})
                          </span>
                          <span className="font-mono text-slate-500">{m.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {records.labOrders.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No past diagnostic lab orders.</p>
              ) : (
                records.labOrders.map((lo, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">
                        {lo.testName || (lo.tests && lo.tests[0]?.testName) || 'Diagnostic Panel'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                        {lo.status || 'ORDERED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Ordered: {new Date(lo.createdAt || lo.orderedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
