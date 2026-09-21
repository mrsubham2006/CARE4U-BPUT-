import { Language } from '../../types';
import { SPEECH_LANG_MAP } from './SpeechRecognizer';

export type SpeakingStatusCallback = (isSpeaking: boolean) => void;

export class SpeechSynthesizer {
  private isMuted: boolean = false;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private currentLanguage: Language = 'en';
  private isSpeaking: boolean = false;
  private statusListeners: Set<SpeakingStatusCallback> = new Set();

  constructor(language: Language = 'en', speed: number = 1.0) {
    this.currentLanguage = language;
    this.rate = Math.max(0.5, Math.min(2.0, speed));
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  public getRate(): number {
    return this.rate;
  }

  public setPitch(pitch: number) {
    this.pitch = Math.max(0.5, Math.min(1.5, pitch));
  }

  public setLanguage(language: Language) {
    this.currentLanguage = language;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public onSpeakingStatus(listener: SpeakingStatusCallback): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus(speaking: boolean) {
    this.isSpeaking = speaking;
    this.statusListeners.forEach(cb => {
      try {
        cb(speaking);
      } catch (err) {
        console.error(err);
      }
    });
  }

  /**
   * Speak response with optional completion callback.
   * Cleans markup tags or Markdown syntax to keep speech clean.
   */
  public speak(rawText: string, onEnd?: () => void): void {
    if (this.isMuted || !this.isSupported()) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean Markdown symbols (asterisks, hashtags, backticks, brackets)
      const cleanText = rawText
        .replace(/\[ACTION:[^\]]+\]/g, '')
        .replace(/[*#_`~>[\]]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = SPEECH_LANG_MAP[this.currentLanguage] || 'en-IN';
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      utterance.onstart = () => {
        this.notifyStatus(true);
      };

      utterance.onend = () => {
        this.notifyStatus(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.notifyStatus(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.notifyStatus(false);
      if (onEnd) onEnd();
    }
  }

  public stop(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.notifyStatus(false);
  }

  public pause(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.pause();
      } catch {}
    }
  }

  public resume(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }
  }
}
