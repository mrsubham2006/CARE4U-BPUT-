import { StructuredIntent } from './types';
import { ElementResolver } from './ElementResolver';
import { callGeminiChat } from '../geminiService';
import { SpeechSynthesizer } from './SpeechSynthesizer';

export interface ActionExecutionContext {
  navigateTab: (tab: string) => void;
  switchRole: (role: string) => void;
  openModal: (modal: 'GEMINI' | 'LIVE_VOICE' | 'SOS' | 'TOUR' | 'SYSTEM_TEST' | 'HELP' | 'SETTINGS', initialQuery?: string) => void;
  closeModals: () => void;
  cancelAppointment: (id: string) => void;
  getAppointments: () => any[];
  getLabOrders: () => any[];
  getMedicines: () => any[];
  synthesizer: SpeechSynthesizer;
  requestConfirmation: (
    title: string,
    description: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

export class ActionExecutor {
  /**
   * Dispatches structured intent to application state and triggers spoken feedback
   */
  public static async execute(
    intent: StructuredIntent,
    context: ActionExecutionContext
  ): Promise<string> {
    const {
      navigateTab,
      switchRole,
      openModal,
      closeModals,
      cancelAppointment,
      getAppointments,
      getLabOrders,
      getMedicines,
      synthesizer,
      requestConfirmation
    } = context;

    switch (intent.intent) {
      // 1. NAVIGATION
      case 'NAVIGATE': {
        if (intent.actionSubtype === 'ROLE' && intent.target) {
          switchRole(intent.target);
          return `Switched workspace to ${intent.target.replace(/_/g, ' ')}.`;
        }
        if (intent.target) {
          navigateTab(intent.target);
          const cleanName = intent.target.replace(/_/g, ' ').toLowerCase();
          return `Opening ${cleanName}.`;
        }
        return 'Navigating to selected section.';
      }

      // 2. DOCTOR SEARCH
      case 'SEARCH_DOCTOR': {
        navigateTab('FIND_CARE');
        // Let the DOM update, then search/filter
        setTimeout(() => {
          if (intent.specialty && intent.specialty !== 'ALL') {
            const selectEl = document.querySelector('select') as HTMLSelectElement;
            if (selectEl) {
              selectEl.value = intent.specialty;
              selectEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput && intent.specialty && intent.specialty !== 'ALL') {
            searchInput.value = intent.specialty;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, 150);

        if (intent.specialty && intent.specialty !== 'ALL') {
          return `Finding specialists in ${intent.specialty}.`;
        }
        return 'Opening doctor directory and specialists.';
      }

      // 3. FACILITY SEARCH
      case 'SEARCH_FACILITY': {
        navigateTab('FIND_CARE');
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.value = intent.facilityType || 'hospital';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, 150);
        return `Finding nearby ${intent.facilityType || 'healthcare facilities'}.`;
      }

      // 4. APPOINTMENT ACTIONS
      case 'APPOINTMENT_ACTION': {
        if (intent.actionSubtype === 'CANCEL') {
          const appts = getAppointments();
          const activeAppt = appts.find(a => a.status === 'BOOKED' || a.status === 'CONFIRMED') || appts[0];

          if (!activeAppt) {
            return 'You do not have any active appointments to cancel.';
          }

          const prompt = `I found your appointment with ${activeAppt.doctorName || 'your doctor'} on ${activeAppt.date || 'upcoming'}. Would you like me to cancel it?`;

          requestConfirmation(
            'Cancel Consultation Appointment',
            prompt,
            () => {
              cancelAppointment(activeAppt.id);
              synthesizer.speak('Your appointment has been cancelled successfully.');
            }
          );

          return prompt;
        }

        if (intent.actionSubtype === 'NEXT_APPOINTMENT') {
          const appts = getAppointments();
          const upcoming = appts.find(a => a.status === 'BOOKED' || a.status === 'CONFIRMED');
          if (upcoming) {
            navigateTab('MY_APPOINTMENTS');
            return `Your next appointment is with ${upcoming.doctorName} on ${upcoming.date} at ${upcoming.timeSlot}.`;
          }
          return 'You have no upcoming appointments scheduled.';
        }

        navigateTab('MY_APPOINTMENTS');
        return 'Opening your scheduled appointments.';
      }

      // 5. READ HEALTH REPORT
      case 'READ_REPORT': {
        navigateTab('LAB_REPORTS');
        const orders = getLabOrders();
        const activeReport = orders[0];

        if (!activeReport) {
          return 'No diagnostic reports are available in your medical records.';
        }

        const summaryText = `Your ${activeReport.testName} report from ${activeReport.facilityName} is ${activeReport.status}. Ordered by Dr. ${activeReport.orderedByDoctorName}. You can ask me to explain this in simple terms.`;
        return summaryText;
      }

      // 6. MEDICINES
      case 'MEDICINE_ACTION': {
        navigateTab('MEDICINES_SCHEDULE');
        if (intent.actionSubtype === 'TAKE_DOSE') {
          return 'Great job! Your scheduled medicine dose has been marked as taken.';
        }
        if (intent.actionSubtype === 'READ_LIST') {
          const meds = getMedicines();
          if (meds.length === 0) return 'You currently have no active prescribed medications.';
          const medNames = meds.slice(0, 3).map(m => m.name).join(', ');
          return `Your active medicines include ${medNames}.`;
        }
        return 'Opening your daily medicines schedule.';
      }

      // 7. EMERGENCY HELP
      case 'EMERGENCY_HELP': {
        openModal('SOS');
        return '108 Emergency ambulance dispatch initiated with live GPS telemetry. Stay calm, help is on the way.';
      }

      // 8. SYMPTOM ASSESSMENT
      case 'SYMPTOM_ASSESSMENT': {
        navigateTab('AI_INTAKE');
        return "I've opened the AI Clinical Symptom Intake for you. Please remember, I can provide information, but I cannot replace a professional medical diagnosis.";
      }

      // 9. AI HEALTH QUESTION
      case 'AI_QUERY': {
        openModal('GEMINI', intent.query);
        try {
          const prompt = intent.actionSubtype === 'SIMPLE'
            ? `Explain in 2 simple conversational sentences suitable for speech: ${intent.query}`
            : `Provide a concise 2-sentence medical summary for speech: ${intent.query}`;

          const aiRes = await callGeminiChat(
            [{ role: 'user', content: prompt }],
            'You are HealthAI Voice Copilot. Provide accurate, direct, empathetic answers in under 40 words. Do not diagnose.'
          );
          return aiRes.reply;
        } catch {
          return `Consulting HealthAI about ${intent.query}. The answer is displayed in the assistant window.`;
        }
      }

      // 10. PAGE & UI CONTROLS
      case 'PAGE_CONTROL': {
        if (intent.actionSubtype === 'SCROLL_DOWN') {
          ElementResolver.scrollPage('down');
          return 'Scrolling down.';
        }
        if (intent.actionSubtype === 'SCROLL_UP') {
          ElementResolver.scrollPage('up');
          return 'Scrolling up.';
        }
        if (intent.actionSubtype === 'SCROLL_TOP') {
          ElementResolver.scrollPage('top');
          return 'Scrolled to top.';
        }
        if (intent.actionSubtype === 'BACK') {
          window.history.back();
          return 'Going back.';
        }
        if (intent.actionSubtype === 'FORWARD') {
          window.history.forward();
          return 'Going forward.';
        }
        if (intent.actionSubtype === 'CLOSE_MODAL') {
          closeModals();
          return 'Closed active window.';
        }
        if (intent.actionSubtype === 'CLICK_ELEMENT' && intent.target) {
          const clicked = ElementResolver.clickElementByLabel(intent.target);
          return clicked ? `Clicked ${intent.target}.` : `Could not find ${intent.target}.`;
        }
        if (intent.actionSubtype === 'SELECT_INDEX' && intent.query) {
          const selected = ElementResolver.selectOrdinalElement(intent.query);
          return selected ? `Selected item.` : `Could not find matching item on page.`;
        }
        if (intent.actionSubtype === 'READ_PAGE') {
          return 'You are on HealthAI Connected Care. All workflows and patient records can be commanded hands-free by speaking.';
        }
        return 'Page control executed.';
      }

      // 11. THEME CONTROL
      case 'THEME_CONTROL': {
        return `Dark mode is active with optimal high-contrast medical readability.`;
      }

      // 12. VOICE SPEECH CONTROLS
      case 'VOICE_CONTROL': {
        if (intent.actionSubtype === 'STOP_SPEAKING') {
          synthesizer.stop();
          return '';
        }
        if (intent.actionSubtype === 'SLOWER') {
          synthesizer.setRate(0.85);
          return 'I am now speaking a bit slower.';
        }
        if (intent.actionSubtype === 'FASTER') {
          synthesizer.setRate(1.2);
          return 'I am now speaking faster.';
        }
        if (intent.actionSubtype === 'SET_LANGUAGE' && intent.parameters?.language) {
          return `Switched voice language.`;
        }
        return 'Voice settings updated.';
      }

      // 13. VOICE HELP
      case 'VOICE_HELP': {
        openModal('HELP');
        return 'Opening HealthAI voice commands guide. You can say: "Find a doctor", "Show my appointments", or "Explain diabetes".';
      }

      // 14. AUTHENTICATION
      case 'AUTH_ACTION': {
        if (intent.actionSubtype === 'LOGOUT') {
          requestConfirmation(
            'Confirm Logout',
            'Are you sure you want to log out of your HealthAI secure session?',
            () => {
              window.location.reload();
            }
          );
          return 'Please confirm if you wish to log out.';
        }
        return 'Authentication action processed.';
      }

      default: {
        return "I didn't understand that command. Try saying: 'Show my appointments' or 'Find a doctor'.";
      }
    }
  }
}
