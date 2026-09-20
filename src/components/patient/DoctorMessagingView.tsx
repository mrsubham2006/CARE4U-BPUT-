import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Stethoscope,
  Building2,
  Clock,
  Video,
  CheckCheck,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useApp } from '../../services/store';

interface DoctorMessagingViewProps {
  initialAppointmentId?: string;
  onBookFollowUp: () => void;
  onStartVideo: (appointmentId: string) => void;
}

export const DoctorMessagingView: React.FC<DoctorMessagingViewProps> = ({
  initialAppointmentId,
  onBookFollowUp,
  onStartVideo
}) => {
  const { appointments, activePatient, sendAppointmentMessage, playAudioChime } = useApp();

  const myAppointments = appointments.filter(
    a => a.patientId === activePatient.id || a.patientName === activePatient.name
  );

  const [selectedApptId, setSelectedApptId] = useState<string>(
    initialAppointmentId || myAppointments[0]?.id || 'apt-1'
  );
  const [inputText, setInputText] = useState('');

  const activeAppt = myAppointments.find(a => a.id === selectedApptId) || myAppointments[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeAppt) return;
    sendAppointmentMessage(activeAppt.id, {
      sender: 'PATIENT',
      senderName: activePatient.name,
      text: inputText
    });
    setInputText('');
    playAudioChime('click');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Direct Doctor & Care Team Messaging</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              HIPAA & ABDM Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Secure asynchronous communication with your treating physicians for post-consultation queries and prescription clarifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Doctor Threads (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consulting Physicians</h2>
          {myAppointments.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedApptId(a.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                activeAppt?.id === a.id
                  ? 'bg-slate-900 border-teal-500 shadow-xl shadow-teal-950/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{a.doctorName}</span>
                <span className="text-[10px] font-mono text-teal-400">{a.department}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{a.facilityName}</div>
              <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                <span>{a.messages?.length || 0} messages</span>
                <span className="text-emerald-400 font-mono">Active</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Message Window (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[500px]">
          {activeAppt ? (
            <>
              {/* Doctor Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center border border-teal-500/30">
                    {activeAppt.doctorName.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{activeAppt.doctorName}</h3>
                    <div className="text-[11px] text-slate-400">{activeAppt.department} • {activeAppt.facilityName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartVideo(activeAppt.id)}
                    className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
                    title="Start Video Consultation"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onBookFollowUp}
                    className="p-2 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30"
                    title="Book Follow-up Slot"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {activeAppt.messages && activeAppt.messages.length > 0 ? (
                   activeAppt.messages.map(m => (
                     <div
                       key={m.id}
                       className={`p-3.5 rounded-2xl text-xs space-y-1 max-w-[80%] ${
                        m.sender === 'PATIENT'
                           ? 'bg-teal-600 text-white ml-auto shadow-md shadow-teal-950/40 rounded-br-none'
                           : 'bg-slate-950 border border-slate-850 text-slate-200 mr-auto rounded-bl-none'
                       }`}
                     >
                       <div className="flex justify-between items-center gap-4 text-[10px] opacity-80 pb-0.5">
                         <span className="font-bold">{m.senderName}</span>
                         <span>{m.timestamp}</span>
                       </div>
                      <p className="leading-relaxed">{m.text}</p>
                     </div>
                   ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No messages yet with {activeAppt.doctorName}. Send a query below.
                  </div>
                )}
              </div>

              {/* Send Form */}
              <form onSubmit={handleSend} className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Ask a question regarding your diagnosis, medicines, or report..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-900/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select a doctor from the left to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
