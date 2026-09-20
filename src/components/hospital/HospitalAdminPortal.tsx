import React from 'react';
import { useApp } from '../../services/store';
import {
  Building2,
  Users,
  Activity,
  AlertTriangle,
  Stethoscope,
  FlaskConical,
  Pill,
  Bed,
  CheckCircle2,
  XCircle,
  Sliders,
  Zap,
  Radio,
  Flame
} from 'lucide-react';

export const HospitalAdminPortal: React.FC = () => {
  const {
    facilities,
    doctors,
    appointments,
    updateFacilityCapacity,
    toggleDoctorAvailability,
    playAudioChime,
    triggerConfetti
  } = useApp();

  // Active facility: District Health Centre (DHC)
  const currentFac = facilities.find(f => f.id === 'fac-1') || facilities[0];
  const facDoctors = doctors.filter(d => d.facilityId === currentFac.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hospital Admin Header */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-teal-950/60 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xl">
            🏥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                HOSPITAL CAPACITY COMMAND
              </span>
              <span className="text-xs text-slate-400">{currentFac.type}</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white mt-1">
              {currentFac.name}
            </h1>
            <p className="text-xs text-slate-300">
              Live Facility Capacity Control & MedRoute Network Broadcast Node
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              currentFac.statusColor === 'GREEN'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : currentFac.statusColor === 'YELLOW'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
            }`}
          >
            STATUS: {currentFac.openStatus}
          </span>
        </div>
      </div>

      {/* Killer Demo Callout Banner */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/50 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-mono">
              The "Killer Demo Moment": Dynamic MedRoute Re-routing
            </h4>
            <p className="text-xs text-slate-300">
              Toggle MRI/Diagnostics offline or increase Emergency Load to 95%. MedRoute immediately stops routing patients here and adapts across the network!
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Live OPD Queue</span>
          <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
            {currentFac.currentQueue} Patients
          </div>
          <span className="text-[10px] text-slate-400">~{currentFac.estimatedWaitMins} min avg wait</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Emergency Department Load</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${currentFac.emergencyLoadPercent > 85 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
            {currentFac.emergencyLoadPercent}%
          </div>
          <span className="text-[10px] text-slate-400">Capacity threshold</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Bed Occupancy</span>
          <div className="text-2xl font-bold font-mono text-blue-300 mt-1">
            {currentFac.bedOccupancyPercent}%
          </div>
          <span className="text-[10px] text-slate-400">Inpatient & ICU</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Doctors On-Duty</span>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
            {facDoctors.filter(d => d.isAvailable).length} / {facDoctors.length}
          </div>
          <span className="text-[10px] text-slate-400">Active clinicians</span>
        </div>
      </div>

      {/* Main Grid: Interactive Capacity Controls & Live Doctor Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Sliders & Diagnostics Toggles */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider font-mono">
            <Sliders className="w-4 h-4" />
            <span>Live Capacity & Diagnostics Controls</span>
          </div>

          {/* Emergency Department Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Emergency Trauma Load</span>
              <span className="font-mono font-bold text-amber-300">{currentFac.emergencyLoadPercent}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={currentFac.emergencyLoadPercent}
              onChange={e => updateFacilityCapacity(currentFac.id, { emergencyLoadPercent: parseInt(e.target.value) })}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>20% (Normal)</span>
              <span>85% (Warning)</span>
              <span>100% (Critical Overload)</span>
            </div>
          </div>

          {/* Bed Occupancy Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Inpatient Bed Occupancy</span>
              <span className="font-mono font-bold text-blue-300">{currentFac.bedOccupancyPercent}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={currentFac.bedOccupancyPercent}
              onChange={e => updateFacilityCapacity(currentFac.id, { bedOccupancyPercent: parseInt(e.target.value) })}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>

          {/* Diagnostics Availability Switches */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300">Diagnostic Services Operational Status</span>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'cbc', label: 'CBC Pathology Lab' },
                { key: 'xray', label: 'Digital X-Ray' },
                { key: 'mri', label: 'MRI 1.5T Scanner' },
                { key: 'ctScan', label: '64-Slice CT Scan' },
                { key: 'ultrasound', label: 'Ultrasound Sonography' }
              ].map(item => {
                const isOnline = (currentFac.diagnostics as any)[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      playAudioChime('click');
                      updateFacilityCapacity(currentFac.id, {
                        diagnostics: {
                          ...currentFac.diagnostics,
                          [item.key]: !isOnline
                        }
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      isOnline
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span>{isOnline ? 'ONLINE ✓' : 'OFFLINE ✗'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Doctor Availability Roster */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider font-mono">
              <Stethoscope className="w-4 h-4" />
              <span>Clinician Duty Roster</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{facDoctors.length} Doctors</span>
          </div>

          <div className="space-y-2.5">
            {facDoctors.map(doc => (
              <div
                key={doc.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{doc.name}</div>
                  <div className="text-slate-400 text-[11px]">{doc.department} • {doc.specialty}</div>
                  <div className="text-teal-300 text-[10px] font-mono mt-0.5">
                    Active Queue: {doc.activeQueueCount} patients
                  </div>
                </div>

                <button
                  onClick={() => {
                    playAudioChime('click');
                    toggleDoctorAvailability(doc.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    doc.isAvailable
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                >
                  {doc.isAvailable ? 'On Duty ✓' : 'Off Duty ✗'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
