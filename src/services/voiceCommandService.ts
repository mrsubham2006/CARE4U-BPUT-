import { Language, UserRole } from '../types';

export type VoiceActionType =
  | 'NAVIGATE_TAB'
  | 'TRIGGER_EMERGENCY_SOS'
  | 'DISPATCH_AMBULANCE'
  | 'SWITCH_ROLE'
  | 'SET_LANGUAGE'
  | 'OPEN_MODAL'
  | 'CLOSE_MODALS'
  | 'AUTH_ACTION'
  | 'TAKE_MEDICINE'
  | 'DISPENSE_PRESCRIPTION'
  | 'ADVANCE_AMBULANCE'
  | 'ADVANCE_LAB_ORDER'
  | 'DOCTOR_ACTION'
  | 'ASHA_ACTION'
  | 'SCROLL_PAGE'
  | 'CLICK_ELEMENT'
  | 'READ_PAGE'
  | 'ASK_GEMINI_AI'
  | 'AI_SYMPTOM_CHECK'
  | 'START_VIDEO_CALL';

export interface VoiceCommandAction {
  type: VoiceActionType;
  payload?: any;
  label: string;
  feedbackText: Record<Language, string>;
}

export type VoiceActionListener = (action: VoiceCommandAction) => void;

// Language code mapping for SpeechRecognition and SpeechSynthesis
export const SPEECH_LANG_MAP: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  or: 'or-IN', // Odia
  mr: 'mr-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ml: 'ml-IN'
};

class VoiceCommandService {
  private recognition: any = null;
  private isListening: boolean = false;
  private continuousMode: boolean = false;
  private listeners: Set<VoiceActionListener> = new Set();
  private transcriptListeners: Set<(text: string, isFinal: boolean) => void> = new Set();
  private statusListeners: Set<(isListening: boolean) => void> = new Set();
  private isTTSMuted: boolean = false;
  private currentLanguage: Language = 'en';
  private restartTimeout: any = null;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech Recognition API not supported in this browser environment.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = SPEECH_LANG_MAP[this.currentLanguage] || 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyStatus(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyStatus(false);
        // Automatically restart if continuous listening mode is enabled
        if (this.continuousMode) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.continuousMode && !this.isListening) {
              try {
                this.recognition.start();
              } catch {
                // Ignore transient already-started errors
              }
            }
          }, 300);
        }
      };

      this.recognition.onerror = (event: any) => {
        // 'no-speech' happens naturally between sentences in continuous mode
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.warn('Speech recognition permission denied or service blocked');
          this.continuousMode = false;
          this.isListening = false;
          this.notifyStatus(false);
        }
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const activeText = (finalTranscript || interimTranscript).trim();
        if (activeText) {
          this.notifyTranscript(activeText, Boolean(finalTranscript));
        }

        if (finalTranscript) {
          this.processCommand(finalTranscript.trim());
        }
      };
    } catch (err) {
      console.warn('Failed to initialize speech recognition:', err);
    }
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN';
      if (this.isListening) {
        try {
          this.recognition.stop();
        } catch {}
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isTTSMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isTTSMuted;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getContinuousMode(): boolean {
    return this.continuousMode;
  }

  public setContinuousMode(enabled: boolean) {
    this.continuousMode = enabled;
    if (enabled && !this.isListening) {
      this.start();
    } else if (!enabled && this.isListening) {
      this.stop();
    }
  }

  public start() {
    if (!this.recognition) {
      this.initSpeechRecognition();
    }
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.lang = SPEECH_LANG_MAP[this.currentLanguage] || 'en-IN';
        this.recognition.start();
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  }

  public stop() {
    this.continuousMode = false;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
    }
  }

  public toggleListening() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  public subscribe(listener: VoiceActionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onTranscript(listener: (text: string, isFinal: boolean) => void): () => void {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  public onStatus(listener: (isListening: boolean) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus(isListening: boolean) {
    this.statusListeners.forEach(listener => {
      try {
        listener(isListening);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyTranscript(text: string, isFinal: boolean) {
    this.transcriptListeners.forEach(listener => {
      try {
        listener(text, isFinal);
      } catch (e) {
        console.error(e);
      }
    });
  }

  public dispatchAction(action: VoiceCommandAction) {
    this.listeners.forEach(listener => {
      try {
        listener(action);
      } catch (e) {
        console.error(e);
      }
    });

    // Speak voice confirmation back to user
    const textToSpeak = action.feedbackText[this.currentLanguage] || action.feedbackText.en;
    this.speak(textToSpeak);
  }

  public speak(text: string) {
    if (this.isTTSMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LANG_MAP[this.currentLanguage] || 'en-IN';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS playback error:', err);
    }
  }

  // DOM Automation Helper: Locate clickable elements by text/label and click
  public clickElementByLabel(targetLabel: string): boolean {
    if (typeof document === 'undefined') return false;
    const lower = targetLabel.toLowerCase().trim();
    if (!lower) return false;

    const interactiveElements = Array.from(
      document.querySelectorAll<HTMLElement>('button, a, input[type="button"], input[type="submit"], [role="button"]')
    );

    // Exact Match
    for (const el of interactiveElements) {
      const text = (el.textContent || '').toLowerCase().trim();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase().trim();
      const title = (el.getAttribute('title') || '').toLowerCase().trim();
      if (text === lower || aria === lower || title === lower) {
        el.click();
        return true;
      }
    }

    // Substring Match
    for (const el of interactiveElements) {
      const text = (el.textContent || '').toLowerCase().trim();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase().trim();
      const title = (el.getAttribute('title') || '').toLowerCase().trim();
      if (text.includes(lower) || aria.includes(lower) || title.includes(lower)) {
        el.click();
        return true;
      }
    }

    return false;
  }

  // Scroll Automation Helper
  public scrollPage(direction: 'up' | 'down' | 'top' | 'bottom') {
    if (typeof window === 'undefined') return;
    if (direction === 'down') {
      window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
    } else if (direction === 'up') {
      window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' });
    } else if (direction === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (direction === 'bottom') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }

  /**
   * Universal Multilingual Intent Parser & Workflow Executor
   * Comprehends English, Odia, Hindi, Marathi, Bengali, Telugu, Tamil, etc.
   */
  public processCommand(rawText: string): VoiceCommandAction | null {
    const text = rawText.toLowerCase().trim();
    if (!text) return null;

    // Helper for multi-word inclusion
    const has = (...phrases: string[]) => phrases.some(p => text.includes(p));

    // =========================================================================
    // 1. EMERGENCY 108 SOS & AMBULANCE DISPATCH
    // =========================================================================
    if (has('sos', '108', 'emergency', 'ambulance', 'ଆମ୍ବୁଲାନ୍ସ', 'ଜରୁରୀ', 'ଏମରଜେନ୍ସି', 'एम्बुलेंस', 'आपातकाल', 'रुग्णवाहिका')) {
      const isDirectDispatch = has('dispatch', 'call ambulance', 'send ambulance', 'dispatch now', 'ଡାକନ୍ତୁ', 'बुलाओ');
      const action: VoiceCommandAction = {
        type: isDirectDispatch ? 'DISPATCH_AMBULANCE' : 'TRIGGER_EMERGENCY_SOS',
        label: isDirectDispatch ? 'Emergency 108 Dispatched' : 'Emergency 108 SOS Modal',
        feedbackText: {
          en: '108 Emergency ambulance dispatch initiated with live GPS telemetry.',
          hi: '108 आपातकालीन एम्बुलेंस सेवा शुरू की जा रही है।',
          or: '୧୦୮ ଜରୁରୀକାଳୀନ ଆମ୍ବୁଲାନ୍ସ ସେବା ଆରମ୍ଭ କରାଯାଉଛି।',
          mr: '१०८ आपत्कालीन रुग्णवाहिका सेवा सुरू केली आहे.',
          bn: '১০৮ জরুরি অ্যাম্বুলেন্স সেবা শুরু করা হয়েছে।',
          te: '108 అత్యవసర అంబులెన్స్ సేవ ప్రారంభించబడింది.',
          ta: '108 அவசர ஆம்புலன்ஸ் சேவை தொடங்கப்பட்டது.',
          kn: '108 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ.',
          gu: '108 કટોકટી એમ્બ્યુલન્સ સેવા શરૂ થઈ.',
          pa: '108 ਐਮਰਜੈਂਸੀ ਐਂਬੂਲੈਂਸ ਸੇਵਾ ਸ਼ੁਰੂ ਕੀਤੀ ਗਈ ਹੈ।',
          ml: '108 അടിയന്തര ആംബുലൻസ് സേവനം ആരംഭിച്ചു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 2. OPERATIONAL TASK: TAKE MEDICINE / DOSE CHECK-OFF
    // =========================================================================
    if (
      has(
        'take medicine',
        'take my medicine',
        'mark medicine as taken',
        'mark medicine taken',
        'took medicine',
        'took my medicine',
        'take pill',
        'take dose',
        'take paracetamol',
        'medicine taken',
        'ଔଷଧ ଖାଇଲି',
        'ଦବା ଖାଇଲି',
        'दवा ली',
        'दवा खा ली',
        'औषध घेतले',
        'औषध खाल्ले'
      )
    ) {
      const action: VoiceCommandAction = {
        type: 'TAKE_MEDICINE',
        label: 'Mark Medicine Dose as Taken',
        feedbackText: {
          en: 'Great job! Your scheduled medicine dose has been marked as taken.',
          hi: 'बहुत बढ़िया! आपकी निर्धारित दवा ली हुई दर्ज कर दी गई है।',
          or: 'ବହୁତ ଭଲ! ଆପଣଙ୍କ ଧାର୍ଯ୍ୟ ଔଷଧ ଖାଇବା ଦର୍ଜ କରାଗଲା।',
          mr: 'छान! तुमचे नियोजित औषध घेतल्याची नोंद झाली आहे.',
          bn: 'চমৎকার! আপনার ওষুধ খাওয়া সম্পন্ন হয়েছে।',
          te: 'చాలా మంచిది! మీ మందు తీసుకున్నట్లు నమోదు చేయబడింది.',
          ta: 'நன்று! உங்கள் மருந்து எடுத்துக்கொண்டதாக பதிவு செய்யப்பட்டது.',
          kn: 'ಉತ್ತಮ! ನಿಮ್ಮ ಔಷಧಿ ತೆಗೆದುಕೊಂಡಿರುವುದಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.',
          gu: 'સરસ! તમારી દવા લેવાઈ ગઈ છે.',
          pa: 'ਬਹੁਤ ਵਧੀਆ! ਤੁਹਾਡੀ ਦਵਾਈ ਖਾਧੀ ਗਈ ਦਰਜ ਹੋ ਗਈ ਹੈ।',
          ml: 'വളരെ നല്ലത്! നിങ്ങളുടെ മരുന്ന് കഴിച്ചതായി രേഖപ്പെടുത്തി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 3. OPERATIONAL TASK: PHARMACY DISPENSE
    // =========================================================================
    if (
      has(
        'dispense medicine',
        'dispense prescription',
        'dispense order',
        'dispense rx',
        'dispense now',
        'ଔଷଧ ଦିଅନ୍ତୁ',
        'ଔଷଧ ବିତରଣ',
        'दवा वितरण करो',
        'दवा दें',
        'औषध वाटप करा'
      )
    ) {
      const action: VoiceCommandAction = {
        type: 'DISPENSE_PRESCRIPTION',
        label: 'Dispense e-Prescription',
        feedbackText: {
          en: 'Dispensing e-prescription and updating medicine inventory stock.',
          hi: 'ई-पर्चे का वितरण और स्टॉक अद्यतन किया जा रहा है।',
          or: 'ଇ-ପ୍ରେସକ୍ରିପସନ ବିତରଣ କରାଗଲା ଏବଂ ଷ୍ଟକ୍ ଅପଡେଟ୍ ହେଲା।',
          mr: 'ई-प्रिस्क्रिप्शन वाटप करून साठा अद्यतनित केला आहे.',
          bn: 'ই-প্রেসক্রিপশন বিতরণ করা হয়েছে।',
          te: 'ఇ-ప్రిస్క్రిప్షన్ పంపిణీ చేయబడింది.',
          ta: 'மருந்து விநியோகிக்கப்பட்டது.',
          kn: 'ಔಷಧಿ ವಿತರಿಸಲಾಗಿದೆ.',
          gu: 'દવા વિતરિત કરવામાં આવી.',
          pa: 'ਦਵਾਈ ਵੰਡ ਦਿੱਤੀ ਗਈ ਹੈ।',
          ml: 'മരുന്ന് വിതരണം ചെയ്തു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 4. OPERATIONAL TASK: DOCTOR CLINICAL WORKFLOW
    // =========================================================================
    if (
      has(
        'next patient',
        'call next patient',
        'call next',
        'next opd',
        'पରବର୍ତ୍ତୀ ରୋଗୀ',
        'ପରବର୍ତ୍ତୀ ରୋଗୀଙ୍କୁ ଡାକନ୍ତୁ',
        'अगला मरीज',
        'अगला मरीज बुलाओ',
        'पुढील रुग्ण',
        'পরের রোগী'
      )
    ) {
      const action: VoiceCommandAction = {
        type: 'DOCTOR_ACTION',
        payload: 'NEXT_PATIENT',
        label: 'Call Next Patient in OPD Queue',
        feedbackText: {
          en: 'Calling the next queued patient into the consultation workspace.',
          hi: 'ओपीडी कतार से अगले मरीज को परामर्श कक्ष में बुलाया जा रहा है।',
          or: 'OPD ଧାଡ଼ିରୁ ପରବର୍ତ୍ତୀ ରୋଗୀଙ୍କୁ ପରାମର୍ଶ କକ୍ଷକୁ ଡକାଯାଉଛି।',
          mr: 'ओपीडी रांगेतील पुढील रुग्णाला सल्लामसलत कक्षात बोलावले आहे.',
          bn: 'পরবর্তী রোগীকে ডাকা হচ্ছে।',
          te: 'తదుపరి రోగిని పిలుస్తున్నారు.',
          ta: 'அடுத்த நோயாளி அழைக்கப்படுகிறார்.',
          kn: 'ಮುಂದಿನ ರೋಗಿಯನ್ನು ಕರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'આગળના દર્દીને બોલાવવામાં આવી રહ્યા છે.',
          pa: 'ਅਗਲੇ ਮਰੀਜ਼ ਨੂੰ ਬੁਲਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'അടുത്ത രോഗിയെ വിളിക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('start consultation', 'begin consultation', 'start clinical consult', 'ପରାମର୍ଶ ଆରମ୍ଭ', 'परामर्श शुरू करो')) {
      const action: VoiceCommandAction = {
        type: 'DOCTOR_ACTION',
        payload: 'CONSULTATION_TAB',
        label: 'Open Clinical Consultation Workspace',
        feedbackText: {
          en: 'Opening doctor consultation workspace.',
          hi: 'डॉक्टर परामर्श कार्यक्षेत्र खोला जा रहा है।',
          or: 'ଡାକ୍ତର ପରାମର୍ଶ କାର୍ଯ୍ୟକ୍ଷେତ୍ର ଖୋଲାଯାଉଛି।',
          mr: 'सल्लामसलत कार्यक्षेत्र उघडले जात आहे.',
          bn: 'পরামর্শ রুম খোলা হচ্ছে।',
          te: 'సంప్రదింపుల విభాగం తెరవబడుతోంది.',
          ta: 'ஆலோசனை அரங்கு திறக்கப்படுகிறது.',
          kn: 'ಸಮಾಲೋಚನಾ ಕೊಠಡಿ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'કન્સલ્ટેશન કાર્યક્ષેત્ર ખુલી રહ્યું છે.',
          pa: 'ਸਲਾਹ-ਮਸ਼ਵਰਾ ਕਾਰਜਖੇਤਰ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'കൺസൾട്ടേഷൻ വിഭാഗം തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('opd queue', 'opd line', 'patient queue', 'queue list', 'ଧାଡ଼ି ତାଲିକା', 'कतार देखें', 'ओपीडी कतार')) {
      const action: VoiceCommandAction = {
        type: 'DOCTOR_ACTION',
        payload: 'OPD_QUEUE',
        label: 'Open Doctor OPD Queue',
        feedbackText: {
          en: 'Opening live OPD patient queue.',
          hi: 'लाइव ओपीडी मरीज कतार खोली जा रही है।',
          or: 'ଲାଇଭ୍ OPD ରୋଗୀ ଧାଡ଼ି ଖୋଲାଯାଉଛି।',
          mr: 'ओपीडी रांग उघडली जात आहे.',
          bn: 'ওপিডি সারি খোলা হচ্ছে।',
          te: 'OPD క్యూ తెరవబడుతోంది.',
          ta: 'OPD வரிசை திறக்கப்படுகிறது.',
          kn: 'OPD ಕ್ಯೂ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'ઓપીડી કતાર ખુલી રહી છે.',
          pa: 'OPD ਕਤਾਰ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'OPD ക്യൂ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 5. OPERATIONAL TASK: AMBULANCE LIFECYCLE
    // =========================================================================
    if (
      has(
        'accept trip',
        'accept emergency',
        'en route',
        'arrived at patient',
        'patient picked',
        'arrive hospital',
        'complete trip',
        'next ambulance status',
        'advance ambulance'
      )
    ) {
      const action: VoiceCommandAction = {
        type: 'ADVANCE_AMBULANCE',
        label: 'Advance Ambulance Trip Status',
        feedbackText: {
          en: 'Ambulance trip status updated successfully.',
          hi: 'एम्बुलेंस यात्रा की स्थिति सफलतापूर्वक अद्यतन की गई।',
          or: 'ଆମ୍ବୁଲାନ୍ସ ଯାତ୍ରା ସ୍ଥିତି ସଫଳତାର ସହ ଅପଡେଟ୍ କରାଗଲା।',
          mr: 'रुग्णवाहिका स्थिती अद्यतनित झाली.',
          bn: 'অ্যাম্বুলেন্স স্ট্যাটাস আপডেট হয়েছে।',
          te: 'అంబులెన్స్ స్థితి నవీకరించబడింది.',
          ta: 'ஆம்புலன்ஸ் நிலை புதுப்பிக்கப்பட்டது.',
          kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ.',
          gu: 'એમ્બ્યુલન્સ સ્થિતિ અપડેટ થઈ.',
          pa: 'ਐਂਬੂਲੈਂਸ ਸਥਿਤੀ ਅੱਪਡੇਟ ਕੀਤੀ ਗਈ।',
          ml: 'ആംബുലൻസ് നില അപ്ഡേറ്റ് ചെയ്തു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 6. OPERATIONAL TASK: LAB TEST PROCESSING
    // =========================================================================
    if (has('process lab', 'process test', 'complete lab order', 'complete test', 'upload lab report', 'verify sample')) {
      const action: VoiceCommandAction = {
        type: 'ADVANCE_LAB_ORDER',
        label: 'Advance Lab Test Order',
        feedbackText: {
          en: 'Diagnostic lab order status advanced.',
          hi: 'लैब जांच ऑर्डर की स्थिति आगे बढ़ा दी गई है।',
          or: 'ଡାଇଗ୍ନୋଷ୍ଟିକ୍ ଲ୍ୟାବ୍ ଅର୍ଡର ସ୍ଥିତି ଆଗକୁ ବଢ଼ାଗଲା।',
          mr: 'प्रयोगशाळा चाचणी स्थिती अद्यतनित केली.',
          bn: 'ল্যাব টেস্ট স্ট্যাটাস আপডেট করা হয়েছে।',
          te: 'ల్యాబ్ పరీక్ష స్థితి నవీకరించబడింది.',
          ta: 'ஆய்வக சோதனை நிலை புதுப்பிக்கப்பட்டது.',
          kn: 'ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷಾ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ.',
          gu: 'લેબ ટેસ્ટ સ્થિતિ અપડેટ થઈ.',
          pa: 'ਲੈਬ ਟੈਸਟ ਸਥਿਤੀ ਅੱਪਡੇਟ ਕੀਤੀ ਗਈ।',
          ml: 'ലാബ് പരിശോധനാ നില അപ്ഡേറ്റ് ചെയ്തു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 7. OPERATIONAL TASK: ASHA FIELD WORKFLOW
    // =========================================================================
    if (has('register citizen', 'register patient', 'new citizen', 'ନୂତନ ରୋଗୀ', 'नागरिक पंजीकरण', 'नवीन रुग्ण नोंदणी')) {
      const action: VoiceCommandAction = {
        type: 'ASHA_ACTION',
        payload: 'REGISTER_CITIZEN',
        label: 'Register Rural Citizen Profile',
        feedbackText: {
          en: 'Rural citizen registration completed with ABDM Health ID.',
          hi: 'ग्रामीण नागरिक पंजीकरण आयुष्मान स्वास्थ्य आईडी के साथ पूरा हुआ।',
          or: 'ABDM ସ୍ୱାସ୍ଥ୍ୟ ID ସହିତ ଗ୍ରାମୀଣ ନାଗରିକ ପଞ୍ଜିକରଣ ସମ୍ପୂର୍ଣ୍ଣ ହେଲା।',
          mr: 'ग्रामीण नागरिक नोंदणी पूर्ण झाली.',
          bn: 'গ্রামীণ নাগরিক নিবন্ধন সম্পন্ন হয়েছে।',
          te: 'గ్రామీణ పౌరుల నమోదు పూర్తయింది.',
          ta: 'கிராமப்புற குடிமகன் பதிவு முடிந்தது.',
          kn: 'ಗ್ರಾಮೀಣ ನಾಗರಿಕ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ.',
          gu: 'ગ્રામીણ નાગરિક નોંધણી પૂર્ણ થઈ.',
          pa: 'ਪੇਂਡੂ ਨਾਗਰਿਕ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਪੂਰੀ ਹੋਈ।',
          ml: 'ഗ്രാമീണ പൗര രജിസ്ട്രേഷൻ പൂർത്തിയായി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('sync data', 'sync offline', 'upload offline', 'ସିଙ୍କ କରନ୍ତୁ', 'सिंक करो', 'डेटा सिंक करा')) {
      const action: VoiceCommandAction = {
        type: 'ASHA_ACTION',
        payload: 'SYNC_OFFLINE',
        label: 'Sync Offline Health Records',
        feedbackText: {
          en: 'Offline sync initiated with central FHIR servers.',
          hi: 'ऑफलाइन डेटा सिंक सफलतापूर्वक शुरू किया गया।',
          or: 'କେନ୍ଦ୍ରୀୟ ସର୍ଭର ସହିତ ଅଫଲାଇନ୍ ଡାଟା ସିଙ୍କ କରାଗଲା।',
          mr: 'ऑफलाइन डेटा सिंक सुरू केले.',
          bn: 'অফলাইন ডেটা সিঙ্ক শুরু হয়েছে।',
          te: 'ఆఫ్‌లైన్ డేటా సమకాలీకరణ ప్రారంభించబడింది.',
          ta: 'ஆஃப்லைன் தரவு ஒத்திசைவு தொடங்கப்பட்டது.',
          kn: 'ಆಫ್‌ಲೈನ್ ಡೇಟಾ ಸಿಂಕ್ ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ.',
          gu: 'ઓફલાઇન ડેટા સિંક શરૂ થયું.',
          pa: 'ਆਫ਼ਲਾਈਨ ਡਾਟਾ ਸਿੰਕ ਸ਼ੁਰੂ ਕੀਤਾ ਗਿਆ।',
          ml: 'ഓഫ്‌ലൈൻ ഡാറ്റ സിങ്ക് ആരംഭിച്ചു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 8. UNIVERSAL UI SCROLL & DOM INTERACTION
    // =========================================================================
    if (has('scroll down', 'page down', 'ତଳକୁ ଯାଆନ୍ତୁ', 'नीचे स्क्रॉल करो', 'खाली स्क्रोल करा')) {
      this.scrollPage('down');
      const action: VoiceCommandAction = {
        type: 'SCROLL_PAGE',
        payload: 'down',
        label: 'Scroll Down Page',
        feedbackText: {
          en: 'Scrolling down.',
          hi: 'नीचे स्क्रॉल किया गया।',
          or: 'ତଳକୁ ସ୍କ୍ରୋଲ୍ କରାଗଲା।',
          mr: 'खाली स्क्रोल केले.',
          bn: 'নিচে স্ক্রোল করা হয়েছে।',
          te: 'క్రిందికి స్క్రోల్ చేస్తోంది.',
          ta: 'கீழே உருட்டுகிறது.',
          kn: 'ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಲಾಗುತ್ತಿದೆ.',
          gu: 'નીચે સ્ક્રોલ કરી રહ્યા છીએ.',
          pa: 'ਹੇਠਾਂ ਸਕ੍ਰੋਲ ਕੀਤਾ ਗਿਆ।',
          ml: 'താഴേക്ക് സ്ക്രോൾ ചെയ്യുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('scroll up', 'page up', 'ଉପରକୁ ଯାଆନ୍ତୁ', 'ऊपर स्क्रॉल करो', 'वर स्क्रोल करा')) {
      this.scrollPage('up');
      const action: VoiceCommandAction = {
        type: 'SCROLL_PAGE',
        payload: 'up',
        label: 'Scroll Up Page',
        feedbackText: {
          en: 'Scrolling up.',
          hi: 'ऊपर स्क्रॉल किया गया।',
          or: 'ଉପରକୁ ସ୍କ୍ରୋଲ୍ କରାଗଲା।',
          mr: 'वर स्क्रोल केले.',
          bn: 'উপরে স্ক্রোল করা হয়েছে।',
          te: 'పైకి స్క్రోల్ చేస్తోంది.',
          ta: 'மேலே உருட்டுகிறது.',
          kn: 'ಮೇಲಕ್ಕೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಲಾಗುತ್ತಿದೆ.',
          gu: 'ઉપર સ્ક્રોલ કરી રહ્યા છીએ.',
          pa: 'ਉੱਪਰ ਸਕ੍ਰੋਲ ਕੀਤਾ ਗਿਆ।',
          ml: 'മുകളിലേക്ക് സ്ക്രോൾ ചെയ്യുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('scroll to top', 'go to top', 'top of page', 'शीर्ष पर जाओ', 'वरती जा')) {
      this.scrollPage('top');
      const action: VoiceCommandAction = {
        type: 'SCROLL_PAGE',
        payload: 'top',
        label: 'Scroll to Top',
        feedbackText: {
          en: 'Scrolled to top.',
          hi: 'पेज के शीर्ष पर पहुंचे।',
          or: 'ପୃଷ୍ଠାର ଶୀର୍ଷକୁ ଯାଉଛି।',
          mr: 'पृष्ठाच्या शीर्षस्थानी गेले.',
          bn: 'শীর্ষে যাওয়া হয়েছে।',
          te: 'పైకి చేరుకుంది.',
          ta: 'மேலே சென்றது.',
          kn: 'ಮೇಲಕ್ಕೆ ತಲುಪಿದೆ.',
          gu: 'ટોચ પર ગયા.',
          pa: 'ਸਿਖਰ ਤੇ ਪਹੁੰਚ ਗਏ।',
          ml: 'മുകളിൽ എത്തി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('scroll to bottom', 'go to bottom', 'bottom of page', 'सबसे नीचे जाओ', 'तळाशी जा')) {
      this.scrollPage('bottom');
      const action: VoiceCommandAction = {
        type: 'SCROLL_PAGE',
        payload: 'bottom',
        label: 'Scroll to Bottom',
        feedbackText: {
          en: 'Scrolled to bottom.',
          hi: 'पेज के अंत में पहुंचे।',
          or: 'ପୃଷ୍ଠାର ଶେଷକୁ ଯାଉଛି।',
          mr: 'पृष्ठाच्या तळाशी गेले.',
          bn: 'নিচে যাওয়া হয়েছে।',
          te: 'చివరికి చేరుకుంది.',
          ta: 'கீழே சென்றது.',
          kn: 'ಕೆಳಗೆ ತಲುಪಿದೆ.',
          gu: 'તળિયે ગયા.',
          pa: 'ਹੇਠਾਂ ਪਹੁੰਚ ਗਏ।',
          ml: 'താഴെ എത്തി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // "Click [button]" trigger
    if (text.startsWith('click ') || text.startsWith('press ') || text.startsWith('tap ')) {
      const targetLabel = text.replace(/^(click|press|tap)\s+/i, '').trim();
      const clicked = this.clickElementByLabel(targetLabel);
      const action: VoiceCommandAction = {
        type: 'CLICK_ELEMENT',
        payload: targetLabel,
        label: `Click: ${targetLabel}`,
        feedbackText: {
          en: clicked ? `Clicked ${targetLabel}.` : `Could not find button ${targetLabel}.`,
          hi: clicked ? `${targetLabel} पर क्लिक किया।` : `${targetLabel} नहीं मिला।`,
          or: clicked ? `${targetLabel} କ୍ଲିକ୍ କରାଗଲା।` : `${targetLabel} ମିଳିଲା ନାହିଁ।`,
          mr: clicked ? `${targetLabel} वर क्लिक केले.` : `${targetLabel} सापडले नाही.`,
          bn: clicked ? `${targetLabel} ক্লিক করা হয়েছে।` : `${targetLabel} পাওয়া যায়নি।`,
          te: clicked ? `${targetLabel} క్లిక్ చేయబడింది.` : `${targetLabel} కనుగొనబడలేదు.`,
          ta: clicked ? `${targetLabel} கிளிக் செய்யப்பட்டது.` : `${targetLabel} கிடைக்கவில்லை.`,
          kn: clicked ? `${targetLabel} ಕ್ಲಿಕ್ ಮಾಡಲಾಗಿದೆ.` : `${targetLabel} ಕಂಡುಬಂದಿಲ್ಲ.`,
          gu: clicked ? `${targetLabel} ક્લિક કર્યું.` : `${targetLabel} મળ્યું નથી.`,
          pa: clicked ? `${targetLabel} ਕਲਿੱਕ ਕੀਤਾ ਗਿਆ।` : `${targetLabel} ਨਹੀਂ ਮਿਲਿਆ।`,
          ml: clicked ? `${targetLabel} ക്ലിക്ക് ചെയ്തു.` : `${targetLabel} കണ്ടെത്താനായില്ല.`
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 9. MEDICAL SYMPTOM DETECTION & NATURAL INTAKE
    // =========================================================================
    const symptomKeywords = [
      'fever', 'cough', 'headache', 'chest pain', 'stomach ache', 'vomiting',
      'cold', 'throat', 'dizziness', 'weakness', 'rash', 'fatigue',
      'ଜ୍ୱର', 'କାଶ', 'ମୁଣ୍ଡବିନ୍ଧା', 'ଛାତି ବିନ୍ଧା', 'ପେଟ ବିନ୍ଧା',
      'बुखार', 'खांसी', 'सिरदर्द', 'सीने में दर्द', 'पेट दर्द', 'उल्टी',
      'ताप', 'खोकला', 'डोकेदुखी', 'छातीत दुखणे', 'पोटदुखी'
    ];

    const containsSymptom = symptomKeywords.some(s => text.includes(s));
    if (containsSymptom && (text.includes('have ') || text.includes('suffering') || text.includes('pain') || text.includes('ଅଛି') || text.includes('है') || text.includes('आहे') || text.includes('check symptom') || text.includes('triage'))) {
      const action: VoiceCommandAction = {
        type: 'AI_SYMPTOM_CHECK',
        payload: rawText,
        label: 'Clinical AI Symptom Triage',
        feedbackText: {
          en: 'Analyzing your reported symptoms in AI Clinical Intake.',
          hi: 'एआई स्वास्थ्य लक्षण जांच में आपके लक्षणों का विश्लेषण किया जा रहा है।',
          or: 'AI ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶରେ ଆପଣଙ୍କ ଲକ୍ଷଣ ବିଶ୍ଳେଷଣ କରାଯାଉଛି।',
          mr: 'एआय क्लिनिकल तपासणीत तुमच्या लक्षणांचे विश्लेषण केले जात आहे.',
          bn: 'আপনার স্বাস্থ্য লক্ষণ বিশ্লেষণ করা হচ্ছে।',
          te: 'మీ లక్షణాలు విశ్లేషించబడుతున్నాయి.',
          ta: 'உங்கள் அறிகுறிகள் ஆய்வு செய்யப்படுகின்றன.',
          kn: 'ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'તમારા લક્ષણોનું વિશ્લેષણ કરવામાં આવી રહ્યું છે.',
          pa: 'ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിശകലനം ചെയ്യുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 10. ASK GEMINI AI CLINICAL ASSISTANT
    // =========================================================================
    if (text.startsWith('ask ai') || text.startsWith('ask gemini') || text.startsWith('what is') || text.startsWith('tell me about') || text.includes('ai doctor')) {
      const cleanPrompt = rawText.replace(/^(ask ai|ask gemini)\s+/i, '').trim();
      const action: VoiceCommandAction = {
        type: 'ASK_GEMINI_AI',
        payload: cleanPrompt,
        label: `Consult Gemini AI: ${cleanPrompt}`,
        feedbackText: {
          en: 'Opening Gemini Clinical AI Assistant with your question.',
          hi: 'जेमिनी क्लिनिकल एआई सहायक से आपका प्रश्न पूछा जा रहा है।',
          or: 'ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପାଇଁ Gemini AI ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ ଖୋଲାଯାଉଛି।',
          mr: 'जेमिनी एआय सहाय्यकाकडे तुमचा प्रश्न पाठवला जात आहे.',
          bn: 'জেমিনি এআই সহকারীর কাছে আপনার প্রশ্ন পাঠানো হচ্ছে।',
          te: 'జెమినీ AI మీ ప్రశ్నకు సమాధానం ఇస్తోంది.',
          ta: 'ஜெமினி AI உங்கள் கேள்விக்கு பதிலளிக்கிறது.',
          kn: 'ಜೆಮಿನಿ AI ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸುತ್ತಿದೆ.',
          gu: 'જેમિની AI તમારા પ્રશ્નનો જવાબ આપી રહ્યું છે.',
          pa: 'ਜੇਮਿਨੀ AI ਤੁਹਾਡੇ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦੇ ਰਿਹਾ ਹੈ।',
          ml: 'ജെമിനി AI നിങ്ങളുടെ ചോദ്യത്തിന് മറുപടി നൽകുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 11. PATIENT CARE PORTAL: NAVIGATION & ALL 21 VIEWS
    // =========================================================================
    // 11.1 HOME & OVERVIEW
    if (has('home', 'dashboard', 'overview', 'main page', 'ମୁଖ୍ୟ ପୃଷ୍ଠା', 'होम', 'डैशबोर्ड', 'मुख्य पृष्ठ')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'HOME',
        label: 'Home Dashboard',
        feedbackText: {
          en: 'Navigating to Home Dashboard.',
          hi: 'मुख्य डैशबोर्ड पर जाया जा रहा है।',
          or: 'ମୁଖ୍ୟ ଡ୍ୟାସବୋର୍ଡକୁ ଯାଉଛି।',
          mr: 'मुख्य डॅशबोर्डवर जात आहे.',
          bn: 'মূল ড্যাশবোর্ডে যাওয়া হচ্ছে।',
          te: 'హోమ్ డ్యాష్‌బోర్డ్‌కి నావిగేట్ చేస్తోంది.',
          ta: 'முகப்பு டாஷ்போர்டுக்கு செல்கிறது.',
          kn: 'ಮುಖಪುಟ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಲಾಗುತ್ತಿದೆ.',
          gu: 'હોમ ડેશબોર્ડ પર જઈ રહ્યા છીએ.',
          pa: 'ਹੋਮ ਡੈਸ਼ਬੋਰਡ ਤੇ ਜਾ ਰਹੇ ਹਾਂ।',
          ml: 'ഹോം ഡാഷ്‌ബോർഡിലേക്ക് പോകുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.2 MY PROFILE
    if (has('profile', 'my details', 'account', 'ପ୍ରୋଫାଇଲ୍', 'मेरी प्रोफाइल', 'माझे प्रोफाईल')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'PROFILE',
        label: 'Patient Profile & Biometrics',
        feedbackText: {
          en: 'Opening your patient profile and security settings.',
          hi: 'आपकी प्रोफाइल और सुरक्षा सेटिंग्स खोली जा रही हैं।',
          or: 'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ଏବଂ ସୁରକ୍ଷା ସେଟିଂ ଖୋଲାଯାଉଛି।',
          mr: 'तुमचे प्रोफाइल उघडले जात आहे.',
          bn: 'প্রোফাইল খোলা হচ্ছে।',
          te: 'ప్రొఫైల్ తెరవబడుతోంది.',
          ta: 'சுயவிவரம் திறக்கப்படுகிறது.',
          kn: 'ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'પ્રોફાઇલ ખુલી રહી છે.',
          pa: 'ਪ੍ਰੋਫਾਈਲ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'പ്രൊഫൈൽ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.3 AI INTAKE & SYMPTOM CHECK
    if (has('intake', 'symptom', 'symptom check', 'ai check', 'triage', 'ଲକ୍ଷଣ', 'ଜାଞ୍ଚ', 'लक्षण जांच', 'तपासणी')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'AI_INTAKE',
        label: 'AI Health Intake & Triage',
        feedbackText: {
          en: 'Opening AI Health Intake and Clinical Triage.',
          hi: 'एआई स्वास्थ्य लक्षण जांच खोली जा रही है।',
          or: 'AI ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶ ଏବଂ ଲକ୍ଷଣ ଯାଞ୍ଚ ଖୋଲାଯାଉଛି।',
          mr: 'एआय लक्षण तपासणी कक्ष उघडला जात आहे.',
          bn: 'এআই স্বাস্থ্য লক্ষণ পরীক্ষা খোলা হচ্ছে।',
          te: 'AI ఆరోగ్య తనిఖీ తెరవబడుతోంది.',
          ta: 'AI சுகாதார பரிசோதனை திறக்கப்படுகிறது.',
          kn: 'AI ಆರೋಗ್ಯ ತಪಾಸಣೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'AI લક્ષણ તપાસ ખુલી રહ્યું છે.',
          pa: 'AI ਲੱਛਣ ਜਾਂਚ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'AI ആരോഗ്യ പരിശോധന തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.4 FIND CARE & HOSPITALS / MEDROUTE
    if (has('find care', 'find doctor', 'search hospital', 'nearby clinic', 'medroute', 'ଡାକ୍ତର ଖୋଜନ୍ତୁ', 'ଅସ୍ପତାଲ', 'अस्पताल खोजें', 'डॉक्टर खोजें')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'FIND_CARE',
        label: 'Find Care & Hospital Routing',
        feedbackText: {
          en: 'Searching facilities, hospitals, and specialists nearby.',
          hi: 'निकटतम अस्पताल और डॉक्टर खोजे जा रहे हैं।',
          or: 'ନିକଟସ୍ଥ ଡାକ୍ତରଖାନା ଏବଂ ବିଶେଷଜ୍ଞ ଖୋଜାଯାଉଛି।',
          mr: 'जवळपासची रुग्णालये आणि डॉक्टर शोधत आहे.',
          bn: 'হাসপাতাল এবং ডাক্তার অনুসন্ধান করা হচ্ছে।',
          te: 'వైద్యులు మరియు ఆసుపత్రులు శోధించబడుతున్నాయి.',
          ta: 'மருத்துவர்கள் மற்றும் மருத்துவமனைகள் தேடப்படுகின்றன.',
          kn: 'ವೈದ್ಯರು ಮತ್ತು ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ.',
          gu: 'હોસ્પિટલો અને ડોકટરો શોધવામાં આવી રહ્યા છે.',
          pa: 'ਹਸਪਤਾਲਾਂ ਅਤੇ ਡਾਕਟਰਾਂ ਦੀ ਖੋਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'ഡോക്ടർമാരെയും ആശുപത്രികളെയും തിരയുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.5 BOOK APPOINTMENT
    if (has('book appointment', 'schedule visit', 'book slot', 'new appointment', 'ଅପଏଣ୍ଟମେଣ୍ଟ ବୁକିଂ', 'अपॉइंटमेंट बुक करें', 'नियोजन करा')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'BOOK_APPOINTMENT',
        label: 'Book Consultation Slot',
        feedbackText: {
          en: 'Opening doctor appointment booking.',
          hi: 'डॉक्टर अपॉइंटमेंट बुकिंग खोली जा रही है।',
          or: 'ଡାକ୍ତର ଅପଏଣ୍ଟମେଣ୍ଟ ବୁକିଂ ଖୋଲାଯାଉଛି।',
          mr: 'अपॉइंटमेंट बुकिंग उघडले जात आहे.',
          bn: 'অ্যাপয়েন্টমেন্ট বুকিং খোলা হচ্ছে।',
          te: 'అపాయింట్‌మెంట్ బుకింగ్ తెరవబడుతోంది.',
          ta: 'முன்பதிவு திறக்கப்படுகிறது.',
          kn: 'ನೇಮಕಾತಿ ಬುಕಿಂಗ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'મુલાકાત બુકિંગ ખુલી રહી છે.',
          pa: 'ਮੁਲਾਕਾਤ ਬੁਕਿੰਗ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'അപ്പോയിന്റ്മെന്റ് ബുക്കിംഗ് തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.6 MY APPOINTMENTS
    if (has('my appointments', 'my bookings', 'consultations', 'scheduled visits', 'ଅପଏଣ୍ଟମେଣ୍ଟ ତାଲିକା', 'मेरी नियुक्तियां', 'माझ्या भेटी')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'MY_APPOINTMENTS',
        label: 'My Appointments',
        feedbackText: {
          en: 'Opening your scheduled consultations.',
          hi: 'आपकी नियुक्तियों की सूची खोली जा रही है।',
          or: 'ଆପଣଙ୍କ ଅପଏଣ୍ଟମେଣ୍ଟ ତାଲିକା ଖୋଲାଯାଉଛି।',
          mr: 'तुमच्या भेटींची यादी उघडली जात आहे.',
          bn: 'আপনার অ্যাপয়েন্টমেন্ট তালিকা খোলা হচ্ছে।',
          te: 'మీ అపాయింట్‌మెంట్‌ల జాబితా తెరవబడుతోంది.',
          ta: 'உங்கள் முன்பதிவுகள் திறக்கப்படுகின்றன.',
          kn: 'ನಿಮ್ಮ ನೇಮಕಾತಿಗಳನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'તમારી મુલાકાતો ખોલવામાં આવી રહી છે.',
          pa: 'ਤੁਹਾਡੀਆਂ ਮੁਲਾਕਾਤਾਂ ਖੋਲ੍ਹੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ।',
          ml: 'നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റുകൾ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.7 QUEUE PASS / TOKEN
    if (has('token', 'queue pass', 'opd pass', 'queue number', 'ଟୋକନ', 'टोकन', 'पास', 'रांग पास')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'QUEUE_PASS',
        label: 'Digital OPD Queue Token',
        feedbackText: {
          en: 'Displaying your live Hospital OPD Queue token.',
          hi: 'आपका डिजिटल ओपीडी कतार पास दिखाया जा रहा है।',
          or: 'ଆପଣଙ୍କ ଡିଜିଟାଲ୍ OPD ଟୋକନ ପ୍ରଦର୍ଶିତ ହେଉଛି।',
          mr: 'तुमचा डिजिटल ओपीडी टोकन दाखवला जात आहे.',
          bn: 'ডিজিটাল ওপিডি টোকেন দেখানো হচ্ছে।',
          te: 'మీ డిజిటల్ ఓపీడీ టోకెన్ చూపబడుతోంది.',
          ta: 'உங்கள் டிஜிட்டல் டோக்கன் காட்டப்படுகிறது.',
          kn: 'ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಟೋಕನ್ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'તમારું ડિજિટલ ટોકન બતાવી રહ્યું છે.',
          pa: 'ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਟੋਕਨ ਦਿਖਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'നിങ്ങളുടെ ഡിജിറ്റൽ ടോക്കൺ കാണിക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.8 MEDICINES SCHEDULE
    if (has('medicine schedule', 'show medicines', 'medication schedule', 'my medicines', 'daily medicines', 'ଔଷଧ ସମୟ', 'दवा समयसूची', 'औषध वेळापत्रक')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'MEDICINES_SCHEDULE',
        label: 'Daily Medicine Schedule',
        feedbackText: {
          en: 'Opening your daily medicine schedule and dose tracking.',
          hi: 'आपकी दैनिक दवा समयसूची खोली जा रही है।',
          or: 'ଆପଣଙ୍କ ଦୈନିକ ଔଷଧ ସମୟସୂଚୀ ଖୋଲାଯାଉଛି।',
          mr: 'तुमचे औषध वेळापत्रक उघडले जात आहे.',
          bn: 'ওষুধের সময়সূচী খোলা হচ্ছে।',
          te: 'మీ మందుల షెడ్యూల్ తెరవబడుతోంది.',
          ta: 'மருந்து அட்டவணை திறக்கப்படுகிறது.',
          kn: 'ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'દવા શેડ્યૂલ ખુલી રહ્યું છે.',
          pa: 'ਦਵਾਈ ਸਮਾਂ-ਸਾਰਣੀ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'മരുന്ന് ഷെഡ്യൂൾ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.9 PRESCRIPTIONS
    if (has('prescription', 'rx', 'pills', 'doctor prescription', 'ପ୍ରେସକ୍ରିପସନ', 'पर्चे', 'प्रिस्क्रिप्शन')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'PRESCRIPTIONS',
        label: 'e-Prescriptions & Medications',
        feedbackText: {
          en: 'Opening your digital prescriptions.',
          hi: 'आपके डिजिटल पर्चे खोले जा रहे हैं।',
          or: 'ଆପଣଙ୍କ ଇ-ପ୍ରେସକ୍ରିପସନ ଖୋଲାଯାଉଛି।',
          mr: 'तुमचे ई-प्रिस्क्रिप्शन उघडले जात आहेत.',
          bn: 'প্রেসক্রিপশন খোলা হচ্ছে।',
          te: 'ప్రిస్క్రిప్షన్లు తెరవబడుతున్నాయి.',
          ta: 'மருந்துச்சீட்டுகள் திறக்கப்படுகின்றன.',
          kn: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'પ્રિસ્ક્રિપ્શન્સ ખુલી રહ્યા છે.',
          pa: 'ਨੁਸਖ਼ੇ ਖੋਲ੍ਹੇ ਜਾ ਰਹੇ ਹਨ।',
          ml: 'പ്രിസ്ക്രിപ്ഷനുകൾ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.10 LAB REPORTS
    if (has('lab report', 'blood test', 'pathology report', 'diagnostic report', 'test results', 'ଲ୍ୟାବ୍ ରିପୋର୍ଟ', 'रक्त परीक्षण', 'ल্যাব রিপোর্ট')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'LAB_REPORTS',
        label: 'Diagnostic Lab Reports',
        feedbackText: {
          en: 'Opening diagnostic test reports.',
          hi: 'आपकी लैब परीक्षण रिपोर्ट खोली जा रही हैं।',
          or: 'ଆପଣଙ୍କ ଡାଇଗ୍ନୋଷ୍ଟିକ୍ ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଖୋଲାଯାଉଛି।',
          mr: 'प्रयोगशाळा अहवाल उघडले जात आहेत.',
          bn: 'ল্যাব রিপোর্ট খোলা হচ্ছে।',
          te: 'ల్యాబ్ నివేదికలు తెరవబడుతున్నాయి.',
          ta: 'ஆய்வக அறிக்கைகள் திறக்கப்படுகின்றன.',
          kn: 'ಪ್ರಯೋಗಾಲಯ ವರದಿಗಳು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'લેબ રિપોર્ટ્સ ખુલી રહ્યા છે.',
          pa: 'ਲੈਬ ਰਿਪੋਰਟਾਂ ਖੋਲ੍ਹੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ।',
          ml: 'ലാബ് റിപ്പോർട്ടുകൾ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.11 HEALTH WALLET & DOCUMENTS
    if (has('health wallet', 'wallet', 'documents', 'records', 'medical record', 'ୱାଲେଟ', 'दस्तावेज', 'वॉलेट', 'आरोग्य दस्तऐवज')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'HEALTH_WALLET',
        label: 'Health Wallet & Documents',
        feedbackText: {
          en: 'Opening Health Wallet and verified records.',
          hi: 'हेल्थ रिकॉर्ड वॉलेट खोला जा रहा है।',
          or: 'ହେଲ୍ଥ ୱାଲେଟ ଏବଂ ନଥିପତ୍ର ଖୋଲାଯାଉଛି।',
          mr: 'आरोग्य दस्तऐवज वॉलेट उघडले जात आहे.',
          bn: 'হেল্থ ওয়ালেট খোলা হচ্ছে।',
          te: 'హెల్త్ వాలెట్ తెరవబడుతోంది.',
          ta: 'சுகாதார பணப்பை திறக்கப்படுகிறது.',
          kn: 'ಆರೋಗ್ಯ ವಾಲೆಟ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'હેલ્થ વૉલેટ ખુલી રહ્યું છે.',
          pa: 'ਸਿਹਤ ਵਾਲਿਟ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ഹെൽത്ത് വാലറ്റ് തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.12 CARE JOURNEY TIMELINE
    if (has('timeline', 'history', 'care journey', 'medical history', 'ଟାଇମଲାଇନ୍', 'इतिहास', 'टाइमलाइन', 'आरोग्य कालक्रम')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'TIMELINE',
        label: 'Medical Care Timeline',
        feedbackText: {
          en: 'Opening your care history timeline.',
          hi: 'आपकी स्वास्थ्य समयरेखा खोली जा रही है।',
          or: 'ଆପଣଙ୍କ ଚିକିତ୍ସା ଇତିହାସ ଟାଇମଲାଇନ୍ ଖୋଲାଯାଉଛି।',
          mr: 'आरोग्य इतिहास कालक्रम उघडला जात आहे.',
          bn: 'চিকিৎসার ইতিহাস টাইমলাইন খোলা হচ্ছে।',
          te: 'వైద్య చరిత్ర టైమ్‌లైన్ తెరవబడుతోంది.',
          ta: 'மருத்துவ வரலாற்று காலவரிசை திறக்கப்படுகிறது.',
          kn: 'ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ ಟೈಮ್‌ಲೈನ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'મેડિકલ હિસ્ટ્રી ટાઈમલાઈન ખુલી રહી છે.',
          pa: 'ਮੈਡੀਕਲ ਇਤਿਹਾਸ ਟਾਈਮਲਾਈਨ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'ചികിത്സാ ചരിത്ര ടൈംലൈൻ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.13 CONSENT SHARING
    if (has('consent', 'abdm consent', 'share record', 'consent sharing', 'ଅନୁମତି', 'सहमति प्रबंधन', 'संमती व्यवस्थापन')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'CONSENT_SHARING',
        label: 'Consent & ABDM Data Sharing',
        feedbackText: {
          en: 'Opening consent manager and ABDM record sharing.',
          hi: 'सहमति प्रबंधन और डेटा शेयरिंग खोला जा रहा है।',
          or: 'ସମ୍ମତି ପରିଚାଳନା ଏବଂ ତଥ୍ୟ ଆଦାନପ୍ରଦାନ ଖୋଲାଯାଉଛି।',
          mr: 'डेटा संमती व्यवस्थापन उघडले जात आहे.',
          bn: 'সম্মতি ব্যবস্থাপনা খোলা হচ্ছে।',
          te: 'సమ్మతి నిర్వహణ తెరవబడుతోంది.',
          ta: 'ஒப்புதல் மேலாண்மை திறக்கப்படுகிறது.',
          kn: 'ಸಮ್ಮತಿ ನಿರ್ವಹಣೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'સંમતિ વ્યવસ્થાપન ખુલી રહ્યું છે.',
          pa: 'ਸਹਿਮਤੀ ਪ੍ਰਬੰਧਨ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'സമ്മത മാനേജ്മെന്റ് തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.14 HEALTH QR ID / ABHA CARD
    if (has('health card', 'qr code', 'abha id', 'health id', 'qr card', 'କ୍ୟୁଆର', 'ହେଲ୍ଥ କାର୍ଡ', 'क्यूआर कोड', 'हेल्थ कार्ड')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'HEALTH_ID_QR',
        label: 'Health QR ID Card',
        feedbackText: {
          en: 'Displaying your verified Health QR ID Card.',
          hi: 'आपका डिजिटल हेल्थ क्यूआर आईडी कार्ड दिखाया जा रहा है।',
          or: 'ଆପଣଙ୍କ ଡିଜିଟାଲ୍ ସ୍ୱାସ୍ଥ୍ୟ QR ID କାର୍ଡ ପ୍ରଦର୍ଶିତ ହେଉଛି।',
          mr: 'तुमचे डिजिटल आरोग्य क्यूआर कार्ड दाखवले जात आहे.',
          bn: 'আপনার হেল্থ কিউআর কার্ড দেখানো হচ্ছে।',
          te: 'మీ హెల్త్ క్యూఆర్ కార్డ్ చూపబడుతోంది.',
          ta: 'உங்கள் சுகாதார கியூஆர் கார்டு காட்டப்படுகிறது.',
          kn: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಕ್ಯೂಆರ್ ಕಾರ್ಡ್ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'તમારું હેલ્થ ક્યૂઆર કાર્ડ બતાવી રહ્યું છે.',
          pa: 'ਤੁਹਾਡਾ ਹੈਲਥ ਕਿਊਆਰ ਕਾਰਡ ਦਿਖਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'നിങ്ങളുടെ ഹെൽത്ത് ക്യുആർ കാർഡ് കാണിക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.15 VIDEO CONSULTATION
    if (has('video consultation', 'video call', 'teleconsult', 'telemedicine', 'ଭିଡିଓ କଲ୍', 'वीडियो कॉल', 'व्हिडिओ कॉल')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'VIDEO_CONSULTATION',
        label: 'Video Consultation Room',
        feedbackText: {
          en: 'Entering teleconsultation video room.',
          hi: 'वीडियो परामर्श कक्ष में प्रवेश किया जा रहा है।',
          or: 'ଭିଡିଓ ପରାମର୍ଶ କକ୍ଷକୁ ଯାଉଛି।',
          mr: 'व्हिडिओ सल्लामसलत दालनात प्रवेश केला जात आहे.',
          bn: 'ভিডিও কনসাল্টেশন রুমে প্রবেশ করা হচ্ছে।',
          te: 'వీడియో సంప్రదింపుల గదిలోకి ప్రవేశిస్తోంది.',
          ta: 'வீடியோ ஆலோசனை அறைக்குள் நுழைகிறது.',
          kn: 'ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ ಕೊಠಡಿಯನ್ನು ಪ್ರವೇಶಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'વિડીયો કન્સલ્ટેશન રૂમમાં પ્રવેશી રહ્યા છીએ.',
          pa: 'ਵੀਡੀਓ ਕੰਸਲਟੇਸ਼ਨ ਰੂਮ ਵਿੱਚ ਦਾਖਲ ਹੋ ਰਹੇ ਹਾਂ।',
          ml: 'വീഡിയോ കൺസൾട്ടേഷൻ റൂമിലേക്ക് പ്രവേശിക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.16 DOCTOR MESSAGING
    if (has('message doctor', 'chat with doctor', 'doctor chat', 'messaging', 'ଡାକ୍ତର ଚାଟ୍', 'डॉक्टर को मैसेज', 'डॉक्टर संदेश')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'DOCTOR_MESSAGING',
        label: 'Doctor Messaging',
        feedbackText: {
          en: 'Opening doctor messaging.',
          hi: 'डॉक्टर मैसेजिंग खोली जा रही है।',
          or: 'ଡାକ୍ତର ମ୍ୟାସେଜିଂ ଖୋଲାଯାଉଛି।',
          mr: 'डॉक्टर मेसेजिंग उघडले जात आहे.',
          bn: 'ডাক্তার মেসেজিং খোলা হচ্ছে।',
          te: 'డాక్టర్ మెసేజింగ్ తెరవబడుతోంది.',
          ta: 'மருத்துவர் செய்தியிடல் திறக்கப்படுகிறது.',
          kn: 'ವೈದ್ಯರ ಸಂದೇಶ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'ડૉક્ટર મેસેજિંગ ખુલી રહ્યું છે.',
          pa: 'ਡਾਕਟਰ ਮੈਸੇਜਿੰਗ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'ഡോക്ടർ സന്ദേശമിടൽ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.17 HEALTH ANALYTICS & VITALS
    if (has('analytics', 'vitals', 'blood pressure', 'heart rate', 'health stats', 'ଚାର୍ଟ', 'वाइटल्स', 'स्वास्थ्य विश्लेषण')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'VITALS_ANALYTICS',
        label: 'Health Vitals & Analytics',
        feedbackText: {
          en: 'Opening vitals and longitudinal health analytics.',
          hi: 'स्वास्थ्य विश्लेषण और वाइटल्स ग्राफ खोले जा रहे हैं।',
          or: 'ସ୍ୱାସ୍ଥ୍ୟ ବିଶ୍ଳେଷଣ ଏବଂ ଭାଇଟାଲ୍ସ ଗ୍ରାଫ୍ ଖୋଲାଯାଉଛି।',
          mr: 'आरोग्य विश्लेषण आणि व्हायटल्स उघडले जात आहेत.',
          bn: 'স্বাস্থ্য বিশ্লেষণ খোলা হচ্ছে।',
          te: 'ఆరోగ్య విశ్లేషణ తెరవబడుతోంది.',
          ta: 'சுகாதார பகுப்பாய்வு திறக்கப்படுகிறது.',
          kn: 'ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'આરોગ્ય વિશ્લેષણ ખુલી રહ્યું છે.',
          pa: 'ਸਿਹਤ ਵਿਸ਼ਲੇਸ਼ਣ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ആരോഗ്യ വിശകലനം തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.18 FAMILY PROFILES
    if (has('family', 'family profiles', 'family members', 'ପରିବାର', 'परिवार के सदस्य', 'कुटुंब सदस्य')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'FAMILY_PROFILES',
        label: 'Family Health Profiles',
        feedbackText: {
          en: 'Opening family health profiles.',
          hi: 'परिवार के सदस्यों के प्रोफाइल खोले जा रहे हैं।',
          or: 'ପରିବାର ସଦସ୍ୟଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରୋଫାଇଲ୍ ଖୋଲାଯାଉଛି।',
          mr: 'कुटुंब सदस्यांचे प्रोफाईल उघडले जात आहेत.',
          bn: 'পারিবারিক প্রোফাইল খোলা হচ্ছে।',
          te: 'కుటుంబ ప్రొఫైల్‌లు తెరవబడుతున్నాయి.',
          ta: 'குடும்ப சுயவிவரங்கள் திறக்கப்படுகின்றன.',
          kn: 'ಕುಟುಂಬದ ಪ್ರೊಫೈಲ್‌ಗಳನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'કુટુંબ પ્રોફાઇલ્સ ખુલી રહી છે.',
          pa: 'ਪਰਿਵਾਰਕ ਪ੍ਰੋਫਾਈਲਾਂ ਖੋਲ੍ਹੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ।',
          ml: 'കുടുംബ പ്രൊഫൈലുകൾ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.19 INSURANCE & PMJAY SCHEMES
    if (has('insurance', 'pmjay', 'ayushman', 'bsky', 'health scheme', 'ବୀମା', 'बीमा', 'आयुष्मान भारत', 'आरोग्य योजना')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'INSURANCE_PMJAY',
        label: 'Ayushman Bharat & PMJAY Schemes',
        feedbackText: {
          en: 'Opening Ayushman Bharat and Government Health Schemes.',
          hi: 'आयुष्मान भारत और स्वास्थ्य योजनाएं खोली जा रही हैं।',
          or: 'ଆୟୁଷ୍ମାନ ଭାରତ ଏବଂ ସରକାରୀ ସ୍ୱାସ୍ଥ୍ୟ ଯୋଜନା ଖୋଲାଯାଉଛି।',
          mr: 'आयुष्मान भारत आणि आरोग्य योजना उघडल्या जात आहेत.',
          bn: 'স্বাস্থ্য বীমা স্কিম খোলা হচ্ছে।',
          te: 'ఆరోగ్య పథకాలు తెరవబడుతున్నాయి.',
          ta: 'சுகாதார திட்டங்கள் திறக்கப்படுகின்றன.',
          kn: 'ಆರೋಗ್ಯ ಯೋಜನೆಗಳು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'આરોગ્ય યોજનાઓ ખુલી રહી છે.',
          pa: 'ਸਿਹਤ ਯੋਜਨਾਵਾਂ ਖੋਲ੍ਹੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ।',
          ml: 'ആരോഗ്യ ഇൻഷുറൻസ് തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // 11.20 PAYMENTS & BILLING
    if (has('payment', 'billing', 'bill', 'receipt', 'invoice', 'ବିଲ୍', 'बिल', 'भुगतान', 'बिलिंग')) {
      const action: VoiceCommandAction = {
        type: 'NAVIGATE_TAB',
        payload: 'PAYMENTS_BILLING',
        label: 'Payments & Billing Receipts',
        feedbackText: {
          en: 'Opening payments and billing history.',
          hi: 'भुगतान और बिलिंग इतिहास खोला जा रहा है।',
          or: 'ପେମେଣ୍ଟ ଏବଂ ବିଲିଂ ଇତିହାସ ଖୋଲାଯାଉଛି।',
          mr: 'बिलिंग आणि पेमेंट इतिहास उघडला जात आहे.',
          bn: 'পেমেন্ট ও বিলিং খোলা হচ্ছে।',
          te: 'చెల్లింపులు తెరవబడుతున్నాయి.',
          ta: 'கட்டணங்கள் திறக்கப்படுகின்றன.',
          kn: 'ಪಾವತಿಗಳು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'બિલિંગ અને ચૂકવણી ખુલી રહી છે.',
          pa: 'ਭੁਗਤਾਨ ਅਤੇ ਬਿਲਿੰਗ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'പേയ്‌മെന്റുകൾ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 12. ROLE & PORTAL SWITCHING
    // =========================================================================
    if (has('doctor portal', 'switch to doctor', 'login as doctor', 'doctor view', 'ଡାକ୍ତର ପୋର୍ଟାଲ')) {
      const action: VoiceCommandAction = {
        type: 'SWITCH_ROLE',
        payload: 'DOCTOR' as UserRole,
        label: 'Switch to Doctor Portal',
        feedbackText: {
          en: 'Switching workspace to Doctor Clinician Portal.',
          hi: 'डॉक्टर क्लिनिकल पोर्टल खोला जा रहा है।',
          or: 'ଡାକ୍ତର ପୋର୍ଟାଲକୁ ବଦଳାଯାଉଛି।',
          mr: 'डॉक्टर पोर्टल उघडले जात आहे.',
          bn: 'ডাক্তার পোর্টালে স্যুইচ করা হচ্ছে।',
          te: 'డాక్టర్ పోర్టల్‌కి మారుతోంది.',
          ta: 'மருத்துவர் போர்ட்டலுக்கு மாறுகிறது.',
          kn: 'ವೈದ್ಯರ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'ડોક્ટર પોર્ટલ પર સ્વિચ કરી રહ્યા છીએ.',
          pa: 'ਡਾਕਟਰ ਪੋਰਟਲ ਤੇ ਸਵਿੱਚ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ഡോക്ടർ പോർട്ടലിലേക്ക് മാറുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('pharmacy', 'dispensary', 'switch to pharmacy', 'login as pharmacy', 'ଔଷଧାଳୟ')) {
      const action: VoiceCommandAction = {
        type: 'SWITCH_ROLE',
        payload: 'PHARMACY_STAFF' as UserRole,
        label: 'Switch to Pharmacy Portal',
        feedbackText: {
          en: 'Switching workspace to Pharmacy & Dispensary.',
          hi: 'फार्मेसी और दवा वितरण पोर्टल खोला जा रहा है।',
          or: 'ଔଷଧାଳୟ ଏବଂ ବିତରଣ ପୋର୍ଟାଲକୁ ବଦଳାଯାଉଛି।',
          mr: 'औषधालय पोर्टल उघडले जात आहे.',
          bn: 'ফার্মেসি পোর্টালে স্যুইচ করা হচ্ছে।',
          te: 'ఫార్మసీ పోర్టల్‌కి మారుతోంది.',
          ta: 'மருந்தக போர்ட்டலுக்கு மாறுகிறது.',
          kn: 'ಔಷಧಾಲಯ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'ફાર્મસી પોર્ટલ પર સ્વિચ કરી રહ્યા છીએ.',
          pa: 'ਫਾਰਮੇਸੀ ਪੋਰਟਲ ਤੇ ਸਵਿੱਚ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ഫാർമസി പോർട്ടലിലേക്ക് മാറുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('lab portal', 'switch to lab', 'login as lab', 'pathology portal', 'ଲ୍ୟାବ୍ ପୋର୍ଟାଲ')) {
      const action: VoiceCommandAction = {
        type: 'SWITCH_ROLE',
        payload: 'LAB_STAFF' as UserRole,
        label: 'Switch to Pathology Lab Portal',
        feedbackText: {
          en: 'Switching workspace to Diagnostic Lab Portal.',
          hi: 'पैथोलॉजी लैब पोर्टल खोला जा रहा है।',
          or: 'ଡାଇଗ୍ନୋଷ୍ଟିକ୍ ଲ୍ୟାବ୍ ପୋର୍ଟାଲକୁ ବଦଳାଯାଉଛି।',
          mr: 'लॅब पोर्टल उघडले जात आहे.',
          bn: 'ল্যাব পোর্টালে স্যুইচ করা হচ্ছে।',
          te: 'ల్యాబ్ పోర్టల్‌కి మారుతోంది.',
          ta: 'ஆய்வக போர்ட்டலுக்கு மாறுகிறது.',
          kn: 'ಪ್ರಯೋಗಾಲಯ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'લેબ પોર્ટલ પર સ્વિચ કરી રહ્યા છીએ.',
          pa: 'ਲੈਬ ਪੋਰਟਲ ਤੇ ਸਵਿੱਚ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ലാബ് പോർട്ടലിലേക്ക് മാറുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('asha', 'switch to asha', 'login as asha', 'field worker', 'ଆଶା ପୋର୍ଟାଲ')) {
      const action: VoiceCommandAction = {
        type: 'SWITCH_ROLE',
        payload: 'ASHA_WORKER' as UserRole,
        label: 'Switch to ASHA Field Portal',
        feedbackText: {
          en: 'Switching workspace to ASHA Worker Portal.',
          hi: 'आशा कार्यकर्ता पोर्टल खोला जा रहा है।',
          or: 'ଆଶା କର୍ମୀ ପୋର୍ଟାଲକୁ ବଦଳାଯାଉଛି।',
          mr: 'आशा सेविका पोर्टल उघडले जात आहे.',
          bn: 'আশা কর্মী পোর্টালে স্যুইচ করা হচ্ছে।',
          te: 'ఆశా కార్యకర్త పోర్టల్‌కి మారుతోంది.',
          ta: 'ஆஷா பணியாளர் போர்ட்டலுக்கு மாறுகிறது.',
          kn: 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'આશા કાર્યકર પોર્ટલ પર સ્વિચ કરી રહ્યા છીએ.',
          pa: 'ਆਸ਼ਾ ਵਰਕਰ ਪੋਰਟਲ ਤੇ ਸਵਿੱਚ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ആശാ വർക്കർ പോർട്ടലിലേക്ക് മാറുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('hospital admin', 'hospital portal', 'bed occupancy', 'switch to hospital', 'ଡାକ୍ତରଖାନା ପ୍ରଶାସନ')) {
      const action: VoiceCommandAction = {
        type: 'SWITCH_ROLE',
        payload: 'HOSPITAL_ADMIN' as UserRole,
        label: 'Switch to Hospital Administrator',
        feedbackText: {
          en: 'Switching workspace to Hospital Admin Portal.',
          hi: 'अस्पताल प्रशासन पोर्टल खोला जा रहा है।',
          or: 'ଡାକ୍ତରଖାନା ପ୍ରଶାସନ ପୋର୍ଟାଲକୁ ବଦଳାଯାଉଛି।',
          mr: 'रुग्णालय प्रशासन पोर्टल उघडले जात आहे.',
          bn: 'হাসপাতাল অ্যাডমিন পোর্টালে স্যুইচ করা হচ্ছে।',
          te: 'ఆసుపత్రి నిర్వాహక పోర్టల్‌కి మారుతోంది.',
          ta: 'மருத்துவமனை நிர்வாக போர்ட்டலுக்கு மாறுகிறது.',
          kn: 'ಆಸ್ಪತ್ರೆ ಆಡಳಿತ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'હોસ્પિટલ એડમિન પોર્ટલ પર સ્વિચ કરી રહ્યા છીએ.',
          pa: 'ਹਸਪਤਾਲ ਪ੍ਰਬੰਧਕ ਪੋਰਟਲ ਤੇ ਸਵਿੱਚ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ആശുപത്രി അഡ്മിൻ പോർട്ടലിലേക്ക് മാറുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('ambulance portal', 'switch to ambulance', 'login as ambulance', 'ambulance driver', 'ଆମ୍ବୁଲାନ୍ସ ପୋର୍ଟାଲ')) {
      const action: VoiceCommandAction = {
        type: 'SWITCH_ROLE',
        payload: 'AMBULANCE_OPERATOR' as UserRole,
        label: 'Switch to 108 Ambulance Unit',
        feedbackText: {
          en: 'Switching workspace to 108 Ambulance Unit.',
          hi: '108 एम्बुलेंस यूनिट पोर्टल खोला जा रहा है।',
          or: '୧୦୮ ଆମ୍ବୁଲାନ୍ସ ୟୁନିଟ୍ ପୋର୍ଟାଲକୁ ବଦଳାଯାଉଛି।',
          mr: '१०८ रुग्णवाहिका पोर्टल उघडले जात आहे.',
          bn: 'অ্যাম্বুলেন্স ইউনিট পোর্টালে স্যুইচ করা হচ্ছে।',
          te: 'అంబులెన్స్ యూనిట్ పోర్టల్‌కి మారుతోంది.',
          ta: 'ஆம்புலன்ஸ் யூனிட் போர்ட்டலுக்கு மாறுகிறது.',
          kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಘಟಕ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'એમ્બ્યુલન્સ યુનિટ પોર્ટલ પર સ્વિચ કરી રહ્યા છીએ.',
          pa: 'ਐਂਬੂਲੈਂਸ ਯੂਨਿਟ ਪੋਰਟਲ ਤੇ ਸਵਿੱਚ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ആംബുലൻസ് യൂണിറ്റ് പോർട്ടലിലേക്ക് മാറുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('patient portal', 'switch to patient', 'citizen view', 'citizen portal', 'login as patient', 'ରୋଗୀ ପୋର୍ଟାଲ')) {
      const action: VoiceCommandAction = {
        type: 'SWITCH_ROLE',
        payload: 'PATIENT' as UserRole,
        label: 'Switch to Patient Portal',
        feedbackText: {
          en: 'Switching workspace to Patient Citizen Portal.',
          hi: 'मरीज पोर्टल खोला जा रहा है।',
          or: 'ରୋଗୀ ପୋର୍ଟାଲକୁ ବଦଳାଯାଉଛି।',
          mr: 'रुग्ण पोर्टल उघडले जात आहे.',
          bn: 'রোগী পোর্টালে স্যুইচ করা হচ্ছে।',
          te: 'పేషెంట్ పోర్టల్‌కి మారుతోంది.',
          ta: 'நோயாளி போர்ட்டலுக்கு மாறுகிறது.',
          kn: 'ರೋಗಿಯ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ.',
          gu: 'દર્દી પોર્ટલ પર સ્વિચ કરી રહ્યા છીએ.',
          pa: 'ਮਰੀਜ਼ ਪੋਰਟਲ ਤੇ ਸਵਿੱਚ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'രോഗി പോർട്ടലിലേക്ക് മാറുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('command center', 'super admin', 'health authority', 'regional mission control', 'କମାଣ୍ଡ ସେଣ୍ଟର')) {
      const action: VoiceCommandAction = {
        type: 'SWITCH_ROLE',
        payload: 'SUPER_ADMIN' as UserRole,
        label: 'Switch to Regional Command Center',
        feedbackText: {
          en: 'Opening Regional Command Center.',
          hi: 'क्षेत्रीय कमांड सेंटर खोला जा रहा है।',
          or: 'ଆଞ୍ଚଳିକ କମାଣ୍ଡ ସେଣ୍ଟର ଖୋଲାଯାଉଛି।',
          mr: 'प्रादेशिक कमांड केंद्र उघडले जात आहे.',
          bn: 'কমান্ড সেন্টার খোলা হচ্ছে।',
          te: 'కమాండ్ సెంటర్ తెరవబడుతోంది.',
          ta: 'கட்டளை மையம் திறக்கப்படுகிறது.',
          kn: 'ಕಮಾಂಡ್ ಸೆಂಟರ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'કમાન્ડ સેન્ટર ખુલી રહ્યું છે.',
          pa: 'ਕਮਾਂਡ ਸੈਂਟਰ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'കമാൻഡ് സെന്റർ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 13. MULTILINGUAL LANGUAGE SWITCHING
    // =========================================================================
    if (has('odia', 'ଓଡ଼ିଆ', 'oriya', 'switch to odia', 'ଭାଷା ଓଡ଼ିଆ')) {
      const action: VoiceCommandAction = {
        type: 'SET_LANGUAGE',
        payload: 'or',
        label: 'Switch Language: Odia',
        feedbackText: {
          en: 'Switched application language to Odia.',
          hi: 'भाषा बदलकर ओड़िया कर दी गई है।',
          or: 'ଭାଷା ସଫଳତାର ସହ ଓଡ଼ିଆ କରାଗଲା।',
          mr: 'भाषा ओडिया केली आहे.',
          bn: 'ভাষা ওড়িয়া করা হয়েছে।',
          te: 'భాష ఒడియాగా మార్చబడింది.',
          ta: 'மொழி ஒடியாவுக்கு மாற்றப்பட்டது.',
          kn: 'ಭಾಷೆಯನ್ನು ಒಡಿಯಾಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
          gu: 'ભાષા ઓડિયા કરવામાં આવી છે.',
          pa: 'ਭਾਸ਼ਾ ਓਡੀਆ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।',
          ml: 'ഭാഷ ഒഡിയയിലേക്ക് മാറ്റി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('hindi', 'हिन्दी', 'हिंदी', 'switch to hindi', 'भाषा हिंदी')) {
      const action: VoiceCommandAction = {
        type: 'SET_LANGUAGE',
        payload: 'hi',
        label: 'Switch Language: Hindi',
        feedbackText: {
          en: 'Switched application language to Hindi.',
          hi: 'भाषा बदलकर हिन्दी कर दी गई है।',
          or: 'ଭାଷା ହିନ୍ଦୀକୁ ପରିବର୍ତ୍ତନ କରାଗଲା।',
          mr: 'भाषा हिंदी केली आहे.',
          bn: 'ভাষা হিন্দি করা হয়েছে।',
          te: 'భాష హిందీగా మార్చబడింది.',
          ta: 'மொழி இந்திக்கு மாற்றப்பட்டது.',
          kn: 'ಭಾಷೆಯನ್ನು ಹಿಂದಿಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
          gu: 'ભાષા હિન્દી કરવામાં આવી છે.',
          pa: 'ਭਾਸ਼ਾ ਹਿੰਦੀ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।',
          ml: 'ഭാഷ ഹിന്ദിയിലേക്ക് മാറ്റി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('english', 'अंग्रेजी', 'ଇଂରାଜୀ', 'switch to english', 'भाषा अंग्रेजी')) {
      const action: VoiceCommandAction = {
        type: 'SET_LANGUAGE',
        payload: 'en',
        label: 'Switch Language: English',
        feedbackText: {
          en: 'Switched application language to English.',
          hi: 'भाषा बदलकर अंग्रेजी कर दी गई है।',
          or: 'ଭାଷା ଇଂରାଜୀକୁ ପରିବର୍ତ୍ତନ କରାଗଲା।',
          mr: 'भाषा इंग्रजी केली आहे.',
          bn: 'ভাষা ইংরেজি করা হয়েছে।',
          te: 'భాష ఇంగ్లీషుగా మార్చబడింది.',
          ta: 'மொழி ஆங்கிலத்திற்கு மாற்றப்பட்டது.',
          kn: 'ಭಾಷೆಯನ್ನು ಇಂಗ್ಲಿಷ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
          gu: 'ભાષા અંગ્રેજી કરવામાં આવી છે.',
          pa: 'ਭਾਸ਼ਾ ਅੰਗਰੇਜ਼ੀ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।',
          ml: 'ഭാഷ ഇംഗ്ലീഷിലേക്ക് മാറ്റി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('marathi', 'मराठी', 'switch to marathi')) {
      const action: VoiceCommandAction = {
        type: 'SET_LANGUAGE',
        payload: 'mr',
        label: 'Switch Language: Marathi',
        feedbackText: {
          en: 'Switched application language to Marathi.',
          hi: 'भाषा बदलकर मराठी कर दी गई है।',
          or: 'ଭାଷା ମରାଠୀକୁ ପରିବର୍ତ୍ତନ କରାଗଲା।',
          mr: 'भाषा मराठी केली आहे.',
          bn: 'ভাষা মারাঠি করা হয়েছে।',
          te: 'భాష మరాఠీగా మార్చబడింది.',
          ta: 'மொழி மராத்திக்கு மாற்றப்பட்டது.',
          kn: 'ಭಾಷೆಯನ್ನು ಮರಾಠಿಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
          gu: 'ભાષા મરાઠી કરવામાં આવી છે.',
          pa: 'ਭਾਸ਼ਾ ਮਰਾਠੀ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।',
          ml: 'ഭാഷ മറാഠിയിലേക്ക് മാറ്റി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('bengali', 'বাংলা', 'bangla')) {
      const action: VoiceCommandAction = {
        type: 'SET_LANGUAGE',
        payload: 'bn',
        label: 'Switch Language: Bengali',
        feedbackText: {
          en: 'Switched application language to Bengali.',
          hi: 'भाषा बदलकर बांग्ला कर दी गई है।',
          or: 'ଭାଷା ବଙ୍ଗାଳୀକୁ ପରିବର୍ତ୍ତନ କରାଗଲା।',
          mr: 'भाषा बंगाली केली आहे.',
          bn: 'ভাষা বাংলা করা হয়েছে।',
          te: 'భాష బెంగాలీగా మార్చబడింది.',
          ta: 'மொழி பெங்காலிக்கு மாற்றப்பட்டது.',
          kn: 'ಭಾಷೆಯನ್ನು ಬೆಂಗಾಲಿಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
          gu: 'ભાષા બંગાળી કરવામાં આવી છે.',
          pa: 'ਭਾਸ਼ਾ ਬੰਗਾਲੀ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।',
          ml: 'ഭാഷ ബംഗാളിലേക്ക് മാറ്റി.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 14. MODAL DIALOGS & OVERLAYS
    // =========================================================================
    if (has('open gemini', 'chat ai', 'medical bot', 'ai assistant', 'जेमिनी')) {
      const action: VoiceCommandAction = {
        type: 'OPEN_MODAL',
        payload: 'GEMINI',
        label: 'Open Gemini Clinical AI Assistant',
        feedbackText: {
          en: 'Opening Gemini Clinical AI Chat.',
          hi: 'जेमिनी क्लिनिकल एआई चैट खोली जा रही है।',
          or: 'Gemini AI ସ୍ୱାସ୍ଥ୍ୟ ଚାଟ୍ ଖୋଲାଯାଉଛି।',
          mr: 'जेमिनी एआय चॅट उघडले जात आहे.',
          bn: 'জেমিনি এআই চ্যাট খোলা হচ্ছে।',
          te: 'జెమినీ AI చాట్ తెరవబడుతోంది.',
          ta: 'ஜெமினி AI அரட்டை திறக்கப்படுகிறது.',
          kn: 'ಜೆಮಿನಿ AI ಚಾಟ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'જેમિની AI ચેટ ખુલી રહી છે.',
          pa: 'ਜੇਮਿਨੀ AI ਚੈਟ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'ജെമിനി AI ചാറ്റ് തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('live voice', 'voice doctor', 'talk to doctor', 'live voice consultation', 'ଲାଇଭ୍ ଭଏସ୍')) {
      const action: VoiceCommandAction = {
        type: 'OPEN_MODAL',
        payload: 'LIVE_VOICE',
        label: 'Open Live Voice Doctor',
        feedbackText: {
          en: 'Opening Live Voice Doctor consultation session.',
          hi: 'लाइव वॉइस डॉक्टर सत्र खोला जा रहा है।',
          or: 'ଲାଇଭ୍ ଭଏସ୍ ଡାକ୍ତର ପରାମର୍ଶ ଖୋଲାଯାଉଛି।',
          mr: 'लाईव्ह व्हॉईस डॉक्टर सत्र उघडले जात आहे.',
          bn: 'লাইভ ভয়েস ডাক্তার সেশন খোলা হচ্ছে।',
          te: 'లైవ్ వాయిస్ డాక్టర్ సెషన్ తెరవబడుతోంది.',
          ta: 'நேரடி குரல் மருத்துவர் அமர்வு திறக்கப்படுகிறது.',
          kn: 'ಲೈವ್ ಧ್ವನಿ ವೈದ್ಯರ ಅಧಿವೇಶನ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'લાઇવ વોઇસ ડોક્ટર સત્ર ખુલી રહ્યું છે.',
          pa: 'ਲਾਈਵ ਵੌਇਸ ਡਾਕਟਰ ਸੈਸ਼ਨ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'തത്സമയ വോയ്‌സ് ഡോക്ടർ സെഷൻ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('system health', 'system test', 'health diagnostic', 'run self test', 'ଡାଇଗ୍ନୋଷ୍ଟିକ୍ ଟେଷ୍ଟ')) {
      const action: VoiceCommandAction = {
        type: 'OPEN_MODAL',
        payload: 'SYSTEM_TEST',
        label: 'Run 20-Point System Diagnostics',
        feedbackText: {
          en: 'Running 20-step automated system health diagnostics.',
          hi: '20-चरणीय स्वचालित सिस्टम स्वास्थ्य जांच शुरू की जा रही है।',
          or: '୨୦-ପଏଣ୍ଟ ସିଷ୍ଟମ୍ ସ୍ୱାସ୍ଥ୍ୟ ନିଦାନ ଆରମ୍ଭ କରାଗଲା।',
          mr: '२०-टप्प्यांची प्रणाली तपासणी सुरू केली आहे.',
          bn: 'সিস্টেম স্বাস্থ্য পরীক্ষা শুরু হয়েছে।',
          te: 'సిస్టమ్ ఆరోగ్య తనిఖీ ప్రారంభించబడింది.',
          ta: 'கணினி சுகாதார சோதனை தொடங்கப்பட்டது.',
          kn: 'ಸಿಸ್ಟಮ್ ತಪಾಸಣೆ ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ.',
          gu: 'સિસ્ટમ સ્વાસ્થ્ય તપાસ શરૂ થઈ.',
          pa: 'ਸਿਸਟਮ ਜਾਂਚ ਸ਼ੁਰੂ ਕੀਤੀ ਗਈ।',
          ml: 'സിസ്റ്റം പരിശോധന ആരംഭിച്ചു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('tour', 'walkthrough', 'interactive guide', 'help tour', 'ଟୁର୍')) {
      const action: VoiceCommandAction = {
        type: 'OPEN_MODAL',
        payload: 'TOUR',
        label: 'Open Interactive Step-by-Step Tour',
        feedbackText: {
          en: 'Opening interactive demo journey guide.',
          hi: 'इंटरैक्टिव डेमो गाइड खोला जा रहा है।',
          or: 'ଇଣ୍ଟରାକ୍ଟିଭ୍ ଗାଇଡ୍ ଖୋଲାଯାଉଛି।',
          mr: 'मार्गदर्शक सुरू केला आहे.',
          bn: 'ট্যুর গাইড খোলা হচ্ছে।',
          te: 'గైడ్ తెరవబడుతోంది.',
          ta: 'வழிகாட்டி திறக்கப்படுகிறது.',
          kn: 'ಮಾರ್ಗದರ್ಶಿ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'માર્ગદર્શિકા ખુલી રહી છે.',
          pa: 'ਗਾਈਡ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'ടൂർ ഗൈഡ് തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('close', 'dismiss', 'go back', 'cancel', 'close modal', 'ବନ୍ଦ କରନ୍ତୁ', 'बंद करो', 'मागे जा')) {
      const action: VoiceCommandAction = {
        type: 'CLOSE_MODALS',
        label: 'Close Active Windows',
        feedbackText: {
          en: 'Closing active dialog.',
          hi: 'विंडो बंद की गई।',
          or: 'ଡାଏଲଗ୍ ବନ୍ଦ କରାଗଲା।',
          mr: 'दालन बंद केले.',
          bn: 'ডায়ালগ বন্ধ করা হয়েছে।',
          te: 'విండో మూసివేయబడింది.',
          ta: 'சாளரம் மூடப்பட்டது.',
          kn: 'ವಿಂಡೋ ಮುಚ್ಚಲಾಗಿದೆ.',
          gu: 'વિન્ડો બંધ કરી.',
          pa: 'ਵਿੰਡੋ ਬੰਦ ਕੀਤੀ ਗਈ।',
          ml: 'വിൻഡോ അടച്ചു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    // =========================================================================
    // 15. AUTHENTICATION & LOGIN
    // =========================================================================
    if (has('log out', 'sign out', 'logout', 'ଲଗ୍ ଆଉଟ୍', 'लॉग आउट', 'लॉग आउट करा')) {
      const action: VoiceCommandAction = {
        type: 'AUTH_ACTION',
        payload: 'LOGOUT',
        label: 'Log Out',
        feedbackText: {
          en: 'Logging out from current session.',
          hi: 'सत्र से लॉग आउट किया जा रहा है।',
          or: 'ବର୍ତ୍ତମାନର ସେସନରୁ ଲଗ୍ ଆଉଟ୍ କରାଯାଉଛି।',
          mr: 'सत्रातून लॉग आउट केले जात आहे.',
          bn: 'লগ আউট করা হচ্ছে।',
          te: 'లాగ్ అవుట్ అవుతోంది.',
          ta: 'வெளியேறுகிறது.',
          kn: 'ಲಾಗ್ ಔಟ್ ಆಗಲಾಗುತ್ತಿದೆ.',
          gu: 'લૉગ આઉટ થઈ રહ્યા છીએ.',
          pa: 'ਲਾਗ ਆਉਟ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
          ml: 'ലോഗ് ഔട്ട് ചെയ്യുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    if (has('sign in', 'login', 'get started', 'choose role', 'ପ୍ରବେଶ କରନ୍ତୁ', 'लॉग इन करो', 'भूमिका निवडा')) {
      const action: VoiceCommandAction = {
        type: 'AUTH_ACTION',
        payload: 'CHOOSE_ROLE',
        label: 'Open Login & Role Selection',
        feedbackText: {
          en: 'Opening workspace role selection.',
          hi: 'भूमिका चयन पृष्ठ खोला जा रहा है।',
          or: 'ଭୂମିକା ଚୟନ ପୃଷ୍ଠା ଖୋଲାଯାଉଛି।',
          mr: 'भूमिका निवड पृष्ठ उघडले जात आहे.',
          bn: 'রোল নির্বাচন খোলা হচ্ছে।',
          te: 'పాత్ర ఎంపిక తెరవబడుతోంది.',
          ta: 'பங்கு தேர்வு திறக்கப்படுகிறது.',
          kn: 'ಪಾತ್ರ ಆಯ್ಕೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          gu: 'ભૂમિકા પસંદગી ખુલી રહી છે.',
          pa: 'ਰੋਲ ਚੋਣ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
          ml: 'റോൾ തിരഞ്ഞെടുക്കൽ തുറക്കുന്നു.'
        }
      };
      this.dispatchAction(action);
      return action;
    }

    return null;
  }
}

export const voiceCommandService = new VoiceCommandService();
