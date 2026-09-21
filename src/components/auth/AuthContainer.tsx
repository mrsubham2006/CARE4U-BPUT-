import React, { useState, useMemo } from 'react';
import { useApp } from '../../services/store';
import { UserRole } from '../../types';
import {
  User,
  Stethoscope,
  Building2,
  FlaskConical,
  Pill,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  FileCheck,
  Database,
  Info,
  Send,
  XCircle
} from 'lucide-react';
import {
  isValidEmail,
  normalizeIndianPhone,
  validatePassword
} from '../../services/authService';
import { getTranslation } from '../../i18n/translations';

export const AuthContainer: React.FC = () => {
  const {
    authView,
    setAuthView,
    selectedAuthRole,
    setSelectedAuthRole,
    login,
    loginWithGoogleAction,
    registerUser,
    sendPasswordResetEmailAction,
    playAudioChime,
    triggerConfetti,
    selectedLanguage
  } = useApp();

  const t = getTranslation(selectedLanguage);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!selectedAuthRole) return;
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogleAction(selectedAuthRole);
      if (!res.success) {
        setErrorMessage(res.error || 'Google authentication failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password Modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({
    loading: false
  });

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regDob, setRegDob] = useState('1999-05-14');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regAddress, setRegAddress] = useState('Kadegaon Village Ward 3');
  const [regVillage, setRegVillage] = useState('Kadegaon');
  const [regDistrict, setRegDistrict] = useState('Sub-District Central');
  const [regState, setRegState] = useState('Maharashtra');
  const [regEmergencyContact, setRegEmergencyContact] = useState('+91 98220 11223 (Pooja Kumar - Sister)');
  const [regHealthId, setRegHealthId] = useState('ABDM-9821-4412-MH');
  const [regLanguage, setRegLanguage] = useState<'en' | 'hi' | 'mr'>('en');

  // Staff registration fields
  const [regMrn, setRegMrn] = useState('MCI-2014-98712');
  const [regSpecialty, setRegSpecialty] = useState('General Medicine');
  const [regQualification, setRegQualification] = useState('MD (Internal Medicine), MBBS');
  const [regDepartment, setRegDepartment] = useState('General Medicine');
  const [regExperience, setRegExperience] = useState('12');
  const [regWorkerId, setRegWorkerId] = useState('ASHA-KAD-09');
  const [regHospitalName, setRegHospitalName] = useState('District Health Centre (DHC)');
  const [regFacilityType, setRegFacilityType] = useState('District Hospital');
  const [regLabName, setRegLabName] = useState('Central Pathology Lab');
  const [regPharmacyName, setRegPharmacyName] = useState('DHC Core Dispensary');

  // Live password validation
  const regPasswordValidation = useMemo(() => {
    return validatePassword(regPassword);
  }, [regPassword]);

  // Live phone validation
  const regPhoneValidation = useMemo(() => {
    return normalizeIndianPhone(regPhone);
  }, [regPhone]);

  // Role Cards definitions
  const roleCards: {
    role: UserRole;
    icon: string;
    title: string;
    description: string;
    color: string;
    demoUser: { email: string; name: string };
  }[] = [
    {
      role: 'PATIENT',
      icon: '👤',
      title: t.rolePatient,
      description: 'AI symptom intake, smart hospital routing, digital token tracking, and health records.',
      color: 'border-teal-500/50 hover:border-teal-400 bg-teal-950/20',
      demoUser: { email: 'rahul.kumar@care4u.nexus', name: 'Rahul Kumar' }
    },
    {
      role: 'DOCTOR',
      icon: '🩺',
      title: t.roleDoctor,
      description: 'Live OPD queue, AI clinical copilot, diagnostic ordering, e-prescriptions, and referrals.',
      color: 'border-blue-500/50 hover:border-blue-400 bg-blue-950/20',
      demoUser: { email: 'dr.rajesh@district-hospital.gov.in', name: 'Dr. Rajesh Sharma, MD' }
    },
    {
      role: 'HOSPITAL_ADMIN',
      icon: '🏥',
      title: t.roleHospital,
      description: 'Real-time facility capacity, bed occupancy, doctor roster, and emergency load diversion.',
      color: 'border-indigo-500/50 hover:border-indigo-400 bg-indigo-950/20',
      demoUser: { email: 'admin@dhc.care4u.nexus', name: 'Dr. Anita Roy' }
    },
    {
      role: 'LAB_STAFF',
      icon: '🧪',
      title: t.roleLab,
      description: 'Pathology sample tracking, test processing queue, and AI document parameter extraction.',
      color: 'border-purple-500/50 hover:border-purple-400 bg-purple-950/20',
      demoUser: { email: 'lab@dhc.care4u.nexus', name: 'Priya Deshmukh' }
    },
    {
      role: 'PHARMACY_STAFF',
      icon: '💊',
      title: t.rolePharmacy,
      description: 'Digital prescription verification, stock inventory tracking, and closed-loop dispensing.',
      color: 'border-amber-500/50 hover:border-amber-400 bg-amber-950/20',
      demoUser: { email: 'pharma@dhc.care4u.nexus', name: 'Manoj Verma' }
    },
    {
      role: 'ASHA_WORKER',
      icon: '🌾',
      title: t.roleAsha,
      description: 'Assisted rural citizen registration, voice symptom intake, offline sync, and SOS dispatch.',
      color: 'border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20',
      demoUser: { email: 'asha.savita@kadegaon.health.in', name: 'Savita Tai' }
    },
    {
      role: 'AMBULANCE_OPERATOR',
      icon: '🚑',
      title: t.roleAmbulance,
      description: 'Emergency dispatches, GPS hospital transit, and patient pickup OTP verification.',
      color: 'border-red-500/50 hover:border-red-400 bg-red-950/20',
      demoUser: { email: 'ambulance.108@nexus.health', name: 'Suresh Patil (108 Pilot)' }
    },
    {
      role: 'SUPER_ADMIN',
      icon: '🛡️',
      title: t.roleCommand,
      description: 'Protected network-wide mission control, MedRoute weights tuning, and audit telemetry.',
      color: 'border-rose-500/50 hover:border-rose-400 bg-rose-950/20',
      demoUser: { email: 'admin@nexus.health', name: 'Dr. Vikram Malhotra' }
    }
  ];

  const handleSelectRole = (role: UserRole) => {
    playAudioChime('click');
    setSelectedAuthRole(role);
    setErrorMessage(null);
    setSuccessNotice(null);
    const card = roleCards.find(c => c.role === role);
    if (card) {
      setEmailOrPhone(card.demoUser.email);
      setPassword('password123');
    }
    setAuthView('LOGIN');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthRole) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const result = await login(selectedAuthRole, emailOrPhone, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid email or password.');
      } else {
        triggerConfetti();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthRole) return;
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!regName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!isValidEmail(regEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!regPhoneValidation.isValid) {
      setErrorMessage(regPhoneValidation.error || 'Invalid phone format.');
      return;
    }
    if (!regPasswordValidation.isValid) {
      setErrorMessage(regPasswordValidation.error || 'Password does not meet security criteria.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUser({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhoneValidation.normalized,
        password: regPassword,
        role: selectedAuthRole,
        dob: regDob,
        gender: regGender,
        address: regAddress,
        villageOrCity: regVillage,
        district: regDistrict,
        state: regState,
        emergencyContact: regEmergencyContact,
        healthId: regHealthId,
        preferredLanguage: regLanguage,
        medicalRegistrationNumber: regMrn,
        specialization: regSpecialty,
        qualification: regQualification,
        department: regDepartment,
        experienceYears: parseInt(regExperience) || 5,
        workerId: regWorkerId,
        hospitalName: regHospitalName,
        facilityType: regFacilityType,
        labName: regLabName,
        pharmacyName: regPharmacyName
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed.');
      } else {
        triggerConfetti();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !isValidEmail(resetEmail)) {
      setResetStatus({ loading: false, message: 'Please enter a valid email address.', success: false });
      return;
    }

    setResetStatus({ loading: true });
    try {
      const res = await sendPasswordResetEmailAction(resetEmail);
      setResetStatus({ loading: false, message: res.message, success: res.success });
      if (res.success) {
        setSuccessNotice('Password reset email dispatched. Please check your inbox.');
      }
    } catch (err: any) {
      setResetStatus({
        loading: false,
        message: 'If an account exists, a reset link was dispatched.',
        success: true
      });
    }
  };

  // 1. PUBLIC LANDING VIEW
  if (authView === 'LANDING') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-300">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>CARE4U NEXUS — Unified Healthcare Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-tight">
            {t.landingTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t.landingSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                playAudioChime('click');
                setAuthView('CHOOSE_ROLE');
              }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-base shadow-xl shadow-teal-500/25 transition cursor-pointer flex items-center gap-2"
            >
              <span>{t.getStarted}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                playAudioChime('click');
                setAuthView('CHOOSE_ROLE');
              }}
              className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-base shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-teal-400" />
              <span>{t.loginToAccount}</span>
            </button>
          </div>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xl">
              ❤️
            </div>
            <h3 className="text-lg font-bold text-white font-display">1. CARE4U Patient Journey</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unifies symptom intake, digital queue tokens (A-027), electronic prescriptions, diagnostic test orders, and proactive follow-up schedules into one unbroken continuum.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl">
              🧭
            </div>
            <h3 className="text-lg font-bold text-white font-display">2. MedRoute AI™ Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic multi-factor facility matching evaluating real-time specialist on-duty status, emergency capacity overload, diagnostic lab readiness, and queue latency.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xl">
              🤖
            </div>
            <h3 className="text-lg font-bold text-white font-display">3. HealthAI Decision Support</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multilingual voice symptom parsing (English, Hindi, Marathi, Odia), safety triage screening, clinical copilot interview prompts, and lab document intelligence.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. CHOOSE ROLE VIEW
  if (authView === 'CHOOSE_ROLE') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <button
            onClick={() => {
              playAudioChime('click');
              setAuthView('LANDING');
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToHome}</span>
          </button>
          <span className="text-xs font-mono font-bold text-teal-400">Step 1 of 2: Role Selection</span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white">{t.chooseRoleTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.chooseRoleSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {roleCards.map(c => (
            <div
              key={c.role}
              onClick={() => handleSelectRole(c.role)}
              className={`p-5 rounded-3xl border transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 group hover:scale-[1.02] shadow-xl ${c.color}`}
            >
              <div className="space-y-2">
                <div className="text-3xl mb-1">{c.icon}</div>
                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-teal-300">
                <span>{t.continueAs} {c.title}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. ROLE-SPECIFIC LOGIN VIEW
  if (authView === 'LOGIN' && selectedAuthRole) {
    const currentRoleCard = roleCards.find(c => c.role === selectedAuthRole) || roleCards[0];

    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
        <button
          onClick={() => {
            playAudioChime('click');
            setAuthView('CHOOSE_ROLE');
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch Role</span>
        </button>

        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-2 pb-3 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-2xl flex items-center justify-center mx-auto">
              {currentRoleCard.icon}
            </div>
            <h2 className="text-xl font-bold text-white font-display">{currentRoleCard.title} Login</h2>
            <p className="text-xs text-slate-400">Firebase Cloud Authentication & RBAC Access</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 rounded-xl bg-teal-950/60 border border-teal-500/50 text-teal-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Quick Demo Autofill Badge */}
          <div
            onClick={() => {
              playAudioChime('click');
              setEmailOrPhone(currentRoleCard.demoUser.email);
              setPassword('password123');
              setErrorMessage(null);
            }}
            className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-xs text-teal-300 flex items-center justify-between cursor-pointer hover:bg-teal-950/60 transition"
          >
            <div>
              <span className="font-bold">⚡ Default Account: </span>
              <span className="font-mono text-[11px] text-slate-300">{currentRoleCard.demoUser.email}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-teal-400 font-mono">Fill & Test</span>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium">Email Address</label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. name@care4u.nexus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(emailOrPhone);
                    setIsForgotOpen(true);
                  }}
                  className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Login as {selectedAuthRole}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-in Divider & Button */}
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-mono">or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Registration link (Not shown for System Admin) */}
          {selectedAuthRole !== 'SUPER_ADMIN' ? (
            <div className="pt-2 text-center text-xs text-slate-400">
              <span>Don't have an account? </span>
              <button
                onClick={() => {
                  playAudioChime('click');
                  setRegName(currentRoleCard.demoUser.name);
                  setRegEmail(currentRoleCard.demoUser.email);
                  setRegPassword('Admin@1234');
                  setRegConfirmPassword('Admin@1234');
                  setRegPhone('+919876543210');
                  setAuthView('REGISTER');
                }}
                className="text-teal-400 hover:underline font-semibold cursor-pointer"
              >
                Register as {currentRoleCard.title}
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center">
              System Admin accounts are provisioned via secure cloud infrastructure configuration.
            </p>
          )}
        </div>

        {/* Forgot Password Modal */}
        {isForgotOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-bold text-white">Reset Password</h3>
                </div>
                <button
                  onClick={() => setIsForgotOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered email address. We will dispatch a secure Firebase password reset link.
              </p>

              {resetStatus.message && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  resetStatus.success ? 'bg-teal-950/70 border border-teal-500/50 text-teal-200' : 'bg-rose-950/70 border border-rose-500/50 text-rose-200'
                }`}>
                  {resetStatus.success ? <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{resetStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="name@nexus.health"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetStatus.loading}
                    className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-xs text-slate-950 font-bold flex items-center justify-center gap-1.5"
                  >
                    {resetStatus.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send Reset Link</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. ROLE-SPECIFIC REGISTRATION VIEW
  if (authView === 'REGISTER' && selectedAuthRole) {
    const currentRoleCard = roleCards.find(c => c.role === selectedAuthRole) || roleCards[0];

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
        <button
          onClick={() => {
            playAudioChime('click');
            setAuthView('LOGIN');
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="pb-3 border-b border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-2xl flex items-center justify-center">
              {currentRoleCard.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Register New {currentRoleCard.title}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedAuthRole === 'PATIENT'
                  ? 'Immediate citizen care activation & 1:1 UID profile'
                  : 'Official staff registration (Subject to verification)'}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Common fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs text-slate-400">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Mobile Number (India) *</label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210 or 9876543210"
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none mt-1 ${
                    regPhone && !regPhoneValidation.isValid ? 'border-rose-500' : 'border-slate-800 focus:border-teal-400'
                  }`}
                />
                {regPhone && (
                  <span className={`text-[10px] mt-0.5 block ${regPhoneValidation.isValid ? 'text-teal-400' : 'text-rose-400'}`}>
                    {regPhoneValidation.isValid ? `✓ Format: ${regPhoneValidation.normalized}` : regPhoneValidation.error}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name@nexus.health"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Preferred Language</label>
                <select
                  value={regLanguage}
                  onChange={e => setRegLanguage(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </div>

            {/* Password with Live Strength Indicator */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400">Password (Min 8 chars) *</label>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      {showRegPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Upper, lower, digit, symbol"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Confirm Password *</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none mt-1 ${
                      regConfirmPassword && regConfirmPassword !== regPassword
                        ? 'border-rose-500'
                        : 'border-slate-800 focus:border-teal-400'
                    }`}
                  />
                  {regConfirmPassword && regConfirmPassword !== regPassword && (
                    <span className="text-[10px] text-rose-400 mt-0.5 block">Passwords do not match</span>
                  )}
                </div>
              </div>

              {/* Password Strength Bars */}
              {regPassword && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={`font-bold ${
                      regPasswordValidation.score >= 3 ? 'text-teal-400' : regPasswordValidation.score === 2 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {regPasswordValidation.score === 4 ? 'Strong' : regPasswordValidation.score === 3 ? 'Good' : regPasswordValidation.score === 2 ? 'Fair' : 'Weak'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map(idx => (
                      <div
                        key={idx}
                        className={`rounded-full transition-all duration-300 ${
                          regPasswordValidation.score >= idx
                            ? regPasswordValidation.score >= 3
                              ? 'bg-teal-400'
                              : regPasswordValidation.score === 2
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    <span className={regPassword.length >= 8 ? 'text-teal-400' : 'text-slate-500'}>
                      {regPassword.length >= 8 ? '✓' : '•'} 8+ Characters
                    </span>
                    <span className={/[A-Z]/.test(regPassword) ? 'text-teal-400' : 'text-slate-500'}>
                      {/[A-Z]/.test(regPassword) ? '✓' : '•'} Uppercase
                    </span>
                    <span className={/[a-z]/.test(regPassword) ? 'text-teal-400' : 'text-slate-500'}>
                      {/[a-z]/.test(regPassword) ? '✓' : '•'} Lowercase
                    </span>
                    <span className={/[0-9]/.test(regPassword) ? 'text-teal-400' : 'text-slate-500'}>
                      {/[0-9]/.test(regPassword) ? '✓' : '•'} Number
                    </span>
                    <span className={/[!@#$%^&*]/.test(regPassword) ? 'text-teal-400' : 'text-slate-500'}>
                      {/[!@#$%^&*]/.test(regPassword) ? '✓' : '•'} Symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Role Specific Registration Fields */}
            {selectedAuthRole === 'PATIENT' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                  Patient Electronic Health Profile (ABDM)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Date of Birth</label>
                    <input
                      type="date"
                      value={regDob}
                      onChange={e => setRegDob(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Gender</label>
                    <select
                      value={regGender}
                      onChange={e => setRegGender(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Health ID (ABDM / ABHA)</label>
                    <input
                      type="text"
                      value={regHealthId}
                      onChange={e => setRegHealthId(e.target.value)}
                      placeholder="ABDM-XXXX-XXXX-MH"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Village / City</label>
                    <input
                      type="text"
                      value={regVillage}
                      onChange={e => setRegVillage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">District</label>
                    <input
                      type="text"
                      value={regDistrict}
                      onChange={e => setRegDistrict(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Emergency Contact</label>
                    <input
                      type="text"
                      value={regEmergencyContact}
                      onChange={e => setRegEmergencyContact(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DOCTOR SPECIFIC */}
            {selectedAuthRole === 'DOCTOR' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider font-mono">
                  Clinical Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Medical Registration Number (MRN) *</label>
                    <input
                      type="text"
                      required
                      value={regMrn}
                      onChange={e => setRegMrn(e.target.value)}
                      placeholder="MCI-2014-98712"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400 mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Specialization</label>
                    <input
                      type="text"
                      value={regSpecialty}
                      onChange={e => setRegSpecialty(e.target.value)}
                      placeholder="General Medicine"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Qualifications</label>
                    <input
                      type="text"
                      value={regQualification}
                      onChange={e => setRegQualification(e.target.value)}
                      placeholder="MD (Medicine), MBBS"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Years of Experience</label>
                    <input
                      type="number"
                      value={regExperience}
                      onChange={e => setRegExperience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ASHA WORKER SPECIFIC */}
            {selectedAuthRole === 'ASHA_WORKER' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                  ASHA Field Accreditation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Worker ID *</label>
                    <input
                      type="text"
                      required
                      value={regWorkerId}
                      onChange={e => setRegWorkerId(e.target.value)}
                      placeholder="ASHA-KAD-09"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Assigned Health Centre</label>
                    <input
                      type="text"
                      value={regHospitalName}
                      onChange={e => setRegHospitalName(e.target.value)}
                      placeholder="Kadegaon PHC / Sub-Centre"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HOSPITAL ADMIN SPECIFIC */}
            {selectedAuthRole === 'HOSPITAL_ADMIN' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">
                  Facility Administration Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Hospital / Facility Name *</label>
                    <input
                      type="text"
                      required
                      value={regHospitalName}
                      onChange={e => setRegHospitalName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Facility Type</label>
                    <select
                      value={regFacilityType}
                      onChange={e => setRegFacilityType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 mt-1"
                    >
                      <option value="District Hospital">District Hospital</option>
                      <option value="Community Health Centre">Community Health Centre</option>
                      <option value="Primary Health Centre">Primary Health Centre</option>
                      <option value="Specialty Hospital">Specialty Hospital</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* LAB STAFF SPECIFIC */}
            {selectedAuthRole === 'LAB_STAFF' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                  Diagnostic Lab Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Laboratory Name *</label>
                    <input
                      type="text"
                      required
                      value={regLabName}
                      onChange={e => setRegLabName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Facility</label>
                    <input
                      type="text"
                      value={regHospitalName}
                      onChange={e => setRegHospitalName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PHARMACY SPECIFIC */}
            {selectedAuthRole === 'PHARMACY_STAFF' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  Pharmacy Dispensary Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Pharmacy Name *</label>
                    <input
                      type="text"
                      required
                      value={regPharmacyName}
                      onChange={e => setRegPharmacyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Facility</label>
                    <input
                      type="text"
                      value={regHospitalName}
                      onChange={e => setRegHospitalName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Provisioning Account in Firebase...</span>
                </>
              ) : (
                <>
                  <span>Create {currentRoleCard.title} Account</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-in Divider & Button */}
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-mono">or register with</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <button
              onClick={() => {
                playAudioChime('click');
                setAuthView('LOGIN');
              }}
              className="text-teal-400 hover:underline font-semibold cursor-pointer"
            >
              Login here
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
