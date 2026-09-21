import React from 'react';
import { useApp } from '../../services/store';
import { Language } from '../../types';
import {
  HeartPulse,
  Radio,
  Wifi,
  WifiOff,
  Bell,
  Sparkles,
  LogOut,
  ShieldCheck,
  LogIn,
  Server,
  AlertTriangle,
  Bot,
  Mic,
  Globe
} from 'lucide-react';
import { getTranslation, SUPPORTED_LANGUAGES } from '../../i18n/translations';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenTour: () => void;
  onOpenSystemTest: () => void;
  onOpenIntegrations?: () => void;
  onOpenEmergencySOS?: () => void;
  onOpenGeminiChat?: () => void;
  onOpenLiveVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenTour,
  onOpenSystemTest,
  onOpenIntegrations,
  onOpenEmergencySOS,
  onOpenGeminiChat,
  onOpenLiveVoice
}) => {
  const {
    currentUser,
    isAuthenticated,
    selectedLanguage,
    setSelectedLanguage,
    isOfflineMode,
    setIsOfflineMode,
    pendingSyncQueue,
    syncOfflineData,
    notifications,
    playAudioChime,
    demoStep,
    logout,
    switchRole,
    setAuthView
  } = useApp();

  const t = getTranslation(selectedLanguage);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      {/* Top Banner: Security status, User info & Global Action Controls */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border-b border-teal-800/30 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-teal-300/90">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span className="font-semibold tracking-wide uppercase text-[10px]">
            {isAuthenticated ? 'Authenticated Session' : 'CARE4U Secure Gateway'}
          </span>
          {currentUser && (
            <>
              <span className="hidden md:inline text-slate-400">|</span>
              <span className="hidden md:inline text-slate-300">
                User: <strong className="text-white font-medium">{currentUser.name}</strong> ({currentUser.role.replace(/_/g, ' ')})
              </span>
              <span className={`hidden lg:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                currentUser.verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
              }`}>
                {currentUser.verificationStatus === 'VERIFIED' ? '✓ VERIFIED' : '⏳ PENDING REVIEW'}
              </span>

              {/* Quick Role Switcher for seamless cross-panel demonstration */}
              <div className="hidden xl:flex items-center gap-1 ml-2 pl-2 border-l border-teal-800/40 text-[10px]">
                <span className="text-slate-400 font-mono">View Role:</span>
                {[
                  { r: 'PATIENT', label: 'Patient' },
                  { r: 'DOCTOR', label: 'Doctor' },
                  { r: 'HOSPITAL_ADMIN', label: 'Hospital' },
                  { r: 'LAB_STAFF', label: 'Lab' },
                  { r: 'PHARMACY_STAFF', label: 'Pharmacy' },
                  { r: 'ASHA_WORKER', label: 'ASHA' },
                  { r: 'AMBULANCE_OPERATOR', label: 'Ambulance' },
                  { r: 'SUPER_ADMIN', label: 'Command' }
                ].map(item => (
                  <button
                    key={item.r}
                    onClick={() => switchRole(item.r as any)}
                    className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                      currentUser?.role === item.r
                        ? 'bg-teal-400 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-teal-900/40 border border-teal-500/20'
                    }`}
                    title={`Switch active portal to ${item.label}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex xl:hidden items-center ml-1">
                <select
                  value={currentUser?.role || 'PATIENT'}
                  onChange={e => switchRole(e.target.value as any)}
                  className="bg-slate-900 border border-teal-500/40 text-teal-200 rounded px-1.5 py-0.5 text-[10px] font-bold focus:outline-none"
                >
                  <option value="PATIENT">👤 Patient</option>
                  <option value="DOCTOR">🩺 Doctor</option>
                  <option value="HOSPITAL_ADMIN">🏥 Hospital</option>
                  <option value="LAB_STAFF">🧪 Lab</option>
                  <option value="PHARMACY_STAFF">💊 Pharmacy</option>
                  <option value="ASHA_WORKER">🌾 ASHA</option>
                  <option value="AMBULANCE_OPERATOR">🚑 Ambulance</option>
                  <option value="SUPER_ADMIN">🛡️ Command Center</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Emergency SOS Button */}
          {onOpenEmergencySOS && (
            <button
              onClick={() => {
                playAudioChime('alert');
                onOpenEmergencySOS();
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-black text-[11px] shadow-sm animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS 108</span>
            </button>
          )}


          {/* Logout / Switch User / Login */}
          {isAuthenticated && currentUser ? (
            <button
              onClick={() => {
                logout();
              }}
              title="Logout from session"
              className="flex items-center gap-1 text-rose-300 hover:text-white text-xs px-2.5 py-0.5 rounded bg-rose-950/50 border border-rose-500/40 hover:bg-rose-900/60 font-medium transition cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{t.logout}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playAudioChime('click');
                setAuthView('CHOOSE_ROLE');
              }}
              className="flex items-center gap-1 text-teal-300 hover:text-white text-xs px-2.5 py-0.5 rounded bg-teal-950/50 border border-teal-500/40 hover:bg-teal-900/60 font-semibold transition cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div
          onClick={() => {
            playAudioChime('click');
            if (!isAuthenticated) {
              setAuthView('LANDING');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-teal-400/30 group-hover:scale-105 transition">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-white bg-clip-text text-transparent">
                CARE4U NEXUS
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls: Language, Offline Mode, Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Enhanced Multi-language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-1 text-xs transition">
            <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <select
              value={selectedLanguage}
              onChange={e => {
                playAudioChime('click');
                setSelectedLanguage(e.target.value as Language);
              }}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              title={t.selectLanguage}
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-slate-950 text-slate-100">
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Offline Mode Simulator Toggle */}
          <button
            onClick={() => {
              playAudioChime('click');
              if (isOfflineMode) {
                syncOfflineData();
              } else {
                setIsOfflineMode(true);
              }
            }}
            title={isOfflineMode ? 'Click to synchronize locally cached records' : 'Toggle offline network simulation'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
              isOfflineMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Offline Mode</span>
                {pendingSyncQueue.length > 0 && (
                  <span className="bg-amber-500 text-slate-950 px-1 rounded text-[10px] font-bold">
                    {pendingSyncQueue.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline text-emerald-300">Live Network</span>
              </>
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => {
              playAudioChime('click');
              onOpenNotifications();
            }}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Open Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
