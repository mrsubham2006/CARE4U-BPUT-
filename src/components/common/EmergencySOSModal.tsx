import React, { useState } from 'react';
import { useApp } from '../../services/store';
import {
  AlertTriangle,
  X,
  Truck,
  Phone,
  Building2,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  HeartPulse
} from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    activePatient,
    facilities,
    requestAmbulance,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [pickupLocation, setPickupLocation] = useState('Ward 4, Near Gandhi Chawk, Kudal');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || 'fac-dhc');
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [dispatchedTrip, setDispatchedTrip] = useState<any>(null);

  if (!isOpen) return null;

  const handleDispatch = async () => {
    playAudioChime('alert');
    const trip = await requestAmbulance(
      activePatient.id,
      pickupLocation,
      selectedFacilityId,
      'Advanced Cardiac Life Support (ACLS)',
      'CRITICAL'
    );
    setDispatchedTrip(trip);
    setIsDispatched(true);
    triggerConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-red-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-red-500 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 p-5 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 animate-pulse">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                EMERGENCY SOS & 108 AMBULANCE DISPATCH
              </h2>
              <p className="text-xs text-red-300">
                Direct Hotline to District Trauma Network & Emergency Casualty
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {!isDispatched ? (
            <>
              {/* Emergency Hotline Banner */}
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-red-400 font-bold uppercase block">
                    National Emergency Helpline
                  </span>
                  <strong className="text-2xl font-black text-white font-mono">108 / 112</strong>
                </div>
                <a
                  href="tel:108"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-600/40 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 108 Direct</span>
                </a>
              </div>

              {/* Form Input */}
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Pickup Location / Patient Address:
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-red-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Destination Emergency Facility:
                  </label>
                  <select
                    value={selectedFacilityId}
                    onChange={e => setSelectedFacilityId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.distanceKm} km away • {f.openStatus.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick CPR Guidance */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <HeartPulse className="w-4 h-4" />
                  <span>Immediate First-Aid Instructions:</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Keep the patient lying flat with airway clear. If unconscious without pulse, begin firm chest compressions in center of chest (100–120 per minute).
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleDispatch}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base shadow-2xl shadow-red-600/50 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98"
              >
                <Truck className="w-6 h-6 animate-pulse" />
                <span>DISPATCH EMERGENCY AMBULANCE NOW</span>
              </button>
            </>
          ) : (
            /* Dispatched Confirmation */
            <div className="space-y-4 text-center py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Ambulance Dispatched!</h3>
                <p className="text-xs text-slate-300">
                  Vehicle <strong>{dispatchedTrip?.vehicleNumber}</strong> is en-route to your location.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Pilot Driver</span>
                  <strong className="text-white text-xs">{dispatchedTrip?.driverName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Estimated Arrival</span>
                  <strong className="text-emerald-400 font-mono text-sm">~{dispatchedTrip?.etaMinutes} Minutes</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Security Handover OTP</span>
                  <strong className="text-amber-400 font-mono text-base">{dispatchedTrip?.otp}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Hospital Casualty</span>
                  <span className="text-teal-400 font-bold text-xs">Pre-Alerted</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Track Live on Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
