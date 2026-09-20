import React, { useState, useRef } from 'react';
import { Mic, MicOff, RefreshCw, Volume2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { callGeminiTranscribe } from '../../services/geminiService';

interface AudioTranscriberProps {
  onTranscriptComplete?: (text: string) => void;
  languageHint?: string;
  placeholder?: string;
  className?: string;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscriptComplete,
  languageHint,
  placeholder = 'Record speech to transcribe with Gemini 3.5 Transcribe...',
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioTranscription(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setError('Microphone access was denied or is not supported in this browser.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processAudioTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
          const res = await callGeminiTranscribe(base64Audio, 'audio/webm', languageHint);
          const text = res.transcript || '';
          setTranscript(text);
          if (onTranscriptComplete) {
            onTranscriptComplete(text);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to transcribe audio with Gemini 3.5 Transcribe.');
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err: any) {
      setError(err.message || 'Error processing audio file.');
      setIsTranscribing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyTranscript = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Gemini 3.5 Transcribe</h4>
            <p className="text-[10px] text-slate-400">High-precision multilingual speech-to-text</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse transition cursor-pointer"
            >
              <MicOff className="w-3.5 h-3.5" />
              <span>Stop ({formatDuration(recordingDuration)})</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={isTranscribing}
              className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record Voice</span>
            </button>
          )}
        </div>
      </div>

      {isTranscribing && (
        <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-2 text-xs text-teal-300">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-teal-400" />
          <span>Gemini 3.5 Transcribe is processing your voice audio in real-time...</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {transcript ? (
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
            {transcript}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={copyTranscript}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3 h-3 text-teal-400" /> : null}
              <span>{copied ? 'Copied!' : 'Copy Transcript'}</span>
            </button>
          </div>
        </div>
      ) : !isTranscribing && !isRecording ? (
        <p className="text-[11px] text-slate-500 italic">{placeholder}</p>
      ) : null}
    </div>
  );
};
