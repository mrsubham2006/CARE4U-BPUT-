import React from 'react';
import { useApp } from '../../services/store';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Play,
  Zap,
  RotateCcw,
  Compass,
  Stethoscope,
  Building2,
  FlaskConical,
  Pill,
  Radio,
  UserCheck
} from 'lucide-react';

interface DemoTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoJourneyWalkthrough: React.FC<DemoTourProps> = ({ isOpen, onClose }) => {
  const {
    demoStep,
    goToDemoStep,
    currentUserRole,
    switchRole,
    runAIIntake,
    runTriageAssessment,
    computeMedRoute,
    bookAppointment,
    facilities,
    doctors,
    appointments,
    labOrders,
    prescriptions,
    completeConsultation,
    updateLabOrderStatus,
    dispensePrescription,
    updateFacilityCapacity,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const navigateStep = (stepNum: number) => {
    const targetTour = tourSteps.find(t => t.step === stepNum);
    if (targetTour && targetTour.role) {
      switchRole(targetTour.role as any);
    }
    goToDemoStep(stepNum);
  };

  if (!isOpen) return null;

  const tourSteps = [
    {
      step: 1,
      title: 'Step 1: Patient Conversational AI Intake',
      role: 'PATIENT',
      roleLabel: 'Patient App',
      icon: <UserCheck className="w-4 h-4 text-teal-400" />,
      desc: 'Rahul Kumar (24M, rural block) enters symptoms via voice/text in English, Hindi, or Marathi: "I have fever since yesterday and severe weakness."',
      actionLabel: 'Execute AI Intake Demo',
      autoAction: async () => {
        const intake = await runAIIntake('I have fever since yesterday and severe weakness with mild headache.', 'en');
        await runTriageAssessment(intake);
        computeMedRoute('General Medicine', false);
        navigateStep(2);
      }
    },
    {
      step: 2,
      title: 'Step 2: HealthAI Triage & Red-Flag Screening',
      role: 'PATIENT',
      roleLabel: 'Patient App',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      desc: 'HealthAI validates against red-flag emergencies (no breathing difficulty, alert sensorium) and assigns Priority: ROUTINE / SAME-DAY REVIEW to General Medicine.',
      actionLabel: 'View Triage & MedRoute Options',
      autoAction: async () => {
        computeMedRoute('General Medicine', false);
        navigateStep(3);
      }
    },
    {
      step: 3,
      title: 'Step 3: MedRoute AI Multi-Factor Recommendation',
      role: 'PATIENT',
      roleLabel: 'Patient App',
      icon: <Compass className="w-4 h-4 text-teal-400" />,
      desc: 'MedRoute ranks facilities using live doctor availability, queues, and diagnostics. Recommends District Health Centre (DHC) with transparent scoring.',
      actionLabel: 'Book Appointment & Issue Token A-027',
      autoAction: async () => {
        const targetFac = facilities.find(f => f.name.includes('District')) || facilities[0];
        const targetDoc = doctors.find(d => d.facilityId === targetFac.id && d.department === 'General Medicine') || doctors[0];
        await bookAppointment(targetFac.id, targetDoc.id, '10:30 AM', 'Fever and generalized weakness since 1 day', 'SAME_DAY');
        navigateStep(4);
      }
    },
    {
      step: 4,
      title: 'Step 4: Hospital Admin Command & Live Capacity',
      role: 'HOSPITAL_ADMIN',
      roleLabel: 'Hospital Admin Portal',
      icon: <Building2 className="w-4 h-4 text-indigo-400" />,
      desc: 'Hospital admin sees incoming Token A-027 in live queue. Demo the killer moment: toggle MRI/Overload and see MedRoute recommendations recalculate live across the network!',
      actionLabel: 'Proceed to Doctor Consultation',
      autoAction: () => {
        navigateStep(5);
      }
    },
    {
      step: 5,
      title: 'Step 5: Doctor Consultation & AI Clinical Copilot',
      role: 'DOCTOR',
      roleLabel: 'Doctor Portal',
      icon: <Stethoscope className="w-4 h-4 text-blue-400" />,
      desc: 'Doctor reviews AI summary, notes information gaps, logs vitals, enters diagnosis (Acute Febrile Illness), orders CBC lab test, prescribes Rx, and schedules follow-up.',
      actionLabel: 'Auto-Complete Consultation & Orders',
      autoAction: async () => {
        const apt = appointments[0];
        if (apt) {
          await completeConsultation(apt.id, {
            vitals: { temperature: '101.4°F', bloodPressure: '118/76', pulseRate: '88 bpm', spO2: '98%' },
            clinicalObservations: 'Febrile, pharyngeal congestion, alert, chest clear bilaterally.',
            provisionalDiagnosis: 'Acute Febrile Illness / Viral Syndrome',
            doctorNotes: 'Prescribed antipyretic & antihistamine. Ordered CBC to rule out bacterial infection or vector-borne etiology.',
            prescriptions: [
              { medicineName: 'Paracetamol 500mg', dosage: '1 tab TDS', frequency: 'Three times daily', durationDays: 3, quantity: 10 },
              { medicineName: 'Cetirizine 10mg', dosage: '1 tab HS', frequency: 'Once daily at night', durationDays: 5, quantity: 5 }
            ],
            orderedLabTests: ['Complete Blood Count (CBC) + ESR'],
            followUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
          });
        }
        navigateStep(6);
      }
    },
    {
      step: 6,
      title: 'Step 6: Lab Diagnostics & AI Report Extraction',
      role: 'LAB_STAFF',
      roleLabel: 'Lab Diagnostics Portal',
      icon: <FlaskConical className="w-4 h-4 text-purple-400" />,
      desc: 'Lab staff collects sample, processes test, and uploads CBC report. HealthAI extracts key parameters (WBC 11,200/µL, Platelets normal) and notifies doctor & patient.',
      actionLabel: 'Simulate Report Upload & Notify',
      autoAction: () => {
        const order = labOrders[0];
        if (order) {
          updateLabOrderStatus(order.id, 'REPORT_READY');
        }
        navigateStep(7);
      }
    },
    {
      step: 7,
      title: 'Step 7: Pharmacy Inventory & Instant Dispense',
      role: 'PHARMACY_STAFF',
      roleLabel: 'Pharmacy Portal',
      icon: <Pill className="w-4 h-4 text-amber-400" />,
      desc: 'Pharmacist verifies prescribed medications against live stock, dispenses to patient, updates inventory, and closes the medication dispensing loop.',
      actionLabel: 'Dispense Prescribed Medicines',
      autoAction: () => {
        const rx = prescriptions[0];
        if (rx) {
          dispensePrescription(rx.id);
        }
        navigateStep(8);
      }
    },
    {
      step: 8,
      title: 'Step 8: Patient Health Record & Follow-up Loop',
      role: 'PATIENT',
      roleLabel: 'Patient App',
      icon: <UserCheck className="w-4 h-4 text-teal-400" />,
      desc: 'Rahul receives instant notification: prescription dispensed, lab report ready with AI summary, and follow-up scheduled for 3 days later. Care continuity intact!',
      actionLabel: 'View NEXUS Command Center',
      autoAction: () => {
        navigateStep(9);
      }
    },
    {
      step: 9,
      title: 'Step 9: NEXUS Command Center Mission Control',
      role: 'SUPER_ADMIN',
      roleLabel: 'Command Center & Analytics',
      icon: <Radio className="w-4 h-4 text-rose-400" />,
      desc: 'NEXUS Command Center monitors 42 connected facilities, emergency loads, live queue latencies, stock levels, and automated AI capacity re-routing alerts.',
      actionLabel: 'Restart Guided Demo Tour',
      autoAction: () => {
        navigateStep(1);
      }
    }
  ];

  const currentTour = tourSteps.find(s => s.step === demoStep) || tourSteps[0];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full p-4 bg-slate-900/95 backdrop-blur-xl border border-teal-500/40 rounded-2xl shadow-2xl shadow-teal-950/80 text-white animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-display text-white">
              End-to-End Care Journey Tour
            </h4>
            <span className="text-[11px] text-teal-300 font-mono">
              Step {demoStep} of {tourSteps.length} • {currentTour.roleLabel}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-1">
          {currentTour.icon}
          <span>{currentTour.title}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {currentTour.desc}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 py-2">
        {tourSteps.map(s => (
          <button
            key={s.step}
            onClick={() => {
              playAudioChime('click');
              navigateStep(s.step);
            }}
            className={`w-2 h-2 rounded-full transition cursor-pointer ${
              s.step === demoStep
                ? 'w-6 bg-teal-400'
                : s.step < demoStep
                ? 'bg-teal-700'
                : 'bg-slate-800'
            }`}
            title={`Jump to step ${s.step}`}
          />
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
        <button
          disabled={demoStep === 1}
          onClick={() => {
            playAudioChime('click');
            goToDemoStep(Math.max(1, demoStep - 1));
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back</span>
        </button>

        <button
          onClick={async () => {
            playAudioChime('click');
            if (currentTour.autoAction) {
              await currentTour.autoAction();
            } else {
              goToDemoStep(demoStep + 1 > tourSteps.length ? 1 : demoStep + 1);
            }
          }}
          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transition cursor-pointer"
        >
          <span>{currentTour.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
