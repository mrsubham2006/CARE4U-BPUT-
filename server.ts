import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

// Initialize Google GenAI SDK (Server-Side only)
let cachedKey: string | undefined = undefined;
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add your Gemini API key in the AI Studio Settings / Secrets panel.');
  }
  if (!ai || cachedKey !== apiKey) {
    cachedKey = apiKey;
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

function formatGeminiErrorMessage(error: any): string {
  const message = error?.message || String(error);
  if (message.includes('reported as leaked') || message.includes('PERMISSION_DENIED')) {
    return 'Your Gemini API key was reported as leaked and revoked by Google security. Please create a new Gemini API Key at https://aistudio.google.com/app/apikey and update GEMINI_API_KEY in the AI Studio Settings / Secrets panel.';
  }
  if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
    return 'Invalid Gemini API key. Please check that GEMINI_API_KEY is correctly set in your AI Studio Settings / Secrets panel.';
  }
  if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
    return 'Gemini API quota exceeded or rate limited. Please try again in a few moments.';
  }
  return message || 'An unexpected error occurred while communicating with Gemini AI.';
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing with increased limit for audio uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ==========================================
  // 1. HEALTH CHECK
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CARE4U NEXUS Backend Engine',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // 2. GEMINI MULTI-TURN CHATBOT (gemini-3.5-flash / gemini-3.1-pro-preview / gemini-3.1-flash-lite)
  // ==========================================
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, systemInstruction, model, role = 'PATIENT' } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      // Model selection based on user requirements:
      // gemini-3.1-pro-preview for complex, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast
      const selectedModel = model || 'gemini-3.5-flash';

      const defaultSystemInstruction =
        systemInstruction ||
        `You are CARE4U NEXUS AI, an expert medical and healthcare coordinator assistant in India.
Your mission is to provide clear, empathetic, clinically structured health guidance, symptom analysis, ABDM consent advice, and triage recommendations.
Always include appropriate medical disclaimers and urge urgent facility care for emergency red-flag symptoms.`;

      // Format contents for @google/genai SDK
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: defaultSystemInstruction,
          temperature: 0.4,
          maxOutputTokens: 1500
        }
      });

      const replyText = response.text || 'I could not generate a response at this moment.';
      res.json({
        reply: replyText,
        modelUsed: selectedModel,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Gemini Chat API Error:', error);
      const userMessage = formatGeminiErrorMessage(error);
      res.status(500).json({
        error: userMessage
      });
    }
  });

  // ==========================================
  // 3. AUDIO TRANSCRIPTION (gemini-3.5-transcribe)
  // ==========================================
  app.post('/api/gemini/transcribe', async (req, res) => {
    try {
      const { audioData, mimeType = 'audio/webm', languageHint } = req.body;

      if (!audioData) {
        return res.status(400).json({ error: 'Audio data is required (base64 encoded).' });
      }

      // Clean base64 string
      const base64Data = audioData.includes('base64,')
        ? audioData.split('base64,')[1]
        : audioData;

      const client = getGeminiClient();

      const promptText = languageHint
        ? `Transcribe this speech accurately in ${languageHint}. If medical terms or symptoms are spoken in Indian languages (Hindi, Marathi, English), transcribe accurately.`
        : 'Transcribe this medical symptom or clinical audio note accurately. Detect spoken language automatically (English, Hindi, Marathi, Bengali, Tamil, Telugu).';

      const response = await client.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            },
            {
              text: promptText
            }
          ]
        }
      });

      const transcript = response.text || '';
      res.json({
        transcript,
        modelUsed: 'gemini-3.5-transcribe',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Gemini Transcribe API Error:', error);
      const userMessage = formatGeminiErrorMessage(error);
      res.status(500).json({
        error: userMessage
      });
    }
  });

  // ==========================================
  // 4. MAPS GROUNDING HEALTHCARE LOCATOR (gemini-3.5-flash with googleMaps tool)
  // ==========================================
  app.post('/api/gemini/maps-grounding', async (req, res) => {
    try {
      const { query, location, specialty, facilityType } = req.body;

      const locationStr = location || 'Maharashtra, India';
      const promptQuery = query || `Find nearest available ${facilityType || 'hospitals and diagnostic centers'} specializing in ${specialty || 'General Medicine'} near ${locationStr}. Include address, operating hours, and emergency facilities.`;

      const client = getGeminiClient();

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptQuery,
        config: {
          tools: [{ googleMaps: {} }],
          systemInstruction: `You are the CARE4U NEXUS Geographic Health Navigator. Use Google Maps data to locate authentic, nearby hospitals, clinics, 24/7 pharmacies, and diagnostic laboratories. Provide exact names, locations, contact info, and availability details.`
        }
      });

      // Extract grounding metadata if provided
      const groundingMetadata = (response as any)?.candidates?.[0]?.groundingMetadata;

      res.json({
        text: response.text || '',
        groundingMetadata: groundingMetadata || null,
        modelUsed: 'gemini-3.5-flash',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Gemini Maps Grounding API Error:', error);
      const userMessage = formatGeminiErrorMessage(error);
      res.status(500).json({
        error: userMessage
      });
    }
  });

  // ==========================================
  // 5. REAL-TIME VOICE ASSISTANT (gemini-3.8-live / Live Audio)
  // ==========================================
  app.post('/api/gemini/voice-conversation', async (req, res) => {
    try {
      const { userAudioOrText, mode = 'TEXT_TO_SPEECH', conversationHistory = [] } = req.body;

      const client = getGeminiClient();

      // Use gemini-3.8-live for live conversational health responses
      const prompt = typeof userAudioOrText === 'string'
        ? userAudioOrText
        : 'Patient is speaking during a real-time consultation. Provide a supportive, direct medical response.';

      const response = await client.models.generateContent({
        model: 'gemini-3.8-live',
        contents: [
          ...conversationHistory.map((h: any) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text }]
          })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: `You are CARE4U Live Voice Doctor AI. Respond concisely in a warm, conversational, reassuring tone suitable for spoken dialogue. Keep sentences short and clear.`
        }
      });

      res.json({
        voiceResponse: response.text || '',
        modelUsed: 'gemini-3.8-live',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Gemini Live Voice Error:', error);
      const userMessage = formatGeminiErrorMessage(error);
      res.status(500).json({
        error: userMessage
      });
    }
  });

  // ==========================================
  // 6. VITE MIDDLEWARE (Dev) / STATIC (Prod)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CARE4U NEXUS full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
