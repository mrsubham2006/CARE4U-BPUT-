import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Ambulance,
  MapPin,
  Heart,
  ShieldCheck,
  Building2,
  Clock,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../services/store';

export const EmergencyShortcutView: React.FC = () => {
  const { facilities, activePatient, requestAmbulance, playAudioChime, triggerConfetti } = useApp();

  const [sosTriggered, setSosTriggered] = useState(false);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [etaMinutes, setEtaMinutes] = useState(8);

  const emergencyHospitals = facilities.filter(f => f.emergencyCapability || (f.emergencyBedsAvailable && f.emergencyBedsAvailable > 0) || f.type === 'District Hospital');

  const handleTriggerSOS = async () => {
    playAudioChime('alert');
    const targetFac = emergencyHospitals[0] || facilities[0];
    try {
      const trip = await requestAmbulance(
        activePatient.id,
        activePatient.address || activePatient.villageOrCity || 'Kadegaon Ward 3',
        targetFac.id,
        'Advanced Cardiac Life Support (ACLS)',
        'CRITICAL'
      );
      setActiveTrip(trip);
      setSosTriggered(true);
      triggerConfetti();
    } catch {
      setSosTriggered(true);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Big Emergency Alert Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border-2 border-red-500/60 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400 text-red-200 text-xs font-black animate-pulse">
              <Radio className="w-4 h-4" />
              <span>EMERGENCY CRITICAL DISPATCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              National Emergency & Ambulance SOS
            </h1>
            <p className="text-xs text-red-100/90 max-w-lg">
              One-touch dispatch to 108 Ambulance Network, trauma stabilization centers, and pre-alert to nearest emergency department.
            </p>
          </div>

          <button
            onClick={handleTriggerSOS}
            className="px-8 py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-base flex items-center gap-3 shadow-2xl shadow-red-950 border-2 border-white/20 transition-transform active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>DISPATCH 108 AMBULANCE</span>
          </button>
        </div>

        {sosTriggered && (
          <div className="p-5 rounded-2xl bg-red-950/80 border border-red-400 space-y-3 animate-scale-in text-xs">
            <div className="flex items-center justify-between text-red-200 font-bold">
              <span className="flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-white animate-pulse" />
                <span>
                  Ambulance Unit {activeTrip ? `#${activeTrip.vehicleNumber}` : '#MH-12-EM-1088'} Dispatched
                </span>
              </span>
              <span className="font-mono text-white text-sm">
                ETA: ~{activeTrip ? activeTrip.etaMinutes : etaMinutes} Mins
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black/40 p-3 rounded-xl border border-red-500/30">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block font-mono">Mission ID</span>
                <span className="font-mono text-white font-bold">{activeTrip ? activeTrip.id : 'amb-101'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block font-mono">Driver / Pilot</span>
                <span className="text-white font-bold">{activeTrip ? activeTrip.driverName : 'Suresh Patil (108 Pilot)'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block font-mono">Your Pickup OTP</span>
                <span className="font-mono text-emerald-300 font-black text-sm tracking-widest">{activeTrip ? activeTrip.otp : '4821'}</span>
              </div>
            </div>
            <p className="text-red-100">
              GPS telemetry live-streamed to {activeTrip ? activeTrip.destinationFacilityName : 'District Health Centre Emergency Room'}. Destination Trauma ICU team pre-notified.
            </p>
          </div>
        )}
      </div>

      {/* Emergency Contacts & Quick Dial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Contact */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400">Emergency Family Contact</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-white">{activePatient.emergencyContact}</div>
              <div className="text-xs text-slate-400">Next of Kin • Primary Guardian</div>
            </div>
            <a
              href="tel:9876543210"
              className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Now</span>
            </a>
          </div>
        </div>

        {/* National Helpline */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400">National Health Helpline</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-white">108 / 104 (Toll-Free)</div>
              <div className="text-xs text-slate-400">24x7 Government Emergency Response</div>
            </div>
            <a
              href="tel:108"
              className="p-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Dial 108</span>
            </a>
          </div>
        </div>
      </div>

      {/* Nearby Trauma Centers */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-red-400" />
          <span>Nearest Emergency Trauma Centers with Live Beds</span>
        </h2>

        <div className="space-y-3">
          {emergencyHospitals.map(fac => (
            <div
              key={fac.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="font-bold text-white text-sm">{fac.name}</div>
                <div className="text-slate-400 flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{fac.address || fac.location || fac.type} • {fac.distanceKm} km away</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold font-mono text-emerald-400">
                    {fac.emergencyBedsAvailable ?? (fac.emergencyCapability ? 'Available' : 'Limited')} Beds
                  </div>
                  <div className="text-[10px] text-teal-300 font-mono">
                    {fac.openStatus === 'OPEN_24_7' ? 'Open 24/7 ER' : 'Emergency Triage Ready'}
                  </div>
                </div>

                <a
                  href={`tel:${fac.contactPhone || '108'}`}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                  <span>ER Desk</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
