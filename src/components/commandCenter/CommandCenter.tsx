import React, { useState } from 'react';
import { useApp } from '../../services/store';
import {
  Activity,
  Radio,
  Building2,
  Users,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Sliders,
  Sparkles,
  MapPin,
  CheckCircle2,
  TrendingUp,
  FlaskConical,
  Pill,
  FileText,
  Compass,
  Zap,
  Layers,
  Search
} from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const {
    facilities,
    doctors,
    appointments,
    emergencyAlerts,
    auditLogs,
    routingWeights,
    updateRoutingWeights,
    updateFacilityCapacity,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [activeFacilityId, setActiveFacilityId] = useState<string>(facilities[0]?.id || '');
  const selectedFacility = facilities.find(f => f.id === activeFacilityId) || facilities[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Command Center Mission Control Header */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-rose-500/40 rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center font-bold text-xl">
            🛰️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40">
                NEXUS REGIONAL COMMAND CENTER
              </span>
              <span className="text-xs text-slate-400">Sub-District Health Intelligence Node</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white mt-1">
              Live Healthcare Network & Capacity Mission Control
            </h1>
            <p className="text-xs text-slate-300">
              Real-time Bed Capacity, Dynamic Queue Balancing & Predictive HealthAI Triage Routing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>42 Connected Facilities Synchronized</span>
          </span>
        </div>
      </div>

      {/* Primary Network KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-mono">
            <span>Network Facilities</span>
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">42 Nodes</div>
          <span className="text-[10px] text-teal-300">5 District Core + 37 PHCs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-mono">
            <span>Active Patients Today</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-300 mt-1">1,284</div>
          <span className="text-[10px] text-slate-400">842 OPD • 174 Emergency</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-mono">
            <span>Avg Network Latency</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-1">31 min</div>
          <span className="text-[10px] text-slate-400">Queue to consultation</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-mono">
            <span>Emergency Load</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-300 mt-1">78%</div>
          <span className="text-[10px] text-amber-300">MedRoute re-routing active</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-mono">
            <span>Care Continuity</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300 mt-1">96.8%</div>
          <span className="text-[10px] text-slate-400">Referral close rate</span>
        </div>
      </div>

      {/* Center Layout: Interactive Healthcare Network Vector Map + Active Facility Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Map Vector Visualization */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider font-mono">
              <Compass className="w-4 h-4" />
              <span>District Healthcare Network Topology Map</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Normal
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Busy
              </span>
              <span className="flex items-center gap-1 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span> Overloaded
              </span>
            </div>
          </div>

          {/* Interactive Graphic Map Canvas */}
          <div className="relative w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
            {/* Grid Lines Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

            {/* Simulated Geographic Road Network Vectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-800 stroke-[1.5] stroke-dasharray-[4]">
              <line x1="20%" y1="50%" x2="50%" y2="40%" />
              <line x1="50%" y1="40%" x2="80%" y2="30%" />
              <line x1="50%" y1="40%" x2="60%" y2="80%" />
              <line x1="20%" y1="50%" x2="30%" y2="85%" />
              <line x1="60%" y1="80%" x2="85%" y2="75%" />
            </svg>

            {/* Interactive Facility Nodes on Map */}
            {facilities.map((fac, idx) => {
              const isSelected = fac.id === activeFacilityId;
              const positions = [
                { top: '40%', left: '50%' }, // DHC Center
                { top: '25%', left: '30%' }, // CHC North
                { top: '30%', left: '80%' }, // Apex Trauma
                { top: '65%', left: '20%' }, // PHC Kadegaon
                { top: '75%', left: '75%' }  // Metro Care
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={fac.id}
                  onClick={() => {
                    playAudioChime('click');
                    setActiveFacilityId(fac.id);
                  }}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-transform duration-200 group-hover:scale-125 shadow-xl ${
                        fac.statusColor === 'GREEN'
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                          : fac.statusColor === 'YELLOW'
                          ? 'bg-amber-950 border-amber-400 text-amber-300'
                          : 'bg-rose-950 border-rose-400 text-rose-300 animate-pulse'
                      } ${isSelected ? 'ring-4 ring-teal-400/50 scale-115' : ''}`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div className="bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold text-white whitespace-nowrap mt-1 shadow-md">
                      {fac.name.split(' ')[0]} ({fac.currentQueue}Q)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Click any hospital node on the map to inspect live capacity & trigger emergency rerouting.</span>
            <span className="font-mono text-teal-300 font-bold">Selected: {selectedFacility.name}</span>
          </div>
        </div>

        {/* Right Column: Active Facility Detailed Inspector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">{selectedFacility.type}</span>
              <h3 className="text-base font-bold text-white">{selectedFacility.name}</h3>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                selectedFacility.statusColor === 'GREEN'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : selectedFacility.statusColor === 'YELLOW'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
              }`}
            >
              {selectedFacility.openStatus}
            </span>
          </div>

          {/* Departmental Queues Bar Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>OPD Load</span>
              <span className="font-mono text-white font-bold">{selectedFacility.opdCapacityPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${selectedFacility.opdCapacityPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-slate-400 pt-1">
              <span>Emergency Department</span>
              <span className="font-mono text-amber-300 font-bold">{selectedFacility.emergencyLoadPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedFacility.emergencyLoadPercent > 85 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${selectedFacility.emergencyLoadPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-slate-400 pt-1">
              <span>Inpatient Beds</span>
              <span className="font-mono text-blue-300 font-bold">{selectedFacility.bedOccupancyPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${selectedFacility.bedOccupancyPercent}%` }}
              />
            </div>
          </div>

          {/* Diagnostics Quick Status */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-300 font-mono text-[11px]">DIAGNOSTICS & PHARMACY</span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">CBC Lab:</span>
                <span className={selectedFacility.diagnostics.cbc ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                  {selectedFacility.diagnostics.cbc ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">MRI 1.5T:</span>
                <span className={selectedFacility.diagnostics.mri ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                  {selectedFacility.diagnostics.mri ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: AI Alert Engine & MedRoute Weights Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time HealthAI Rule-Based Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>HealthAI Operational Alert Engine</span>
          </div>

          <div className="space-y-3">
            {emergencyAlerts.map(al => (
              <div
                key={al.id}
                className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                    <strong className="text-white text-sm">{al.facilityName}</strong>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    {al.severity}: {al.value}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{al.reason}</p>

                <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-teal-200 text-[11px]">
                  <strong className="text-teal-300">Action: </strong>
                  {al.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MedRoute Routing Algorithm Weights Tuning */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider font-mono">
              <Sliders className="w-4 h-4" />
              <span>MedRoute AI Algorithm Weight Tuning</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Configurable Super Admin Layer</span>
          </div>

          <p className="text-xs text-slate-300">
            Adjust multi-factor decision weights in real time. All routing calculations adapt instantly across patient and hospital panels.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Clinical Specialty Match</span>
                <span className="font-mono text-teal-300 font-bold">{routingWeights.capabilityWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={routingWeights.capabilityWeight}
                onChange={e => updateRoutingWeights({ capabilityWeight: parseInt(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Doctor Active Availability</span>
                <span className="font-mono text-blue-300 font-bold">{routingWeights.doctorAvailabilityWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={routingWeights.doctorAvailabilityWeight}
                onChange={e => updateRoutingWeights({ doctorAvailabilityWeight: parseInt(e.target.value) })}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Queue & Wait Time Penalty</span>
                <span className="font-mono text-cyan-300 font-bold">{routingWeights.queueWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={routingWeights.queueWeight}
                onChange={e => updateRoutingWeights({ queueWeight: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
