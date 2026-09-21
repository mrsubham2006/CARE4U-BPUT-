import { StructuredIntent, SafetyCheckResult } from './types';

export class SafetyValidator {
  private static EMERGENCY_INDICATORS = [
    'chest pain',
    'heart attack',
    'stroke',
    'unconscious',
    'cannot breathe',
    'difficulty breathing',
    'severe bleeding',
    'anaphylaxis',
    'choking',
    'severe trauma',
    'seizure',
    'convulsion',
    'poisoning',
    'overdose',
    'ଛାତି ବିନ୍ଧା',
    'ଶ୍ୱାସକଷ୍ଟ',
    'ଅଚେତ',
    'ରକ୍ତସ୍ରାବ',
    'सीने में दर्द',
    'सांस लेने में तकलीफ',
    'बेहोश',
    'भारी रक्तस्राव',
    'छातीत तीव्र वेदना',
    'श्वास घेण्यास त्रास'
  ];

  private static CONSEQUENCE_INTENTS = [
    'APPOINTMENT_ACTION:CANCEL',
    'AUTH_ACTION:LOGOUT',
    'HEALTH_RECORD_ACTION:DELETE',
    'MEDICINE_ACTION:STOP'
  ];

  /**
   * Evaluates structured intent against strict healthcare safety policies
   */
  public static validate(intent: StructuredIntent): SafetyCheckResult {
    const transcript = intent.rawTranscript.toLowerCase();

    // 1. Critical Red-Flag Emergency Detection
    const hasEmergencySymptom = this.EMERGENCY_INDICATORS.some(ind => transcript.includes(ind));

    if (hasEmergencySymptom || intent.intent === 'EMERGENCY_HELP') {
      return {
        isSafe: true,
        isEmergency: true,
        requiresConfirmation: false,
        sanitizedIntent: {
          ...intent,
          intent: 'EMERGENCY_HELP',
          actionSubtype: 'IMMEDIATE_SOS'
        },
        disclaimerText:
          'Critical emergency indicators detected. Activating Emergency 108 SOS dispatch immediately. Please seek emergency medical care.'
      };
    }

    // 2. Symptom Assessment Safety: Non-diagnostic disclaimer
    if (intent.intent === 'SYMPTOM_ASSESSMENT') {
      return {
        isSafe: true,
        isEmergency: false,
        requiresConfirmation: false,
        sanitizedIntent: intent,
        disclaimerText:
          "I can provide general health information, but I cannot diagnose a medical condition. For severe or persistent symptoms, please consult a qualified healthcare professional."
      };
    }

    // 3. Consequential Action Check (requires user confirmation)
    const actionKey = `${intent.intent}:${intent.actionSubtype || ''}`;
    const isConsequential = this.CONSEQUENCE_INTENTS.includes(actionKey) || intent.requiresConfirmation;

    if (isConsequential) {
      return {
        isSafe: true,
        isEmergency: false,
        requiresConfirmation: true,
        sanitizedIntent: {
          ...intent,
          requiresConfirmation: true,
          confirmationPrompt:
            intent.confirmationPrompt ||
            this.generateConfirmationPrompt(intent)
        }
      };
    }

    // 4. General safe intent
    return {
      isSafe: true,
      isEmergency: false,
      requiresConfirmation: false,
      sanitizedIntent: intent
    };
  }

  private static generateConfirmationPrompt(intent: StructuredIntent): string {
    if (intent.intent === 'APPOINTMENT_ACTION' && intent.actionSubtype === 'CANCEL') {
      return 'Are you sure you want to cancel your scheduled appointment? Please confirm.';
    }
    if (intent.intent === 'AUTH_ACTION' && intent.actionSubtype === 'LOGOUT') {
      return 'Do you want to log out of your HealthAI secure session?';
    }
    return 'This action will make changes. Would you like to proceed?';
  }
}
