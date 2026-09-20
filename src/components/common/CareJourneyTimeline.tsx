import React from 'react';
import { useApp } from '../../services/store';
import {
  Mic,
  ShieldCheck,
  Compass,
  QrCode,
  Stethoscope,
  FlaskConical,
  Pill,
  CalendarCheck,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react';

export const CareJourneyTimeline: React.FC = () => {
  const {
    activeIntake,
    activeTriage,
    activeToken,
    appointments,
    labOrders,
    prescriptions,
    followUps,
    activePatient
  } = useApp();

  // Find latest appointment for active patient
  const patientApt = appointments.find(a => a.patientId === activePatient.id) || appointments[0];
  const patientLab = labOrders.find(l => l.patientId === activePatient.id);
  const patientRx = prescriptions.find(p => p.patientId === activePatient.id);
  const patientFollowUp = followUps.find(f => f.patientId === activePatient.id);

  const steps = [
    {
      id: 'intake',
      label: 'AI Intake',
      desc: activeIntake ? activeIntake.chiefComplaint.substring(0, 24) + '...' : 'Natural Language',
      icon: <Mic className="w-4 h-4" />,
      status: activeIntake ? 'completed' : 'pending'
    },
    {
      id: 'triage',
      label: 'HealthAI Triage',
      desc: activeTriage ? activeTriage.urgencyLabel.split(':')[0] : 'Safety Triage',
      icon: <ShieldCheck className="w-4 h-4" />,
      status: activeTriage ? 'completed' : activeIntake ? 'current' : 'pending'
    },
    {
      id: 'medroute',
      label: 'MedRoute AI',
      desc: patientApt ? patientApt.facilityName.split(' ')[0] : 'Capacity Match',
      icon: <Compass className="w-4 h-4" />,
      status: patientApt || activeToken ? 'completed' : activeTriage ? 'current' : 'pending'
    },
    {
      id: 'token',
      label: 'Digital Token',
      desc: activeToken ? activeToken.tokenNumber : patientApt ? patientApt.token?.tokenNumber || 'Token' : 'Care Token',
      icon: <QrCode className="w-4 h-4" />,
      status: activeToken || patientApt ? 'completed' : 'pending'
    },
    {
      id: 'consult',
      label: 'Doctor Review',
      desc: patientApt?.status === 'COMPLETED' || patientApt?.status === 'LAB_PENDING' || patientApt?.status === 'PHARMACY_PENDING'
        ? 'Consulted'
        : patientApt ? 'In Queue' : 'Consultation',
      icon: <Stethoscope className="w-4 h-4" />,
      status:
        patientApt?.status === 'COMPLETED' ||
        patientApt?.status === 'LAB_PENDING' ||
        patientApt?.status === 'PHARMACY_PENDING'
          ? 'completed'
          : patientApt ? 'current' : 'pending'
    },
    {
      id: 'lab',
      label: 'Lab Orders',
      desc: patientLab?.status === 'REPORT_READY'
        ? 'Report Ready'
        : patientLab ? 'Processing' : 'CBC / Diagnostics',
      icon: <FlaskConical className="w-4 h-4" />,
      status:
        patientLab?.status === 'REPORT_READY'
          ? 'completed'
          : patientLab ? 'current' : 'pending'
    },
    {
      id: 'rx',
      label: 'Pharmacy & Rx',
      desc: patientRx?.status === 'DISPENSED'
        ? 'Dispensed'
        : patientRx ? 'Prescribed' : 'e-Prescription',
      icon: <Pill className="w-4 h-4" />,
      status:
        patientRx?.status === 'DISPENSED'
          ? 'completed'
          : patientRx ? 'current' : 'pending'
    },
    {
      id: 'followup',
      label: 'Care Follow-up',
      desc: patientFollowUp ? `Due: ${patientFollowUp.targetDate}` : 'Continuous Loop',
      icon: <CalendarCheck className="w-4 h-4" />,
      status: patientFollowUp ? 'completed' : 'pending'
    }
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-teal-400 animate-ping"></div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Live Connected Care Journey
            </h3>
            <p className="text-xs text-slate-400">
              Patient: <span className="text-teal-300 font-medium">{activePatient.name}</span> • One Continuous Record Loop
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            Synchronized Across All Panels
          </span>
        </div>
      </div>

      {/* Horizontal Steps Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div
              key={step.id}
              className={`relative rounded-xl p-3 border transition flex flex-col justify-between ${
                isCompleted
                  ? 'bg-teal-950/40 border-teal-500/40 text-teal-100 shadow-sm shadow-teal-500/10'
                  : isCurrent
                  ? 'bg-blue-950/50 border-blue-500 text-white animate-pulse shadow-md shadow-blue-500/20'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? 'bg-teal-500/20 text-teal-300'
                      : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step.icon}
                </div>
                {isCompleted ? (
                  <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : isCurrent ? (
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                    <Clock className="w-2.5 h-2.5" />
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold truncate text-slate-100">{step.label}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
