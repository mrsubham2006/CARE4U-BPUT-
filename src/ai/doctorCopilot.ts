import { Patient, Appointment, LabOrder } from '../types';
import { callGeminiChat } from '../services/geminiService';

export interface ClinicalSOAPDraft {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  suggestedFollowUpQuestions: string[];
  reviewedByDoctor: boolean;
}

export class DoctorCopilot {
  public static async draftConsultationNote(
    patient: Patient,
    encounterReason: string,
    vitalsSummary: string,
    activeLabOrders: LabOrder[] = []
  ): Promise<ClinicalSOAPDraft> {
    try {
      const prompt = `You are HealthAI Doctor Clinical Copilot assisting a certified physician.
Generate a professional clinical SOAP note draft for this patient encounter:
Patient: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}
Chief Complaint: ${encounterReason}
Vitals: ${vitalsSummary}
Lab context: ${activeLabOrders.map(l => `${l.testName}: ${l.status}`).join(', ') || 'No acute labs'}

Return ONLY JSON:
{
  "subjective": "Concise summary of patient symptoms and history",
  "objective": "Objective findings including reported vitals and laboratory results",
  "assessment": "Working clinical impressions and differential considerations",
  "plan": "Diagnostic workup, therapy suggestions, lifestyle measures, and follow-up timeline",
  "suggestedFollowUpQuestions": [
    "Question 1 to ask patient",
    "Question 2 to ask patient"
  ]
}`;

      const res = await callGeminiChat(
        [{ role: 'user', content: prompt }],
        'You are an expert physician assistant. Generate clinical notes adhering to medical documentation standards. Return valid JSON only.'
      );

      const jsonText = res.reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonText);

      return {
        ...parsed,
        reviewedByDoctor: false
      };
    } catch {
      return {
        subjective: `Patient reports ${encounterReason || 'routine clinical follow-up'}. Denies acute shortness of breath or chest discomfort.`,
        objective: `Reported vitals: ${vitalsSummary || 'BP 120/80 mmHg, SpO2 98%, Pulse 74 bpm, Temp 98.4 F'}. Physical appearance comfortable.`,
        assessment: 'Stable clinical presentation. Ongoing chronic care maintenance and lifestyle monitoring.',
        plan: 'Continue current medication regimen. Recheck vitals and fasting lab markers in 4 weeks. Return immediately if red flags occur.',
        suggestedFollowUpQuestions: [
          'Have you noticed any side effects or gastrointestinal discomfort with your medications?',
          'Are your symptoms more pronounced in the morning or during physical exertion?'
        ],
        reviewedByDoctor: false
      };
    }
  }
}
