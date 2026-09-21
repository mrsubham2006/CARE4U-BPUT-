import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  VoiceState,
  VoiceSettings,
  ConsequentialActionRequest
} from './types';
import { globalVoiceController, VoiceController } from './VoiceController';
import { useApp } from '../store';

interface VoiceContextValue {
  isSupported: boolean;
  voiceState: VoiceState;
  transcript: string;
  feedbackNotice: string | null;
  settings: VoiceSettings;
  isMuted: boolean;
  waveformData: number[];
  pendingConfirmation: ConsequentialActionRequest | null;
  isHelpOpen: boolean;
  isSettingsOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  toggleContinuous: () => void;
  toggleMute: () => void;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  confirmAction: () => void;
  cancelAction: () => void;
  executeSampleCommand: (command: string) => void;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

export const VoiceProvider: React.FC<{
  children: React.ReactNode;
  onNavigateTab?: (tab: string) => void;
  onOpenSOSModal?: () => void;
  onOpenGeminiModal?: (initialQuery?: string) => void;
  onOpenLiveVoiceModal?: () => void;
  onOpenTourModal?: () => void;
  onOpenSystemTestModal?: () => void;
  onCloseAllModals?: () => void;
}> = ({
  children,
  onNavigateTab,
  onOpenSOSModal,
  onOpenGeminiModal,
  onOpenLiveVoiceModal,
  onOpenTourModal,
  onOpenSystemTestModal,
  onCloseAllModals
}) => {
  const {
    switchRole,
    appointments,
    labOrders,
    medicines,
    cancelAppointment,
    selectedLanguage
  } = useApp();

  const [voiceState, setVoiceState] = useState<VoiceState>(globalVoiceController.getState());
  const [transcript, setTranscript] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>(globalVoiceController.getSettings());
  const [isMuted, setIsMuted] = useState<boolean>(globalVoiceController.getIsMuted());
  const [pendingConfirmation, setPendingConfirmation] = useState<ConsequentialActionRequest | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Synchronize language from store
  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== settings.language) {
      globalVoiceController.saveSettings({ language: selectedLanguage });
      setSettings(globalVoiceController.getSettings());
    }
  }, [selectedLanguage]);

  // Bind execution context so VoiceController can manipulate application state
  useEffect(() => {
    globalVoiceController.setExecutionContext({
      navigateTab: tab => {
        if (onNavigateTab) onNavigateTab(tab);
      },
      switchRole: role => {
        switchRole(role as any);
      },
      openModal: (modal, initialQuery) => {
        if (modal === 'SOS' && onOpenSOSModal) onOpenSOSModal();
        else if (modal === 'GEMINI' && onOpenGeminiModal) onOpenGeminiModal(initialQuery);
        else if (modal === 'LIVE_VOICE' && onOpenLiveVoiceModal) onOpenLiveVoiceModal();
        else if (modal === 'TOUR' && onOpenTourModal) onOpenTourModal();
        else if (modal === 'SYSTEM_TEST' && onOpenSystemTestModal) onOpenSystemTestModal();
        else if (modal === 'HELP') setIsHelpOpen(true);
        else if (modal === 'SETTINGS') setIsSettingsOpen(true);
      },
      closeModals: () => {
        if (onCloseAllModals) onCloseAllModals();
        setIsHelpOpen(false);
        setIsSettingsOpen(false);
      },
      cancelAppointment: id => {
        cancelAppointment(id);
      },
      getAppointments: () => appointments,
      getLabOrders: () => labOrders,
      getMedicines: () => medicines,
      synthesizer: (globalVoiceController as any).synthesizer,
      requestConfirmation: (title, description, onConfirm, onCancel) => {
        setPendingConfirmation({
          id: Math.random().toString(36).substring(7),
          type: 'CONFIRM',
          title,
          description,
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
          onConfirm,
          onCancel
        });
      }
    });
  }, [
    onNavigateTab,
    onOpenSOSModal,
    onOpenGeminiModal,
    onOpenLiveVoiceModal,
    onOpenTourModal,
    onOpenSystemTestModal,
    onCloseAllModals,
    switchRole,
    appointments,
    labOrders,
    medicines,
    cancelAppointment
  ]);

  // Subscribe to controller events
  useEffect(() => {
    const unsubState = globalVoiceController.onStateChange(st => {
      setVoiceState(st);
    });

    const unsubTranscript = globalVoiceController.onTranscript((text, isFinal) => {
      setTranscript(text);
      if (isFinal) {
        setTimeout(() => setTranscript(''), 3000);
      }
    });

    const unsubFeedback = globalVoiceController.onFeedback(notice => {
      setFeedbackNotice(notice);
      setTimeout(() => setFeedbackNotice(null), 5000);
    });

    const unsubConfirmation = globalVoiceController.onConfirmation(req => {
      setPendingConfirmation(req);
    });

    // Waveform poll animation loop
    let animFrame: number;
    const pollWaveform = () => {
      if (globalVoiceController.getState() === 'LISTENING') {
        setWaveformData(globalVoiceController.getWaveformData());
      }
      animFrame = requestAnimationFrame(pollWaveform);
    };
    animFrame = requestAnimationFrame(pollWaveform);

    return () => {
      unsubState();
      unsubTranscript();
      unsubFeedback();
      unsubConfirmation();
      cancelAnimationFrame(animFrame);
    };
  }, []);

  const toggleListening = useCallback(() => {
    globalVoiceController.toggleListening();
  }, []);

  const startListening = useCallback(() => {
    globalVoiceController.start();
  }, []);

  const stopListening = useCallback(() => {
    globalVoiceController.stop();
  }, []);

  const toggleContinuous = useCallback(() => {
    const next = !settings.continuousListening;
    globalVoiceController.setContinuous(next);
    setSettings(globalVoiceController.getSettings());
  }, [settings.continuousListening]);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    globalVoiceController.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    globalVoiceController.saveSettings(newSettings);
    setSettings(globalVoiceController.getSettings());
  }, []);

  const confirmAction = useCallback(() => {
    globalVoiceController.confirmPendingAction();
  }, []);

  const cancelAction = useCallback(() => {
    globalVoiceController.cancelPendingAction();
  }, []);

  const executeSampleCommand = useCallback((cmd: string) => {
    setTranscript(cmd);
    globalVoiceController.handleFinalTranscript(cmd);
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        isSupported: globalVoiceController.isSupported(),
        voiceState,
        transcript,
        feedbackNotice,
        settings,
        isMuted,
        waveformData,
        pendingConfirmation,
        isHelpOpen,
        isSettingsOpen,
        setIsHelpOpen,
        setIsSettingsOpen,
        toggleListening,
        startListening,
        stopListening,
        toggleContinuous,
        toggleMute,
        updateSettings,
        confirmAction,
        cancelAction,
        executeSampleCommand
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextValue => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
