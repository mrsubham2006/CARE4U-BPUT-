import React, { useState } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Share2,
  ShieldCheck,
  Stethoscope,
  Heart,
  Activity,
  Send,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { useApp } from '../../services/store';

interface VideoConsultationViewProps {
  appointmentId?: string;
  onEndCall: () => void;
}

export const VideoConsultationView: React.FC<VideoConsultationViewProps> = ({
  appointmentId,
  onEndCall
}) => {
  const { appointments, activePatient, playAudioChime } = useApp();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Dr. Ananya Sharma', text: 'Hello Rahul! I can see your recent symptom log and chest vitals. How are you feeling today?', time: '10:02 AM' },
    { sender: 'You', text: 'Hello Doctor. The wheezing has reduced but I feel mild throat congestion in the morning.', time: '10:03 AM' }
  ]);

  const appt = appointments.find(a => a.id === appointmentId) || appointments[0];
  const doctorName = appt?.doctorName || 'Dr. Ananya Sharma';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages([
      ...messages,
      {
        sender: 'You',
        text: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatMessage('');
    playAudioChime('click');
  };

  return (
    <div className="space-y-4 pb-8 animate-fade-in max-w-6xl mx-auto">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Live Teleconsultation: {doctorName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                HD WebRTC Encrypted
              </span>
            </h1>
            <div className="text-[11px] text-slate-400">Patient: {activePatient.name} • Health ID: {activePatient.healthId}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Vitals Pills */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-rose-500/30 text-rose-300 font-mono flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
              <span>74 BPM</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-teal-500/30 text-teal-300 font-mono flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>98% SpO2</span>
            </span>
          </div>

          <button
            onClick={onEndCall}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-900/30"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport & Optional Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Doctor Stream & Controls (8 or 12 Cols) */}
        <div className={`${isChatOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
            {/* Simulated Remote Doctor Video */}
            <div className="text-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-3xl mx-auto shadow-xl">
                {doctorName.replace('Dr. ', '').charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{doctorName}</h3>
                <div className="text-xs text-teal-400">Chief Pulmonology Specialist</div>
                <div className="text-[10px] text-slate-400 mt-1">Audio/Video Stream Active • 1080p 60fps</div>
              </div>
            </div>

            {/* Self Video Thumbnail PIP */}
            <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video rounded-2xl bg-slate-900 border-2 border-teal-500/40 shadow-xl flex items-center justify-center overflow-hidden">
              {isVideoOn ? (
                <div className="text-center">
                  <div className="text-xs font-bold text-white">{activePatient.name}</div>
                  <div className="text-[10px] text-teal-400">Self Video (Live)</div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500">Camera Off</div>
              )}
            </div>

            {/* Floating Controls Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 shadow-2xl">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-all ${
                  isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
                title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-all ${
                  isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
                title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-3 rounded-full transition-all ${
                  isChatOpen ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title="Toggle In-Call Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                onClick={onEndCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg"
                title="Disconnect Consultation"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: In-Call Chat (4 Cols) */}
        {isChatOpen && (
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col h-[400px] lg:h-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                <span>In-Call Live Consultation Chat</span>
              </h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs space-y-1 ${
                    m.sender === 'You'
                      ? 'bg-teal-600/20 border border-teal-500/30 text-teal-200 ml-4'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 mr-4'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type a message to doctor..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
