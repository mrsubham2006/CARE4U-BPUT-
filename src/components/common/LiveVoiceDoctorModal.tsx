import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  RefreshCw,
  Activity,
  PhoneCall,
  PhoneOff,
  MessageSquare
} from 'lucide-react';
import { callGeminiVoiceConversation, callGeminiTranscribe } from '../../services/geminiService';

interface LiveVoiceDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VoiceTurn {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const LiveVoiceDoctorModal: React.FC<LiveVoiceDoctorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isActiveCall, setIsActiveCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(16).fill(10));
  const [history, setHistory] = useState<VoiceTurn[]>([
    {
      sender: 'ai',
      text: 'Namaste! I am your CARE4U NEXUS Live Voice Doctor powered by gemini-3.8-live. Tell me about any symptoms or medical questions you have.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const endCall = React.useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsActiveCall(false);
    setIsListening(false);
    setIsAiSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  const startCall = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio analysis for real-time waveform
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const updateWaveform = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const sampleSlice = Array.from(dataArray.slice(0, 16)).map((v) =>
            Math.max(8, (v / 255) * 60)
          );
          setAudioLevel(sampleSlice);
        }
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      setIsActiveCall(true);
      startListeningLoop(stream);
    } catch (err: any) {
      console.error('Call start error:', err);
      setErrorMessage('Microphone permission denied. Please allow microphone access to talk to the Live Voice Doctor.');
    }
  };

  const startListeningLoop = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processUserSpeech(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error('Recording loop error:', err);
    }
  };

  const stopCurrentRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processUserSpeech = async (blob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        // Step 1: Transcribe using Gemini 3.5
        const tr = await callGeminiTranscribe(base64, 'audio/webm');
        const userText = tr.transcript;
        if (!userText || userText.trim().length === 0) {
          // Re-listen if silence
          if (streamRef.current && streamRef.current.active) {
            startListeningLoop(streamRef.current);
          }
          return;
        }

        const newTurn: VoiceTurn = {
          sender: 'user',
          text: userText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory((prev) => [...prev, newTurn]);

        // Step 2: Live Doctor Voice reasoning (gemini-3.8-live)
        setIsAiSpeaking(true);
        const voiceRes = await callGeminiVoiceConversation(
          userText,
          history.map((h) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            text: h.text
          }))
        );

        const aiResponseText = voiceRes.voiceResponse;
        setHistory((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: aiResponseText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        // Step 3: Speak response using Web Speech Synthesis
        if (!isAudioMuted && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(aiResponseText);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.onend = () => {
            setIsAiSpeaking(false);
            if (streamRef.current && streamRef.current.active) {
              startListeningLoop(streamRef.current);
            }
          };
          utterance.onerror = () => {
            setIsAiSpeaking(false);
            if (streamRef.current && streamRef.current.active) {
              startListeningLoop(streamRef.current);
            }
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setIsAiSpeaking(false);
          if (streamRef.current && streamRef.current.active) {
            startListeningLoop(streamRef.current);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error processing live voice conversation.');
        setIsAiSpeaking(false);
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-teal-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">Live Voice Doctor</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Natural bidirectional speech consultation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
            </button>
            <button
              onClick={() => {
                endCall();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Visualizer Stage */}
        <div className="p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center border-b border-slate-800 text-center">
          {/* Pulsing Avatar / Waves */}
          <div className="relative my-4">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                isAiSpeaking
                  ? 'bg-purple-500/30 border-2 border-purple-400 shadow-xl shadow-purple-500/30 scale-105'
                  : isListening
                  ? 'bg-teal-500/30 border-2 border-teal-400 shadow-xl shadow-teal-500/30 animate-pulse'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <Activity
                className={`w-12 h-12 transition-all ${
                  isAiSpeaking ? 'text-purple-300 animate-bounce' : isListening ? 'text-teal-400' : 'text-slate-500'
                }`}
              />
            </div>
          </div>

          {/* Status Label */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {isAiSpeaking
                ? 'AI Doctor Speaking...'
                : isListening
                ? 'Listening to your voice...'
                : isActiveCall
                ? 'Voice channel connected'
                : 'Ready for Live Voice Consultation'}
            </h4>
            <p className="text-xs text-slate-400">
              {isActiveCall
                ? 'Speak naturally. Gemini will respond with real-time audio.'
                : 'Click "Start Voice Call" to talk hands-free.'}
            </p>
          </div>

          {/* Waveform Bars */}
          {isActiveCall && (
            <div className="flex items-end justify-center gap-1.5 h-14 mt-4">
              {audioLevel.map((lvl, i) => (
                <div
                  key={i}
                  style={{ height: `${lvl}px` }}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isAiSpeaking
                      ? 'bg-purple-400'
                      : isListening
                      ? 'bg-teal-400'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center gap-3 mt-6">
            {!isActiveCall ? (
              <button
                onClick={startCall}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start Voice Call</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {isListening ? (
                  <button
                    onClick={stopCurrentRecording}
                    className="px-4 py-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Done Speaking (Send)</span>
                  </button>
                ) : null}

                <button
                  onClick={endCall}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Consultation</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div className="p-4 bg-slate-950 flex-1 max-h-56 overflow-y-auto space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
            <span>LIVE CAPTIONS & RECORD</span>
          </div>

          {history.map((turn, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                turn.sender === 'user'
                  ? 'bg-teal-950/60 border border-teal-500/30 text-teal-100 ml-8'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 mr-8'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-bold uppercase font-mono">
                  {turn.sender === 'user' ? '👤 You' : '🤖 Live Doctor AI'}
                </span>
                <span>{turn.time}</span>
              </div>
              <p>{turn.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
