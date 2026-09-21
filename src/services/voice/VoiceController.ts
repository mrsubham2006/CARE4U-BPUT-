import {
  VoiceState,
  StructuredIntent,
  VoiceSettings,
  ConsequentialActionRequest
} from './types';
import { SpeechRecognizer } from './SpeechRecognizer';
import { SpeechSynthesizer } from './SpeechSynthesizer';
import { HealthIntentParser } from './HealthIntentParser';
import { SafetyValidator } from './SafetyValidator';
import { ActionExecutor, ActionExecutionContext } from './ActionExecutor';

const DEFAULT_SETTINGS: VoiceSettings = {
  voiceAssistantEnabled: true,
  voiceFeedbackEnabled: true,
  continuousListening: false,
  language: 'en',
  speechSpeed: 1.0,
  speechPitch: 1.0,
  autoReadResponses: true,
  commandConfirmation: true,
  voiceHistoryEnabled: true
};

const SETTINGS_KEY = 'healthai_voice_settings_v1';

export class VoiceController {
  private recognizer: SpeechRecognizer;
  private synthesizer: SpeechSynthesizer;
  private state: VoiceState = 'INACTIVE';
  private currentTranscript: string = '';
  private currentFeedback: string = '';
  private settings: VoiceSettings;
  private pendingConfirmation: ConsequentialActionRequest | null = null;
  private executionContext: ActionExecutionContext | null = null;

  // Listeners
  private stateListeners: Set<(state: VoiceState) => void> = new Set();
  private transcriptListeners: Set<(text: string, isFinal: boolean) => void> = new Set();
  private feedbackListeners: Set<(feedback: string) => void> = new Set();
  private confirmationListeners: Set<(request: ConsequentialActionRequest | null) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
    this.recognizer = new SpeechRecognizer(this.settings.language);
    this.synthesizer = new SpeechSynthesizer(this.settings.language, this.settings.speechSpeed);

    this.initBindings();
  }

  private loadSettings(): VoiceSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  }

  public saveSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch {}
    }

    if (newSettings.language) {
      this.recognizer.setLanguage(newSettings.language);
      this.synthesizer.setLanguage(newSettings.language);
    }
    if (newSettings.speechSpeed !== undefined) {
      this.synthesizer.setRate(newSettings.speechSpeed);
    }
    if (newSettings.continuousListening !== undefined) {
      this.recognizer.setContinuous(newSettings.continuousListening);
    }
  }

  public getSettings(): VoiceSettings {
    return this.settings;
  }

  public setExecutionContext(ctx: ActionExecutionContext) {
    this.executionContext = ctx;
  }

  private initBindings() {
    this.recognizer.onStatus(listening => {
      if (listening) {
        this.setState('LISTENING');
      } else if (this.state === 'LISTENING') {
        this.setState('INACTIVE');
      }
    });

    this.recognizer.onTranscript((text, isFinal) => {
      this.currentTranscript = text;
      this.notifyTranscript(text, isFinal);

      if (isFinal) {
        this.handleFinalTranscript(text);
      }
    });

    this.recognizer.onError(err => {
      this.currentFeedback = err;
      this.notifyFeedback(err);
      this.setState('ERROR');
      setTimeout(() => {
        if (this.state === 'ERROR') {
          this.setState('INACTIVE');
        }
      }, 4000);
    });

    this.synthesizer.onSpeakingStatus(isSpeaking => {
      if (isSpeaking) {
        this.setState('SPEAKING');
      } else if (this.state === 'SPEAKING') {
        this.setState(this.recognizer.getIsListening() ? 'LISTENING' : 'INACTIVE');
      }
    });
  }

  public isSupported(): boolean {
    return this.recognizer.isSupported();
  }

  public getState(): VoiceState {
    return this.state;
  }

  public getWaveformData(): number[] {
    return this.recognizer.getWaveformData();
  }

  public toggleListening(): void {
    if (!this.settings.voiceAssistantEnabled) return;
    if (this.recognizer.getIsListening()) {
      this.stop();
    } else {
      this.start();
    }
  }

  public start(): void {
    if (!this.settings.voiceAssistantEnabled) return;
    this.synthesizer.stop();
    this.recognizer.start();
  }

  public stop(): void {
    this.recognizer.stop();
    this.synthesizer.stop();
    this.setState('INACTIVE');
  }

  public setContinuous(enabled: boolean): void {
    this.saveSettings({ continuousListening: enabled });
  }

  public setMuted(muted: boolean): void {
    this.synthesizer.setMuted(muted);
  }

  public getIsMuted(): boolean {
    return this.synthesizer.getIsMuted();
  }

  public getPendingConfirmation(): ConsequentialActionRequest | null {
    return this.pendingConfirmation;
  }

  public confirmPendingAction(): void {
    if (this.pendingConfirmation) {
      const action = this.pendingConfirmation;
      this.pendingConfirmation = null;
      this.notifyConfirmation(null);
      this.setState('EXECUTING');
      action.onConfirm();
      setTimeout(() => this.setState('INACTIVE'), 1500);
    }
  }

  public cancelPendingAction(): void {
    if (this.pendingConfirmation) {
      const action = this.pendingConfirmation;
      this.pendingConfirmation = null;
      this.notifyConfirmation(null);
      if (action.onCancel) action.onCancel();
      this.synthesizer.speak('Action cancelled.');
      this.setState('INACTIVE');
    }
  }

  /**
   * Pipeline from Speech -> Intent -> Safety -> Execution -> Synthesizer
   */
  public async handleFinalTranscript(transcript: string): Promise<void> {
    const cleanText = transcript.trim();
    if (!cleanText) return;

    // Handle voice confirmation if currently pending
    if (this.pendingConfirmation) {
      const lower = cleanText.toLowerCase();
      if (lower.includes('yes') || lower.includes('confirm') || lower.includes('sure') || lower.includes('okay') || lower.includes('proceed') || lower.includes('ହଁ') || lower.includes('हाँ')) {
        this.confirmPendingAction();
        return;
      }
      if (lower.includes('no') || lower.includes('cancel') || lower.includes('stop') || lower.includes('don\'t') || lower.includes('ନାହିଁ') || lower.includes('नहीं')) {
        this.cancelPendingAction();
        return;
      }
    }

    this.setState('UNDERSTANDING');

    // 1. Natural Language Intent Parsing
    const parsedIntent = HealthIntentParser.parse(cleanText);

    // 2. Safety Layer
    const safetyCheck = SafetyValidator.validate(parsedIntent);

    if (safetyCheck.isEmergency) {
      this.setState('EXECUTING');
      this.currentFeedback = safetyCheck.disclaimerText || 'Emergency care initiated.';
      this.notifyFeedback(this.currentFeedback);
      if (this.settings.autoReadResponses) {
        this.synthesizer.speak(this.currentFeedback);
      }
      if (this.executionContext) {
        await ActionExecutor.execute(safetyCheck.sanitizedIntent, this.executionContext);
      }
      return;
    }

    // 3. Consequential Action Check
    if (safetyCheck.requiresConfirmation && this.settings.commandConfirmation) {
      const prompt = safetyCheck.sanitizedIntent.confirmationPrompt || 'Please confirm to execute this action.';
      this.pendingConfirmation = {
        id: Math.random().toString(36).substring(7),
        type: safetyCheck.sanitizedIntent.intent,
        title: 'Safety Confirmation Required',
        description: prompt,
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        onConfirm: async () => {
          if (this.executionContext) {
            await ActionExecutor.execute(
              { ...safetyCheck.sanitizedIntent, requiresConfirmation: false },
              this.executionContext
            );
          }
        }
      };

      this.setState('CONFIRMATION_PENDING');
      this.notifyConfirmation(this.pendingConfirmation);
      if (this.settings.autoReadResponses) {
        this.synthesizer.speak(prompt);
      }
      return;
    }

    // 4. Execution
    this.setState('EXECUTING');
    if (this.executionContext) {
      try {
        const feedback = await ActionExecutor.execute(
          safetyCheck.sanitizedIntent,
          this.executionContext
        );

        this.currentFeedback = feedback;
        this.notifyFeedback(feedback);

        if (this.settings.autoReadResponses && feedback) {
          this.synthesizer.speak(feedback);
        } else {
          setTimeout(() => {
            if (this.state === 'EXECUTING') {
              this.setState('INACTIVE');
            }
          }, 1500);
        }
      } catch (err: any) {
        this.setState('ERROR');
        this.currentFeedback = "Sorry, I couldn't execute that command.";
        this.notifyFeedback(this.currentFeedback);
      }
    }
  }

  // State Subscription Listeners
  public onStateChange(listener: (state: VoiceState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onTranscript(listener: (text: string, isFinal: boolean) => void): () => void {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  public onFeedback(listener: (feedback: string) => void): () => void {
    this.feedbackListeners.add(listener);
    return () => this.feedbackListeners.delete(listener);
  }

  public onConfirmation(listener: (req: ConsequentialActionRequest | null) => void): () => void {
    this.confirmationListeners.add(listener);
    return () => this.confirmationListeners.delete(listener);
  }

  private setState(newState: VoiceState) {
    this.state = newState;
    this.stateListeners.forEach(cb => cb(newState));
  }

  private notifyTranscript(text: string, isFinal: boolean) {
    this.transcriptListeners.forEach(cb => cb(text, isFinal));
  }

  private notifyFeedback(feedback: string) {
    this.feedbackListeners.forEach(cb => cb(feedback));
  }

  private notifyConfirmation(req: ConsequentialActionRequest | null) {
    this.confirmationListeners.forEach(cb => cb(req));
  }
}

export const globalVoiceController = new VoiceController();
