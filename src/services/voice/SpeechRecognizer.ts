import { Language } from '../../types';

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

export type TranscriptCallback = (transcript: string, isFinal: boolean) => void;
export type StatusCallback = (isListening: boolean) => void;
export type ErrorCallback = (error: string) => void;

export class SpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;
  private continuous: boolean = false;
  private language: Language = 'en';
  private restartTimeout: any = null;

  // Audio Context & Analyser for Waveform Visualization
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private audioDataArray: Uint8Array | null = null;

  // Event callbacks
  private onTranscriptCallbacks: Set<TranscriptCallback> = new Set();
  private onStatusCallbacks: Set<StatusCallback> = new Set();
  private onErrorCallbacks: Set<ErrorCallback> = new Set();

  constructor(language: Language = 'en') {
    this.language = language;
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = SPEECH_LANG_MAP[this.language] || 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyStatus(true);
        this.startAudioAnalysis();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyStatus(false);
        this.stopAudioAnalysis();

        if (this.continuous) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.continuous && !this.isListening) {
              try {
                this.recognition.start();
              } catch {
                // Ignore transient errors
              }
            }
          }, 300);
        }
      };

      this.recognition.onerror = (event: any) => {
        const error = event.error || 'unknown_error';
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          this.continuous = false;
          this.isListening = false;
          this.notifyStatus(false);
          this.notifyError('Microphone access is required for HealthAI Voice. Please allow microphone access in your browser settings.');
        } else if (error !== 'no-speech') {
          this.notifyError(`Voice recognition: ${error}`);
        }
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        const activeText = (final || interim).trim();
        if (activeText) {
          this.notifyTranscript(activeText, Boolean(final));
        }
      };
    } catch (err) {
      console.warn('Speech recognition initialization error:', err);
    }
  }

  private async startAudioAnalysis() {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      if (!this.analyser) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        source.connect(this.analyser);
        this.audioDataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    } catch {
      // Non-fatal if audio analysis cannot bind; recognition continues
    }
  }

  private stopAudioAnalysis() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
      this.analyser = null;
    }
  }

  /**
   * Returns normalized frequency bins (0 to 1) for real-time waveform visualization
   */
  public getWaveformData(): number[] {
    if (!this.analyser || !this.audioDataArray || !this.isListening) {
      return [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
    }
    this.analyser.getByteFrequencyData(this.audioDataArray as any);
    const bins: number[] = [];
    const step = Math.max(1, Math.floor(this.audioDataArray.length / 8));
    for (let i = 0; i < 8; i++) {
      const val = this.audioDataArray[i * step] || 0;
      bins.push(Math.max(0.08, val / 255));
    }
    return bins;
  }

  public setLanguage(lang: Language) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN';
      if (this.isListening) {
        try {
          this.recognition.stop();
        } catch {}
      }
    }
  }

  public setContinuous(enabled: boolean) {
    this.continuous = enabled;
    if (enabled && !this.isListening) {
      this.start();
    } else if (!enabled && this.isListening) {
      this.stop();
    }
  }

  public start() {
    if (!this.recognition) this.initRecognition();
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.lang = SPEECH_LANG_MAP[this.language] || 'en-IN';
        this.recognition.start();
      } catch {
        // Recognition already starting
      }
    }
  }

  public stop() {
    this.continuous = false;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.stopAudioAnalysis();
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getContinuous(): boolean {
    return this.continuous;
  }

  public onTranscript(cb: TranscriptCallback): () => void {
    this.onTranscriptCallbacks.add(cb);
    return () => this.onTranscriptCallbacks.delete(cb);
  }

  public onStatus(cb: StatusCallback): () => void {
    this.onStatusCallbacks.add(cb);
    return () => this.onStatusCallbacks.delete(cb);
  }

  public onError(cb: ErrorCallback): () => void {
    this.onErrorCallbacks.add(cb);
    return () => this.onErrorCallbacks.delete(cb);
  }

  private notifyTranscript(text: string, isFinal: boolean) {
    this.onTranscriptCallbacks.forEach(cb => cb(text, isFinal));
  }

  private notifyStatus(isListening: boolean) {
    this.onStatusCallbacks.forEach(cb => cb(isListening));
  }

  private notifyError(err: string) {
    this.onErrorCallbacks.forEach(cb => cb(err));
  }
}
