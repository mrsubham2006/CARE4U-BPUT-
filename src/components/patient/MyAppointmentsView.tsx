import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  MessageSquare,
  QrCode,
  FileText,
  AlertCircle,
  Send,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Appointment } from '../../types';

interface MyAppointmentsViewProps {
  onJoinVideo: (appointmentId: string) => void;
  onOpenMessaging: (appointmentId: string) => void;
  onViewQueue: () => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({
  onJoinVideo,
  onOpenMessaging,
  onViewQueue
}) => {
  const {
    appointments,
    activePatient,
    checkInAppointment,
    cancelAppointment,
    rescheduleAppointment,
    addAppointmentFeedback,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [feedbackApptId, setFeedbackApptId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [waitTimeRating, setWaitTimeRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [newTimeSlot, setNewTimeSlot] = useState('02:45 PM');

  const myAppointments = appointments.filter(
    a => a.patientId === activePatient.id || a.patientName === activePatient.name
  );

  const upcomingAppointments = myAppointments.filter(
    a => a.status === 'BOOKED' || a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'IN_CONSULTATION' || a.status === 'RESCHEDULED'
  );

  const pastAppointments = myAppointments.filter(
    a => a.status === 'COMPLETED' || a.status === 'CONSULTATION_COMPLETED' || a.status === 'CANCELLED' || a.status === 'LAB_PENDING' || a.status === 'PHARMACY_PENDING'
  );

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackApptId) return;
    addAppointmentFeedback(feedbackApptId, {
      rating,
      waitTimeRating,
      reviewText,
      experienceSummary: `${rating}-Star consultation feedback submitted by patient.`
    });
    setFeedbackApptId(null);
    setReviewText('');
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApptId) return;
    rescheduleAppointment(reschedulingApptId, newTimeSlot);
    setReschedulingApptId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold font-display text-white">My Appointments & Consultations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your booked OPD visits, telemedicine video sessions, token passes, and physician reviews.
          </p>
        </div>

        <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('PAST')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PAST'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past History ({pastAppointments.length})
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {activeTab === 'UPCOMING' ? (
          upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appt => (
              <div
                key={appt.id}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/30 transition-all shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-lg border border-teal-500/30">
                      {appt.doctorName.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{appt.doctorName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
                          {appt.department}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appt.facilityName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {appt.scheduledTime}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {appt.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/30 text-center min-w-[70px]">
                      <div className="text-[9px] text-slate-400 uppercase font-semibold">Token</div>
                      <div className="text-base font-black font-mono text-teal-300">{appt.token?.tokenNumber || 'A-027'}</div>
                    </div>
                  </div>
                </div>

                {/* Symptom snippet */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300">
                  <span className="text-slate-400 font-medium">Chief Concern: </span>
                  {appt.symptomsSummary}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {appt.consultationType === 'VIDEO' ? (
                    <button
                      onClick={() => onJoinVideo(appt.id)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/30"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Video Call</span>
                    </button>
                  ) : (
                    <button
                      onClick={onViewQueue}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-900/30"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View Live Queue & Pass</span>
                    </button>
                  )}

                  {appt.status === 'BOOKED' && (
                    <button
                      onClick={() => checkInAppointment(appt.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Check In Early</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenMessaging(appt.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                    <span>Message ({appt.messages?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setReschedulingApptId(appt.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No upcoming appointments</div>
              <p className="text-xs text-slate-400">You have no upcoming consultations in the schedule.</p>
            </div>
          )
        ) : (
          pastAppointments.length > 0 ? (
            pastAppointments.map(appt => (
              <div
                key={appt.id}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{appt.doctorName}</h3>
                      <span className="text-xs text-slate-400 font-medium">({appt.department})</span>
                    </div>
                    <div className="text-xs text-slate-400">{appt.facilityName} • {appt.scheduledTime}</div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appt.status === 'CANCELLED' ? 'bg-red-500/15 text-red-300 border border-red-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {appt.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300">{appt.symptomsSummary}</div>

                {/* Doctor Review / Feedback Block */}
                {appt.feedback ? (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < appt.feedback!.rating ? 'fill-amber-400' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-white">{appt.feedback.rating}/5 Stars</span>
                    </div>
                    <p className="text-slate-300 italic">"{appt.feedback.reviewText}"</p>
                  </div>
                ) : (
                  appt.status !== 'CANCELLED' && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">Share your consultation experience:</span>
                      <button
                        onClick={() => setFeedbackApptId(appt.id)}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span>Rate & Review Doctor</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            ))
          ) : (
            <div className="p-10 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No past appointment history</div>
            </div>
          )
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingApptId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Reschedule Consultation</h3>
              <button
                type="button"
                onClick={() => setReschedulingApptId(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Select New Available Slot</label>
              <div className="grid grid-cols-2 gap-2">
                {['11:45 AM', '02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM'].map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setNewTimeSlot(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold ${
                      newTimeSlot === slot
                        ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                        : 'bg-slate-950 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingApptId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctor Feedback Modal */}
      {feedbackApptId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleFeedbackSubmit}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Doctor Feedback & Quality Rating</h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackApptId(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Doctor Consultation Quality</label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-300 ml-2">{rating} Stars</span>
              </div>
            </div>

            {/* Wait time rating */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">OPD Wait Time Satisfaction</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setWaitTimeRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= waitTimeRating ? 'text-teal-400 fill-teal-400' : 'text-slate-700'}`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-teal-300 ml-2">{waitTimeRating}/5</span>
              </div>
            </div>

            {/* Written Review */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Detailed Review Comments</label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share how the doctor explained your condition, medication clarity, and overall care..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackApptId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
