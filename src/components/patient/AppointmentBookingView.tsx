import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  CreditCard,
  QrCode,
  ArrowRight,
  User,
  Stethoscope,
  Sparkles,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Doctor } from '../../types';

type ConsultationType = 'IN_PERSON' | 'VIDEO';

interface AppointmentBookingViewProps {
  initialDoctor?: Doctor | null;
  onBookingComplete: (appointmentId: string) => void;
}

export const AppointmentBookingView: React.FC<AppointmentBookingViewProps> = ({
  initialDoctor,
  onBookingComplete
}) => {
  const {
    doctors,
    facilities,
    activePatient,
    bookAppointment,
    createRazorpayOrder,
    verifyRazorpayPayment,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctor ? initialDoctor.id : doctors[0]?.id || 'doc-1'
  );
  const [consultationType, setConsultationType] = useState<ConsultationType>('IN_PERSON');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM');
  const [symptoms, setSymptoms] = useState<string>('General OPD consultation and vital checks');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
  const selectedFacility = facilities.find(f => f.id === selectedDoctor?.facilityId) || facilities[0];

  const availableSlots = [
    '09:30 AM',
    '10:15 AM',
    '11:00 AM',
    '11:45 AM',
    '02:00 PM',
    '02:45 PM',
    '03:30 PM',
    '04:15 PM'
  ];

  const docFee = selectedDoctor.consultationFee ?? 0;
  const fee = consultationType === 'VIDEO' ? Math.max(docFee, 150) : docFee;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    playAudioChime('click');

    try {
      // 1. Book appointment
      const newAppt = await bookAppointment(
        selectedDoctor.id,
        selectedFacility.id,
        selectedDoctor.specialty,
        symptoms,
        selectedSlot
      );

      // 2. If fee > 0, simulate Razorpay payment
      if (fee > 0) {
        const order = await createRazorpayOrder(newAppt.id, fee);
        await verifyRazorpayPayment(order.orderId, 'pay_rzp_live_' + Date.now(), 'UPI');
      }

      setIsProcessing(false);
      setBookingSuccessData(newAppt);
      playAudioChime('success');
      triggerConfetti();
    } catch (err) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Book Doctor OPD & Teleconsultation Slot</h1>
        <p className="text-xs text-slate-400">
          Instant digital token issuance with verified queue scheduling across district healthcare network.
        </p>
      </div>

      {bookingSuccessData ? (
        /* Success Receipt Card */
        <div className="bg-slate-900/90 border border-teal-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto border border-teal-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-display text-white">Appointment Confirmed!</h2>
            <p className="text-xs text-slate-400">
              Your appointment has been registered in the Hospital Information System (HIS).
            </p>
          </div>

          {/* Pass Box */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-4 text-left shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Digital Token</div>
                <div className="text-2xl font-black font-mono text-teal-300 tracking-wider">
                  {bookingSuccessData.token.tokenNumber}
                </div>
              </div>
              <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Doctor</div>
                <div className="font-bold text-white mt-0.5">{bookingSuccessData.doctorName}</div>
                <div className="text-[10px] text-teal-400">{bookingSuccessData.department}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Facility</div>
                <div className="font-bold text-white mt-0.5">{bookingSuccessData.facilityName}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Time & Slot</div>
                <div className="font-bold text-white mt-0.5">{bookingSuccessData.scheduledTime}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
                <span className="font-bold text-emerald-400 font-mono">CONFIRMED</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onBookingComplete(bookingSuccessData.id)}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30"
            >
              <span>View in My Appointments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setBookingSuccessData(null)}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Book Another Slot
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Doctor & Mode Selection (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              {/* Doctor Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>Choose Clinician</span>
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-teal-500"
                >
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id} className="bg-slate-900">
                      {doc.name} — {doc.specialty} ({doc.facilityName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Mini-Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-lg border border-teal-500/30">
                    {selectedDoctor.name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedDoctor.name}</h3>
                    <div className="text-xs text-teal-400 font-medium">{selectedDoctor.specialty}</div>
                    <div className="text-[10px] text-slate-400">{selectedFacility.name} • {selectedDoctor.experienceYears} yrs experience</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Consultation Fee</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    {selectedDoctor.consultationFee === 0 ? 'Free' : `₹${selectedDoctor.consultationFee}`}
                  </div>
                </div>
              </div>

              {/* Consultation Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('IN_PERSON')}
                    className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                      consultationType === 'IN_PERSON'
                        ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-md shadow-teal-900/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                      <span>In-Person OPD Desk</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Visit hospital OPD room. Receive live queue token on phone.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('VIDEO')}
                    className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                      consultationType === 'VIDEO'
                        ? 'bg-purple-500/15 border-purple-500 text-purple-300 shadow-md shadow-purple-900/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Video className="w-4 h-4" />
                      <span>Telemedicine Video Call</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      HD WebRTC consultation room with audio & screen sharing.
                    </p>
                  </button>
                </div>
              </div>

              {/* Reason for Visit */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Symptoms / Reason for Visit
                </label>
                <textarea
                  rows={3}
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms (e.g., Persistent cough, high fever, post-medication checkup)..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right: Date, Slots, Summary & Confirmation (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Choose Date</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Available Time Slots</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                        selectedSlot === slot
                          ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Consultation Summary</div>
                <div className="flex justify-between text-slate-300">
                  <span>Patient:</span>
                  <strong className="text-white">{activePatient.name}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Mode:</span>
                  <strong className="text-teal-300">{consultationType === 'VIDEO' ? 'Video Telehealth' : 'In-Person OPD'}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Date & Slot:</span>
                  <strong className="text-white">{selectedDate} at {selectedSlot}</strong>
                </div>
                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-bold">
                  <span>Total Payable:</span>
                  <span className="text-emerald-400 font-mono text-sm">{fee === 0 ? '₹0 (Free Govt)' : `₹${fee}`}</span>
                </div>
              </div>

              {/* Submit / Confirm Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-teal-900/40 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Generating Digital Token...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>{fee === 0 ? 'Confirm Free OPD Slot' : `Pay ₹${fee} & Confirm Booking`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
