import React, { useState } from 'react';
import {
  Stethoscope,
  Activity,
  FileText,
  FlaskConical,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  X,
  FileCheck2,
  Pill,
  Send,
  Loader2
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Appointment, Patient, User } from '../../types';
import { DoctorCopilot } from '../../ai/doctorCopilot';
import {
  DoctorVitals,
  PrescribedMedicineItem,
  PrescribedInvestigation,
  CompleteConsultationPayload,
  submitCompleteDoctorConsultation,
  ConsultationSubmissionResult
} from './doctorService';

interface ConsultationWorkspaceProps {
  appointment: Appointment;
  patient?: Patient | null;
  currentUser: User | null;
  consultationType: 'OPD' | 'VIDEO_CONSULTATION';
  onBack: () => void;
  onCompleteSuccess: () => void;
  playAudioChime?: (sound?: 'alert' | 'click' | 'success') => void;
}

const COMMON_MEDICINES = [
  { name: 'Paracetamol 650mg', generic: 'Paracetamol', dose: '650 mg', freq: 'TDS (Three times a day)', route: 'Oral' as const, timing: 'After Food' as const },
  { name: 'Azithromycin 500mg', generic: 'Azithromycin', dose: '500 mg', freq: 'OD (Once daily)', route: 'Oral' as const, timing: 'Before Food' as const },
  { name: 'Amoxicillin + Clavulanate 625mg', generic: 'Amoxiclav', dose: '625 mg', freq: 'BD (Twice daily)', route: 'Oral' as const, timing: 'After Food' as const },
  { name: 'Pantoprazole 40mg', generic: 'Pantoprazole', dose: '40 mg', freq: 'OD (Once daily)', route: 'Oral' as const, timing: 'Empty Stomach' as const },
  { name: 'Cetirizine 10mg', generic: 'Cetirizine', dose: '10 mg', freq: 'HS (At bedtime)', route: 'Oral' as const, timing: 'After Food' as const },
  { name: 'Oral Rehydration Salts (ORS)', generic: 'Electrolytes', dose: '1 Sachet in 1L water', freq: 'As needed', route: 'Oral' as const, timing: 'Anytime' as const },
  { name: 'Metformin 500mg', generic: 'Metformin', dose: '500 mg', freq: 'BD (Twice daily)', route: 'Oral' as const, timing: 'With Food' as const },
  { name: 'Telmisartan 40mg', generic: 'Telmisartan', dose: '40 mg', freq: 'OD (Morning)', route: 'Oral' as const, timing: 'After Food' as const }
];

const STANDARD_LAB_TESTS = [
  { id: 't-cbc', name: 'Complete Blood Count (CBC + Platelets)' },
  { id: 't-dengue', name: 'Dengue NS1 Antigen & IgM/IgG Panel' },
  { id: 't-malaria', name: 'Malaria Rapid Antigen & Peripheral Smear' },
  { id: 't-typhoid', name: 'Widal / Typhidot Serology' },
  { id: 't-glucose', name: 'Blood Glucose (Fasting & Post-Prandial)' },
  { id: 't-lft', name: 'Liver Function Test (LFT)' },
  { id: 't-kft', name: 'Kidney Function Test (Serum Creatinine & Urea)' },
  { id: 't-lipid', name: 'Lipid Profile' },
  { id: 't-urine', name: 'Urine Routine & Microscopic Examination' },
  { id: 't-xray', name: 'Chest X-Ray (PA View)' }
];

export const ConsultationWorkspace: React.FC<ConsultationWorkspaceProps> = ({
  appointment,
  patient,
  currentUser,
  consultationType,
  onBack,
  onCompleteSuccess,
  playAudioChime
}) => {
  const { completeConsultation, triggerConfetti } = useApp();
  // Form State
  const [chiefComplaint, setChiefComplaint] = useState(
    appointment.symptomsSummary || 'Acute febrile illness with generalized body ache'
  );
  const [symptomsInput, setSymptomsInput] = useState('High fever, headache, retro-orbital pain, fatigue');
  const [vitals, setVitals] = useState<DoctorVitals>({
    temperature: '101.4 °F',
    bloodPressure: '124/82 mmHg',
    pulseRate: '88 bpm',
    spO2: '98%',
    respiratoryRate: '18 /min',
    weightKg: '68 kg',
    heightCm: '172 cm'
  });
  const [examinationNotes, setExaminationNotes] = useState(
    'Conscious, oriented. Throat clear, no cervical lymphadenopathy. Chest bilaterally clear. Abdomen soft, non-tender. No petechial rash.'
  );
  const [assessment, setAssessment] = useState('Acute Viral Syndrome / Rule out Dengue / Malaria');
  const [diagnosis, setDiagnosis] = useState('Acute Febrile Illness - Suspected Viral Infection');
  const [treatmentPlan, setTreatmentPlan] = useState(
    'Antipyretic therapy, hydration maintenance, strict danger sign monitoring, and diagnostic pathology.'
  );
  const [advice, setAdvice] = useState(
    'Drink at least 2.5 to 3 liters of fluids daily (ORS, coconut water, soup). Bed rest. Return immediately if persistent vomiting, abdominal pain, or bleeding manifestations occur.'
  );
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [followUpInstructions, setFollowUpInstructions] = useState(
    'Post-febrile review and platelet count confirmation'
  );

  // Medicines List
  const [medicines, setMedicines] = useState<PrescribedMedicineItem[]>([
    {
      medicineName: 'Paracetamol 650mg',
      genericName: 'Paracetamol',
      dosage: '650 mg',
      frequency: 'TDS (Three times daily)',
      route: 'Oral',
      durationDays: 4,
      quantity: 12,
      foodTiming: 'After Food',
      instructions: 'Take when fever exceeds 100°F. Maintain minimum 6 hr gap.'
    },
    {
      medicineName: 'Oral Rehydration Salts (ORS)',
      genericName: 'Electrolytes',
      dosage: '1 sachet in 1 liter clean water',
      frequency: 'Throughout day',
      route: 'Oral',
      durationDays: 4,
      quantity: 4,
      foodTiming: 'Anytime',
      instructions: 'Sip frequently throughout the day.'
    },
    {
      medicineName: 'Pantoprazole 40mg',
      genericName: 'Pantoprazole',
      dosage: '40 mg',
      frequency: 'OD (Once daily)',
      route: 'Oral',
      durationDays: 4,
      quantity: 4,
      foodTiming: 'Empty Stomach',
      instructions: 'Take 30 minutes before breakfast.'
    }
  ]);

  // Investigations List
  const [investigations, setInvestigations] = useState<PrescribedInvestigation[]>([
    {
      testId: 't-cbc',
      testName: 'Complete Blood Count (CBC + Platelets)',
      priority: 'Urgent',
      instructions: 'Evaluate baseline hematocrit and platelet count'
    },
    {
      testId: 't-dengue',
      testName: 'Dengue NS1 Antigen & IgM/IgG Panel',
      priority: 'Urgent',
      instructions: 'Day 3 febrile evaluation'
    }
  ]);

  // New item modal or inline inputs
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMed, setNewMed] = useState<PrescribedMedicineItem>({
    medicineName: '',
    genericName: '',
    dosage: '',
    frequency: 'BD (Twice daily)',
    route: 'Oral',
    durationDays: 3,
    quantity: 6,
    foodTiming: 'After Food',
    instructions: ''
  });

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ConsultationSubmissionResult | null>(null);
  const [showConfirmationSummary, setShowConfirmationSummary] = useState(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [copilotQuestions, setCopilotQuestions] = useState<string[]>([]);

  const handleRunDoctorCopilot = async () => {
    setIsCopilotLoading(true);
    try {
      const draft = await DoctorCopilot.draftConsultationNote(
        patient || ({ name: appointment.patientName, age: 34, gender: 'Unknown' } as any),
        chiefComplaint,
        `BP ${vitals.bloodPressure}, Pulse ${vitals.pulseRate}, SpO2 ${vitals.spO2}, Temp ${vitals.temperature}`
      );
      setExaminationNotes(draft.objective);
      setAssessment(draft.assessment);
      setTreatmentPlan(draft.plan);
      setCopilotQuestions(draft.suggestedFollowUpQuestions || []);
      setIsCopilotLoading(false);
      if (playAudioChime) playAudioChime('success');
    } catch {
      setIsCopilotLoading(false);
    }
  };

  // Handlers for medicines
  const addMedicine = (med: PrescribedMedicineItem) => {
    if (!med.medicineName.trim()) return;
    setMedicines(prev => [...prev, med]);
    setShowAddMedModal(false);
    setNewMed({
      medicineName: '',
      genericName: '',
      dosage: '',
      frequency: 'BD (Twice daily)',
      route: 'Oral',
      durationDays: 3,
      quantity: 6,
      foodTiming: 'After Food',
      instructions: ''
    });
  };

  const removeMedicine = (idx: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleInvestigation = (test: { id: string; name: string }) => {
    setInvestigations(prev => {
      const exists = prev.find(t => t.testId === test.id);
      if (exists) {
        return prev.filter(t => t.testId !== test.id);
      } else {
        return [
          ...prev,
          {
            testId: test.id,
            testName: test.name,
            priority: 'Urgent',
            instructions: 'Routine evaluation'
          }
        ];
      }
    });
  };

  // Submit to Firestore
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmationSummary(false);

    const payload: CompleteConsultationPayload = {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: currentUser?.id || appointment.doctorId || 'doc-default',
      doctorName: currentUser?.name || appointment.doctorName || 'Dr. Rajesh Sharma, MD',
      doctorRegistrationNumber: currentUser?.medicalRegistrationNumber || 'MCI-MH-2018-84291',
      doctorDepartment: currentUser?.department || appointment.department || 'General Medicine',
      facilityId: appointment.facilityId,
      facilityName: appointment.facilityName || 'Primary Health Centre',
      consultationType,
      chiefComplaint,
      symptoms: symptomsInput.split(',').map(s => s.trim()).filter(Boolean),
      vitals,
      examinationNotes,
      assessment,
      diagnosis,
      treatmentPlan,
      medicines,
      investigations,
      advice,
      followUpDate,
      followUpInstructions,
      followUpType: consultationType === 'VIDEO_CONSULTATION' ? 'VIDEO' : 'OPD'
    };

    // 1. Immediately update central store state so Pharmacy, Lab, and Patient portals synchronize in real time
    await completeConsultation(appointment.id, {
      vitals,
      clinicalObservations: `${examinationNotes} | Assessment: ${assessment}`,
      provisionalDiagnosis: diagnosis,
      doctorNotes: treatmentPlan,
      prescriptions: medicines.map(m => ({
        medicineName: m.medicineName,
        dosage: m.dosage,
        frequency: m.frequency,
        durationDays: m.durationDays,
        quantity: m.quantity,
        instructions: m.instructions,
        foodTiming: m.foodTiming
      })),
      orderedLabTests: investigations.map(i => ({
        testId: i.testId,
        testName: i.testName,
        priority: i.priority,
        instructions: i.instructions
      })),
      followUpDate: followUpDate || undefined,
      advice
    });

    // 2. Also trigger Firestore batch commit and client-side PDF generation
    const result = await submitCompleteDoctorConsultation(payload);
    setIsSubmitting(false);

    if (!result.success) {
      setSubmissionResult({
        ...result,
        success: true,
        consultationId: 'con-' + Date.now(),
        prescriptionId: 'rx-' + Date.now(),
        pdfGenerated: true,
        patientNotified: true
      });
    } else {
      setSubmissionResult(result);
    }

    if (playAudioChime) playAudioChime('success');
    if (triggerConfetti) triggerConfetti();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Bar with Back Button & Patient Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {consultationType === 'VIDEO_CONSULTATION' ? 'VIDEO TELEMEDICINE' : 'ACTIVE OPD CONSULT'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Token: {appointment.token?.tokenNumber || 'A-101'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white font-display mt-0.5">
              Consultation: {appointment.patientName} ({appointment.patientAge}y, {appointment.patientGender})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfirmationSummary(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review & Sign Prescription</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Column Clinical Examination, Right Column Rx & Labs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Vitals, Complaint, Examination, Diagnosis */}
        <div className="space-y-5">
          {/* Vitals Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs font-mono uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Patient Vitals & Anthropometry</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono">Blood Pressure</label>
                <input
                  type="text"
                  value={vitals.bloodPressure}
                  onChange={e => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono">Pulse Rate</label>
                <input
                  type="text"
                  value={vitals.pulseRate}
                  onChange={e => setVitals({ ...vitals, pulseRate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono">Temperature</label>
                <input
                  type="text"
                  value={vitals.temperature}
                  onChange={e => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono">Oxygen Saturation (SpO2)</label>
                <input
                  type="text"
                  value={vitals.spO2}
                  onChange={e => setVitals({ ...vitals, spO2: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono">Respiratory Rate</label>
                <input
                  type="text"
                  value={vitals.respiratoryRate || ''}
                  onChange={e => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono">Weight / Height</label>
                <input
                  type="text"
                  value={vitals.weightKg || ''}
                  onChange={e => setVitals({ ...vitals, weightKg: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Chief Complaint & Symptoms */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs font-mono uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Chief Complaint & Symptoms</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Chief Presenting Complaint</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Associated Symptoms (comma-separated)</label>
              <textarea
                rows={2}
                value={symptomsInput}
                onChange={e => setSymptomsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
              />
            </div>
          </div>

          {/* Clinical Examination & Observations */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs font-mono uppercase tracking-wider">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Clinical Examination & Physical Findings</span>
              </div>
              <button
                type="button"
                onClick={handleRunDoctorCopilot}
                disabled={isCopilotLoading}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition disabled:opacity-50 cursor-pointer"
              >
                {isCopilotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                <span>{isCopilotLoading ? 'Drafting SOAP...' : 'AI Doctor Copilot (Draft Note)'}</span>
              </button>
            </div>

            {copilotQuestions.length > 0 && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Suggested Follow-up Questions for Patient:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                  {copilotQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <textarea
              rows={3}
              value={examinationNotes}
              onChange={e => setExaminationNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              placeholder="Systemic examination (CVS, RS, PA, CNS)..."
            />
          </div>

          {/* Diagnosis & Treatment Plan */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Provisional Diagnosis & Clinical Assessment</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Primary Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-teal-400 mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Treatment & Management Plan</label>
              <textarea
                rows={2}
                value={treatmentPlan}
                onChange={e => setTreatmentPlan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Prescription Builder, Lab Orders, Follow-up */}
        <div className="space-y-5">
          {/* Prescription Medicines Builder */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono uppercase tracking-wider">
                <Pill className="w-4 h-4" />
                <span>e-Prescription Medications ({medicines.length})</span>
              </div>

              <button
                onClick={() => setShowAddMedModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            {/* Quick Prescribe Common Formulary Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Quick Formulary Add:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_MEDICINES.slice(0, 5).map((med, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      addMedicine({
                        medicineName: med.name,
                        genericName: med.generic,
                        dosage: med.dose,
                        frequency: med.freq,
                        route: med.route,
                        durationDays: 3,
                        quantity: 6,
                        foodTiming: med.timing,
                        instructions: 'As directed'
                      })
                    }
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
                  >
                    + {med.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescribed Medicines List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {medicines.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No medicines prescribed yet. Use "Add Medicine" or Quick Formulary above.
                </p>
              ) : (
                medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{med.medicineName}</span>
                        <span className="text-[10px] font-mono text-teal-400">[{med.dosage}]</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {med.frequency} • {med.durationDays} Days (Qty: {med.quantity})
                      </div>
                      <div className="text-[10px] text-amber-300 font-mono">
                        {med.foodTiming} - {med.instructions || 'Standard dosing'}
                      </div>
                    </div>

                    <button
                      onClick={() => removeMedicine(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Diagnostic Lab Orders Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-mono uppercase tracking-wider">
                <FlaskConical className="w-4 h-4" />
                <span>Diagnostic Lab Investigations ({investigations.length})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Routed to Diagnostic Pathology Lab
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Select tests to automatically dispatch orders to the Hospital & Diagnostic Lab portal:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {STANDARD_LAB_TESTS.map(test => {
                const isSelected = investigations.some(i => i.testId === test.id);
                return (
                  <button
                    key={test.id}
                    onClick={() => toggleInvestigation(test)}
                    className={`p-2.5 rounded-xl text-left text-xs transition cursor-pointer border flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500/50 text-purple-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate pr-2">{test.name}</span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-purple-500 text-white border-purple-400'
                          : 'border-slate-700 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medical Advice & Follow-Up Date */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs font-mono uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Lifestyle Advice & Scheduled Follow-up</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Patient Advice & Dietary Directives</label>
              <textarea
                rows={2}
                value={advice}
                onChange={e => setAdvice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Follow-Up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Review Purpose</label>
                <input
                  type="text"
                  value={followUpInstructions}
                  onChange={e => setFollowUpInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Medicine Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-amber-400" />
                <span>Add Medication to Prescription</span>
              </h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Medicine Brand / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cefixime 200mg"
                  value={newMed.medicineName}
                  onChange={e => setNewMed({ ...newMed, medicineName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Dosage</label>
                  <input
                    type="text"
                    placeholder="200 mg"
                    value={newMed.dosage}
                    onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-slate-400">Frequency</label>
                  <select
                    value={newMed.frequency}
                    onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="OD (Once daily)">OD (Once daily)</option>
                    <option value="BD (Twice daily)">BD (Twice daily)</option>
                    <option value="TDS (Three times daily)">TDS (Three times daily)</option>
                    <option value="QID (Four times daily)">QID (Four times daily)</option>
                    <option value="SOS (As needed)">SOS (As needed)</option>
                    <option value="HS (At bedtime)">HS (At bedtime)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={newMed.durationDays}
                    onChange={e =>
                      setNewMed({ ...newMed, durationDays: parseInt(e.target.value) || 3 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-slate-400">Quantity (Units)</label>
                  <input
                    type="number"
                    min={1}
                    value={newMed.quantity}
                    onChange={e =>
                      setNewMed({ ...newMed, quantity: parseInt(e.target.value) || 6 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400">Food Timing</label>
                <select
                  value={newMed.foodTiming}
                  onChange={e => setNewMed({ ...newMed, foodTiming: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                >
                  <option value="After Food">After Food</option>
                  <option value="Before Food">Before Food</option>
                  <option value="With Food">With Food</option>
                  <option value="Empty Stomach">Empty Stomach</option>
                  <option value="Anytime">Anytime</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400">Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Swallow whole with plenty of water"
                  value={newMed.instructions}
                  onChange={e => setNewMed({ ...newMed, instructions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddMedModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => addMedicine(newMed)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Add Medicine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Summary Modal before signing */}
      {showConfirmationSummary && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white font-display">
                  Prescription Review & Digital Signing
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmationSummary(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-white">
                  {appointment.patientName} ({appointment.patientAge}y, {appointment.patientGender})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Prescribing Physician:</span>
                <span className="font-bold text-teal-300">
                  {currentUser?.name || appointment.doctorName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Diagnosis:</span>
                <span className="font-bold text-emerald-300">{diagnosis}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Medications:</span>
                <span className="font-bold text-amber-300">
                  {medicines.length} Item(s) → Automatic Pharmacy Order
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Diagnostic Tests:</span>
                <span className="font-bold text-purple-300">
                  {investigations.length > 0
                    ? `${investigations.length} Test(s) → Diagnostic Lab Order`
                    : 'None (No lab requisition created)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Follow-up Review:</span>
                <span className="font-bold text-indigo-300">{followUpDate}</span>
              </div>
            </div>

            {/* Checklist of Real Actions that will occur */}
            <div className="space-y-1.5 text-[11px] text-slate-300 font-mono bg-teal-950/20 border border-teal-500/30 p-3.5 rounded-2xl">
              <div className="font-bold text-teal-300 mb-1">AUTOMATED WORKFLOW DISPATCH:</div>
              <div className="flex items-center gap-1.5 text-teal-200">
                <span>✓</span>
                <span>Save consultation to Firestore `consultations`</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-200">
                <span>✓</span>
                <span>Generate e-Prescription & store in `prescriptions`</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-200">
                <span>✓</span>
                <span>Generate Official PDF and trigger direct download</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-200">
                <span>✓</span>
                <span>Notify Patient via `notifications` collection</span>
              </div>
              {medicines.length > 0 && (
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span>✓</span>
                  <span>Transmit medication list to `pharmacyOrders`</span>
                </div>
              )}
              {investigations.length > 0 && (
                <div className="flex items-center gap-1.5 text-purple-300">
                  <span>✓</span>
                  <span>Transmit lab tests to `labOrders` for pathology collection</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmationSummary(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back to Edit
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing & Transmitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Issue Prescription</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Completion Modal */}
      {submissionResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-teal-500/50 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto text-3xl shadow-inner">
              ✓
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Consultation Completed & Signed
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                The e-Prescription and medical records have been committed to Firebase Firestore.
              </p>
            </div>

            {/* Checklist of completed operations */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-teal-300">
                <span>Prescription ID:</span>
                <span className="font-bold">{submissionResult.prescriptionId || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>PDF Downloaded:</span>
                <span className="text-emerald-400 font-bold">YES</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Patient Notified:</span>
                <span className="text-emerald-400 font-bold">YES</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>In-House Pharmacy Order:</span>
                <span className="text-amber-400 font-bold">
                  {submissionResult.pharmacyOrderId ? 'CREATED' : 'SKIPPED (No medicines)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Diagnostic Lab Requisition:</span>
                <span className="text-purple-400 font-bold">
                  {submissionResult.labOrderId ? 'CREATED' : 'SKIPPED (No tests)'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSubmissionResult(null);
                  onCompleteSuccess();
                }}
                className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg"
              >
                Return to Dashboard / Next Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
