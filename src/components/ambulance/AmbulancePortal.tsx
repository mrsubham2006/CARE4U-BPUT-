import React, { useState } from 'react';
import { useApp } from '../../services/store';
import { AmbulanceTripStatus, AmbulanceTrip } from '../../types';
import {
  Truck,
  Navigation,
  Phone,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Radio,
  User,
  Building2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const AmbulancePortal: React.FC = () => {
  const {
    currentUser,
    ambulanceTrips,
    updateAmbulanceStatus,
    facilities,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [selectedTripId, setSelectedTripId] = useState<string>(ambulanceTrips[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'ACTIVE_DISPATCH' | 'ALL_REQUESTS' | 'VEHICLE_LOGS'>('ACTIVE_DISPATCH');
  const [driverOtpInput, setDriverOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  const currentTrip = ambulanceTrips.find(t => t.id === selectedTripId) || ambulanceTrips[0];

  const statusWorkflow: AmbulanceTripStatus[] = [
    'AVAILABLE',
    'ASSIGNED',
    'EN_ROUTE',
    'ARRIVED',
    'PATIENT_PICKED',
    'HOSPITAL_ARRIVAL',
    'COMPLETED'
  ];

  const handleNextStatus = () => {
    if (!currentTrip) return;
    const currentIndex = statusWorkflow.indexOf(currentTrip.status);
    if (currentIndex < statusWorkflow.length - 1) {
      const nextStatus = statusWorkflow[currentIndex + 1];
      
      // If moving from ARRIVED to PATIENT_PICKED, require OTP check
      if (currentTrip.status === 'ARRIVED' && nextStatus === 'PATIENT_PICKED') {
        if (driverOtpInput !== currentTrip.otp) {
          setOtpError(`Invalid OTP. Patient OTP is ${currentTrip.otp} (For testing/demo verification).`);
          playAudioChime('alert');
          return;
        }
        setOtpError('');
      }

      updateAmbulanceStatus(currentTrip.id, nextStatus);
      if (nextStatus === 'COMPLETED') {
        triggerConfetti();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Operator Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border border-red-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
            <Truck className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Ambulance Emergency Response Unit
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                EMS-108 ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Driver: <strong>{currentUser?.name || 'Suresh Patil'}</strong> • Vehicle: <strong>MH-12-EM-1088</strong> • GPS Active
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('ACTIVE_DISPATCH')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'ACTIVE_DISPATCH'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚨 Live Dispatch
          </button>
          <button
            onClick={() => setActiveTab('ALL_REQUESTS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'ALL_REQUESTS'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 All Requests ({ambulanceTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('VEHICLE_LOGS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'VEHICLE_LOGS'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🩺 Medical Vitals & Kit
          </button>
        </div>
      </div>

      {activeTab === 'ACTIVE_DISPATCH' && currentTrip && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dispatch Action Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider">
                    MISSION #{currentTrip.id} • {currentTrip.emergencyLevel} PRIORITY
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {currentTrip.ambulanceType}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-800 text-emerald-400 border border-emerald-500/30">
                    {currentTrip.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Workflow Stepper */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Emergency Response Workflow
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {statusWorkflow.filter(s => s !== 'AVAILABLE').map((step, idx) => {
                    const isDone = statusWorkflow.indexOf(currentTrip.status) >= statusWorkflow.indexOf(step);
                    const isCurrent = currentTrip.status === step;
                    return (
                      <div
                        key={step}
                        className={`p-2 rounded-xl border text-center transition ${
                          isCurrent
                            ? 'bg-red-600 text-white border-red-400 font-bold shadow-lg shadow-red-500/30'
                            : isDone
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-medium'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="text-[10px] font-mono opacity-80">0{idx + 1}</div>
                        <div className="text-[11px] leading-tight font-semibold mt-1 truncate">
                          {step.replace(/_/g, ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <MapPin className="w-4 h-4" />
                    <span>Pickup Location</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {currentTrip.pickupAddress}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Patient: <strong className="text-slate-200">{currentTrip.patientName}</strong></span>
                    <a
                      href={`tel:${currentTrip.patientPhone}`}
                      className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{currentTrip.patientPhone}</span>
                    </a>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Building2 className="w-4 h-4" />
                    <span>Destination Trauma Centre</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {currentTrip.destinationFacilityName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>ETA: <strong className="text-emerald-400 font-mono">{currentTrip.etaMinutes} mins</strong></span>
                    <span className="text-slate-400">ICU & Casualty Notified</span>
                  </div>
                </div>
              </div>

              {/* OTP Verification Gate if Arrived at Patient Location */}
              {currentTrip.status === 'ARRIVED' && (
                <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span>Patient Handover Security OTP Verification</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Enter the 4-digit verification code displayed on the patient's phone to verify identity:
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 4821"
                      value={driverOtpInput}
                      onChange={e => setDriverOtpInput(e.target.value)}
                      className="w-36 px-3 py-2 bg-slate-950 border border-amber-500/60 rounded-lg text-center font-mono font-bold text-lg text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-400">
                      (Patient Demo OTP: <strong className="text-amber-300">{currentTrip.otp}</strong>)
                    </span>
                  </div>
                  {otpError && (
                    <p className="text-xs text-red-400 font-semibold">{otpError}</p>
                  )}
                </div>
              )}

              {/* Action Button to advance status */}
              <div className="pt-2">
                {currentTrip.status !== 'COMPLETED' ? (
                  <button
                    onClick={handleNextStatus}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-base shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 cursor-pointer transition transform active:scale-98"
                  >
                    <span>Proceed to Next Phase:</span>
                    <strong className="underline">
                      {statusWorkflow[statusWorkflow.indexOf(currentTrip.status) + 1]?.replace(/_/g, ' ')}
                    </strong>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-center font-bold">
                    ✓ Mission Completed & Patient Handed to Casualty Triage.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Telemetry & Map Card */}
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Live Navigation Telemetry</span>
              </h3>

              {/* Simulated Map / Radar View */}
              <div className="relative h-48 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto animate-pulse">
                    <Truck className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    Lat: {currentTrip.currentLat} • Lng: {currentTrip.currentLng}
                  </div>
                  <div className="text-[11px] text-teal-400 font-semibold">
                    Google Maps Traffic Matrix: Fast Route via Highway Bypass
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Target Facility:</span>
                  <span className="text-white font-medium">{currentTrip.destinationFacilityName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Emergency Casualty Bed:</span>
                  <span className="text-emerald-400 font-bold">Pre-Reserved</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Vehicle Equipment:</span>
                  <span className="text-slate-200">Defibrillator + O2 Cylinder 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ALL_REQUESTS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Emergency Transport Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Trip ID</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Pickup</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ambulanceTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-red-400 font-bold">{trip.id}</td>
                    <td className="p-3 font-semibold text-white">{trip.patientName}</td>
                    <td className="p-3 truncate max-w-xs">{trip.pickupAddress}</td>
                    <td className="p-3 text-slate-300">{trip.destinationFacilityName}</td>
                    <td className="p-3">{trip.ambulanceType}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-teal-300 border border-teal-500/30">
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedTripId(trip.id);
                          setActiveTab('ACTIVE_DISPATCH');
                        }}
                        className="px-2.5 py-1 rounded bg-teal-600 text-white font-bold hover:bg-teal-500 transition cursor-pointer"
                      >
                        View Mission
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'VEHICLE_LOGS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">On-Board Clinical Equipment Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-teal-400">Oxygen Cylinder System</div>
              <div className="text-lg font-bold text-white">180 Bar / Full</div>
              <p className="text-[11px] text-slate-400">Regulator inspected 07:00 AM today.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-teal-400">AED Defibrillator</div>
              <div className="text-lg font-bold text-white">Battery 98% • Ready</div>
              <p className="text-[11px] text-slate-400">Self-test passed with adult & pediatric pads.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-teal-400">Suction Unit & Spine Board</div>
              <div className="text-lg font-bold text-white">Verified On Board</div>
              <p className="text-[11px] text-slate-400">Trauma immobilizers & neck collars checked.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
