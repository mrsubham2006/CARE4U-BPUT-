import { callGeminiChat } from '../services/geminiService';

export interface WellnessRoutineItem {
  time: string;
  category: 'HYDRATION' | 'NUTRITION' | 'ACTIVITY' | 'MINDFULNESS' | 'SLEEP';
  title: string;
  recommendation: string;
}

export interface WellnessPlan {
  title: string;
  goals: string[];
  schedule: WellnessRoutineItem[];
  tips: string[];
  disclaimer: string;
}

export class WellnessAI {
  public static async generateRoutine(
    focus: 'balanced' | 'energy' | 'sleep' | 'heart' = 'balanced',
    activityLevel: 'low' | 'moderate' | 'active' = 'moderate'
  ): Promise<WellnessPlan> {
    try {
      const prompt = `Generate a non-diagnostic daily wellness routine focused on: ${focus}, activity level: ${activityLevel}.
Return JSON only:
{
  "title": "HealthAI Daily Wellness Blueprint",
  "goals": ["Goal 1", "Goal 2", "Goal 3"],
  "schedule": [
    { "time": "06:30 AM", "category": "HYDRATION", "title": "Morning Rehydration", "recommendation": "Drink 500ml water" },
    { "time": "07:30 AM", "category": "ACTIVITY", "title": "Morning Movement", "recommendation": "20-minute brisk walk or stretching" },
    { "time": "01:00 PM", "category": "NUTRITION", "title": "Balanced Lunch", "recommendation": "Rich in lean protein, whole grains, and greens" },
    { "time": "06:00 PM", "category": "MINDFULNESS", "title": "Stress Decompression", "recommendation": "10 minutes of deep breathing" },
    { "time": "10:00 PM", "category": "SLEEP", "title": "Sleep Hygiene", "recommendation": "Digital sunset 30 mins before sleep" }
  ],
  "tips": ["Tip 1", "Tip 2"]
}`;

      const res = await callGeminiChat(
        [{ role: 'user', content: prompt }],
        'You are HealthAI Wellness Copilot. Return strictly valid JSON only.'
      );

      const jsonText = res.reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonText);

      return {
        ...parsed,
        disclaimer:
          'Wellness routines are for general lifestyle enhancement and do not constitute a medical treatment plan.'
      };
    } catch {
      return {
        title: 'HealthAI Daily Balanced Wellness Plan',
        goals: [
          'Maintain 2.5L daily hydration',
          'Incorporate 30 minutes of moderate aerobic movement',
          'Support restorative 7-8 hours of sleep'
        ],
        schedule: [
          { time: '06:30 AM', category: 'HYDRATION', title: 'Morning Hydration', recommendation: 'Start with 500ml room temperature water.' },
          { time: '07:15 AM', category: 'ACTIVITY', title: 'Light Aerobic Exercise', recommendation: '25-minute brisk outdoor walk or yoga session.' },
          { time: '01:00 PM', category: 'NUTRITION', title: 'Wholesome Lunch', recommendation: 'High-fiber vegetables, pulses, and complex carbs.' },
          { time: '05:30 PM', category: 'MINDFULNESS', title: 'Mid-Day Rest & Breathing', recommendation: '5 minutes of 4-7-8 deep diaphragmatic breathing.' },
          { time: '10:15 PM', category: 'SLEEP', title: 'Restorative Sleep Prep', recommendation: 'Dark, cool bedroom with no smartphone screens.' }
        ],
        tips: [
          'Consistency in sleep schedules stabilizes circadian rhythms.',
          'Stay hydrated throughout the day rather than drinking large quantities at night.'
        ],
        disclaimer:
          'Wellness routines are for general lifestyle enhancement and do not constitute a medical treatment plan.'
      };
    }
  }
}
