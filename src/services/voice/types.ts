import { Language, UserRole } from '../../types';

export type VoiceState =
  | 'INACTIVE'
  | 'LISTENING'
  | 'UNDERSTANDING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'ERROR'
  | 'CONFIRMATION_PENDING';

export type IntentType =
  | 'NAVIGATE'
  | 'SEARCH_DOCTOR'
  | 'SEARCH_FACILITY'
  | 'APPOINTMENT_ACTION'
  | 'HEALTH_RECORD_ACTION'
  | 'READ_REPORT'
  | 'MEDICINE_ACTION'
  | 'SYMPTOM_ASSESSMENT'
  | 'EMERGENCY_HELP'
  | 'AI_QUERY'
  | 'PAGE_CONTROL'
  | 'THEME_CONTROL'
  | 'VOICE_CONTROL'
  | 'VOICE_HELP'
  | 'AUTH_ACTION'
  | 'UNKNOWN';

export interface StructuredIntent {
  intent: IntentType;
  target?: string;
  specialty?: string;
  facilityType?: string;
  query?: string;
  location?: string;
  appointmentId?: string;
  actionSubtype?: string;
  confidence: number;
  rawTranscript: string;
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
  parameters?: Record<string, any>;
}

export interface SafetyCheckResult {
  isSafe: boolean;
  isEmergency: boolean;
  requiresConfirmation: boolean;
  sanitizedIntent: StructuredIntent;
  safetyReason?: string;
  disclaimerText?: string;
}

export interface VoiceSettings {
  voiceAssistantEnabled: boolean;
  voiceFeedbackEnabled: boolean;
  continuousListening: boolean;
  language: Language;
  speechSpeed: number; // 0.5 to 2.0
  speechPitch: number;
  autoReadResponses: boolean;
  commandConfirmation: boolean;
  voiceHistoryEnabled: boolean;
}

export interface ConsequentialActionRequest {
  id: string;
  type: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel?: () => void;
}
