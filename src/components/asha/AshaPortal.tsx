import React, { useState, useEffect } from 'react';
import { useApp } from '../../services/store';
import { getTranslation } from '../../i18n/translations';
import { voiceCommandService } from '../../services/voiceCommandService';
import {
  UserPlus,
  Mic,
  MicOff,
  Sparkles,
  Compass,
  CalendarCheck,
  Building2,
  AlertOctagon,
  FileCheck,
  CheckCircle2,
  WifiOff,
  RefreshCw,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export const AshaPortal: React.FC = () => {
  const {
    selectedLanguage,
    registerPatientByAsha,
    runAIIntake,
    runTriageAssessment,
    computeMedRoute,
    bookAppointment,
    facilities,
    doctors,
    activePatient,
    requestAmbulance,
    isOfflineMode,
    pendingSyncQueue,
    syncOfflineData,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const t = getTranslation(selectedLanguage);

  const [citizenName, setCitizenName] = useState('');
  const [citizenAge, setCitizenAge] = useState('24');
  const [citizenGender, setCitizenGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [citizenVillage, setCitizenVillage] = useState('Kadegaon Rural Block (Ward 3)');
  const [citizenPhone, setCitizenPhone] = useState('+91 98765 43210');
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleVoiceIntake = () => {
    playAudioChime('click');
    setIsListening(true);
    const samples: Record<string, string> = {
      hi: 'मरीज को दो दिन से तेज बुखार, बदन दर्द और कमजोरी है।',
      or: 'ରୋଗୀଙ୍କର ଦୁଇ ଦିନ ହେଲା ପ୍ରବଳ ଜ୍ୱର, ଦେହହାତ ବିନ୍ଧା ଏବଂ ଦୁର୍ବଳତା ଅଛି।',
      mr: 'रुग्णाला दोन दिवसांपासून तीव्र ताप, अंगदुखी आणि अशक्तपणा आहे.',
      bn: 'রোগীর দুই দিন ধরে তীব্র জ্বর, গায়ে ব্যথা এবং দুর্বলতা আছে।',
      te: 'రోగికి రెండు రోజులుగా తీవ్ర జ్వరం, ఒంటి నొప్పులు మరియు నీరసం ఉన్నాయి.',
      ta: 'நோயாளிக்கு இரண்டு நாட்களாக கடுமையான காய்ச்சல், உடல் வலி மற்றும் சோர்வு உள்ளது.',
      kn: 'ರೋಗಿಗೆ ಎರಡು ದಿನಗಳಿಂದ ತೀವ್ರ ಜ್ವರ, ಮೈಕೈ ನೋವು ಮತ್ತು ದೌರ್ಬಲ್ಯವಿದೆ.',
      gu: 'દર્દીને બે દિવસથી તીવ્ર તાવ, શરીરનો દુખાવો અને નબળાઈ છે.',
      pa: 'ਮਰੀਜ਼ ਨੂੰ ਦੋ ਦਿਨਾਂ ਤੋਂ ਤੇਜ਼ ਬੁਖਾਰ, ਸਰੀਰ ਦਰਦ ਅਤੇ ਕਮਜ਼ੋਰੀ ਹੈ।',
      ml: 'രോഗിക്ക് രണ്ട് ദിവസമായി കടുത്ത പനിയും ശരീരവേദനയും ക്ഷീണവുമുണ്ട്.',
      en: 'Patient has high fever, body aches and severe weakness for 2 days.'
    };
    const sample = samples[selectedLanguage] || samples.en;
    setTimeout(() => {
      setVoiceQuery(sample);
      setIsListening(false);
    }, 1500);
  };

  const handleRegisterAndRoute = async () => {
    if (!citizenName.trim()) {
      setStatusMessage('Please enter citizen name.');
      return;
    }

    playAudioChime('click');
    try {
      // 1. Register citizen
      const newPatient = await registerPatientByAsha({
        name: citizenName,
        age: parseInt(citizenAge) || 25,
        gender: citizenGender,
        phone: citizenPhone,
        villageOrCity: citizenVillage,
        bloodGroup: 'B+',
        allergies: ['None recorded'],
        registeredByAshaId: 'asha-savita'
      });

      // 2. Run AI Intake
      const textToUse = voiceQuery || `${citizenName} presents with fever and weakness`;
      const intake = await runAIIntake(textToUse, selectedLanguage);
      const triage = await runTriageAssessment(intake);

      // 3. MedRoute match and auto-book
      const targetFac = facilities.find(f => f.name.includes('District')) || facilities[0];
      const targetDoc = doctors.find(d => d.facilityId === targetFac.id && d.isAvailable) || doctors[0];

      await bookAppointment(targetFac.id, targetDoc.id, '11:00 AM', intake.chiefComplaint, triage.careLevel);

      setStatusMessage(`Citizen ${newPatient.name} registered (Health ID: ${newPatient.healthId}) and booked at ${targetFac.name}!`);
      triggerConfetti();
    } catch (e) {
      setStatusMessage('Error registering citizen.');
    }
  };

  useEffect(() => {
    const unsub = voiceCommandService.subscribe(action => {
      if (action.type === 'ASHA_ACTION') {
        if (action.payload === 'REGISTER_CITIZEN') {
          if (!citizenName.trim()) {
            setCitizenName('Sunita Majhi');
          }
          handleRegisterAndRoute();
        } else if (action.payload === 'SYNC_OFFLINE') {
          syncOfflineData();
        }
      }
    });
    return () => unsub();
  }, [citizenName, handleRegisterAndRoute, syncOfflineData]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ASHA Header */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xl">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                ASHA FIELD WORKER PORTAL
              </span>
              {isOfflineMode && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Offline Mode Active ({pendingSyncQueue.length} pending)
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold font-display text-white mt-1">
              Savita Tai (Kadegaon Village Circle)
            </h1>
            <p className="text-xs text-slate-300">
              Assisted Rural Citizen Intake, Voice Triage & Facility Routing
            </p>
          </div>
        </div>

        {isOfflineMode && pendingSyncQueue.length > 0 && (
          <button
            onClick={syncOfflineData}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync {pendingSyncQueue.length} Offline Records</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main ASHA Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Register Citizen & Voice Intake */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <UserPlus className="w-4 h-4" />
            <span>1. Register Rural Citizen</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Citizen Full Name</label>
              <input
                type="text"
                value={citizenName}
                onChange={e => setCitizenName(e.target.value)}
                placeholder="e.g. Rahul Kumar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Age</label>
                <input
                  type="number"
                  value={citizenAge}
                  onChange={e => setCitizenAge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Gender</label>
                <select
                  value={citizenGender}
                  onChange={e => setCitizenGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Village / Hamlet</label>
              <input
                type="text"
                value={citizenVillage}
                onChange={e => setCitizenVillage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Voice Symptom Intake</span>
              </label>
              <button
                onClick={handleVoiceIntake}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Listening...' : 'Tap & Speak'}</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={voiceQuery}
              onChange={e => setVoiceQuery(e.target.value)}
              placeholder="Record symptoms spoken by citizen..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          <button
            onClick={handleRegisterAndRoute}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Register & Instant MedRoute Booking</span>
          </button>
        </div>

        {/* Quick Rural Emergency SOS & Community Services */}
        <div className="space-y-4">
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              <span>Rural Emergency SOS Dispatch</span>
            </div>
            <p className="text-xs text-slate-300">
              Direct emergency bypass to District Trauma Hospital & 108 Ambulance Network.
            </p>
            <button
              onClick={async () => {
                playAudioChime('alert');
                const targetFac = facilities.find(f => f.emergencyCapability) || facilities[0];
                const trip = await requestAmbulance(
                  activePatient?.id || 'pat-rural-1',
                  citizenVillage || 'Kadegaon Rural Block Ward 3',
                  targetFac.id,
                  'Advanced Life Support (ALS)',
                  'CRITICAL'
                );
                setStatusMessage(`🚨 Emergency Ambulance 108 Dispatched! Mission #${trip.id}. Driver: ${trip.driverName}. Pickup OTP: ${trip.otp}. Trauma Emergency team notified.`);
                triggerConfetti();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 108 Emergency Ambulance</span>
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Village Health Schedule & Immunization
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Maternal Health Camp</span>
                  <p className="text-slate-400 text-[11px]">Kadegaon PHC • Friday 10 AM</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[10px]">Upcoming</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Pediatric Immunization Drive</span>
                  <p className="text-slate-400 text-[11px]">Anganwadi Center 2 • Tomorrow</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
