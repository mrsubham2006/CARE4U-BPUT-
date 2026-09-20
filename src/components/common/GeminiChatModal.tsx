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
  ChevronDown
} from 'lucide-react';
import { callGeminiChat, callGeminiTranscribe, GeminiModelChoice, ChatMessage } from '../../services/geminiService';

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'TRIAGE' | 'PHARMACY' | 'ABDM' | 'EMERGENCY';
}

const ROLES_CONFIG = {
  TRIAGE: {
    title: 'Clinical Triage Doctor',
    icon: <Stethoscope className="w-4 h-4 text-teal-400" />,
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    systemInstruction: `You are CARE4U Clinical Triage Doctor AI. Analyze user symptoms, categorize severity (Green/Yellow/Red-Flag), provide differential explanations, home care advice, and recommend whether to visit a Primary Health Centre (PHC) or District Hospital.`
  },
  PHARMACY: {
    title: 'Pharmacist & Drug Safety Specialist',
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
  initialRole = 'TRIAGE'
}) => {
  const [activeRoleKey, setActiveRoleKey] = useState<'TRIAGE' | 'PHARMACY' | 'ABDM' | 'EMERGENCY'>(initialRole);
  const [selectedModel, setSelectedModel] = useState<GeminiModelChoice>('gemini-3.5-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **CARE4U NEXUS AI Healthcare Assistant**. How can I assist you with clinical triage, medication guidance, or healthcare coordination today?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const currentRole = ROLES_CONFIG[activeRoleKey];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await callGeminiChat(
        newMessages,
        currentRole.systemInstruction,
        selectedModel
      );

      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **AI Service Notice**: ${err.message || 'Unable to connect to Gemini API. Please ensure your GEMINI_API_KEY is configured in Settings.'}`
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
        content: `Conversation reset. Switched to **${currentRole.title}** powered by \`${selectedModel}\`. How can I help you?`
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">Gemini Healthcare Assistant</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentRole.badgeColor}`}>
                  {currentRole.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Multi-turn medical intelligence & coordination</p>
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
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider shrink-0 font-mono">Role:</span>
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
                      content: `Switched mode to **${role.title}**. ${role.systemInstruction.slice(0, 100)}...`
                    }
                  ]);
                }}
                className={`px-3 py-1 rounded-xl font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
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
                className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${
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
                <span>Gemini is generating clinical reasoning response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-500 font-mono">Suggested:</span>
          <button
            onClick={() => handleSendMessage('What are emergency red-flag symptoms for acute chest pain or fever in kids?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0"
          >
            🚨 Emergency Red Flags
          </button>
          <button
            onClick={() => handleSendMessage('How do I link and view my health records with ABDM ABHA ID?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0"
          >
            🪪 ABDM ABHA ID Link
          </button>
          <button
            onClick={() => handleSendMessage('Check drug interactions between Paracetamol and Ibuprofen.')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0"
          >
            💊 Drug Interactions
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              disabled={isLoading || isTranscribing}
              title={isRecording ? 'Stop recording' : 'Speak using Gemini 3.5 Transcribe'}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg'
                  : 'bg-slate-800 hover:bg-slate-700 text-teal-400'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isTranscribing
                  ? 'Transcribing voice input...'
                  : isRecording
                  ? 'Listening... Click mic to stop.'
                  : `Ask ${currentRole.title} (${selectedModel})...`
              }
              disabled={isLoading || isRecording}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 transition"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || isRecording}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
