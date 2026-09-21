export interface SafetyAssessment {
  isEmergency: boolean;
  requiresImmediateCare: boolean;
  emergencyReason?: string;
  disclaimerText: string;
  sanitizedText: string;
}

export class HealthSafetyValidator {
  private static EMERGENCY_KEYWORDS = [
    'chest pain',
    'difficulty breathing',
    'shortness of breath',
    'unconscious',
    'severe bleeding',
    'stroke',
    'heart attack',
    'anaphylaxis',
    'blue lips',
    'sudden weakness',
    'slurred speech',
    'severe allergic reaction',
    'choking',
    'convulsions',
    'seizure'
  ];

  /**
   * Evaluates text for emergency indicators and attaches mandatory clinical disclaimers.
   */
  public static assess(input: string, aiResponse: string): SafetyAssessment {
    const combined = `${input} ${aiResponse}`.toLowerCase();
    const isEmergency = this.EMERGENCY_KEYWORDS.some(k => combined.includes(k));

    let sanitized = aiResponse;

    // Safety guard: ensure the AI never claims to diagnose definitively
    sanitized = sanitized.replace(/\byou have\b/gi, 'these symptoms may be associated with');
    sanitized = sanitized.replace(/\byou definitely have\b/gi, 'this might indicate');
    sanitized = sanitized.replace(/\bi diagnose you with\b/gi, 'possible causes include');

    const disclaimer = isEmergency
      ? 'CRITICAL ALERT: Emergency indicators detected. Please seek immediate professional medical attention or call emergency services (108 in India).'
      : 'Disclaimer: HealthAI provides general informational guidance only and does not provide formal medical diagnoses or prescriptions. Always consult a certified physician.';

    return {
      isEmergency,
      requiresImmediateCare: isEmergency,
      emergencyReason: isEmergency ? 'Life-threatening or critical symptom indicators detected.' : undefined,
      disclaimerText: disclaimer,
      sanitizedText: sanitized
    };
  }
}
