import { StructuredIntent } from './types';

export class HealthIntentParser {
  /**
   * Parse speech transcript into a structured intent with confidence scoring.
   * Understands natural phrasing variations across English and Indian regional terms.
   */
  public static parse(rawTranscript: string): StructuredIntent {
    const text = rawTranscript.toLowerCase().trim();

    if (!text) {
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        rawTranscript
      };
    }

    const has = (...phrases: string[]) => phrases.some(p => text.includes(p));

    // =========================================================================
    // 1. EMERGENCY VOICE CONTROL (Highest priority)
    // =========================================================================
    if (
      has(
        'emergency',
        '108',
        'sos',
        'call ambulance',
        'send ambulance',
        'heart attack',
        'severe chest pain',
        'cannot breathe',
        'unconscious',
        'emergency hospital',
        'ଆମ୍ବୁଲାନ୍ସ',
        'ଜରୁରୀ',
        'ଏମରଜେନ୍ସି',
        'आपातकाल',
        'एम्बुलेंस'
      )
    ) {
      return {
        intent: 'EMERGENCY_HELP',
        actionSubtype: has('dispatch', 'send', 'call') ? 'DISPATCH' : 'OPEN_SOS',
        confidence: 0.98,
        rawTranscript
      };
    }

    // =========================================================================
    // 2. HELP & "WHAT CAN I SAY?"
    // =========================================================================
    if (has('what can i say', 'help', 'voice help', 'show commands', 'voice commands', 'কী বলতে পারি', 'काय बोलू शकतो', 'ସାହାଯ୍ୟ', 'मदद')) {
      return {
        intent: 'VOICE_HELP',
        confidence: 0.99,
        rawTranscript
      };
    }

    // =========================================================================
    // 3. VOICE SPEECH CONTROLS (Stop, slower, faster)
    // =========================================================================
    if (has('stop speaking', 'stop talking', 'be quiet', 'shut up', 'pause speaking', 'stop reading', 'ମୌନ', 'चुप रहो', 'शांत')) {
      return {
        intent: 'VOICE_CONTROL',
        actionSubtype: 'STOP_SPEAKING',
        confidence: 0.99,
        rawTranscript
      };
    }

    if (has('speak slower', 'talk slower', 'slow down voice', 'ଧୀରେ କୁହନ୍ତୁ', 'धीरे बोलो')) {
      return {
        intent: 'VOICE_CONTROL',
        actionSubtype: 'SLOWER',
        confidence: 0.95,
        rawTranscript
      };
    }

    if (has('speak faster', 'talk faster', 'speed up voice', 'ଜଲ୍ଦି କୁହନ୍ତୁ', 'तेज बोलो')) {
      return {
        intent: 'VOICE_CONTROL',
        actionSubtype: 'FASTER',
        confidence: 0.95,
        rawTranscript
      };
    }

    if (has('read this page', 'read page', 'read screen', 'ପୃଷ୍ଠା ପଢ଼ନ୍ତୁ', 'पेज पढ़ो')) {
      return {
        intent: 'PAGE_CONTROL',
        actionSubtype: 'READ_PAGE',
        confidence: 0.95,
        rawTranscript
      };
    }

    // =========================================================================
    // 4. LANGUAGE SWITCHING
    // =========================================================================
    if (has('change language to hindi', 'switch to hindi', 'in hindi', 'भाषा हिंदी', 'हिन्दी')) {
      return {
        intent: 'VOICE_CONTROL',
        actionSubtype: 'SET_LANGUAGE',
        parameters: { language: 'hi' },
        confidence: 0.96,
        rawTranscript
      };
    }
    if (has('change language to odia', 'switch to odia', 'in odia', 'ଭାଷା ଓଡ଼ିଆ', 'ଓଡ଼ିଆ')) {
      return {
        intent: 'VOICE_CONTROL',
        actionSubtype: 'SET_LANGUAGE',
        parameters: { language: 'or' },
        confidence: 0.96,
        rawTranscript
      };
    }
    if (has('change language to english', 'switch to english', 'in english', 'अंग्रेजी', 'ଇଂରାଜୀ')) {
      return {
        intent: 'VOICE_CONTROL',
        actionSubtype: 'SET_LANGUAGE',
        parameters: { language: 'en' },
        confidence: 0.96,
        rawTranscript
      };
    }

    // =========================================================================
    // 5. DOCTOR SEARCH WITH SPECIALTIES & FILTERS
    // =========================================================================
    const specialtyMap: Record<string, string> = {
      cardiolog: 'Cardiology',
      heart: 'Cardiology',
      dermatolog: 'Dermatology',
      skin: 'Dermatology',
      pediatric: 'Pediatrics',
      child: 'Pediatrics',
      pulmonolog: 'Pulmonology',
      lung: 'Pulmonology',
      chest: 'Pulmonology',
      orthopedic: 'Orthopedics',
      bone: 'Orthopedics',
      gynecolog: 'Obstetrics & Gynecology',
      obstetric: 'Obstetrics & Gynecology',
      women: 'Obstetrics & Gynecology',
      general: 'General Medicine',
      physician: 'General Medicine'
    };

    const isDoctorSearch = has(
      'doctor', 'specialist', 'cardiologist', 'dermatologist', 'pediatrician',
      'pulmonologist', 'orthopedic', 'gynecologist', 'physician',
      'ଡାକ୍ତର', 'डॉक्टर'
    ) && has('find', 'search', 'show', 'look for', 'near me', 'available', 'खोजें', 'ଦେଖାନ୍ତୁ');

    if (isDoctorSearch || text.startsWith('find a ') || text.startsWith('show ')) {
      let matchedSpecialty: string | undefined = undefined;
      for (const [key, val] of Object.entries(specialtyMap)) {
        if (text.includes(key)) {
          matchedSpecialty = val;
          break;
        }
      }

      if (matchedSpecialty || has('doctor', 'physician', 'specialist')) {
        return {
          intent: 'SEARCH_DOCTOR',
          specialty: matchedSpecialty || 'ALL',
          location: has('near me', 'nearby', 'local') ? 'current' : undefined,
          actionSubtype: has('female') ? 'FEMALE_ONLY' : has('today', 'available') ? 'AVAILABLE_TODAY' : undefined,
          confidence: 0.94,
          rawTranscript
        };
      }
    }

    // =========================================================================
    // 6. HEALTHCARE FACILITIES (Hospitals, Clinics, Labs, Pharmacies)
    // =========================================================================
    if (
      has('hospital', 'clinic', 'diagnostic center', 'pharmacy', 'laborator', 'health center', 'medical center', 'ଡାକ୍ତରଖାନା', 'ଅସ୍ପତାଲ', 'अस्पताल') &&
      has('find', 'show', 'nearby', 'search', 'emergency hospital', 'near me')
    ) {
      let facilityType = 'hospital';
      if (has('clinic')) facilityType = 'clinic';
      if (has('lab', 'diagnostic')) facilityType = 'lab';
      if (has('pharmac')) facilityType = 'pharmacy';

      return {
        intent: 'SEARCH_FACILITY',
        facilityType,
        location: 'current',
        confidence: 0.95,
        rawTranscript
      };
    }

    // =========================================================================
    // 7. APPOINTMENTS (Show, Book, Cancel, Next)
    // =========================================================================
    if (has('appointment', 'booking', 'consultation visit', 'ଅପଏଣ୍ଟମେଣ୍ଟ', 'अपॉइंटमेंट')) {
      // Cancellation requires confirmation!
      if (has('cancel', 'delete', 'drop', 'रद्द')) {
        return {
          intent: 'APPOINTMENT_ACTION',
          actionSubtype: 'CANCEL',
          requiresConfirmation: true,
          confirmationPrompt: 'I found your scheduled appointment. Would you like me to cancel it?',
          confidence: 0.96,
          rawTranscript
        };
      }

      if (has('book', 'schedule', 'new appointment', 'reserve')) {
        return {
          intent: 'NAVIGATE',
          target: 'BOOK_APPOINTMENT',
          confidence: 0.95,
          rawTranscript
        };
      }

      if (has('next', 'when is', 'upcoming')) {
        return {
          intent: 'APPOINTMENT_ACTION',
          actionSubtype: 'NEXT_APPOINTMENT',
          confidence: 0.93,
          rawTranscript
        };
      }

      // Default appointments view
      return {
        intent: 'NAVIGATE',
        target: 'MY_APPOINTMENTS',
        confidence: 0.96,
        rawTranscript
      };
    }

    // =========================================================================
    // 8. HEALTH REPORTS & LAB RESULTS (Read / Summarize / Open)
    // =========================================================================
    if (has('report', 'lab result', 'blood test', 'pathology', 'test report', 'ରିପୋର୍ଟ', 'रिपोर्ट')) {
      if (has('read', 'summarize', 'explain', 'what does', 'tell me', 'important', 'ପଢ଼ନ୍ତୁ', 'समझाओ', 'पढ़ो')) {
        return {
          intent: 'READ_REPORT',
          actionSubtype: has('important', 'simple') ? 'SIMPLIFIED' : 'FULL',
          confidence: 0.93,
          rawTranscript
        };
      }
      return {
        intent: 'NAVIGATE',
        target: 'LAB_REPORTS',
        confidence: 0.95,
        rawTranscript
      };
    }

    // =========================================================================
    // 9. HEALTH RECORDS & WALLET
    // =========================================================================
    if (has('health record', 'medical history', 'medical record', 'health wallet', 'my records', 'ସୁରକ୍ଷିତ ରେକର୍ଡ', 'हेल्थ रिकॉर्ड', 'इतिहास')) {
      return {
        intent: 'NAVIGATE',
        target: 'HEALTH_WALLET',
        confidence: 0.95,
        rawTranscript
      };
    }

    // =========================================================================
    // 10. MEDICINE SECTION
    // =========================================================================
    if (has('medicine', 'medication', 'pill', 'paracetamol', 'tablet', 'prescription', 'ଔଷଧ', 'दवा')) {
      if (has('take', 'took', 'taken', 'mark taken')) {
        return {
          intent: 'MEDICINE_ACTION',
          actionSubtype: 'TAKE_DOSE',
          confidence: 0.96,
          rawTranscript
        };
      }

      if (has('read', 'list', 'explain medicine')) {
        return {
          intent: 'MEDICINE_ACTION',
          actionSubtype: 'READ_LIST',
          confidence: 0.92,
          rawTranscript
        };
      }

      // Paracetamol / drug search
      if (has('paracetamol', 'search', 'find')) {
        return {
          intent: 'NAVIGATE',
          target: 'MEDICINES_SCHEDULE',
          parameters: { searchQuery: has('paracetamol') ? 'Paracetamol' : '' },
          confidence: 0.93,
          rawTranscript
        };
      }

      return {
        intent: 'NAVIGATE',
        target: 'MEDICINES_SCHEDULE',
        confidence: 0.95,
        rawTranscript
      };
    }

    // =========================================================================
    // 11. SYMPTOM NAVIGATION & TRIAGE
    // =========================================================================
    const commonSymptoms = [
      'headache', 'fever', 'cough', 'cold', 'stomach ache', 'vomiting', 'pain',
      'dizziness', 'sore throat', 'rash', 'fatigue', 'diarrhea', 'nausea',
      'ମୁଣ୍ଡବିନ୍ଧା', 'ଜ୍ୱର', 'କାଶ', 'ପେଟ ବିନ୍ଧା', 'सिरदर्द', 'बुखार', 'खांसी', 'पेट दर्द'
    ];
    if (commonSymptoms.some(s => text.includes(s)) || has('symptom', 'not feeling well', 'i have', 'i feel', 'suffering from', 'lately')) {
      return {
        intent: 'SYMPTOM_ASSESSMENT',
        query: rawTranscript,
        confidence: 0.94,
        rawTranscript
      };
    }

    // =========================================================================
    // 12. GENERAL HEALTH AI ASSISTANT ("Ask HealthAI about...")
    // =========================================================================
    if (
      text.startsWith('ask healthai') ||
      text.startsWith('ask ai') ||
      text.startsWith('tell me about') ||
      text.startsWith('what is') ||
      text.startsWith('explain') ||
      has('diabetes', 'hypertension', 'dehydration', 'blood pressure', 'cholesterol')
    ) {
      const cleanQuery = rawTranscript
        .replace(/^(ask healthai about|ask healthai|ask ai about|ask ai|tell me about|explain)\s+/i, '')
        .trim();

      return {
        intent: 'AI_QUERY',
        query: cleanQuery || rawTranscript,
        actionSubtype: has('simple language', 'simply', 'in simple terms') ? 'SIMPLE' : has('summarize') ? 'SUMMARIZE' : 'GENERAL',
        confidence: 0.92,
        rawTranscript
      };
    }

    // =========================================================================
    // 13. UNIVERSAL VOICE NAVIGATION (Open / Show / Take me to ...)
    // =========================================================================
    if (has('open home', 'open dashboard', 'show home', 'take me home', 'dashboard', 'home', 'ମୁଖ୍ୟ ପୃଷ୍ଠା', 'होम')) {
      return { intent: 'NAVIGATE', target: 'HOME', confidence: 0.97, rawTranscript };
    }
    if (has('profile', 'my details', 'account', 'ମୋ ପ୍ରୋଫାଇଲ୍', 'मेरी प्रोफाइल')) {
      return { intent: 'NAVIGATE', target: 'PROFILE', confidence: 0.97, rawTranscript };
    }
    if (has('queue', 'token', 'opd pass', 'ଟୋକନ', 'टोकन')) {
      return { intent: 'NAVIGATE', target: 'QUEUE_PASS', confidence: 0.96, rawTranscript };
    }
    if (has('health card', 'qr code', 'abha', 'health id', 'କ୍ୟୁଆର', 'हेल्थ कार्ड')) {
      return { intent: 'NAVIGATE', target: 'HEALTH_ID_QR', confidence: 0.96, rawTranscript };
    }
    if (has('video consultation', 'video call', 'teleconsult', 'ଭିଡିଓ କଲ୍', 'वीडियो कॉल')) {
      return { intent: 'NAVIGATE', target: 'VIDEO_CONSULTATION', confidence: 0.96, rawTranscript };
    }
    if (has('doctor chat', 'message doctor', 'messaging', 'ଡାକ୍ତର ଚାଟ୍', 'मैसेजिंग')) {
      return { intent: 'NAVIGATE', target: 'DOCTOR_MESSAGING', confidence: 0.96, rawTranscript };
    }
    if (has('vitals', 'analytics', 'health stats', 'blood pressure chart', 'ଚାର୍ଟ', 'वाइटल्स')) {
      return { intent: 'NAVIGATE', target: 'VITALS_ANALYTICS', confidence: 0.95, rawTranscript };
    }
    if (has('family', 'family profile', 'ପରିବାର', 'परिवार')) {
      return { intent: 'NAVIGATE', target: 'FAMILY_PROFILES', confidence: 0.95, rawTranscript };
    }
    if (has('insurance', 'pmjay', 'ayushman', 'ବୀମା', 'बीमा')) {
      return { intent: 'NAVIGATE', target: 'INSURANCE_PMJAY', confidence: 0.95, rawTranscript };
    }
    if (has('billing', 'payment', 'receipt', 'ବିଲ୍', 'बिल')) {
      return { intent: 'NAVIGATE', target: 'PAYMENTS_BILLING', confidence: 0.95, rawTranscript };
    }
    if (has('emergency section', 'emergency care')) {
      return { intent: 'NAVIGATE', target: 'EMERGENCY_SOS', confidence: 0.96, rawTranscript };
    }

    // Role portal navigations
    if (has('doctor portal', 'switch to doctor', 'login as doctor')) {
      return { intent: 'NAVIGATE', actionSubtype: 'ROLE', target: 'DOCTOR', confidence: 0.95, rawTranscript };
    }
    if (has('patient portal', 'switch to patient')) {
      return { intent: 'NAVIGATE', actionSubtype: 'ROLE', target: 'PATIENT', confidence: 0.95, rawTranscript };
    }
    if (has('pharmacy portal', 'switch to pharmacy')) {
      return { intent: 'NAVIGATE', actionSubtype: 'ROLE', target: 'PHARMACY_STAFF', confidence: 0.95, rawTranscript };
    }
    if (has('lab portal', 'switch to lab')) {
      return { intent: 'NAVIGATE', actionSubtype: 'ROLE', target: 'LAB_STAFF', confidence: 0.95, rawTranscript };
    }
    if (has('hospital portal', 'hospital admin')) {
      return { intent: 'NAVIGATE', actionSubtype: 'ROLE', target: 'HOSPITAL_ADMIN', confidence: 0.95, rawTranscript };
    }
    if (has('ambulance portal', '108 ambulance')) {
      return { intent: 'NAVIGATE', actionSubtype: 'ROLE', target: 'AMBULANCE_OPERATOR', confidence: 0.95, rawTranscript };
    }
    if (has('command center', 'super admin')) {
      return { intent: 'NAVIGATE', actionSubtype: 'ROLE', target: 'SUPER_ADMIN', confidence: 0.95, rawTranscript };
    }

    // =========================================================================
    // 14. UI CONTROLS & BROWSER INTERACTION
    // =========================================================================
    if (has('scroll down', 'page down', 'ତଳକୁ ଯାଆନ୍ତୁ', 'नीचे स्क्रॉल करो')) {
      return { intent: 'PAGE_CONTROL', actionSubtype: 'SCROLL_DOWN', confidence: 0.98, rawTranscript };
    }
    if (has('scroll up', 'page up', 'ଉପରକୁ ଯାଆନ୍ତୁ', 'ऊपर स्क्रॉल करो')) {
      return { intent: 'PAGE_CONTROL', actionSubtype: 'SCROLL_UP', confidence: 0.98, rawTranscript };
    }
    if (has('go to top', 'scroll to top', 'top of page', 'शीर्ष पर जाओ')) {
      return { intent: 'PAGE_CONTROL', actionSubtype: 'SCROLL_TOP', confidence: 0.98, rawTranscript };
    }
    if (has('go back', 'back', 'previous', 'ପଛକୁ ଯାଆନ୍ତୁ', 'वापस जाओ')) {
      return { intent: 'PAGE_CONTROL', actionSubtype: 'BACK', confidence: 0.97, rawTranscript };
    }
    if (has('go forward', 'forward', 'ଆଗକୁ ଯାଆନ୍ତୁ', 'आगे जाओ')) {
      return { intent: 'PAGE_CONTROL', actionSubtype: 'FORWARD', confidence: 0.97, rawTranscript };
    }
    if (has('close', 'close it', 'dismiss', 'close modal', 'ବନ୍ଦ କରନ୍ତୁ', 'बंद करो')) {
      return { intent: 'PAGE_CONTROL', actionSubtype: 'CLOSE_MODAL', confidence: 0.96, rawTranscript };
    }
    if (has('turn on dark mode', 'dark mode', 'dark theme', 'डार्क मोड')) {
      return { intent: 'THEME_CONTROL', actionSubtype: 'DARK', confidence: 0.96, rawTranscript };
    }
    if (has('turn on light mode', 'light mode', 'लाइट मोड')) {
      return { intent: 'THEME_CONTROL', actionSubtype: 'LIGHT', confidence: 0.96, rawTranscript };
    }

    // Contextual "click [button]" or "show the second doctor"
    if (text.startsWith('click ') || text.startsWith('press ') || text.startsWith('tap ')) {
      const targetLabel = text.replace(/^(click|press|tap)\s+/i, '').trim();
      return {
        intent: 'PAGE_CONTROL',
        actionSubtype: 'CLICK_ELEMENT',
        target: targetLabel,
        confidence: 0.94,
        rawTranscript
      };
    }

    if (has('second doctor', 'first doctor', 'third doctor', 'second appointment', 'first report')) {
      return {
        intent: 'PAGE_CONTROL',
        actionSubtype: 'SELECT_INDEX',
        query: text,
        confidence: 0.91,
        rawTranscript
      };
    }

    // =========================================================================
    // 15. AUTHENTICATION (Logout / Sign In)
    // =========================================================================
    if (has('log out', 'logout', 'sign out', 'ଲଗ୍ ଆଉଟ୍', 'लॉग आउट')) {
      return {
        intent: 'AUTH_ACTION',
        actionSubtype: 'LOGOUT',
        requiresConfirmation: true,
        confirmationPrompt: 'Do you want to log out of HealthAI?',
        confidence: 0.97,
        rawTranscript
      };
    }

    // =========================================================================
    // 16. UNKNOWN INTENT FALLBACK
    // =========================================================================
    return {
      intent: 'UNKNOWN',
      confidence: 0.35,
      rawTranscript
    };
  }
}
