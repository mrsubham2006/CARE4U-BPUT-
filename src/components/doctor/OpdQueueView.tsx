import React from 'react';
import {
  Clock,
  User,
  Stethoscope,
  Video,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Appointment } from '../../types';

interface OpdQueueViewProps {
  appointments: Appointment[];
  onStartConsultation: (appointment: Appointment, type: 'OPD' | 'VIDEO_CONSULTATION') => void;
  onViewPatientProfile: (patientId: string, appointment?: Appointment) => void;
}

export const OpdQueueView: React.FC<OpdQueueViewProps> = ({
  appointments,
  onStartConsultation,
  onViewPatientProfile
}) => {
  const waitingPatients = appointments.filter(
    a => (a.status as any) === 'WAITING' || a.status === 'CHECKED_IN' || a.status === 'BOOKED'
  );

  const inConsultationPatients = appointments.filter(a => a.status === 'IN_CONSULTATION');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* OPD Queue Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              LIVE CLINIC QUEUE
            </span>
            <span className="text-xs text-slate-400">
              Department: General OPD & Telemedicine
            </span>
          </div>
          <h1 className="text-xl font-bold text-white font-display mt-1">
            Active OPD Queue Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Patients currently waiting in the OPD corridor with digital tokens issued.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-amber-300">
              {waitingPatients.length}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Patients In Queue</div>
          </div>
        </div>
      </div>

      {/* Currently In Consultation (if any) */}
      {inConsultationPatients.length > 0 && (
        <div className="p-5 rounded-3xl bg-blue-950/40 border border-blue-500/40 space-y-3">
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>CURRENTLY IN CONSULTATION ROOM</span>
          </div>

          {inConsultationPatients.map(apt => (
            <div
              key={apt.id}
              className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono font-bold flex items-center justify-center">
                  {apt.token?.tokenNumber || 'A-1'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{apt.patientName}</h4>
                  <p className="text-xs text-slate-400">
                    {apt.patientAge}y • {apt.patientGender} • Chief Complaint: {apt.symptomsSummary}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onStartConsultation(apt, 'OPD')}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Resume Consultation
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Waiting List Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Waiting Queue Sequence
        </h3>

        {waitingPatients.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-500 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-300">OPD Queue is Clear</p>
            <p className="text-[11px] text-slate-500">
              No patients currently waiting in the clinic queue.
            </p>
          </div>
        ) : (
          waitingPatients.map((apt, index) => {
            const isVideo =
              apt.consultationType === 'VIDEO' || (apt as any).appointmentType === 'VIDEO_CONSULTATION';
            const isPriority =
              apt.triageLevel === 'EMERGENCY' || apt.triageLevel === 'URGENT';

            return (
              <div
                key={apt.id}
                className={`p-5 rounded-3xl bg-slate-900/90 border transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                  isPriority
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : index === 0
                    ? 'border-amber-500/40'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-bold shrink-0 ${
                      index === 0
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-[9px] text-slate-400">QUEUE</span>
                    <span className="text-sm">#{index + 1}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-400">
                        Token: {apt.token?.tokenNumber || 'A-100'}
                      </span>
                      <h4 className="text-base font-bold text-white">{apt.patientName}</h4>
                      <span className="text-xs text-slate-400">
                        ({apt.patientAge}y, {apt.patientGender})
                      </span>

                      {isPriority && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> TRIAGE PRIORITY
                        </span>
                      )}

                      {isVideo && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Video className="w-3 h-3" /> VIDEO
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      Chief Complaint: {apt.symptomsSummary || 'General Consultation'}
                    </p>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Estimated Wait: ~{Math.max(5, (index + 1) * 10)} mins • Slot: {apt.scheduledTime || 'Walk-in OPD'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => onViewPatientProfile(apt.patientId, apt)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Medical History
                  </button>

                  <button
                    onClick={() =>
                      onStartConsultation(apt, isVideo ? 'VIDEO_CONSULTATION' : 'OPD')
                    }
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md ${
                      index === 0
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                        : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                    }`}
                  >
                    {isVideo ? <Video className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                    <span>{index === 0 ? 'Call Next Patient' : 'Start Consult'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
