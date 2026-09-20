import React from 'react';
import {
  Calendar,
  Clock,
  Pill,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Search,
  Video,
  Upload,
  QrCode,
  ShieldCheck,
  Activity,
  Heart,
  UserCheck,
  CheckCircle2,
  Building2,
  PhoneCall,
  Bell,
  Stethoscope
} from 'lucide-react';
import { useApp } from '../../services/store';
import { translations } from '../../i18n/translations';

interface PatientHomeViewProps {
  onNavigate: (tab: any) => void;
  onOpenVideoModal?: (appointmentId: string) => void;
  onOpenSOSModal?: () => void;
  onOpenScannerModal?: () => void;
  onStartVideoCall?: (appointmentId?: string) => void;
  onBookAppointment?: () => void;
}

export const PatientHomeView: React.FC<PatientHomeViewProps> = ({
  onNavigate,
  onOpenVideoModal,
  onOpenSOSModal,
  onOpenScannerModal,
  onStartVideoCall,
  onBookAppointment
}) => {
  const {
    activePatient,
    selectedLanguage,
    appointments,
    labOrders,
    prescriptions,
    referrals,
    followUps,
    notifications,
    activeToken
  } = useApp();

  const t = (translations as any)[selectedLanguage] || translations.en;

  const myAppointments = appointments.filter(a => a.patientId === activePatient.id || a.patientName === activePatient.name);
  const upcomingAppointment = myAppointments.find(
    a => a.status === 'BOOKED' || a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'IN_CONSULTATION'
  );

  const myPrescriptions = prescriptions.filter(p => p.patientId === activePatient.id || p.patientName === activePatient.name);
  const activePrescription = myPrescriptions[0];

  const myLabOrders = labOrders.filter(l => l.patientId === activePatient.id || l.patientName === activePatient.name);
  const recentLabOrder = myLabOrders[0];

  const myReferrals = referrals.filter(r => r.patientId === activePatient.id || r.patientName === activePatient.name);
  const activeReferral = myReferrals[0];

  const myFollowUps = followUps.filter(f => f.patientId === activePatient.id || f.patientName === activePatient.name);
  const upcomingFollowUp = myFollowUps.find(f => f.status === 'SCHEDULED');

  const myNotifications = notifications.filter(
    n => n.targetRole === 'ALL' || n.targetRole === 'PATIENT'
  ).slice(0, 3);

  // Profile completion calculation
  const fields = [
    activePatient.name,
    activePatient.phone,
    activePatient.dob,
    activePatient.gender,
    activePatient.bloodGroup,
    activePatient.villageOrCity,
    activePatient.emergencyContact,
    activePatient.abhaNumber,
    activePatient.allergies?.length
  ];
  const filledCount = fields.filter(Boolean).length;
  const profileCompletionPercent = Math.round((filledCount / fields.length) * 100);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Personalized Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900/80 via-slate-900 to-indigo-950/80 border border-teal-500/30 p-6 lg:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ABDM Verified Citizen • {activePatient.healthId}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display text-white tracking-tight">
              {t.greeting}, {activePatient.name} 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Welcome to your personal digital health portal. Manage connected consultations, live OPD queues, prescription refills, and verified laboratory diagnostics in one place.
            </p>
          </div>

          {/* Quick Emergency Shortcut */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSOSModal}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-red-900/40 border border-red-400/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>108 Emergency SOS</span>
            </button>
            <button
              onClick={() => onNavigate('QR_ID')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
            >
              <QrCode className="w-4 h-4 text-teal-400" />
              <span>Health QR ID</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs">
              {profileCompletionPercent}%
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Profile Completion Status</div>
              <div className="text-[11px] text-slate-400">
                {profileCompletionPercent === 100
                  ? 'All health identity and emergency contacts verified'
                  : 'Complete your medical history and emergency contacts'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${profileCompletionPercent}%` }}
              />
            </div>
            <button
              onClick={() => onNavigate('PROFILE')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Care Actions & Services</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <button
            onClick={() => onNavigate('FIND_CARE')}
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 text-slate-200 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-teal-300 leading-tight">Find a Doctor</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Specialists & clinics</span>
          </button>

          <button
            onClick={() => onNavigate('BOOKING')}
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-slate-200 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-blue-300 leading-tight">Book Slot</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Real-time OPD</span>
          </button>

          <button
            onClick={() => onNavigate('VIDEO_CALLS')}
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-slate-200 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-purple-300 leading-tight">Teleconsult</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Video room</span>
          </button>

          <button
            onClick={() => onNavigate('AI_INTAKE')}
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-slate-200 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-emerald-300 leading-tight">AI Intake</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Voice & symptoms</span>
          </button>

          <button
            onClick={onOpenScannerModal}
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-slate-200 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-amber-300 leading-tight">Scan Rx</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Document AI OCR</span>
          </button>

          <button
            onClick={() => onNavigate('WALLET')}
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-cyan-300 leading-tight">Health Wallet</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Upload records</span>
          </button>

          <button
            onClick={() => onNavigate('MEDROUTE')}
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-slate-200 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-indigo-300 leading-tight">MedRoute AI</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Smart facility load</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Upcoming Care & Prescriptions), Right (Health Summary, Reminders, Labs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointment & Next Care Action Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upcoming Consultation & Next Care Step</h3>
                  <p className="text-xs text-slate-400">Live OPD token & queue synchronization</p>
                </div>
              </div>
              {upcomingAppointment && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  {upcomingAppointment.status}
                </span>
              )}
            </div>

            {upcomingAppointment ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                      {upcomingAppointment.department} • {upcomingAppointment.facilityName}
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {upcomingAppointment.doctorName}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        Today at {upcomingAppointment.scheduledTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {upcomingAppointment.consultationType === 'VIDEO' ? 'Telemedicine Call' : 'In-Person OPD'}
                      </span>
                    </div>
                  </div>

                  {/* Token Box */}
                  <div className="text-center p-3.5 rounded-xl bg-slate-900 border border-teal-500/30 shadow-md">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Your Digital Token</div>
                    <div className="text-2xl font-black font-mono text-teal-300 tracking-wider">
                      {upcomingAppointment.token?.tokenNumber || 'A-027'}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      ~{upcomingAppointment.token?.estimatedWaitMins || 10} mins wait
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <Activity className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium">Chief Concern: </span>
                    {upcomingAppointment.symptomsSummary}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {upcomingAppointment.consultationType === 'VIDEO' ? (
                    <button
                      onClick={() => onOpenVideoModal && onOpenVideoModal(upcomingAppointment.id)}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/30"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Video Consultation Room</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('QUEUE')}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View Live Queue & OPD Pass</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('MESSAGES')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium text-xs flex items-center gap-1.5"
                  >
                    <span>Message Doctor</span>
                  </button>

                  <button
                    onClick={() => onNavigate('APPOINTMENTS')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium text-xs flex items-center gap-1.5 ml-auto"
                  >
                    <span>Manage Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-white">No upcoming appointments scheduled</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Book an in-person OPD consultation or instant telemedicine video call with top district doctors.
                </p>
                <button
                  onClick={() => onNavigate('BOOKING')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Current Prescriptions & Active Medications */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Active Prescriptions & Medicines</h3>
                  <p className="text-xs text-slate-400">Doctor validated e-prescriptions and course durations</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('PRESCRIPTIONS')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                <span>View All ({myPrescriptions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activePrescription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Prescribed by <strong className="text-white">{activePrescription.doctorName}</strong> ({activePrescription.facilityName})</span>
                  <span className="font-mono text-teal-400">{activePrescription.items.length} Medicines</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePrescription.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{item.medicineName}</span>
                          {item.availableInStock && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="In Stock" />
                          )}
                        </div>
                        <div className="text-[11px] text-teal-300 mt-0.5">{item.dosage} • {item.frequency}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Duration: {item.durationDays} Days (Qty: {item.quantity})</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                No active prescriptions recorded yet.
              </div>
            )}
          </div>

          {/* Active Referrals & Scheduled Follow-ups Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Referral Card */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Specialty Referral</span>
                </div>
                {activeReferral && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeReferral.status}
                  </span>
                )}
              </div>

              {activeReferral ? (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-white text-sm">{activeReferral.specialtyRequired}</div>
                  <div className="text-slate-400">
                    From: <strong className="text-slate-200">{activeReferral.fromFacilityName}</strong> → To: <strong className="text-teal-300">{activeReferral.toFacilityName}</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2 bg-slate-950 p-2 rounded-lg border border-slate-850">
                    {activeReferral.reasonForReferral}
                  </p>
                  <button
                    onClick={() => onNavigate('REFERRALS')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 pt-1"
                  >
                    <span>View Referral Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No active specialist referrals.
                </div>
              )}
            </div>

            {/* Scheduled Follow-up Card */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Follow-up Care</span>
                </div>
                {upcomingFollowUp && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Scheduled
                  </span>
                )}
              </div>

              {upcomingFollowUp ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Target: {upcomingFollowUp.targetDate}</span>
                    <span className="text-[10px] text-teal-400 font-semibold">Proactive Care</span>
                  </div>
                  <div className="text-slate-300">{upcomingFollowUp.purpose}</div>
                  <div className="text-[11px] text-slate-400">With {upcomingFollowUp.doctorName} at {upcomingFollowUp.facilityName}</div>
                  <button
                    onClick={() => onNavigate('CARE_JOURNEY')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 pt-1"
                  >
                    <span>View Care Timeline</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No pending follow-ups.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Health Summary, Medication Reminders, Recent Lab & Notifications */}
        <div className="space-y-6">
          {/* Health Summary & Profile Badge */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                <span>Health Snapshot</span>
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Blood Group: {activePatient.bloodGroup || 'B+'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Age / Gender</div>
                <div className="text-white font-bold mt-0.5">{activePatient.age} Yrs • {activePatient.gender}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Emergency SOS</div>
                <div className="text-teal-300 font-bold mt-0.5 truncate">{activePatient.emergencyContact || 'Verified'}</div>
              </div>
            </div>

            {/* Allergies & Conditions */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Allergies: </span>
                <span className="text-amber-300 font-semibold">
                  {activePatient.allergies && activePatient.allergies.length > 0 ? activePatient.allergies.join(', ') : 'None recorded'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Chronic Conditions: </span>
                <span className="text-slate-200">
                  {activePatient.chronicConditions && activePatient.chronicConditions.length > 0 ? activePatient.chronicConditions.join(', ') : 'None'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ANALYTICS')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>View Health Analytics & Vitals</span>
            </button>
          </div>

          {/* Today's Medication Reminders */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Medication Schedule</span>
              </h3>
              <button
                onClick={() => onNavigate('MEDICINES')}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
              >
                All Reminders
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                    AM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Paracetamol 500mg</div>
                    <div className="text-[10px] text-slate-400">08:00 AM • After Breakfast</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  ✓ Taken
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    PM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Cetirizine 10mg</div>
                    <div className="text-[10px] text-slate-400">09:30 PM • Before Bed</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Pending
                </span>
              </div>
            </div>
          </div>

          {/* Recent Lab Report */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Recent Diagnostics</span>
              </h3>
              <button
                onClick={() => onNavigate('LAB_REPORTS')}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
              >
                View ({myLabOrders.length})
              </button>
            </div>

            {recentLabOrder ? (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{recentLabOrder.testName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                    {recentLabOrder.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Ordered by {recentLabOrder.orderedByDoctorName}</div>
                {recentLabOrder.aiExtractedInsights && (
                  <div className="p-2 rounded-lg bg-teal-950/30 border border-teal-500/20 text-[11px] text-teal-200">
                    <strong className="text-teal-300">AI Summary: </strong>
                    {recentLabOrder.aiExtractedInsights}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">No lab reports on file.</div>
            )}
          </div>

          {/* Live Notification Snippet */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-teal-400" />
                <span>Recent Alerts</span>
              </h3>
              <button
                onClick={() => onNavigate('NOTIFICATIONS')}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
              >
                Notifications
              </button>
            </div>

            <div className="space-y-2">
              {myNotifications.map(n => (
                <div key={n.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs space-y-0.5">
                  <div className="font-semibold text-white">{n.title}</div>
                  <div className="text-[11px] text-slate-400">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
