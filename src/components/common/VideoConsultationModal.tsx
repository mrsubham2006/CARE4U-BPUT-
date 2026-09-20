import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../services/store';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
  Send,
  X,
  Maximize2,
  Share2
} from 'lucide-react';

interface VideoConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
}

export const VideoConsultationModal: React.FC<VideoConsultationModalProps> = ({
  isOpen,
  onClose,
  appointmentId
}) => {
  const {
    currentUser,
    activePatient,
    appointments,
    completeConsultation,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [activeSidePanel, setActiveSidePanel] = useState<'NOTES' | 'CHAT'>('NOTES');
  const [callDuration, setCallDuration] = useState(0);

  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'System', text: 'Encrypted LiveKit WebRTC channel connected. End-to-end media channel secure.', time: '00:00' },
    { sender: 'Dr. Rajesh Sharma, MD', text: 'Hello Rahul! I can see your CBC lab reports and previous history. How is the fever today?', time: '00:05' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Clinical Notes state
  const [clinicalObs, setClinicalObs] = useState('Patient febrile, alert, mild pharyngeal congestion. No respiratory distress.');
  const [provisionalDiag, setProvisionalDiag] = useState('Acute Viral Pyrexia with reactive lymphocytosis');
  const [doctorNotes, setDoctorNotes] = useState('Hydration advised. Prescribing Paracetamol 500mg and ORS electrolytes.');

  const targetAppt = appointments.find(a => a.id === appointmentId) || appointments[0];

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        sender: currentUser?.name || 'You',
        text: chatInput,
        time: formatDuration(callDuration)
      }
    ]);
    setChatInput('');
    playAudioChime('click');
  };

  const handleEndAndSaveConsultation = async () => {
    if (currentUser?.role === 'DOCTOR' || currentUser?.role === 'SUPER_ADMIN') {
      await completeConsultation(targetAppt.id, {
        vitals: { temperature: '101.4°F', bloodPressure: '120/80', pulseRate: '88 bpm', spO2: '98%' },
        clinicalObservations: clinicalObs,
        provisionalDiagnosis: provisionalDiag,
        doctorNotes,
        prescriptions: [
          { medicineName: 'Paracetamol 500mg', dosage: '500 mg', frequency: 'Twice daily', durationDays: 3 }
        ],
        orderedLabTests: ['Complete Blood Count (CBC)'],
        followUpDate: '2026-09-24'
      });
    }
    playAudioChime('success');
    triggerConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Call Top Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Teleconsultation Room: {targetAppt?.token.tokenNumber || 'A-027'}
                </h3>
                <span className="px-2 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono">
                  LIVEKIT SFU ENCRYPTED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Patient: <strong className="text-slate-200">{targetAppt?.patientName}</strong> • Clinician: <strong className="text-slate-200">{targetAppt?.doctorName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 font-bold">
              <span>⏱</span>
              <span>{formatDuration(callDuration)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video & Panel Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden bg-slate-950">
          {/* Main Video Tile Area */}
          <div className="lg:col-span-2 relative p-4 flex flex-col justify-between overflow-hidden bg-slate-950">
            {/* Primary Doctor/Patient Stream */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-800 flex items-center justify-center">
              {/* Simulated Doctor Video feed */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80"
                  alt="Doctor Video Feed"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40"></div>

                {/* Stream Overlay info */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold">{targetAppt?.doctorName} (Consultant)</span>
                </div>

                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
                  <span>HD 1080p • 60 fps • 0% Packet Loss</span>
                </div>
              </div>

              {/* PiP (Patient's Self Stream) */}
              <div className="absolute top-4 right-4 w-36 h-48 sm:w-44 sm:h-56 rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl">
                {isCameraOn ? (
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
                    alt="Self Stream"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900 text-xs">
                    <VideoOff className="w-6 h-6 mb-1 text-slate-600" />
                    <span>Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-white font-semibold">
                  You ({currentUser?.name || 'Patient'})
                </div>
              </div>
            </div>

            {/* Bottom Call Controls Bar */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsMicOn(!isMicOn);
                  playAudioChime('click');
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  isMicOn
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-red-600/20 border-red-500/40 text-red-400'
                }`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  setIsCameraOn(!isCameraOn);
                  playAudioChime('click');
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  isCameraOn
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-red-600/20 border-red-500/40 text-red-400'
                }`}
                title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={handleEndAndSaveConsultation}
                className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition cursor-pointer"
                title="End Consultation Call"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Consultation</span>
              </button>

              <button
                onClick={() => setActiveSidePanel(activeSidePanel === 'NOTES' ? 'CHAT' : 'NOTES')}
                className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-teal-300 hover:bg-slate-700 transition cursor-pointer lg:hidden"
              >
                {activeSidePanel === 'NOTES' ? <MessageSquare className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Right Side Companion Panel: Clinical Notes / Chat */}
          <div className="border-l border-slate-800 bg-slate-900 flex flex-col">
            {/* Panel Tabs */}
            <div className="p-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setActiveSidePanel('NOTES')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeSidePanel === 'NOTES'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Clinical Notes</span>
              </button>
              <button
                onClick={() => setActiveSidePanel('CHAT')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeSidePanel === 'CHAT'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat & Files</span>
              </button>
            </div>

            {/* Notes View */}
            {activeSidePanel === 'NOTES' ? (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Clinical Observations & Symptoms
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalObs}
                    onChange={e => setClinicalObs(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Provisional Diagnosis
                  </label>
                  <input
                    type="text"
                    value={provisionalDiag}
                    onChange={e => setProvisionalDiag(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Doctor Advice & Management Plan
                  </label>
                  <textarea
                    rows={3}
                    value={doctorNotes}
                    onChange={e => setDoctorNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-[11px] text-teal-300">
                  ✓ Consultation notes will automatically sync to Patient Health Wallet, Lab queue, and Pharmacy e-Prescription queue upon completion.
                </div>
              </div>
            ) : (
              /* Chat View */
              <div className="flex-1 flex flex-col justify-between overflow-hidden p-3">
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                        msg.sender === (currentUser?.name || 'You')
                          ? 'ml-auto bg-teal-600 text-white rounded-br-xs'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-bl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono opacity-80 mb-1">
                        <span>{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type message to doctor..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
