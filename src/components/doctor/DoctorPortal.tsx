import React, { useState } from 'react';
import { useApp } from '../../services/store';
import {
  Stethoscope,
  User,
  Clock,
  Sparkles,
  AlertCircle,
  FileCheck,
  FlaskConical,
  Pill,
  Send,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Heart,
  Activity,
  Plus,
  Trash2
} from 'lucide-react';

export const DoctorPortal: React.FC = () => {
  const {
    doctors,
    appointments,
    activePatient,
    activeIntake,
    completeConsultation,
    facilities,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const currentDoctor = doctors.find(d => d.department === 'General Medicine') || doctors[0];

  // Active Selected Appointment for Consultation
  const [selectedAptId, setSelectedAptId] = useState<string>(
    appointments.find(a => a.doctorId === currentDoctor.id || a.patientId === activePatient.id)?.id || appointments[0]?.id || ''
  );

  const currentAppointment = appointments.find(a => a.id === selectedAptId) || appointments[0];

  // Consultation Form State
  const [temp, setTemp] = useState('101.4°F');
  const [bp, setBp] = useState('118/76 mmHg');
  const [pulse, setPulse] = useState('88 bpm');
  const [spo2, setSpO2] = useState('98%');
  const [observations, setObservations] = useState(
    'Patient presents with 1-day history of acute high fever and body ache. O/E: Mild pharyngeal congestion, alert and oriented. Chest clear, no cyanosis.'
  );
  const [diagnosis, setDiagnosis] = useState('Acute Febrile Illness / Viral Syndrome');
  const [notes, setNotes] = useState('Advised warm oral fluids, rest, antipyretic cover, and CBC report review.');

  // Prescribed Medicines list
  const [prescriptionsList, setPrescriptionsList] = useState([
    { medicineName: 'Paracetamol 500mg', dosage: '1 tab TDS (After Food)', frequency: 'Three times daily', durationDays: 3, quantity: 10 },
    { medicineName: 'Cetirizine 10mg', dosage: '1 tab HS (At Bedtime)', frequency: 'Once daily at night', durationDays: 5, quantity: 5 }
  ]);

  // Selected Lab Orders
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>(['Complete Blood Count (CBC) + ESR']);

  // Referral State
  const [wantReferral, setWantReferral] = useState(false);
  const [referralFacilityId, setReferralFacilityId] = useState(facilities[2]?.id || '');
  const [referralSpecialty, setReferralSpecialty] = useState('Cardiology');
  const [referralReason, setReferralReason] = useState('Specialist evaluation for persistent symptoms');

  // Follow-up date
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggleLabTest = (testName: string) => {
    setSelectedLabTests(prev =>
      prev.includes(testName) ? prev.filter(t => t !== testName) : [...prev, testName]
    );
  };

  const handleAddMedicine = () => {
    setPrescriptionsList(prev => [
      ...prev,
      { medicineName: 'Amoxicillin + Clavulanic Acid 625mg', dosage: '1 tab BD (After Food)', frequency: 'Twice daily', durationDays: 5, quantity: 10 }
    ]);
  };

  const handleRemoveMedicine = (idx: number) => {
    setPrescriptionsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinalizeConsultation = async () => {
    if (!currentAppointment) return;

    setIsSubmitting(true);
    playAudioChime('click');
    try {
      await completeConsultation(currentAppointment.id, {
        vitals: { temperature: temp, bloodPressure: bp, pulseRate: pulse, spO2: spo2 },
        clinicalObservations: observations,
        provisionalDiagnosis: diagnosis,
        doctorNotes: notes,
        prescriptions: prescriptionsList,
        orderedLabTests: selectedLabTests,
        referral: wantReferral
          ? {
              toFacilityId: referralFacilityId,
              specialtyRequired: referralSpecialty,
              priority: 'Routine',
              reason: referralReason
            }
          : undefined,
        followUpDate
      });

      setIsSubmitting(false);
      setSuccessMessage(
        `Consultation finalized for ${currentAppointment.patientName}! Lab Orders placed, e-Prescription routed to Pharmacy, and Follow-up confirmed.`
      );
      triggerConfetti();
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Clinician Header Bar */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xl">
            🩺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/40">
                CLINICAL DECISION COPILOT
              </span>
              <span className="text-xs text-slate-400">
                {currentDoctor.facilityName}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white mt-1">
              {currentDoctor.name} ({currentDoctor.department})
            </h1>
            <p className="text-xs text-slate-300">
              Active OPD Queue: <strong className="text-teal-300 font-mono">{appointments.length} Patients</strong> • Average Consultation: 10 mins
            </p>
          </div>
        </div>

        {/* Doctor Status Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-300 font-semibold font-mono">OPD IN SESSION</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-sm flex items-center gap-2.5 shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Clinical Layout: Patient Queue Sidebar + Active Consultation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Patient Queue */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Today's OPD Queue</span>
              </h3>
              <span className="text-xs text-teal-300 font-mono font-bold">
                {appointments.length} Waiting
              </span>
            </div>

            <div className="space-y-2.5">
              {appointments.map(apt => {
                const isSelected = apt.id === selectedAptId;
                return (
                  <div
                    key={apt.id}
                    onClick={() => {
                      playAudioChime('click');
                      setSelectedAptId(apt.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/50 border-blue-500/60 ring-1 ring-blue-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                        {apt.token?.tokenNumber || 'Token'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{apt.scheduledTime}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{apt.patientName}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{apt.symptomsSummary}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-slate-400">
                        {apt.patientAge}y • {apt.patientGender}
                      </span>
                      <span className="font-mono text-teal-300 font-semibold">{apt.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right: Patient Profile, AI Copilot Summary & Consultation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Overview & AI Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-base">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{currentAppointment?.patientName || activePatient.name}</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {activePatient.healthId}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    24 Years • Male • Blood Group B+ • Rural Zone (Kadegaon Block)
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold">
                Token {currentAppointment?.token?.tokenNumber || 'A-027'}
              </span>
            </div>

            {/* AI Clinical Summary Banner */}
            <div className="bg-gradient-to-r from-teal-950/40 via-slate-950 to-indigo-950/40 border border-teal-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>HealthAI Clinical Intake Summary</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Assistance Only</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Patient reports acute onset of high fever and generalized body weakness for 1 day. Red-flag screening negative (no dyspnea, alert sensorium, no chest pain).
              </p>

              {/* Detected Information Gaps & Suggested Clinical Probing Questions */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
                <div className="text-amber-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>AI Suggested Clinical Questions & Gaps:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                  <li>Ask regarding diurnal fever chills or rigors.</li>
                  <li>Check recent vector/mosquito exposure in Kadegaon rural block.</li>
                  <li>Verify any pre-consultation self-medication or antipyretics taken.</li>
                </ul>
              </div>
            </div>

            {/* Vitals Input Row */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Clinical Vitals (Recorded at OPD)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Temperature</span>
                  <input
                    type="text"
                    value={temp}
                    onChange={e => setTemp(e.target.value)}
                    className="w-full bg-transparent font-bold text-white text-sm focus:outline-none mt-0.5"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Blood Pressure</span>
                  <input
                    type="text"
                    value={bp}
                    onChange={e => setBp(e.target.value)}
                    className="w-full bg-transparent font-bold text-white text-sm focus:outline-none mt-0.5"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Pulse Rate</span>
                  <input
                    type="text"
                    value={pulse}
                    onChange={e => setPulse(e.target.value)}
                    className="w-full bg-transparent font-bold text-white text-sm focus:outline-none mt-0.5"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">SpO2</span>
                  <input
                    type="text"
                    value={spo2}
                    onChange={e => setSpO2(e.target.value)}
                    className="w-full bg-transparent font-bold text-white text-sm focus:outline-none mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Observations & Diagnosis */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Clinical Observations & Physical Examination</label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Provisional Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400 mt-1"
                />
              </div>
            </div>

            {/* Prescriptions Section */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5">
                  <Pill className="w-4 h-4" />
                  <span>Prescribe Medicines (e-Prescription)</span>
                </label>
                <button
                  onClick={handleAddMedicine}
                  className="text-xs text-teal-300 hover:text-teal-200 flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2">
                {prescriptionsList.map((med, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <div className="font-bold text-white">{med.medicineName}</div>
                      <div className="text-[11px] text-slate-400">{med.dosage} • {med.frequency}</div>
                    </div>
                    <span className="text-slate-300 font-mono">{med.durationDays} Days</span>
                    <button
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Lab Tests Request */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4" />
                <span>Order On-Site Diagnostic Lab Tests</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {[
                  'Complete Blood Count (CBC) + ESR',
                  'Dengue NS1 Antigen & IgM',
                  'Malaria Smear Test',
                  'Urine Routine & Microscopic',
                  'Chest X-Ray PA View'
                ].map(test => {
                  const isChecked = selectedLabTests.includes(test);
                  return (
                    <button
                      key={test}
                      onClick={() => handleToggleLabTest(test)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span>{test}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Follow-up Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Scheduled Follow-up Date</span>
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Specialist Referral Needed?</span>
                </label>
                <button
                  onClick={() => setWantReferral(!wantReferral)}
                  className={`w-full mt-1 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    wantReferral
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {wantReferral ? '✓ Referral Active' : '+ Add Specialty Referral'}
                </button>
              </div>
            </div>

            {/* Complete Consultation Button */}
            <button
              disabled={isSubmitting}
              onClick={handleFinalizeConsultation}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Complete Consultation, Order Tests & Issue e-Rx</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
