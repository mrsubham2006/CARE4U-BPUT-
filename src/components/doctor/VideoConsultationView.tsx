import React, { useEffect, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Stethoscope,
  Maximize2,
  FileText,
  Clock,
  User,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Appointment } from '../../types';

interface VideoConsultationViewProps {
  appointment: Appointment;
  onProceedToPrescription: () => void;
  onEndCall: () => void;
}

export const VideoConsultationView: React.FC<VideoConsultationViewProps> = ({
  appointment,
  onProceedToPrescription,
  onEndCall
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [quickNotes, setQuickNotes] = useState('');

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request media stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          activeStream = s;
          setStream(s);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        }
      } catch (err: any) {
        console.warn('Could not access camera/mic:', err);
        setCameraPermissionError(
          'Camera / microphone preview simulated (Permission denied or hardware not found).'
        );
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(prev => !prev);
    } else {
      setIsAudioMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted(prev => !prev);
    } else {
      setIsVideoMuted(prev => !prev);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Video Call Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-display">
                Teleconsultation: {appointment.patientName}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Room ID: room-{appointment.id} • Duration: {formatSeconds(callDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onProceedToPrescription}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Prescription & Finish</span>
          </button>
          <button
            onClick={onEndCall}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-900/30"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {cameraPermissionError && (
        <div className="px-4 py-2 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraPermissionError}</span>
        </div>
      )}

      {/* Main Video Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Video Windows (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Simulated Remote Patient Video Feed */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/40 text-teal-300 flex items-center justify-center text-4xl shadow-inner font-display font-bold">
                {appointment.patientName[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{appointment.patientName}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Patient Connected via CARE4U Nexus WebRTC Gateway
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] text-emerald-300 font-mono">Audio / Video Encrypted</span>
                </div>
              </div>
            </div>

            {/* Doctor Self Preview (Picture in Picture) */}
            <div className="absolute bottom-4 right-4 w-44 h-32 bg-slate-900 rounded-2xl border-2 border-teal-500/60 overflow-hidden shadow-2xl">
              {isVideoMuted ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] font-mono">
                  <VideoOff className="w-5 h-5 mb-1 text-slate-600" />
                  <span>Camera Off</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-1 left-2 text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-white">
                You (Doctor)
              </div>
            </div>

            {/* In-Call Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 shadow-xl">
              <button
                onClick={toggleAudio}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isAudioMuted
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isVideoMuted
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                onClick={onProceedToPrescription}
                className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Issue Prescription</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: In-Call Doctor Scratchpad Notes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs font-mono uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>In-Consultation Clinical Notes</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Record live observations during the video call. Notes will carry over to the prescription workspace.
            </p>

            <textarea
              rows={9}
              value={quickNotes}
              onChange={e => setQuickNotes(e.target.value)}
              placeholder="Patient reports onset of symptoms 3 days ago. No dyspnea. Cough dry..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-teal-400 resize-none font-mono"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[10px] text-slate-400 font-mono">
              Patient Chief Complaint: <span className="text-white">{appointment.symptomsSummary}</span>
            </div>
            <button
              onClick={onProceedToPrescription}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Proceed to Prescription Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
