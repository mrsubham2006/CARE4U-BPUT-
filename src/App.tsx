import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './services/store';
import { Header } from './components/common/Header';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DemoJourneyWalkthrough } from './components/common/DemoJourneyWalkthrough';
import { SystemHealthDiagnosticModal } from './components/common/SystemHealthDiagnosticModal';
import { IntegrationDashboardModal } from './components/common/IntegrationDashboardModal';
import { EmergencySOSModal } from './components/common/EmergencySOSModal';
import { GeminiChatModal } from './components/common/GeminiChatModal';
import { LiveVoiceDoctorModal } from './components/common/LiveVoiceDoctorModal';
import { voiceCommandService } from './services/voiceCommandService';
import { VoiceProvider, useVoice } from './services/voice/VoiceContext';
import {
  HealthAIVoiceWidget,
  VoiceConfirmationModal,
  VoiceHelpModal,
  VoiceSettingsModal
} from './components/voice';
import { Language, UserRole } from './types';
import { AuthContainer } from './components/auth/AuthContainer';
import { PatientApp } from './components/patient/PatientApp';
import { AshaPortal } from './components/asha/AshaPortal';
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { HospitalAdminPortal } from './components/hospital/HospitalAdminPortal';
import { LabPortal } from './components/lab/LabPortal';
import { PharmacyPortal } from './components/pharmacy/PharmacyPortal';
import { AmbulancePortal } from './components/ambulance/AmbulancePortal';
import { CommandCenter } from './components/commandCenter/CommandCenter';
import { ShieldCheck, HeartPulse, Server, AlertTriangle, Bot, Mic, Sparkles } from 'lucide-react';

const HeaderWithVoice: React.FC<React.ComponentProps<typeof Header>> = (props) => {
  const { setIsSettingsOpen } = useVoice();
  return <Header {...props} onOpenVoiceSettings={() => setIsSettingsOpen(true)} />;
};

const MainLayout: React.FC = () => {
  const {
    currentUser,
    authView,
    setAuthView,
    isAuthenticated,
    selectedLanguage,
    setSelectedLanguage,
    switchRole,
    logout
  } = useApp();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSystemHealthOpen, setIsSystemHealthOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isEmergencySosOpen, setIsEmergencySosOpen] = useState(false);
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  const [geminiInitialQuery, setGeminiInitialQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    voiceCommandService.setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    const unsubscribe = voiceCommandService.subscribe(action => {
      if (action.type === 'TRIGGER_EMERGENCY_SOS' || action.type === 'DISPATCH_AMBULANCE') {
        setIsEmergencySosOpen(true);
      } else if (action.type === 'ASK_GEMINI_AI') {
        setGeminiInitialQuery(action.payload);
        setIsGeminiChatOpen(true);
      } else if (action.type === 'OPEN_MODAL') {
        if (action.payload === 'GEMINI') setIsGeminiChatOpen(true);
        if (action.payload === 'LIVE_VOICE') setIsLiveVoiceOpen(true);
        if (action.payload === 'SOS') setIsEmergencySosOpen(true);
        if (action.payload === 'SYSTEM_TEST') setIsSystemHealthOpen(true);
        if (action.payload === 'TOUR') setIsTourOpen(true);
      } else if (action.type === 'CLOSE_MODALS') {
        setIsGeminiChatOpen(false);
        setIsLiveVoiceOpen(false);
        setIsEmergencySosOpen(false);
        setIsSystemHealthOpen(false);
        setIsTourOpen(false);
        setIsNotificationOpen(false);
      } else if (action.type === 'SET_LANGUAGE') {
        setSelectedLanguage(action.payload as Language);
      } else if (action.type === 'SWITCH_ROLE') {
        switchRole(action.payload as UserRole);
      } else if (action.type === 'READ_PAGE') {
        const roleName = currentUser ? currentUser.role.replace(/_/g, ' ') : 'Landing Page';
        voiceCommandService.speak(`You are currently on the CARE4U ${roleName} interface. All features and workflows can be commanded hands-free by speaking.`);
      } else if (action.type === 'AUTH_ACTION') {
        if (action.payload === 'LOGOUT') {
          logout();
        } else if (action.payload === 'CHOOSE_ROLE') {
          setAuthView('CHOOSE_ROLE');
        }
      }
    });
    return () => unsubscribe();
  }, [setSelectedLanguage, switchRole, logout, setAuthView, currentUser]);

  // Strictly enforce authentication: only show role portals when user is authenticated with a valid session
  const isAuthScreen = !isAuthenticated || !currentUser || authView !== 'DASHBOARD';

  return (
    <VoiceProvider
      onOpenSOSModal={() => setIsEmergencySosOpen(true)}
      onOpenGeminiModal={(query) => {
        setGeminiInitialQuery(query);
        setIsGeminiChatOpen(true);
      }}
      onOpenLiveVoiceModal={() => setIsLiveVoiceOpen(true)}
      onOpenTourModal={() => setIsTourOpen(true)}
      onOpenSystemTestModal={() => setIsSystemHealthOpen(true)}
      onCloseAllModals={() => {
        setIsGeminiChatOpen(false);
        setIsLiveVoiceOpen(false);
        setIsEmergencySosOpen(false);
        setIsSystemHealthOpen(false);
        setIsTourOpen(false);
        setIsNotificationOpen(false);
      }}
    >
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
        {/* Top Header */}
        <HeaderWithVoice
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenSystemTest={() => setIsSystemHealthOpen(true)}
          onOpenIntegrations={() => setIsIntegrationsOpen(true)}
          onOpenEmergencySOS={() => setIsEmergencySosOpen(true)}
          onOpenGeminiChat={() => setIsGeminiChatOpen(true)}
          onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isAuthScreen ? (
          <AuthContainer />
        ) : (
          <>
            {currentUser.role === 'PATIENT' && <PatientApp />}
            {currentUser.role === 'ASHA_WORKER' && <AshaPortal />}
            {currentUser.role === 'DOCTOR' && <DoctorPortal />}
            {currentUser.role === 'HOSPITAL_ADMIN' && <HospitalAdminPortal />}
            {currentUser.role === 'LAB_STAFF' && <LabPortal />}
            {currentUser.role === 'PHARMACY_STAFF' && <PharmacyPortal />}
            {currentUser.role === 'AMBULANCE_OPERATOR' && <AmbulancePortal />}
            {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HEALTH_AUTHORITY') && (
              <CommandCenter />
            )}
          </>
        )}
      </main>

      {/* Floating AI Hub Action Bar */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsLiveVoiceOpen(true)}
          className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 border border-purple-400/30 transition transform hover:scale-105 cursor-pointer flex items-center gap-2 group"
          title="Open Live Voice Doctor (gemini-3.8-live)"
        >
          <Mic className="w-5 h-5 animate-pulse text-purple-200" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
            Live Voice (3.8)
          </span>
        </button>

        <button
          onClick={() => setIsGeminiChatOpen(true)}
          className="p-3 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 shadow-xl shadow-teal-500/30 border border-teal-300/40 transition transform hover:scale-105 cursor-pointer flex items-center gap-2 group"
          title="Open Gemini AI Medical Assistant"
        >
          <Bot className="w-5 h-5 font-bold" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
            Gemini Chat
          </span>
        </button>
      </div>

      {/* Global HealthAI Voice Assistant HUD */}
      <HealthAIVoiceWidget />

      {/* HealthAI Consequential Action Safety Confirmation Modal */}
      <VoiceConfirmationModal />

      {/* HealthAI "What Can I Say?" Voice Help Modal */}
      <VoiceHelpModal />

      {/* HealthAI Voice Settings Modal */}
      <VoiceSettingsModal />

      {/* Persistent Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-400 space-y-2">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <strong className="text-white">CARE4U NEXUS</strong> • One Patient. One Connected Care Journey.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSystemHealthOpen(true)}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>/system/health (20 Checks)</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsIntegrationsOpen(true)}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer"
            >
              <Server className="w-3.5 h-3.5" />
              <span>API Registry</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsTourOpen(true)}
              className="hover:text-teal-300 transition cursor-pointer text-teal-400 font-semibold"
            >
              Interactive Tour Guide
            </button>
            <span>•</span>
            <button
              onClick={() => setAuthView('LANDING')}
              className="hover:text-slate-200 transition cursor-pointer"
            >
              Landing Page
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 max-w-3xl mx-auto leading-relaxed">
          AI assistance and operational triage simulation prototype only. Final clinical decisions, diagnoses, and medical prescriptions must be confirmed by certified healthcare professionals.
        </p>
      </footer>

      {/* Notifications Drawer Modal */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Interactive Step Tour Walkthrough Guide */}
      <DemoJourneyWalkthrough
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      {/* Comprehensive 20-Step Health Diagnostics Modal */}
      <SystemHealthDiagnosticModal
        isOpen={isSystemHealthOpen}
        onClose={() => setIsSystemHealthOpen(false)}
      />

      {/* External Integration Registry Modal */}
      <IntegrationDashboardModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
      />

      {/* Emergency SOS & 108 Ambulance Dispatch Modal */}
      <EmergencySOSModal
        isOpen={isEmergencySosOpen}
        onClose={() => setIsEmergencySosOpen(false)}
      />

      {/* Gemini AI Multi-Turn Healthcare Assistant Modal */}
      <GeminiChatModal
        isOpen={isGeminiChatOpen}
        onClose={() => {
          setIsGeminiChatOpen(false);
          setGeminiInitialQuery(undefined);
        }}
        initialQuery={geminiInitialQuery}
      />

      {/* Gemini 3.8 Live Voice Doctor Modal */}
      <LiveVoiceDoctorModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />
    </div>
    </VoiceProvider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
