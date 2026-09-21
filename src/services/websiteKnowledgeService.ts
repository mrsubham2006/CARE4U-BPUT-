/**
 * CARE4U NEXUS — Dedicated Website Intelligence & Knowledge Engine
 * Provides authoritative platform guidance, workflow instructions, role navigation,
 * and direct interactive action dispatch for the AI Chatbot Copilot.
 */

export interface WebsiteActionTag {
  type: 'NAVIGATE_TAB' | 'SWITCH_ROLE' | 'TRIGGER_SOS' | 'OPEN_TOUR' | 'OPEN_SYSTEM_TEST' | 'SET_LANGUAGE' | 'EXECUTE_VOICE';
  payload?: string;
  label: string;
}

export interface KnowledgeMatchResult {
  reply: string;
  suggestedActions: WebsiteActionTag[];
  topic: string;
}

export const CARE4U_SYSTEM_PROMPT = `
You are the **CARE4U NEXUS AI Assistant & Official Platform Navigator**.
You have complete, expert knowledge of the entire CARE4U NEXUS healthcare platform, its 8 specialized roles, its 21 patient workflows, its hands-free voice command system, ABDM integration, and emergency dispatch features.

### PLATFORM OVERVIEW:
CARE4U NEXUS is India's unified, connected digital healthcare and clinical AI coordination network built on Ayushman Bharat Digital Mission (ABDM) and FHIR standards.
Mission: "One Patient. One Connected Care Journey."

### 8 WORKSPACES & ROLES:
1. **Patient Citizen Portal**: 21 health services including AI Health Intake, MedRoute, Appointment Booking, Queue Token, Prescriptions, Medicine Reminders, Lab Reports, Health Wallet, ABDM Consent Manager, Health QR ID, Video Teleconsultation, Doctor Messaging, Emergency 108 SOS, Vitals Analytics, Family Profiles, Ayushman Bharat PMJAY schemes, and Billing.
2. **Doctor Clinician Portal**: Live OPD Queue, Clinical Consultation Workspace, Electronic Prescriptions, Pathology Lab Orders, Referrals & Follow-ups, Real-time patient alerts.
3. **ASHA Field Worker Portal**: Rural door-to-door citizen registration, Voice AI intake in local dialects, MedRoute matching, offline sync queue with central FHIR servers, and emergency ambulance dispatch.
4. **Pharmacy & Dispensary Portal**: e-Prescription dispensing queue, barcode verification, closed-loop medicine dispensing, real-time inventory tracking, and stockout safeguards.
5. **Pathology & Diagnostics Lab Portal**: Diagnostic test order pipeline (Ordered -> Sample Collected -> Processing -> Report Ready), automated test extraction, quality control.
6. **108 Ambulance Unit Portal**: Live emergency dispatch telemetry, GPS navigation, OTP patient pickup verification, en-route vitals monitoring, hospital arrival handoff.
7. **Hospital Administrator Portal**: Live hospital bed occupancy, ICU beds, oxygen telemetry, doctor duty rosters, inbound emergency ambulance tracking.
8. **Regional Command Center (Super Admin / Health Authority)**: Sub-district and regional disease outbreak surveillance heatmaps, facility resource allocation, emergency fleet coordination, audit trail logging.

### HANDS-FREE VOICE CONTROL:
The entire website can be operated hands-free via the floating Voice Command HUD at the bottom of the screen. Supports 11 Indian languages: English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), Marathi (मराठी), Bengali, Telugu, Tamil, Kannada, Gujarati, Punjabi, and Malayalam. Users can turn on "Hands-Free Mode" to keep the microphone listening continuously.

### ACTION MARKDOWN SYNTAX:
When advising the user to visit a section, include actionable buttons formatted as:
[ACTION:NAVIGATE_TAB|TAB_NAME|Button Label]
[ACTION:SWITCH_ROLE|ROLE_NAME|Button Label]
[ACTION:TRIGGER_SOS||Button Label]
[ACTION:OPEN_TOUR||Button Label]
[ACTION:OPEN_SYSTEM_TEST||Button Label]
[ACTION:SET_LANGUAGE|LANG_CODE|Button Label]

Always be polite, medically responsible, and guide users directly to where they need to go.
`;

export function getWebsiteKnowledgeAnswer(query: string, language: string = 'en'): KnowledgeMatchResult {
  const q = query.toLowerCase().trim();

  // Helper for multiple inclusions
  const has = (...terms: string[]) => terms.some(t => q.includes(t));

  // 1. APPOINTMENT BOOKING & CONSULTATIONS
  if (has('appointment', 'book doctor', 'schedule visit', 'consultation', 'book slot', 'ଅପଏଣ୍ଟମେଣ୍ଟ', 'अपॉइंटमेंट', 'डॉक्टर बुक')) {
    return {
      topic: 'Appointments',
      reply: `### How to Book an Appointment on CARE4U NEXUS:

1. **Find Care & Facilities**: Browse verified District Hospitals, Community Health Centres (CHC), and specialists near your location.
2. **Select Doctor & Slot**: Choose your preferred physician, available consultation time, and whether you prefer an **In-Person OPD visit** or an **Online Video Consultation**.
3. **Instant Confirmation**: Once booked, you receive an ABDM-linked confirmation and a digital **Queue Token Pass** with your estimated consultation time.

You can manage all your upcoming consultations in **My Appointments**.`,
      suggestedActions: [
        { type: 'NAVIGATE_TAB', payload: 'BOOK_APPOINTMENT', label: '📅 Book New Appointment' },
        { type: 'NAVIGATE_TAB', payload: 'MY_APPOINTMENTS', label: '📋 View My Appointments' },
        { type: 'NAVIGATE_TAB', payload: 'FIND_CARE', label: '🏥 Find Facilities & MedRoute' }
      ]
    };
  }

  // 2. MEDICINES, DOSES & REMINDERS
  if (has('medicine', 'prescription', 'pill', 'dose', 'pharmacy', 'take medicine', 'ଔଷଧ', 'दवा', 'औषध')) {
    return {
      topic: 'Medicines',
      reply: `### Managing Your Medicines on CARE4U NEXUS:

- **Daily Medicine Schedule**: View your personalized schedule for morning, afternoon, and night doses. You can mark doses as taken with voice commands like *"Take my medicine"*.
- **e-Prescriptions**: All electronic prescriptions issued by your doctors are safely stored with complete dosage, duration, instructions, and Jan Aushadhi generic alternatives.
- **Closed-Loop Dispensing**: When you visit a hospital dispensary, the pharmacist verifies and marks the prescription as dispensed in real time.`,
      suggestedActions: [
        { type: 'NAVIGATE_TAB', payload: 'MEDICINES_SCHEDULE', label: '💊 Daily Medicine Schedule' },
        { type: 'NAVIGATE_TAB', payload: 'PRESCRIPTIONS', label: '📄 View e-Prescriptions' },
        { type: 'SWITCH_ROLE', payload: 'PHARMACY_STAFF', label: '🏥 Switch to Pharmacy Portal' }
      ]
    };
  }

  // 3. EMERGENCY 108 SOS & AMBULANCE
  if (has('emergency', 'sos', '108', 'ambulance', 'accident', 'heart attack', 'critical', 'ଜରୁରୀ', 'ଆମ୍ବୁଲାନ୍ସ', 'आपातकाल', 'एम्बुलेंस')) {
    return {
      topic: 'Emergency SOS',
      reply: `### 🚨 108 Emergency Ambulance Protocol:

CARE4U NEXUS is integrated with the **108 National Emergency Ambulance Network**:
1. **Immediate GPS Dispatch**: Tapping the Emergency SOS button or saying *"108 Ambulance Emergency"* initiates an immediate dispatch to your live GPS coordinates.
2. **Hospital Allocation**: MedRoute automatically reserves trauma beds at the nearest ready facility (e.g. District Health Centre ACLS Trauma Unit).
3. **Live Telemetry & OTP Security**: An emergency verification OTP is provided for handoff to the certified ambulance pilot.

If this is a critical life-threatening emergency, launch SOS dispatch now:`,
      suggestedActions: [
        { type: 'TRIGGER_SOS', label: '🚨 Launch Emergency 108 SOS' },
        { type: 'SWITCH_ROLE', payload: 'AMBULANCE_OPERATOR', label: '🚑 Ambulance Operator Portal' }
      ]
    };
  }

  // 4. DOCTOR CLINICIAN PORTAL
  if (has('doctor portal', 'doctor view', 'opd queue', 'consult patient', 'doctor workspace', 'ଡାକ୍ତର', 'डॉक्टर पोर्टल')) {
    return {
      topic: 'Doctor Portal',
      reply: `### 🩺 Doctor Clinician Portal Features:

- **Live OPD Queue**: Displays checked-in patients sorted by clinical triage urgency (Red-Flag / High / Routine).
- **Consultation Workspace**: Comprehensive EHR clinical workspace with vitals recording, ICD-10 provisional diagnoses, e-prescribing with drug safety checks, and lab orders.
- **Teleconsultation Video**: Encrypted WebRTC video consultation room with live patient health records preview.
- **Voice Control**: Doctors can say *"Call next patient"* to automatically load the next queued patient into the consultation room!`,
      suggestedActions: [
        { type: 'SWITCH_ROLE', payload: 'DOCTOR', label: '🩺 Switch to Doctor Portal' },
        { type: 'NAVIGATE_TAB', payload: 'MY_APPOINTMENTS', label: '📋 Patient Consultations' }
      ]
    };
  }

  // 5. ASHA FIELD WORKER PORTAL & RURAL HEALTHCARE
  if (has('asha', 'village', 'field worker', 'rural', 'offline sync', 'citizen register', 'ଆଶା', 'आशा')) {
    return {
      topic: 'ASHA Portal',
      reply: `### 🌾 ASHA Field Worker Portal:

The ASHA Portal is specifically designed for frontline healthcare workers in rural villages and tribal blocks:
- **Rural Citizen Registration**: Enroll citizens who lack digital devices and automatically issue an ABDM Health ID.
- **Voice AI Dialect Intake**: Record patient symptoms in regional dialects (Odia, Hindi, Marathi, etc.) with automatic AI clinical triage.
- **Offline Mode & Sync**: Works completely without internet connection in remote areas. Queued health records automatically sync with central FHIR servers upon reconnection.`,
      suggestedActions: [
        { type: 'SWITCH_ROLE', payload: 'ASHA_WORKER', label: '🌾 Switch to ASHA Portal' },
        { type: 'NAVIGATE_TAB', payload: 'AI_INTAKE', label: '✨ AI Health Intake' }
      ]
    };
  }

  // 6. HEALTH QR ID CARD & ABHA
  if (has('qr', 'health id', 'abha', 'health card', 'identity', 'card', 'କ୍ୟୁଆର', 'हेल्थ कार्ड', 'क्यूआर')) {
    return {
      topic: 'Health QR ID',
      reply: `### 🪪 Verified Digital Health QR ID Card:

Your CARE4U Health ID is interoperable with India's **Ayushman Bharat Digital Mission (ABDM)**:
- **Zero-Wait Hospital Check-in**: Scan your secure QR code at any hospital registration desk or kiosk to generate a digital OPD token pass without paper forms.
- **Emergency Vital Strip**: Contains your emergency contact, blood group, chronic conditions, and recorded drug allergies.
- **Downloadable Offline Pass**: You can view and download your verified health card anytime.`,
      suggestedActions: [
        { type: 'NAVIGATE_TAB', payload: 'HEALTH_ID_QR', label: '🪪 View Health QR ID Card' },
        { type: 'NAVIGATE_TAB', payload: 'QUEUE_PASS', label: '🎫 Digital Queue Token' },
        { type: 'NAVIGATE_TAB', payload: 'CONSENT_SHARING', label: '🔒 ABDM Consent Manager' }
      ]
    };
  }

  // 7. LAB REPORTS & DIAGNOSTICS
  if (has('lab', 'report', 'blood test', 'pathology', 'test result', 'diagnostic', 'ରିପୋର୍ଟ', 'रिपोर्ट', 'ल্যাব')) {
    return {
      topic: 'Lab Reports',
      reply: `### 🔬 Pathology & Diagnostic Reports:

- **Live Pipeline Tracking**: Monitor ordered lab tests as they advance from *Sample Collected* to *Processing* to *Report Ready*.
- **AI Diagnostic Summary**: Complex biomarker results (CBC, Lipid Profile, Liver Function, Blood Glucose) are automatically explained in plain language with normal reference ranges highlighted.
- **Downloadable PDF Reports**: Full verified pathology documentation is accessible directly in your Health Wallet.`,
      suggestedActions: [
        { type: 'NAVIGATE_TAB', payload: 'LAB_REPORTS', label: '🔬 View Diagnostic Lab Reports' },
        { type: 'SWITCH_ROLE', payload: 'LAB_STAFF', label: '🧪 Switch to Lab Staff Portal' }
      ]
    };
  }

  // 8. VOICE COMMANDS & HANDS-FREE AUTOMATION
  if (has('voice', 'command', 'hands free', 'speak', 'talk', 'mic', 'odia', 'hindi', 'english', 'ଭଏସ୍', 'आवाज', 'ध्वनी')) {
    return {
      topic: 'Voice Commands',
      reply: `### 🎙️ Universal Voice Command & Hands-Free Automation:

CARE4U NEXUS features a full ambient voice engine allowing complete hands-free navigation and task execution:
- **Continuous Hands-Free Mode**: Tap the **HANDS-FREE** button on the bottom floating HUD to keep the mic listening continuously.
- **Multilingual Recognition**: Works natively in 11 Indian languages: English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), Marathi (मराठी), Bengali, Telugu, Tamil, Kannada, Gujarati, Punjabi, and Malayalam.
- **Commands You Can Speak**:
  - *"Take my medicine"* — marks your scheduled dose as taken.
  - *"Call 108 ambulance"* — launches emergency SOS dispatch.
  - *"Switch to Doctor portal"* — switches workspace instantly.
  - *"Open appointment booking"* — opens booking.
  - *"Show my QR health card"* — displays verified QR card.
  - *"Scroll down"* / *"Scroll to top"* — navigates the page hands-free.`,
      suggestedActions: [
        { type: 'OPEN_TOUR', label: '🚀 Launch Interactive Tour Guide' },
        { type: 'SET_LANGUAGE', payload: 'or', label: '🌐 Switch to Odia (ଓଡ଼ିଆ)' },
        { type: 'SET_LANGUAGE', payload: 'hi', label: '🌐 Switch to Hindi (हिन्दी)' },
        { type: 'SET_LANGUAGE', payload: 'en', label: '🌐 Switch to English' }
      ]
    };
  }

  // 9. SYSTEM HEALTH & DIAGNOSTICS (/system/health)
  if (has('system health', 'diagnostic', 'self test', 'test report', 'health check', '20 point', '20 checks')) {
    return {
      topic: 'System Health Diagnostics',
      reply: `### 🛡️ Automated 20-Point System Health Diagnostics:

CARE4U NEXUS includes an automated internal verification suite covering all 20 healthcare pillars:
- Authentication, ABDM Consent Tokens, Live GPS Tracking, Gemini AI Models, Web Speech Voice Recognition, Biometric Vault, Offline Queue, FHIR Interoperability, and Pharmacy Inventory.
- You can trigger the live diagnostic run anytime.`,
      suggestedActions: [
        { type: 'OPEN_SYSTEM_TEST', label: '🛡️ Run 20-Point System Self-Test' },
        { type: 'OPEN_TOUR', label: '🚀 Guided Journey Tour' }
      ]
    };
  }

  // 10. ALL ROLES OVERVIEW & ROLE SWITCHING
  if (has('role', 'portal', 'roles', 'switch', 'login as', 'who can use', 'workspaces')) {
    return {
      topic: 'Role Navigation',
      reply: `### 👥 8 Specialized Portals in CARE4U NEXUS:

You can switch between any of the 8 workspaces to test or manage connected care journeys:
1. **Patient**: Personal care journey, appointments, medicines, emergency SOS.
2. **Doctor**: OPD queue, electronic health records, consultation workspace.
3. **ASHA Worker**: Rural village outreach, citizen registration, offline sync.
4. **Hospital Admin**: Bed capacity, ICU status, oxygen supply, doctor rosters.
5. **Pharmacy**: Prescription queue, stock levels, closed-loop dispensing.
6. **Pathology Lab**: Diagnostic testing pipeline and report generation.
7. **Ambulance Unit**: 108 dispatch navigation, OTP patient pickup, hospital handoff.
8. **Command Center**: Regional epidemiology heatmaps and emergency fleet control.`,
      suggestedActions: [
        { type: 'SWITCH_ROLE', payload: 'PATIENT', label: '👤 Patient Portal' },
        { type: 'SWITCH_ROLE', payload: 'DOCTOR', label: '🩺 Doctor Portal' },
        { type: 'SWITCH_ROLE', payload: 'ASHA_WORKER', label: '🌾 ASHA Portal' },
        { type: 'SWITCH_ROLE', payload: 'HOSPITAL_ADMIN', label: '🏥 Hospital Admin' },
        { type: 'SWITCH_ROLE', payload: 'PHARMACY_STAFF', label: '💊 Pharmacy Portal' },
        { type: 'SWITCH_ROLE', payload: 'AMBULANCE_OPERATOR', label: '🚑 Ambulance Portal' }
      ]
    };
  }

  // 11. GENERAL PLATFORM OVERVIEW / DEFAULT
  return {
    topic: 'Platform Guide',
    reply: `### 👋 Welcome to CARE4U NEXUS!
I am your dedicated **Platform Assistant and Healthcare Navigator**.

CARE4U NEXUS connects patients, doctors, ASHA community workers, hospitals, pharmacies, pathology labs, and 108 ambulances into a unified care journey.

Here are some helpful things you can ask me:
- *"How do I book an appointment?"*
- *"Where is my medicine schedule?"*
- *"How do I call a 108 emergency ambulance?"*
- *"Explain the Doctor and ASHA portals."*
- *"How do I operate this website using voice commands?"*
- *"Show me my Health QR ID card."*

Or tap any quick action below to explore:`,
    suggestedActions: [
      { type: 'NAVIGATE_TAB', payload: 'AI_INTAKE', label: '✨ AI Health Intake & Triage' },
      { type: 'NAVIGATE_TAB', payload: 'MY_APPOINTMENTS', label: '📅 Consultations & Appointments' },
      { type: 'NAVIGATE_TAB', payload: 'MEDICINES_SCHEDULE', label: '💊 Daily Medicine Schedule' },
      { type: 'NAVIGATE_TAB', payload: 'HEALTH_ID_QR', label: '🪪 Verified Health QR ID' },
      { type: 'TRIGGER_SOS', label: '🚨 Emergency 108 SOS' },
      { type: 'SWITCH_ROLE', payload: 'DOCTOR', label: '🩺 Switch to Doctor Portal' },
      { type: 'OPEN_TOUR', label: '🚀 Guided Platform Tour' }
    ]
  };
}
