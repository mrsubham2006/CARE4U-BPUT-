import React from 'react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  FileCheck2,
  CalendarClock,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  Stethoscope,
  Activity,
  PlusCircle,
  FlaskConical
} from 'lucide-react';
import { Appointment, Prescription, LabOrder, FollowUp, Patient } from '../../types';

interface DoctorDashboardViewProps {
  appointments: Appointment[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  labReports: any[];
  followUps: FollowUp[];
  onSelectAppointment: (appointment: Appointment) => void;
  onStartConsultation: (appointment: Appointment, type: 'OPD' | 'VIDEO_CONSULTATION') => void;
  onViewPatientProfile: (patientId: string, appointment?: Appointment) => void;
  onNavigateTab: (tab: any) => void;
}

export const DoctorDashboardView: React.FC<DoctorDashboardViewProps> = ({
  appointments,
  prescriptions,
  labOrders,
  labReports,
  followUps,
  onSelectAppointment,
  onStartConsultation,
  onViewPatientProfile,
  onNavigateTab
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Real data calculations
  const todayAppointments = appointments.filter(a => {
    if (a.scheduledDate) return a.scheduledDate === todayStr;
    if (a.createdAt) return a.createdAt.startsWith(todayStr);
    return true; // default include
  });

  const waitingPatients = appointments.filter(
    a => (a.status as any) === 'WAITING' || a.status === 'CHECKED_IN' || a.status === 'BOOKED'
  );

  const videoConsultations = appointments.filter(
    a => a.consultationType === 'VIDEO' || (a as any).appointmentType === 'VIDEO_CONSULTATION'
  );

  const completedConsultations = appointments.filter(
    a => a.status === 'COMPLETED' || a.status === 'CONSULTATION_COMPLETED'
  );

  const pendingLabReports = labOrders.filter(
    o => o.status === 'ORDERED' || o.status === 'SAMPLE_COLLECTED' || o.status === 'PROCESSING'
  );

  const followUpsDue = followUps.filter(f => f.status === 'SCHEDULED');

  const priorityPatients = appointments.filter(
    a => a.triageLevel === 'EMERGENCY' || a.triageLevel === 'URGENT'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Clinician Overview Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-teal-950/60 border border-blue-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              FIRESTORE REALTIME SYNC ACTIVE
            </span>
            <span className="text-xs text-slate-400">
              Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white mt-1">
            Doctor Clinical Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Realtime OPD queue orchestration, digital e-prescriptions, and diagnostic investigations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('appointments')}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Manage Appointments</span>
          </button>
          <button
            onClick={() => onNavigateTab('opd_queue')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer border border-slate-700 flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>View Live Queue ({waitingPatients.length})</span>
          </button>
        </div>
      </div>

      {/* 9 Clinical Metric Metric Cards (Real Firestore Data Only) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => onNavigateTab('appointments')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Appts</span>
            <Calendar className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {todayAppointments.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Scheduled Today</div>
        </div>

        <div
          onClick={() => onNavigateTab('opd_queue')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Waiting Patients</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {waitingPatients.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">In OPD Waiting Hall</div>
        </div>

        <div
          onClick={() => onNavigateTab('video_consultations')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 transition cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Video Consults</span>
            <Video className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-300 font-mono">
            {videoConsultations.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Telemedicine Slots</div>
        </div>

        <div
          onClick={() => onNavigateTab('consultations')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 font-mono">
            {completedConsultations.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Signed & Closed</div>
        </div>

        <div
          onClick={() => onNavigateTab('lab_reports')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Labs</span>
            <FileCheck2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            {pendingLabReports.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Awaiting Results</div>
        </div>

        <div
          onClick={() => onNavigateTab('follow_ups')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Follow-ups Due</span>
            <CalendarClock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {followUpsDue.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Scheduled Reviews</div>
        </div>

        <div
          onClick={() => onNavigateTab('opd_queue')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Priority Triaged</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {priorityPatients.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Urgent / Emergency</div>
        </div>

        <div
          onClick={() => onNavigateTab('prescriptions')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer space-y-1 sm:col-span-2 lg:col-span-3"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Recent Signed Prescriptions</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {prescriptions.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Transmitted to Patient Portal & In-House Pharmacy
          </div>
        </div>
      </div>

      {/* Main Grid: Waiting OPD Queue & Priority Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current OPD Queue with Direct Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                <h2 className="text-base font-bold text-white font-display">
                  Current OPD Consultation Queue
                </h2>
              </div>
              <span className="text-xs text-teal-300 font-mono font-semibold">
                {waitingPatients.length} Waiting
              </span>
            </div>

            {waitingPatients.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-400">No appointments today</p>
                <p className="text-[11px] text-slate-600">
                  All scheduled patients have been consulted or no appointments booked yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingPatients.map((apt, idx) => {
                  const isVideo =
                    apt.consultationType === 'VIDEO' ||
                    (apt as any).appointmentType === 'VIDEO_CONSULTATION';

                  return (
                    <div
                      key={apt.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-xs font-mono">
                          {apt.token?.tokenNumber || `#${idx + 1}`}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{apt.patientName}</h4>
                            <span className="text-[10px] text-slate-400">
                              {apt.patientAge}y • {apt.patientGender}
                            </span>
                            {isVideo && (
                              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[9px] font-mono font-bold flex items-center gap-1">
                                <Video className="w-2.5 h-2.5" /> Video
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
                            {apt.symptomsSummary || 'Consultation request'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => onViewPatientProfile(apt.patientId, apt)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                        >
                          View Patient
                        </button>
                        <button
                          onClick={() => onStartConsultation(apt, isVideo ? 'VIDEO_CONSULTATION' : 'OPD')}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Start Consultation</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Pending Lab Reports & Follow-ups */}
        <div className="space-y-6">
          {/* Pending Diagnostic Reports */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span>Pending Lab Reports</span>
              </h3>
              <span className="text-xs text-purple-400 font-mono font-bold">
                {pendingLabReports.length}
              </span>
            </div>

            {pendingLabReports.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending reports</p>
            ) : (
              <div className="space-y-2">
                {pendingLabReports.slice(0, 4).map(order => (
                  <div
                    key={order.id}
                    onClick={() => onNavigateTab('lab_reports')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-purple-500/40 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{order.testName}</div>
                      <div className="text-[10px] text-slate-400">{order.patientName}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold">
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-Ups Due */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-indigo-400" />
                <span>Follow-ups Scheduled</span>
              </h3>
              <span className="text-xs text-indigo-400 font-mono font-bold">
                {followUpsDue.length}
              </span>
            </div>

            {followUpsDue.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No follow-ups scheduled</p>
            ) : (
              <div className="space-y-2">
                {followUpsDue.slice(0, 4).map(flw => (
                  <div
                    key={flw.id}
                    onClick={() => onNavigateTab('follow_ups')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{flw.patientName}</div>
                      <div className="text-[10px] text-slate-400">{flw.purpose}</div>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300">
                      {flw.targetDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
