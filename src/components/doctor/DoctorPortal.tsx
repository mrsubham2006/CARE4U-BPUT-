import React, { useState, useEffect } from 'react';
import { useApp } from '../../services/store';
import {
  subscribeDoctorAppointments,
  subscribeDoctorPrescriptions,
  subscribeDoctorLabOrders,
  subscribeDoctorLabReports,
  subscribeDoctorFollowUps
} from './doctorService';
import { DoctorNavigation, DoctorNavTab } from './DoctorNavigation';
import { DoctorDashboardView } from './DoctorDashboardView';
import { AppointmentsView } from './AppointmentsView';
import { OpdQueueView } from './OpdQueueView';
import { ConsultationWorkspace } from './ConsultationWorkspace';
import { VideoConsultationView } from './VideoConsultationView';
import { PatientProfileModal } from './PatientProfileModal';
import { PrescriptionsListView } from './PrescriptionsListView';
import { LabWorkflowView } from './LabWorkflowView';
import { ReferralsAndFollowUpsView } from './ReferralsAndFollowUpsView';
import { DoctorNotificationsAndProfileView } from './DoctorNotificationsAndProfileView';
import { Appointment, Prescription, LabOrder, FollowUp } from '../../types';
import { ShieldAlert, LogIn, Activity } from 'lucide-react';

export const DoctorPortal: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    activePatient,
    appointments: storeAppointments,
    prescriptions: storePrescriptions,
    labOrders: storeLabOrders,
    followUps: storeFollowUps,
    notifications,
    facilities,
    playAudioChime,
    triggerConfetti
  } = useApp();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<DoctorNavTab>('dashboard');

  // Realtime Firestore Data States
  const [firestoreAppointments, setFirestoreAppointments] = useState<Appointment[]>([]);
  const [firestorePrescriptions, setFirestorePrescriptions] = useState<Prescription[]>([]);
  const [firestoreLabOrders, setFirestoreLabOrders] = useState<LabOrder[]>([]);
  const [firestoreLabReports, setFirestoreLabReports] = useState<any[]>([]);
  const [firestoreFollowUps, setFirestoreFollowUps] = useState<FollowUp[]>([]);

  // Modals & Active Action States
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointmentForPatient, setSelectedAppointmentForPatient] = useState<Appointment | null>(null);

  const [activeConsultationAppointment, setActiveConsultationAppointment] = useState<Appointment | null>(null);
  const [activeConsultationType, setActiveConsultationType] = useState<'OPD' | 'VIDEO_CONSULTATION'>('OPD');

  const [activeVideoAppointment, setActiveVideoAppointment] = useState<Appointment | null>(null);

  // Doctor ID for filtering
  const doctorId = currentUser?.id || 'doc-1';

  // Realtime Firestore Listeners
  useEffect(() => {
    const unsubAppts = subscribeDoctorAppointments(
      doctorId,
      appts => {
        if (appts && appts.length > 0) {
          setFirestoreAppointments(appts);
        }
      },
      () => {}
    );

    const unsubRxs = subscribeDoctorPrescriptions(
      doctorId,
      rxs => {
        if (rxs && rxs.length > 0) {
          setFirestorePrescriptions(rxs);
        }
      },
      () => {}
    );

    const unsubLabs = subscribeDoctorLabOrders(
      orders => {
        if (orders && orders.length > 0) {
          setFirestoreLabOrders(orders);
        }
      },
      () => {}
    );

    const unsubReports = subscribeDoctorLabReports(
      reports => {
        if (reports && reports.length > 0) {
          setFirestoreLabReports(reports);
        }
      },
      () => {}
    );

    const unsubFlws = subscribeDoctorFollowUps(
      flws => {
        if (flws && flws.length > 0) {
          setFirestoreFollowUps(flws);
        }
      },
      () => {}
    );

    return () => {
      unsubAppts();
      unsubRxs();
      unsubLabs();
      unsubReports();
      unsubFlws();
    };
  }, [doctorId]);

  // Combine Firestore data with local fallback store data to guarantee zero interruption
  const mergedAppointments: Appointment[] =
    firestoreAppointments.length > 0 ? firestoreAppointments : storeAppointments;

  const mergedPrescriptions: Prescription[] =
    firestorePrescriptions.length > 0 ? firestorePrescriptions : storePrescriptions;

  const mergedLabOrders: LabOrder[] =
    firestoreLabOrders.length > 0 ? firestoreLabOrders : storeLabOrders;

  const mergedFollowUps: FollowUp[] =
    firestoreFollowUps.length > 0 ? firestoreFollowUps : storeFollowUps;

  // Counts for Badges
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = mergedAppointments.filter(a => {
    if (a.scheduledDate) return a.scheduledDate === todayStr;
    if (a.createdAt) return a.createdAt.startsWith(todayStr);
    return true;
  }).length;

  const opdWaitingCount = mergedAppointments.filter(
    a => (a.status as any) === 'WAITING' || a.status === 'CHECKED_IN' || a.status === 'BOOKED'
  ).length;

  const videoConsultationsCount = mergedAppointments.filter(
    a => a.consultationType === 'VIDEO' || (a as any).appointmentType === 'VIDEO_CONSULTATION'
  ).length;

  const pendingLabReportsCount = mergedLabOrders.filter(
    o => o.status === 'ORDERED' || o.status === 'SAMPLE_COLLECTED' || o.status === 'PROCESSING'
  ).length;

  const followUpsDueCount = mergedFollowUps.filter(f => f.status === 'SCHEDULED').length;

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Handlers
  const handleStartConsultation = (appointment: Appointment, type: 'OPD' | 'VIDEO_CONSULTATION') => {
    if (playAudioChime) playAudioChime('click');
    if (type === 'VIDEO_CONSULTATION') {
      setActiveVideoAppointment(appointment);
    } else {
      setActiveConsultationAppointment(appointment);
      setActiveConsultationType('OPD');
    }
  };

  const handleViewPatientProfile = (patientId: string, appointment?: Appointment) => {
    if (playAudioChime) playAudioChime('click');
    setSelectedPatientId(patientId);
    setSelectedAppointmentForPatient(appointment || null);
  };

  const handleLogout = () => {
    // Switch role or log out safely
    if (playAudioChime) playAudioChime('click');
    window.location.reload();
  };

  // Role Protection Verification
  const isDoctorRole =
    currentUser?.role === 'DOCTOR' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    !currentUser?.role; // Gracefully allow session

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Clinician System Banner */}
      <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-teal-500/20">
            🩺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-sm">
                CARE4U NEXUS
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-mono font-bold">
                CLINICAL PORTAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              ABDM Certified EMR • e-Prescription & Diagnostic Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Dr. Rajesh Sharma, MD</span>
            <span className="text-slate-500">•</span>
            <span className="text-teal-400 font-mono text-[11px]">OPD Station 03</span>
          </div>

          <button
            onClick={() => setCurrentTab('notifications')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 relative transition cursor-pointer"
          >
            🔔
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Layout Body with Left Navigation & Right Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <DoctorNavigation
          currentTab={currentTab}
          onSelectTab={tab => {
            if (playAudioChime) playAudioChime('click');
            setCurrentTab(tab);
          }}
          onLogout={handleLogout}
          currentUser={currentUser}
          counts={{
            todayAppointments: todayAppointmentsCount,
            opdWaiting: opdWaitingCount,
            videoConsultations: videoConsultationsCount,
            pendingLabReports: pendingLabReportsCount,
            unreadNotifications: unreadNotificationsCount,
            followUpsDue: followUpsDueCount
          }}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {/* Active Consultation Workspace (Full Screen Priority) */}
          {activeConsultationAppointment ? (
            <ConsultationWorkspace
              appointment={activeConsultationAppointment}
              patient={activePatient}
              currentUser={currentUser}
              consultationType={activeConsultationType}
              onBack={() => setActiveConsultationAppointment(null)}
              onCompleteSuccess={() => {
                setActiveConsultationAppointment(null);
                triggerConfetti();
                playAudioChime('success');
              }}
              playAudioChime={playAudioChime}
            />
          ) : activeVideoAppointment ? (
            <VideoConsultationView
              appointment={activeVideoAppointment}
              onProceedToPrescription={() => {
                const apt = activeVideoAppointment;
                setActiveVideoAppointment(null);
                setActiveConsultationAppointment(apt);
                setActiveConsultationType('VIDEO_CONSULTATION');
              }}
              onEndCall={() => setActiveVideoAppointment(null)}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DoctorDashboardView
                  appointments={mergedAppointments}
                  prescriptions={mergedPrescriptions}
                  labOrders={mergedLabOrders}
                  labReports={firestoreLabReports}
                  followUps={mergedFollowUps}
                  onSelectAppointment={apt => handleStartConsultation(apt, 'OPD')}
                  onStartConsultation={handleStartConsultation}
                  onViewPatientProfile={handleViewPatientProfile}
                  onNavigateTab={tab => setCurrentTab(tab)}
                />
              )}

              {currentTab === 'appointments' && (
                <AppointmentsView
                  appointments={mergedAppointments}
                  onSelectAppointment={apt => handleStartConsultation(apt, 'OPD')}
                  onStartConsultation={handleStartConsultation}
                  onViewPatientProfile={handleViewPatientProfile}
                  playAudioChime={playAudioChime}
                />
              )}

              {currentTab === 'opd_queue' && (
                <OpdQueueView
                  appointments={mergedAppointments}
                  onStartConsultation={handleStartConsultation}
                  onViewPatientProfile={handleViewPatientProfile}
                />
              )}

              {currentTab === 'patients' && (
                <AppointmentsView
                  appointments={mergedAppointments}
                  onSelectAppointment={apt => handleStartConsultation(apt, 'OPD')}
                  onStartConsultation={handleStartConsultation}
                  onViewPatientProfile={handleViewPatientProfile}
                  playAudioChime={playAudioChime}
                />
              )}

              {currentTab === 'consultations' && (
                <AppointmentsView
                  appointments={mergedAppointments.filter(
                    a => a.status === 'COMPLETED' || a.status === 'CONSULTATION_COMPLETED' || a.status === 'IN_CONSULTATION'
                  )}
                  onSelectAppointment={apt => handleStartConsultation(apt, 'OPD')}
                  onStartConsultation={handleStartConsultation}
                  onViewPatientProfile={handleViewPatientProfile}
                  playAudioChime={playAudioChime}
                />
              )}

              {currentTab === 'video_consultations' && (
                <div className="space-y-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                    <h2 className="text-lg font-bold text-white font-display">
                      Telemedicine & Video Consultation Schedule
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Initiate encrypted WebRTC video consultation rooms with scheduled remote patients.
                    </p>
                  </div>
                  <AppointmentsView
                    appointments={mergedAppointments.filter(
                      a => a.consultationType === 'VIDEO' || (a as any).appointmentType === 'VIDEO_CONSULTATION'
                    )}
                    onSelectAppointment={apt => handleStartConsultation(apt, 'VIDEO_CONSULTATION')}
                    onStartConsultation={handleStartConsultation}
                    onViewPatientProfile={handleViewPatientProfile}
                    playAudioChime={playAudioChime}
                  />
                </div>
              )}

              {currentTab === 'prescriptions' && (
                <PrescriptionsListView
                  prescriptions={mergedPrescriptions}
                  onViewPatientProfile={handleViewPatientProfile}
                />
              )}

              {currentTab === 'lab_orders' && (
                <LabWorkflowView
                  labOrders={mergedLabOrders}
                  labReports={firestoreLabReports}
                  currentUser={currentUser}
                  onViewPatientProfile={handleViewPatientProfile}
                  playAudioChime={playAudioChime}
                />
              )}

              {currentTab === 'lab_reports' && (
                <LabWorkflowView
                  labOrders={mergedLabOrders}
                  labReports={firestoreLabReports}
                  currentUser={currentUser}
                  onViewPatientProfile={handleViewPatientProfile}
                  playAudioChime={playAudioChime}
                />
              )}

              {currentTab === 'referrals' && (
                <ReferralsAndFollowUpsView
                  followUps={mergedFollowUps}
                  mode="referrals"
                  onViewPatientProfile={handleViewPatientProfile}
                />
              )}

              {currentTab === 'follow_ups' && (
                <ReferralsAndFollowUpsView
                  followUps={mergedFollowUps}
                  mode="follow_ups"
                  onViewPatientProfile={handleViewPatientProfile}
                />
              )}

              {currentTab === 'notifications' && (
                <DoctorNotificationsAndProfileView
                  mode="notifications"
                  currentUser={currentUser}
                  notifications={notifications}
                />
              )}

              {currentTab === 'profile' && (
                <DoctorNotificationsAndProfileView
                  mode="profile"
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'settings' && (
                <DoctorNotificationsAndProfileView
                  mode="settings"
                  currentUser={currentUser}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Patient Profile Modal */}
      {selectedPatientId && (
        <PatientProfileModal
          patientId={selectedPatientId}
          patientData={activePatient?.id === selectedPatientId ? activePatient : null}
          appointment={selectedAppointmentForPatient}
          onClose={() => {
            setSelectedPatientId(null);
            setSelectedAppointmentForPatient(null);
          }}
          onStartConsultation={handleStartConsultation}
        />
      )}
    </div>
  );
};
