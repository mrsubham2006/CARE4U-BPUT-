/**
 * Client-Side Gemini Service Bridge
 * Communicates strictly through full-stack backend endpoints (/api/gemini/*)
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export type GeminiModelChoice =
  | 'gemini-3.5-flash'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite';

export async function callGeminiChat(
  messages: ChatMessage[],
  systemInstruction?: string,
  model: GeminiModelChoice = 'gemini-3.5-flash'
): Promise<{ reply: string; modelUsed: string }> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemInstruction, model })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to contact AI service' }));
    throw new Error(err.error || `AI Chat request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function callGeminiTranscribe(
  audioBase64: string,
  mimeType: string = 'audio/webm',
  languageHint?: string
): Promise<{ transcript: string; modelUsed: string }> {
  const response = await fetch('/api/gemini/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioData: audioBase64, mimeType, languageHint })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Audio transcription failed' }));
    throw new Error(err.error || `Transcription failed with status ${response.status}`);
  }

  return await response.json();
}

export async function callGeminiMapsGrounding(
  query: string,
  location?: string,
  facilityType?: string,
  specialty?: string
): Promise<{ text: string; groundingMetadata?: any; modelUsed: string }> {
  const response = await fetch('/api/gemini/maps-grounding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, location, facilityType, specialty })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Maps search failed' }));
    throw new Error(err.error || `Maps Grounding request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function callGeminiVoiceConversation(
  userAudioOrText: string,
  conversationHistory: { role: 'user' | 'model'; text: string }[] = []
): Promise<{ voiceResponse: string; modelUsed: string }> {
  const response = await fetch('/api/gemini/voice-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAudioOrText, conversationHistory })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Voice conversation failed' }));
    throw new Error(err.error || `Voice request failed with status ${response.status}`);
  }

  return await response.json();
}
