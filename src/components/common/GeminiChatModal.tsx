import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  X,
  Copy,
  Check,
  Mic,
  MicOff,
  Stethoscope,
  Pill,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Compass,
  Building2,
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';
import { callGeminiChat, callGeminiTranscribe, GeminiModelChoice, ChatMessage } from '../../services/geminiService';
import { useApp } from '../../services/store';
import { voiceCommandService } from '../../services/voiceCommandService';
import { getWebsiteKnowledgeAnswer, CARE4U_SYSTEM_PROMPT, WebsiteActionTag } from '../../services/websiteKnowledgeService';

export interface ChatMessageWithActions extends ChatMessage {
  actions?: WebsiteActionTag[];
  isFallback?: boolean;
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'PLATFORM_GUIDE' | 'TRIAGE' | 'PHARMACY' | 'ABDM' | 'EMERGENCY';
  initialQuery?: string;
}

const ROLES_CONFIG = {
  PLATFORM_GUIDE: {
    title: 'CARE4U Copilot & Guide',
    icon: <Compass className="w-4 h-4 text-teal-400" />,
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    systemInstruction: CARE4U_SYSTEM_PROMPT
  },
  TRIAGE: {
    title: 'Clinical Triage Doctor',
    icon: <Stethoscope className="w-4 h-4 text-emerald-400" />,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    systemInstruction: `You are CARE4U Clinical Triage Doctor AI. Analyze user symptoms, categorize severity (Green/Yellow/Red-Flag), provide differential explanations, home care advice, and recommend whether to visit a Primary Health Centre (PHC) or District Hospital.`
  },
  PHARMACY: {
    title: 'Pharmacist & Drug Safety',
    icon: <Pill className="w-4 h-4 text-amber-400" />,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    systemInstruction: `You are CARE4U Drug & Pharmacy Safety AI. Explain medication dosages, drug-drug interactions, common side effects, storage guidelines, and generic alternatives available under PMBJP (Jan Aushadhi) schemes in India.`
  },
  ABDM: {
    title: 'ABDM Health Records Guide',
    icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    systemInstruction: `You are CARE4U ABDM Consent & Health ID Advisor. Guide patients and healthcare workers on creating ABHA IDs, granting electronic consent tokens, managing HIP/HIU record links, and data privacy policies under Indian healthcare law.`
  },
  EMERGENCY: {
    title: 'Emergency First-Aid Responder',
    icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    systemInstruction: `You are CARE4U Emergency First-Aid Assistant. Provide immediate, bulleted step-by-step first-aid instructions for trauma, burns, cardiac symptoms, snakebites, or poisoning while advising the user to immediately summon 108/102 emergency ambulance services.`
  }
};

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'PLATFORM_GUIDE',
  initialQuery
}) => {
  const { selectedLanguage } = useApp();

  const [activeRoleKey, setActiveRoleKey] = useState<'PLATFORM_GUIDE' | 'TRIAGE' | 'PHARMACY' | 'ABDM' | 'EMERGENCY'>(initialRole);
  const [selectedModel, setSelectedModel] = useState<GeminiModelChoice>('gemini-3.5-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageWithActions[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **CARE4U NEXUS AI Copilot & Healthcare Guide**.
I know this entire platform inside and out. Ask me anything about appointments, medicine schedules, the 8 user portals, emergency ambulance dispatch, or voice commands!`,
      actions: [
        { type: 'NAVIGATE_TAB', payload: 'AI_INTAKE', label: '✨ AI Symptom Intake' },
        { type: 'NAVIGATE_TAB', payload: 'MY_APPOINTMENTS', label: '📅 Consultations' },
        { type: 'NAVIGATE_TAB', payload: 'MEDICINES_SCHEDULE', label: '💊 Medicine Schedule' },
        { type: 'TRIGGER_SOS', label: '🚨 Emergency 108 SOS' },
        { type: 'SWITCH_ROLE', payload: 'DOCTOR', label: '🩺 Doctor Portal' }
      ]
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasSentInitialRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && initialQuery && hasSentInitialRef.current !== initialQuery) {
      hasSentInitialRef.current = initialQuery;
      handleSendMessage(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const currentRole = ROLES_CONFIG[activeRoleKey];

  const handleExecuteAction = (action: WebsiteActionTag) => {
    if (action.type === 'NAVIGATE_TAB') {
      voiceCommandService.dispatchAction({
        type: 'NAVIGATE_TAB',
        payload: action.payload,
        label: action.label,
        feedbackText: {
          en: `Navigating to ${action.label}`,
          hi: 'नेविगेट किया जा रहा है',
          or: 'ଯାଉଛି',
          mr: 'जात आहे',
          bn: 'যাওয়া হচ্ছে',
          te: 'వెళ్తోంది',
          ta: 'செல்கிறது',
          kn: 'ಹೋಗುತ್ತಿದೆ',
          gu: 'જઈ રહ્યા છીએ',
          pa: 'ਜਾ ਰਹੇ ਹਾਂ',
          ml: 'പോകുന്നു'
        }
      });
      onClose();
    } else if (action.type === 'SWITCH_ROLE') {
      voiceCommandService.dispatchAction({
        type: 'SWITCH_ROLE',
        payload: action.payload as any,
        label: action.label,
        feedbackText: {
          en: `Switching workspace to ${action.label}`,
          hi: 'पोर्टल बदला जा रहा है',
          or: 'ପୋର୍ଟାଲ୍ ବଦଳାଯାଉଛି',
          mr: 'पोर्टल बदलत आहे',
          bn: 'পোর্টাল পরিবর্তন করা হচ্ছে',
          te: 'పోర్టల్ మారుతోంది',
          ta: 'போர்டல் மாறுகிறது',
          kn: 'ಪೋರ್ಟಲ್ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ',
          gu: 'પોર્ટલ બદલાઈ રહ્યું છે',
          pa: 'ਪੋਰਟਲ ਬਦਲਿਆ ਜਾ ਰਿਹਾ ਹੈ',
          ml: 'പോർട്ടൽ മാറുന്നു'
        }
      });
      onClose();
    } else if (action.type === 'TRIGGER_SOS') {
      voiceCommandService.dispatchAction({
        type: 'TRIGGER_EMERGENCY_SOS',
        label: '108 Emergency Ambulance',
        feedbackText: {
          en: '108 Emergency ambulance dispatch initiated.',
          hi: '108 आपातकालीन सेवा',
          or: '୧୦୮ ଜରୁରୀକାଳୀନ ସେବା',
          mr: '१०८ आपत्कालीन सेवा',
          bn: '১০৮ জরুরি সেবা',
          te: '108 అత్యవసర సేవ',
          ta: '108 அவசர சேவை',
          kn: '108 ತುರ್ತು ಸೇವೆ',
          gu: '108 કટોકટી સેવા',
          pa: '108 ਐਮਰਜੈਂਸੀ ਸੇਵਾ',
          ml: '108 അടിയന്തര സേവനം'
        }
      });
      onClose();
    } else if (action.type === 'OPEN_TOUR') {
      voiceCommandService.dispatchAction({
        type: 'OPEN_MODAL',
        payload: 'TOUR',
        label: 'Platform Tour',
        feedbackText: {
          en: 'Opening Interactive Tour Guide',
          hi: 'टूर गाइड खोला जा रहा है',
          or: 'ଇଣ୍ଟରାକ୍ଟିଭ୍ ଗାଇଡ୍ ଖୋଲାଯାଉଛି',
          mr: 'मार्गदर्शक सुरू केला आहे',
          bn: 'ট্যুর গাইড',
          te: 'టూర్ గైడ్',
          ta: 'டூர் கைடு',
          kn: 'ಟೂರ್ ಗೈಡ್',
          gu: 'ટૂર માર્ગદર્શિકા',
          pa: 'ਟੂਰ ਗਾਈਡ',
          ml: 'ടൂർ ഗൈഡ്'
        }
      });
      onClose();
    } else if (action.type === 'OPEN_SYSTEM_TEST') {
      voiceCommandService.dispatchAction({
        type: 'OPEN_MODAL',
        payload: 'SYSTEM_TEST',
        label: 'System Diagnostic',
        feedbackText: {
          en: 'Running 20-Point System Diagnostics',
          hi: 'सिस्टम डायग्नोस्टिक शुरू',
          or: 'ସିଷ୍ଟମ୍ ନିଦାନ ଆରମ୍ଭ',
          mr: 'प्रणाली चाचणी सुरू',
          bn: 'সিস্টেম পরীক্ষা',
          te: 'సిస్టమ్ పరీక్ష',
          ta: 'கணினி சோதனை',
          kn: 'ಸಿಸ್ಟಮ್ ಪರೀಕ್ಷೆ',
          gu: 'સિસ્ટમ તપાસ',
          pa: 'ਸਿਸਟਮ ਜਾਂਚ',
          ml: 'സിസ്റ്റം പരിശോധന'
        }
      });
      onClose();
    } else if (action.type === 'SET_LANGUAGE') {
      voiceCommandService.dispatchAction({
        type: 'SET_LANGUAGE',
        payload: action.payload,
        label: action.label,
        feedbackText: {
          en: `Language changed to ${action.label}`,
          hi: 'भाषा बदल दी गई',
          or: 'ଭାଷା ବଦଳାଗଲା',
          mr: 'भाषा बदलली',
          bn: 'ভাষা পরিবর্তন করা হয়েছে',
          te: 'భాష మార్చబడింది',
          ta: 'மொழி மாற்றப்பட்டது',
          kn: 'ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ',
          gu: 'ભાષા બદલાઈ',
          pa: 'ਭਾਸ਼ਾ ਬਦਲੀ ਗਈ',
          ml: 'ഭാഷ മാറ്റി'
        }
      });
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const newMessages: ChatMessageWithActions[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    // 1. Try Gemini API First
    try {
      const res = await callGeminiChat(
        newMessages.map(({ role, content }) => ({ role, content })),
        currentRole.systemInstruction,
        selectedModel
      );

      // Check if query is also related to platform features so we can offer direct buttons
      const knowledge = getWebsiteKnowledgeAnswer(textToSend, selectedLanguage);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          actions: knowledge.suggestedActions
        }
      ]);
    } catch (err: any) {
      // 2. Intelligent Resilient Fallback to Built-in CARE4U Website Knowledge Engine
      const knowledge = getWebsiteKnowledgeAnswer(textToSend, selectedLanguage);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: knowledge.reply,
          actions: knowledge.suggestedActions,
          isFallback: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const tr = await callGeminiTranscribe(base64, 'audio/webm');
            if (tr.transcript) {
              setInputMessage((prev) => (prev ? `${prev} ${tr.transcript}` : tr.transcript));
            }
          } catch (e: any) {
            console.error('Transcription error:', e);
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
    }
  };

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation reset. Switched to **${currentRole.title}** powered by \`${selectedModel}\`. How can I help you?`,
        actions: [
          { type: 'NAVIGATE_TAB', payload: 'AI_INTAKE', label: '✨ AI Symptom Intake' },
          { type: 'NAVIGATE_TAB', payload: 'MY_APPOINTMENTS', label: '📅 Consultations' },
          { type: 'NAVIGATE_TAB', payload: 'MEDICINES_SCHEDULE', label: '💊 Medicine Schedule' },
          { type: 'TRIGGER_SOS', label: '🚨 Emergency 108 SOS' },
          { type: 'SWITCH_ROLE', payload: 'DOCTOR', label: '🩺 Doctor Portal' }
        ]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">CARE4U NEXUS AI Copilot</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentRole.badgeColor}`}>
                  {currentRole.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Platform Navigator & Clinical Intelligence Copilot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModelChoice)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              </select>
            </div>

            <button
              onClick={clearChat}
              title="Reset Conversation"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Specialized Roles Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider shrink-0 font-mono">Expertise:</span>
          {(Object.keys(ROLES_CONFIG) as (keyof typeof ROLES_CONFIG)[]).map((key) => {
            const role = ROLES_CONFIG[key];
            const isActive = activeRoleKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveRoleKey(key);
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: 'assistant',
                      content: `Mode switched to **${role.title}**. Ask me any question related to this area!`
                    }
                  ]);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {role.icon}
                <span>{role.title}</span>
              </button>
            );
          })}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[95%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-slate-950 shadow-md'
                      : 'bg-slate-800 border border-slate-700 text-teal-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                    isUser
                      ? 'bg-teal-600/90 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Interactive Action Navigation Buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleExecuteAction(act)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-950/80 to-slate-900 hover:from-teal-900/90 hover:to-slate-800 border border-teal-500/40 hover:border-teal-400 text-teal-200 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 group"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-teal-400 group-hover:translate-x-0.5 transition" />
                        </button>
                      ))}
                    </div>
                  )}

                  {!isUser && (
                    <button
                      onClick={() => copyMessage(m.content, idx)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-teal-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 rounded-tl-none flex items-center gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span>AI Copilot is analyzing and retrieving platform guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-500 font-mono">Suggested:</span>
          <button
            onClick={() => handleSendMessage('How do I book an appointment on this website?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0 cursor-pointer"
          >
            📅 How to book appointment
          </button>
          <button
            onClick={() => handleSendMessage('Where is my medicine schedule and how do I mark it as taken?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0 cursor-pointer"
          >
            💊 Medicine schedule guide
          </button>
          <button
            onClick={() => handleSendMessage('How does the Doctor Clinician Portal work?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0 cursor-pointer"
          >
            🩺 Doctor Portal
          </button>
          <button
            onClick={() => handleSendMessage('What does the ASHA Field Worker portal do?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0 cursor-pointer"
          >
            🌾 ASHA Portal
          </button>
          <button
            onClick={() => handleSendMessage('How do I use voice commands in Odia or Hindi?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0 cursor-pointer"
          >
            🎙️ Voice commands help
          </button>
          <button
            onClick={() => handleSendMessage('How do I call a 108 emergency ambulance?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-rose-300 border border-rose-500/30 transition shrink-0 cursor-pointer"
          >
            🚨 108 Emergency SOS
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isRecording
                    ? 'Listening to audio note...'
                    : isTranscribing
                    ? 'Transcribing speech with AI...'
                    : `Ask CARE4U Copilot about features, workflows, or medical triage...`
                }
                disabled={isLoading || isRecording || isTranscribing}
                className="w-full bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none pr-12"
              />

              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                disabled={isLoading || isTranscribing}
                title={isRecording ? 'Stop Recording' : 'Speak to AI'}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition cursor-pointer ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    : 'text-slate-400 hover:text-teal-400'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 sm:px-5 sm:py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 rounded-2xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-teal-500/20"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Send</span>
            </button>
          </form>

          <p className="text-[10px] text-slate-500 text-center mt-2 font-mono">
            Powered by Gemini AI • CARE4U Platform Intelligence • ABDM FHIR Standards
          </p>
        </div>
      </div>
    </div>
  );
};
