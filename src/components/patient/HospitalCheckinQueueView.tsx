import React, { useState } from 'react';
import {
  QrCode,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  Bell,
  RefreshCw,
  Volume2,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useApp } from '../../services/store';

export const HospitalCheckinQueueView: React.FC = () => {
  const { activeToken, appointments, activePatient, checkInAppointment, playAudioChime } = useApp();

  const [simulatedQueueAhead, setSimulatedQueueAhead] = useState(2);
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const myAppointment = appointments.find(
    a => a.patientId === activePatient.id || a.patientName === activePatient.name
  );

  const tokenNumber = activeToken?.tokenNumber || myAppointment?.token?.tokenNumber || 'A-027';
  const doctorName = activeToken?.doctorName || myAppointment?.doctorName || 'Dr. Ananya Sharma';
  const facilityName = activeToken?.facilityName || myAppointment?.facilityName || 'District Health Centre (DHC)';
  const roomNumber = 'Room 104 (1st Floor, OPD Wing)';

  const handleManualCheckin = () => {
    if (myAppointment) {
      checkInAppointment(myAppointment.id);
    }
    setIsCheckedIn(true);
    setSimulatedQueueAhead(1);
    playAudioChime('success');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>Live OPD Hospital Queue Synchronizer</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-white">Smart OPD Digital Pass & Live Queue</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Scan your digital pass at the entrance kiosk or check in virtually. Receive live updates as your turn approaches.
        </p>
      </div>

      {/* Main Digital Pass Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/60 border border-teal-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">
              {facilityName}
            </span>
            <h2 className="text-xl font-bold text-white">OPD Consultation Pass</h2>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span>Patient: <strong className="text-white">{activePatient.name}</strong></span>
              <span>•</span>
              <span className="font-mono text-teal-300">{activePatient.healthId}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 h-24 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg">
              <QrCode className="w-20 h-20 text-slate-900" />
            </div>
          </div>
        </div>

        {/* Live Queue Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Your Token */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 text-center space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Your Token Number</div>
            <div className="text-3xl font-black font-mono text-teal-300 tracking-wider">
              {tokenNumber}
            </div>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Checked In
            </span>
          </div>

          {/* Currently Serving */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Now Serving in Room</div>
            <div className="text-3xl font-black font-mono text-amber-300 tracking-wider">
              A-025
            </div>
            <span className="inline-block text-[10px] font-bold text-slate-400">
              {simulatedQueueAhead} patients ahead
            </span>
          </div>

          {/* Estimated Wait */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Wait Time</div>
            <div className="text-3xl font-black font-mono text-white tracking-wider flex items-center justify-center gap-1">
              <span>~{simulatedQueueAhead * 5}</span>
              <span className="text-xs text-slate-400 font-sans">mins</span>
            </div>
            <span className="inline-block text-[10px] text-teal-400 font-semibold">
              Live pacing
            </span>
          </div>
        </div>

        {/* Doctor & Room Details */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="text-slate-400">Consulting Physician</div>
            <div className="text-sm font-bold text-white mt-0.5">{doctorName}</div>
          </div>
          <div>
            <div className="text-slate-400">Location / Room</div>
            <div className="text-sm font-bold text-teal-300 mt-0.5">{roomNumber}</div>
          </div>
          <button
            onClick={() => {
              playAudioChime('alert');
              alert(`NEXUS Audio Alert: Token ${tokenNumber} for ${activePatient.name}, please proceed to Room 104.`);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Test Audio Chime</span>
          </button>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Queue Progress (A-020 to A-030)</span>
            <span className="text-teal-400 font-bold">80% to your turn</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full w-4/5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hospital Instructions Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-400" />
          <span>Patient Check-in Guidelines</span>
        </h3>
        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
          <li>Show the QR code above at the automated check-in kiosk near the main lobby entrance.</li>
          <li>Once scanned, your queue token will light up on the overhead LED displays outside Room 104.</li>
          <li>Keep your mobile phone volume on; you will receive an SMS and push alert 2 turns prior.</li>
        </ul>
      </div>
    </div>
  );
};
