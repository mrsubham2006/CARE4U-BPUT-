import React, { useState } from 'react';
import { AppProvider, useApp } from './services/store';
import { Header } from './components/common/Header';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DemoJourneyWalkthrough } from './components/common/DemoJourneyWalkthrough';
import { SystemHealthDiagnosticModal } from './components/common/SystemHealthDiagnosticModal';
import { IntegrationDashboardModal } from './components/common/IntegrationDashboardModal';
import { EmergencySOSModal } from './components/common/EmergencySOSModal';
import { AuthContainer } from './components/auth/AuthContainer';
import { PatientApp } from './components/patient/PatientApp';
import { AshaPortal } from './components/asha/AshaPortal';
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { HospitalAdminPortal } from './components/hospital/HospitalAdminPortal';
import { LabPortal } from './components/lab/LabPortal';
import { PharmacyPortal } from './components/pharmacy/PharmacyPortal';
import { AmbulancePortal } from './components/ambulance/AmbulancePortal';
import { CommandCenter } from './components/commandCenter/CommandCenter';
import { ShieldCheck, HeartPulse, Server, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, authView, setAuthView, isAuthenticated } = useApp();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSystemHealthOpen, setIsSystemHealthOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isEmergencySosOpen, setIsEmergencySosOpen] = useState(false);

  // Strictly enforce authentication: only show role portals when user is authenticated with a valid session
  const isAuthScreen = !isAuthenticated || !currentUser || authView !== 'DASHBOARD';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenSystemTest={() => setIsSystemHealthOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        onOpenEmergencySOS={() => setIsEmergencySosOpen(true)}
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
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
