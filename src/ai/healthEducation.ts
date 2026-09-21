export interface HealthEducationTopic {
  id: string;
  category: string;
  title: string;
  simpleExplanation: string;
  keyFacts: string[];
  preventionTips: string[];
  whenToSeeDoctor: string;
}

export const HEALTH_EDUCATION_LIBRARY: HealthEducationTopic[] = [
  {
    id: 'heart-health',
    category: 'Heart Health',
    title: 'Understanding Blood Pressure & Cardiovascular Wellness',
    simpleExplanation:
      'Blood pressure is the force of blood pushing against artery walls. Keeping it in a healthy range protects your heart, brain, and kidneys from damage.',
    keyFacts: [
      'Normal blood pressure is typically around 120/80 mmHg.',
      'High blood pressure is often called a "silent condition" because it usually has no obvious symptoms until checked.'
    ],
    preventionTips: [
      'Reduce sodium/salt intake in prepared foods.',
      'Engage in 30 minutes of daily aerobic activity like brisk walking.',
      'Manage chronic stress with deep breathing and adequate sleep.'
    ],
    whenToSeeDoctor:
      'Seek prompt medical evaluation if you experience persistent chest tightness, shortness of breath, unexplained dizziness, or severe sudden headaches.'
  },
  {
    id: 'diabetes',
    category: 'Diabetes',
    title: 'Managing Blood Sugar (HbA1c & Fasting Glucose)',
    simpleExplanation:
      'Diabetes occurs when your body either cannot produce enough insulin or cannot effectively use the insulin it makes, leading to elevated sugar in the bloodstream.',
    keyFacts: [
      'An HbA1c test reflects your average blood sugar levels over the past 2 to 3 months.',
      'Regular physical movement helps cells absorb glucose naturally, reducing reliance on high insulin levels.'
    ],
    preventionTips: [
      'Choose whole, unprocessed grains over refined starches and sugary drinks.',
      'Incorporate fiber-rich legumes and vegetables with every main meal.'
    ],
    whenToSeeDoctor:
      'Consult your healthcare team if you notice extreme thirst, frequent night urination, unexplained weight loss, or slow-healing skin cuts.'
  },
  {
    id: 'mental-wellness',
    category: 'Mental Wellness',
    title: 'Recognizing Stress, Anxiety & Emotional Balance',
    simpleExplanation:
      'Mental health is as essential as physical health. Stress triggers hormones that affect heart rate, digestion, and immune strength over time.',
    keyFacts: [
      'Chronic stress elevates cortisol, which can impact sleep quality and blood sugar regulation.',
      'Talking openly with supportive peers or clinicians significantly eases emotional burdens.'
    ],
    preventionTips: [
      'Practice 10 minutes of daily mindfulness or slow rhythmic breathing.',
      'Maintain strong social bonds and stay physically active outdoors.'
    ],
    whenToSeeDoctor:
      'Reach out to a mental health professional if feeling overwhelmed, persistent sadness lasts beyond two weeks, or panic impairs daily functioning.'
  },
  {
    id: 'respiratory-health',
    category: 'Respiratory Health',
    title: 'Lung Wellness, Air Quality & Asthma Management',
    simpleExplanation:
      'Lungs supply vital oxygen to all organs while removing carbon dioxide. Clean air and timely asthma treatment preserve lifelong lung capacity.',
    keyFacts: [
      'Seasonal changes and airborne particulate matter (PM2.5) can trigger airway inflammation.',
      'Using prescribed inhalers correctly and consistently prevents acute breathing attacks.'
    ],
    preventionTips: [
      'Wear high-filtration masks on poor air quality days.',
      'Avoid passive tobacco smoke exposure and ensure good indoor ventilation.'
    ],
    whenToSeeDoctor:
      'Call emergency services immediately if you experience severe shortness of breath, inability to speak in full sentences, or blue-tinted lips/nails.'
  }
];
