import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Search,
  Filter,
  User,
  Stethoscope,
  XCircle,
  FileText,
  AlertCircle,
  Building2,
  ChevronRight,
  MoreVertical,
  MessageSquare,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import { Appointment } from '../../types';
import { updateAppointmentStatus } from './doctorService';
import { useApp } from '../../services/store';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onStartConsultation: (appointment: Appointment, type: 'OPD' | 'VIDEO_CONSULTATION') => void;
  onViewPatientProfile: (patientId: string, appointment?: Appointment) => void;
  playAudioChime?: (sound?: 'alert' | 'click' | 'success') => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onSelectAppointment,
  onStartConsultation,
  onViewPatientProfile,
  playAudioChime
}) => {
  const { sendAppointmentMessage, currentUser, appointments: storeAppointments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [updatingAptId, setUpdatingAptId] = useState<string | null>(null);
  const [chatAppointmentId, setChatAppointmentId] = useState<string | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');

  // Merge store appointment data to capture latest real-time messages
  const effectiveAppointments = appointments.map(apt => {
    const storeApt = storeAppointments.find(sa => sa.id === apt.id);
    return storeApt || apt;
  });

  const activeChatApt = chatAppointmentId
    ? effectiveAppointments.find(a => a.id === chatAppointmentId) || null
    : null;

  const handleSendDoctorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeChatApt) return;
    sendAppointmentMessage(activeChatApt.id, {
      sender: 'DOCTOR',
      senderName: currentUser?.name || 'Dr. Rajesh Sharma, MD',
      text: chatMessageText.trim()
    });
    setChatMessageText('');
    if (playAudioChime) playAudioChime('click');
  };

  const handleStatusChange = async (aptId: string, newStatus: Appointment['status']) => {
    try {
      setUpdatingAptId(aptId);
      if (playAudioChime) playAudioChime('click');
      await updateAppointmentStatus(aptId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingAptId(null);
    }
  };

  const filteredAppointments = effectiveAppointments.filter(apt => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.token?.tokenNumber && apt.token.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (apt.department && apt.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      apt.status === statusFilter ||
      (statusFilter === 'ACTIVE' &&
        ['BOOKED', 'CONFIRMED', 'CHECKED_IN', 'WAITING', 'IN_CONSULTATION'].includes(apt.status));

    const isVideo =
      apt.consultationType === 'VIDEO' || (apt as any).appointmentType === 'VIDEO_CONSULTATION';
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'VIDEO' && isVideo) ||
      (typeFilter === 'OPD' && !isVideo);

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header with Search and Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              <span>Patient Appointments Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review booked visits, manage consultation statuses, direct patient messaging, and initiate OPD or Teleconsultations.
            </p>
          </div>

          <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-teal-300 border border-slate-700">
            Total Records: {effectiveAppointments.length}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, token, ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active in Queue</option>
              <option value="BOOKED">Booked</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="IN_CONSULTATION">In Consultation</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            >
              <option value="ALL">All Types (OPD & Video)</option>
              <option value="OPD">In-Person OPD Only</option>
              <option value="VIDEO">Video Teleconsultation Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-500 text-xs space-y-2">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-400">No appointments found</p>
            <p className="text-[11px] text-slate-600">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        ) : (
          filteredAppointments.map(apt => {
            const isVideo =
              apt.consultationType === 'VIDEO' || (apt as any).appointmentType === 'VIDEO_CONSULTATION';
            const isCompleted =
              apt.status === 'COMPLETED' || apt.status === 'CONSULTATION_COMPLETED';
            const isCancelled = apt.status === 'CANCELLED';
            const messageCount = apt.messages?.length || 0;

            return (
              <div
                key={apt.id}
                className={`p-5 rounded-3xl border transition bg-slate-900/90 ${
                  isCompleted
                    ? 'border-emerald-500/30'
                    : isCancelled
                    ? 'border-rose-500/30 opacity-75'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Patient Meta & Token */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex flex-col items-center justify-center font-bold font-mono shrink-0">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">TOKEN</span>
                      <span className="text-sm">{apt.token?.tokenNumber || 'APT'}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{apt.patientName}</h3>
                        <span className="text-xs text-slate-400">
                          {apt.patientAge} Years • {apt.patientGender}
                        </span>

                        {isVideo ? (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Video className="w-3 h-3" /> VIDEO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-mono font-bold">
                            OPD
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            apt.status === 'COMPLETED' || apt.status === 'CONSULTATION_COMPLETED'
                              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                              : apt.status === 'IN_CONSULTATION'
                              ? 'bg-blue-950/80 border-blue-500/40 text-blue-300 animate-pulse'
                              : apt.status === 'CHECKED_IN'
                              ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                              : apt.status === 'CANCELLED'
                              ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium">
                        Reason for visit: <span className="text-slate-200">{apt.symptomsSummary || 'General health review'}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{apt.scheduledTime || 'Slot 10:00 AM'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{apt.facilityName || 'Primary Facility'}</span>
                        </span>
                        <span>•</span>
                        <span>ID: {apt.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <button
                      onClick={() => onViewPatientProfile(apt.patientId, apt)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      <span>Patient Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        if (playAudioChime) playAudioChime('click');
                        setChatAppointmentId(apt.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                      <span>Chat</span>
                      {messageCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-teal-400 text-slate-950 font-bold font-mono text-[10px]">
                          {messageCount}
                        </span>
                      )}
                    </button>

                    {apt.status !== 'CHECKED_IN' && !isCompleted && !isCancelled && (
                      <button
                        disabled={updatingAptId === apt.id}
                        onClick={() => handleStatusChange(apt.id, 'CHECKED_IN')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer"
                      >
                        Mark Checked-In
                      </button>
                    )}

                    {!isCompleted && !isCancelled && (
                      <button
                        onClick={() =>
                          onStartConsultation(apt, isVideo ? 'VIDEO_CONSULTATION' : 'OPD')
                        }
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        {isVideo ? <Video className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                        <span>{isVideo ? 'Join Video Room' : 'Start OPD'}</span>
                      </button>
                    )}

                    {!isCompleted && !isCancelled && (
                      <button
                        disabled={updatingAptId === apt.id}
                        onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                        className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer text-xs"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Direct Doctor-Patient Messaging Modal */}
      {activeChatApt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Chat Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-display">
                      Direct Chat: {activeChatApt.patientName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold">
                      Token #{activeChatApt.token?.tokenNumber || 'APT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {activeChatApt.patientAge}y • {activeChatApt.patientGender} • Complaint: {activeChatApt.symptomsSummary || 'General consultation'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatAppointmentId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {(!activeChatApt.messages || activeChatApt.messages.length === 0) ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">No messages exchanged yet</p>
                  <p className="text-[11px] text-slate-500">
                    Send a direct clinical instruction or query to {activeChatApt.patientName}.
                  </p>
                </div>
              ) : (
                activeChatApt.messages.map((msg, i) => {
                  const isDoctor = msg.sender === 'DOCTOR';
                  return (
                    <div
                      key={msg.id || i}
                      className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-300">
                          {isDoctor ? `${msg.senderName || 'You (Doctor)'}` : `${msg.senderName || activeChatApt.patientName}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                          isDoctor
                            ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                            : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Canned Clinical Suggestions */}
            <div className="px-5 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] text-slate-500 uppercase font-mono shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-400" /> Quick Replies:
              </span>
              {[
                'Please take prescribed medicines after meals as directed.',
                'Your lab test sample has been collected and is being analyzed.',
                'Please proceed to Room 03 for physical OPD consultation.',
                'Please join the secure video room now for your teleconsultation.'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatMessageText(suggestion)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition cursor-pointer border border-slate-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendDoctorMessage} className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950/40">
              <input
                type="text"
                placeholder={`Type a clinical message to ${activeChatApt.patientName}...`}
                value={chatMessageText}
                onChange={e => setChatMessageText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
              <button
                type="submit"
                disabled={!chatMessageText.trim()}
                className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
