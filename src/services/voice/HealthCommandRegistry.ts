export type AllowedActionCategory =
  | 'navigate'
  | 'scroll'
  | 'search'
  | 'open'
  | 'read'
  | 'filter'
  | 'theme'
  | 'form_fill'
  | 'healthcare_action';

export interface RegisteredActionDefinition {
  id: string;
  category: AllowedActionCategory;
  allowedParams: string[];
  description: string;
}

export class HealthCommandRegistry {
  private static ALLOWED_ACTIONS: Map<string, RegisteredActionDefinition> = new Map([
    // Navigation actions
    ['navigate.tab', { id: 'navigate.tab', category: 'navigate', allowedParams: ['tab'], description: 'Navigate between application tabs' }],
    ['navigate.role', { id: 'navigate.role', category: 'navigate', allowedParams: ['role'], description: 'Switch portal workspace role' }],
    ['navigate.back', { id: 'navigate.back', category: 'navigate', allowedParams: [], description: 'Go back in history' }],
    ['navigate.forward', { id: 'navigate.forward', category: 'navigate', allowedParams: [], description: 'Go forward in history' }],

    // UI & Scroll actions
    ['scroll.page', { id: 'scroll.page', category: 'scroll', allowedParams: ['direction'], description: 'Scroll page vertically' }],
    ['element.click', { id: 'element.click', category: 'open', allowedParams: ['targetLabel', 'index'], description: 'Safely click targeted button or link' }],
    ['modal.open', { id: 'modal.open', category: 'open', allowedParams: ['modalType', 'initialQuery'], description: 'Open specific modal dialog' }],
    ['modal.close', { id: 'modal.close', category: 'open', allowedParams: [], description: 'Close any active modal dialog' }],

    // Search & Filter actions
    ['search.universal', { id: 'search.universal', category: 'search', allowedParams: ['query', 'scope'], description: 'Universal search across portal' }],
    ['search.doctor', { id: 'search.doctor', category: 'filter', allowedParams: ['specialty', 'query', 'gender', 'availability'], description: 'Search and filter doctors' }],
    ['search.facility', { id: 'search.facility', category: 'filter', allowedParams: ['facilityType', 'location', 'query'], description: 'Find hospitals, clinics, or labs' }],

    // Healthcare actions
    ['healthcare.read_report', { id: 'healthcare.read_report', category: 'read', allowedParams: ['reportId', 'mode'], description: 'Read diagnostic lab report aloud' }],
    ['healthcare.take_medicine', { id: 'healthcare.take_medicine', category: 'healthcare_action', allowedParams: ['medicineId'], description: 'Log scheduled medication dose' }],
    ['healthcare.emergency_sos', { id: 'healthcare.emergency_sos', category: 'healthcare_action', allowedParams: ['dispatch'], description: 'Trigger Emergency 108 SOS dispatch' }],
    ['healthcare.cancel_appointment', { id: 'healthcare.cancel_appointment', category: 'healthcare_action', allowedParams: ['appointmentId'], description: 'Cancel scheduled consultation' }],
    ['healthcare.symptom_triage', { id: 'healthcare.symptom_triage', category: 'healthcare_action', allowedParams: ['symptoms'], description: 'AI clinical symptom assessment' }],

    // Theme & Accessibility
    ['theme.toggle', { id: 'theme.toggle', category: 'theme', allowedParams: ['mode'], description: 'Toggle application visual theme' }],
    ['voice.settings', { id: 'voice.settings', category: 'open', allowedParams: ['setting', 'value'], description: 'Adjust voice assistant settings' }],
    ['voice.help', { id: 'voice.help', category: 'open', allowedParams: ['category'], description: 'Display voice commands help' }]
  ]);

  /**
   * Strictly validates whether an action and its parameters are allowed
   */
  public static isActionAllowed(actionId: string, params: Record<string, any> = {}): boolean {
    const action = this.ALLOWED_ACTIONS.get(actionId);
    if (!action) {
      console.warn(`[Security Alert] Rejected unapproved action: ${actionId}`);
      return false;
    }

    // Ensure parameters only contain allowlisted keys
    for (const key of Object.keys(params)) {
      if (!action.allowedParams.includes(key)) {
        console.warn(`[Security Alert] Rejected illegal parameter '${key}' for action: ${actionId}`);
        return false;
      }
    }

    return true;
  }

  public static getAction(actionId: string): RegisteredActionDefinition | undefined {
    return this.ALLOWED_ACTIONS.get(actionId);
  }
}
