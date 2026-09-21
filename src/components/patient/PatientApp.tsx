import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../services/store';
import { getTranslation } from '../../i18n/translations';
import { voiceCommandService } from '../../services/voiceCommandService';
import { CareJourneyTimeline } from '../common/CareJourneyTimeline';
import { PatientHomeView } from './PatientHomeView';
import { PatientProfileView } from './PatientProfileView';
import { AIHealthIntakeView } from './AIHealthIntakeView';
import { FindHealthcareView } from './FindHealthcareView';
import { AppointmentBookingView } from './AppointmentBookingView';
import { MyAppointmentsView } from './MyAppointmentsView';
import { HospitalCheckinQueueView } from './HospitalCheckinQueueView';
import { PaymentsBillingView } from './PaymentsBillingView';
import { MyPrescriptionsView } from './MyPrescriptionsView';
import { MyMedicinesView } from './MyMedicinesView';
import { LabReportsView } from './LabReportsView';
import { HealthWalletView } from './HealthWalletView';
import { MedicalHistoryTimelineView } from './MedicalHistoryTimelineView';
import { ConsentSharingView } from './ConsentSharingView';
import { SecureQRHealthIDView } from './SecureQRHealthIDView';
import { VideoConsultationView } from './VideoConsultationView';
import { DoctorMessagingView } from './DoctorMessagingView';
import { EmergencyShortcutView } from './EmergencyShortcutView';
import { HealthAnalyticsView } from './HealthAnalyticsView';
import { FamilyProfilesView } from './FamilyProfilesView';
import { HealthInsuranceSchemesView } from './HealthInsuranceSchemesView';
import { HealthEducationWellnessView } from './HealthEducationWellnessView';
import { Doctor } from '../../types';
import { BiometricProtectedGate } from './BiometricProtectedGate';

import {
  Heart,
  Sparkles,
  Search,
  Calendar,
  Clock,
  Pill,
  FileText,
  ShieldCheck,
  QrCode,
  Video,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  User,
  Users,
  Activity,
  CreditCard,
  Building2,
  FolderOpen,
  PhoneCall,
  Lock,
  Unlock,
  Fingerprint,
  ScanFace
} from 'lucide-react';

export type PatientViewTab =
  | 'HOME'
  | 'PROFILE'
  | 'AI_INTAKE'
  | 'FIND_CARE'
  | 'BOOK_APPOINTMENT'
  | 'MY_APPOINTMENTS'
  | 'QUEUE_PASS'
  | 'PRESCRIPTIONS'
  | 'MEDICINES_SCHEDULE'
  | 'LAB_REPORTS'
  | 'HEALTH_WALLET'
  | 'TIMELINE'
  | 'CONSENT_SHARING'
  | 'HEALTH_ID_QR'
  | 'VIDEO_CONSULTATION'
  | 'DOCTOR_MESSAGING'
  | 'EMERGENCY_SOS'
  | 'VITALS_ANALYTICS'
  | 'FAMILY_PROFILES'
  | 'INSURANCE_PMJAY'
  | 'PAYMENTS_BILLING'
  | 'HEALTH_EDUCATION';

export const PatientApp: React.FC = () => {
  const {
    activePatient,
    selectedLanguage,
    playAudioChime,
    isBiometricUnlocked,
    lockBiometrics
  } = useApp();

  const [activeTab, setActiveTab] = useState<PatientViewTab>('HOME');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [activeVideoApptId, setActiveVideoApptId] = useState<string | undefined>(undefined);
  const [activeMessagingApptId, setActiveMessagingApptId] = useState<string | undefined>(undefined);

  const biometricSettings = activePatient.biometricSecurity;
  const isBiometricEnabled = !!biometricSettings?.enabled;

  const t = getTranslation(selectedLanguage);

  const [voiceSymptomQuery, setVoiceSymptomQuery] = useState<string | undefined>(undefined);

  const handleNavigate = useCallback((tab: any) => {
    playAudioChime('click');
    setActiveTab(tab as PatientViewTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [playAudioChime]);

  // Use a ref to always call the latest handleNavigate without re-subscribing
  const handleNavigateRef = useRef(handleNavigate);
  useEffect(() => {
    handleNavigateRef.current = handleNavigate;
  }, [handleNavigate]);

  useEffect(() => {
    const unsub = voiceCommandService.subscribe(action => {
      if (action.type === 'NAVIGATE_TAB' && action.payload) {
        handleNavigateRef.current(action.payload);
      } else if (action.type === 'TAKE_MEDICINE') {
        handleNavigateRef.current('MEDICINES_SCHEDULE');
      } else if (action.type === 'AI_SYMPTOM_CHECK') {
        setVoiceSymptomQuery(action.payload);
        handleNavigateRef.current('AI_INTAKE');
      } else if (action.type === 'START_VIDEO_CALL') {
        handleNavigateRef.current('VIDEO_CONSULTATION');
      }
    });
    return () => unsub();
  }, []);

  const handleBookDoctor = (doc: Doctor) => {
    setSelectedDoctorForBooking(doc);
    handleNavigate('BOOK_APPOINTMENT');
  };

  const handleStartVideo = (apptId: string) => {
    setActiveVideoApptId(apptId);
    handleNavigate('VIDEO_CONSULTATION');
  };

  const handleOpenMessaging = (apptId: string) => {
    setActiveMessagingApptId(apptId);
    handleNavigate('DOCTOR_MESSAGING');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Care Continuity Timeline Top Banner */}
      <CareJourneyTimeline />

      {/* Main Patient Navigation Strip with Biometric Privacy Indicator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-xl space-y-2">
        <div className="flex items-center justify-between px-2 pt-1 pb-1 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Patient Care Services</span>
          </div>

          {/* Quick Biometric Status Badge */}
          {isBiometricEnabled && (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isBiometricUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {biometricSettings?.biometricType === 'FACE_ID' ? (
                  <ScanFace className="w-3 h-3" />
                ) : (
                  <Fingerprint className="w-3 h-3" />
                )}
                <span>
                  {isBiometricUnlocked
                    ? `${biometricSettings?.biometricType === 'FACE_ID' ? 'FaceID' : 'TouchID'} Unlocked`
                    : `Medical Records Protected`}
                </span>
              </span>

              {isBiometricUnlocked && (
                <button
                  type="button"
                  onClick={() => {
                    lockBiometrics();
                    playAudioChime('click');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Lock sensitive records now"
                >
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Lock</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'HOME', label: t.navOverview, icon: <Heart className="w-3.5 h-3.5" /> },
            { id: 'PROFILE', label: t.navProfile, icon: <User className="w-3.5 h-3.5" /> },
            { id: 'AI_INTAKE', label: t.navAIIntake, icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'FIND_CARE', label: t.navFindCare, icon: <Search className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'BOOK_APPOINTMENT', label: t.navBookSlot, icon: <Calendar className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: 'MY_APPOINTMENTS', label: t.navAppointments, icon: <Clock className="w-3.5 h-3.5 text-indigo-400" /> },
            { id: 'QUEUE_PASS', label: t.navQueuePass, icon: <QrCode className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'PRESCRIPTIONS', label: t.navPrescriptions, icon: <Pill className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'MEDICINES_SCHEDULE', label: t.navMedSchedule, icon: <Clock className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'LAB_REPORTS', label: t.navLabReports, icon: <FileText className="w-3.5 h-3.5 text-purple-400" /> },
            { id: 'HEALTH_WALLET', label: t.navHealthWallet, icon: <FolderOpen className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'TIMELINE', label: t.navTimeline, icon: <Activity className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'CONSENT_SHARING', label: t.navPrivacyConsent, icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> },
            { id: 'HEALTH_ID_QR', label: t.navHealthCard, icon: <QrCode className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: 'VITALS_ANALYTICS', label: t.navVitalsAnalytics, icon: <Activity className="w-3.5 h-3.5 text-rose-400" /> },
            { id: 'FAMILY_PROFILES', label: t.navFamilyProfiles, icon: <Users className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'INSURANCE_PMJAY', label: t.navInsurancePmjay, icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: 'PAYMENTS_BILLING', label: t.navBilling, icon: <CreditCard className="w-3.5 h-3.5 text-slate-300" /> },
            { id: 'HEALTH_EDUCATION', label: 'Education & Wellness', icon: <BookOpen className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'EMERGENCY_SOS', label: t.navEmergencySos, icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id as PatientViewTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === item.id
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render Current Active View */}
      {activeTab === 'HOME' && (
        <PatientHomeView
          onNavigate={handleNavigate}
          onStartVideoCall={(apptId?: string) => handleStartVideo(apptId || '')}
          onBookAppointment={() => handleNavigate('BOOK_APPOINTMENT')}
        />
      )}

      {activeTab === 'PROFILE' && (
        <PatientProfileView />
      )}

      {activeTab === 'AI_INTAKE' && (
        <AIHealthIntakeView
          initialSymptoms={voiceSymptomQuery}
          onProceedToBooking={() => handleNavigate('BOOK_APPOINTMENT')}
          onViewFacilities={() => handleNavigate('FIND_CARE')}
        />
      )}

      {activeTab === 'FIND_CARE' && (
        <FindHealthcareView
          onBookDoctor={handleBookDoctor}
          onNavigateFacility={() => handleNavigate('BOOK_APPOINTMENT')}
        />
      )}

      {activeTab === 'BOOK_APPOINTMENT' && (
        <AppointmentBookingView
          initialDoctor={selectedDoctorForBooking}
          onBookingComplete={() => handleNavigate('MY_APPOINTMENTS')}
        />
      )}

      {activeTab === 'MY_APPOINTMENTS' && (
        <MyAppointmentsView
          onJoinVideo={handleStartVideo}
          onOpenMessaging={handleOpenMessaging}
          onViewQueue={() => handleNavigate('QUEUE_PASS')}
        />
      )}

      {activeTab === 'QUEUE_PASS' && (
        <HospitalCheckinQueueView />
      )}

      {activeTab === 'PRESCRIPTIONS' && (
        <BiometricProtectedGate
          category="requireForPrescriptions"
          title="Electronic Prescriptions"
          description="Your medical prescriptions, clinical dosages, and doctor notes contain confidential health data"
        >
          <MyPrescriptionsView
            onNavigateToMedicines={() => handleNavigate('MEDICINES_SCHEDULE')}
          />
        </BiometricProtectedGate>
      )}

      {activeTab === 'MEDICINES_SCHEDULE' && (
        <MyMedicinesView />
      )}

      {activeTab === 'LAB_REPORTS' && (
        <BiometricProtectedGate
          category="requireForLabReports"
          title="Pathology & Diagnostic Reports"
          description="Your diagnostic laboratory results, blood panels, and clinical pathology reports are protected"
        >
          <LabReportsView />
        </BiometricProtectedGate>
      )}

      {activeTab === 'HEALTH_WALLET' && (
        <BiometricProtectedGate
          category="requireForHealthWallet"
          title="Digital Health Wallet"
          description="Your health wallet contains encrypted government ABHA records, discharge summaries, and medical scans"
        >
          <HealthWalletView />
        </BiometricProtectedGate>
      )}

      {activeTab === 'TIMELINE' && (
        <BiometricProtectedGate
          category="requireForMedicalHistory"
          title="Clinical History & Timeline"
          description="Your longitudinal health history, chronic conditions, and past hospitalizations are protected"
        >
          <MedicalHistoryTimelineView />
        </BiometricProtectedGate>
      )}

      {activeTab === 'CONSENT_SHARING' && (
        <ConsentSharingView />
      )}

      {activeTab === 'HEALTH_ID_QR' && (
        <SecureQRHealthIDView />
      )}

      {activeTab === 'VIDEO_CONSULTATION' && (
        <VideoConsultationView
          appointmentId={activeVideoApptId}
          onEndCall={() => handleNavigate('MY_APPOINTMENTS')}
        />
      )}

      {activeTab === 'DOCTOR_MESSAGING' && (
        <DoctorMessagingView
          initialAppointmentId={activeMessagingApptId}
          onBookFollowUp={() => handleNavigate('BOOK_APPOINTMENT')}
          onStartVideo={handleStartVideo}
        />
      )}

      {activeTab === 'EMERGENCY_SOS' && (
        <EmergencyShortcutView />
      )}

      {activeTab === 'VITALS_ANALYTICS' && (
        <HealthAnalyticsView />
      )}

      {activeTab === 'FAMILY_PROFILES' && (
        <FamilyProfilesView />
      )}

      {activeTab === 'INSURANCE_PMJAY' && (
        <HealthInsuranceSchemesView />
      )}

      {activeTab === 'PAYMENTS_BILLING' && (
        <PaymentsBillingView />
      )}

      {activeTab === 'HEALTH_EDUCATION' && (
        <HealthEducationWellnessView />
      )}
    </div>
  );
};
