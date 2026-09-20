import {
  Facility,
  Doctor,
  Patient,
  Medicine,
  Appointment,
  LabOrder,
  Prescription,
  Referral,
  FollowUp,
  NotificationItem,
  EmergencyAlert,
  AuditLogEntry,
  RoutingWeights,
  User,
  AmbulanceTrip,
  PaymentRecord,
  MedicalRecordDocument,
  ConsentToken,
  IntegrationStatus,
  BiometricAccessLog
} from '../types';

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'fac-1',
    name: 'District Health Centre (DHC)',
    type: 'District Hospital',
    distanceKm: 8.2,
    latitude: 18.5204,
    longitude: 73.8567,
    address: 'Sector 4, Main Highway Corridor, Sub-District Central',
    contactPhone: '+91 20 2554 1001',
    openStatus: 'OPEN_24_7',
    departments: ['General Medicine', 'Pediatrics', 'Orthopedics', 'Emergency', 'Pathology'],
    doctorsCount: 14,
    doctorsAvailable: 11,
    currentQueue: 6,
    estimatedWaitMins: 24,
    emergencyCapability: true,
    emergencyLoadPercent: 68,
    bedOccupancyPercent: 72,
    opdCapacityPercent: 64,
    diagnostics: {
      cbc: true,
      xray: true,
      mri: true,
      ctScan: true,
      ultrasound: true
    },
    pharmacyStatus: 'FULL',
    statusColor: 'GREEN'
  },
  {
    id: 'fac-2',
    name: 'Community Health Centre (CHC North)',
    type: 'Community Health Centre',
    distanceKm: 5.1,
    latitude: 18.5312,
    longitude: 73.8421,
    address: 'Old Market Junction, Taluka North',
    contactPhone: '+91 20 2554 1002',
    openStatus: 'BUSY',
    departments: ['General Medicine', 'Pediatrics', 'Maternity'],
    doctorsCount: 6,
    doctorsAvailable: 2,
    currentQueue: 18,
    estimatedWaitMins: 65,
    emergencyCapability: false,
    emergencyLoadPercent: 40,
    bedOccupancyPercent: 88,
    opdCapacityPercent: 92,
    diagnostics: {
      cbc: true,
      xray: false,
      mri: false,
      ctScan: false,
      ultrasound: false
    },
    pharmacyStatus: 'LIMITED',
    statusColor: 'YELLOW'
  },
  {
    id: 'fac-3',
    name: 'Regional Apex Hospital & Trauma Centre',
    type: 'Specialty Hospital',
    distanceKm: 14.5,
    latitude: 18.4988,
    longitude: 73.8821,
    address: 'Healthcare City Zone, Ring Road Phase 2',
    contactPhone: '+91 20 2554 1003',
    openStatus: 'OVERLOADED',
    departments: ['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Critical Care', 'Trauma'],
    doctorsCount: 32,
    doctorsAvailable: 24,
    currentQueue: 34,
    estimatedWaitMins: 85,
    emergencyCapability: true,
    emergencyLoadPercent: 93,
    bedOccupancyPercent: 94,
    opdCapacityPercent: 86,
    diagnostics: {
      cbc: true,
      xray: true,
      mri: true,
      ctScan: true,
      ultrasound: true
    },
    pharmacyStatus: 'FULL',
    statusColor: 'RED'
  },
  {
    id: 'fac-4',
    name: 'Rural Primary Health Centre (PHC Kadegaon)',
    type: 'Primary Health Centre',
    distanceKm: 2.8,
    latitude: 18.5422,
    longitude: 73.8199,
    address: 'Village Chowk, Kadegaon Rural Block',
    contactPhone: '+91 20 2554 1004',
    openStatus: 'OPEN_REGULAR',
    departments: ['General Medicine', 'Maternal & Child Health', 'Immunization'],
    doctorsCount: 3,
    doctorsAvailable: 2,
    currentQueue: 4,
    estimatedWaitMins: 15,
    emergencyCapability: false,
    emergencyLoadPercent: 20,
    bedOccupancyPercent: 45,
    opdCapacityPercent: 50,
    diagnostics: {
      cbc: true,
      xray: false,
      mri: false,
      ctScan: false,
      ultrasound: false
    },
    pharmacyStatus: 'LIMITED',
    statusColor: 'GREEN'
  },
  {
    id: 'fac-5',
    name: 'Metro Care Super-Specialty Medical Hub',
    type: 'Specialty Hospital',
    distanceKm: 19.0,
    latitude: 18.4611,
    longitude: 73.9102,
    address: 'East Corridor Tech Park Extension',
    contactPhone: '+91 20 2554 1005',
    openStatus: 'OPEN_24_7',
    departments: ['General Medicine', 'Cardiology', 'Oncology', 'Gastroenterology', 'Pediatrics'],
    doctorsCount: 45,
    doctorsAvailable: 38,
    currentQueue: 14,
    estimatedWaitMins: 30,
    emergencyCapability: true,
    emergencyLoadPercent: 55,
    bedOccupancyPercent: 62,
    opdCapacityPercent: 60,
    diagnostics: {
      cbc: true,
      xray: true,
      mri: true,
      ctScan: true,
      ultrasound: true
    },
    pharmacyStatus: 'FULL',
    statusColor: 'GREEN'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Ananya Sharma',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    department: 'General Medicine',
    specialty: 'Internal Medicine & Infectious Diseases',
    isAvailable: true,
    activeQueueCount: 6,
    avgConsultationMins: 10,
    nextAvailableSlot: '10:30 AM',
    rating: 4.9
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Kumar',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    department: 'General Medicine',
    specialty: 'Family Medicine & Public Health',
    isAvailable: true,
    activeQueueCount: 4,
    avgConsultationMins: 12,
    nextAvailableSlot: '11:00 AM',
    rating: 4.8
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya Nair',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    department: 'Pediatrics',
    specialty: 'Child Health & Neonatology',
    isAvailable: true,
    activeQueueCount: 5,
    avgConsultationMins: 15,
    nextAvailableSlot: '11:15 AM',
    rating: 4.9
  },
  {
    id: 'doc-4',
    name: 'Dr. Vikram Malhotra',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    department: 'Orthopedics',
    specialty: 'Joint & Trauma Surgery',
    isAvailable: true,
    activeQueueCount: 3,
    avgConsultationMins: 18,
    nextAvailableSlot: '12:00 PM',
    rating: 4.7
  },
  {
    id: 'doc-5',
    name: 'Dr. Ramesh Patil',
    facilityId: 'fac-2',
    facilityName: 'Community Health Centre (CHC North)',
    department: 'General Medicine',
    specialty: 'General Practice',
    isAvailable: false, // temporarily off-duty
    activeQueueCount: 18,
    avgConsultationMins: 8,
    nextAvailableSlot: '03:00 PM',
    rating: 4.4
  },
  {
    id: 'doc-6',
    name: 'Dr. Sunita Kulkarni',
    facilityId: 'fac-3',
    facilityName: 'Regional Apex Hospital & Trauma Centre',
    department: 'Cardiology',
    specialty: 'Interventional Cardiology',
    isAvailable: true,
    activeQueueCount: 12,
    avgConsultationMins: 20,
    nextAvailableSlot: '01:30 PM',
    rating: 4.95
  },
  {
    id: 'doc-7',
    name: 'Dr. Arvind Deshmukh',
    facilityId: 'fac-4',
    facilityName: 'Rural Primary Health Centre (PHC Kadegaon)',
    department: 'General Medicine',
    specialty: 'Rural Primary Healthcare',
    isAvailable: true,
    activeQueueCount: 3,
    avgConsultationMins: 10,
    nextAvailableSlot: '10:00 AM',
    rating: 4.85
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-rahul',
    name: 'Rahul Kumar',
    age: 24,
    gender: 'Male',
    dob: '2001-08-15',
    phone: '+91 98765 43210',
    email: 'rahul.kumar@gmail.com',
    address: 'House #42, Shivaji Chowk, Ward 3',
    villageOrCity: 'Kadegaon Rural Block (Ward 3)',
    district: 'Sangli District',
    state: 'Maharashtra',
    pincode: '415304',
    emergencyContact: '+91 98765 99881',
    emergencyContactName: 'Suresh Kumar (Father)',
    preferredLanguage: 'en',
    healthId: 'ABDM-9821-4412',
    abhaNumber: '91-4829-1092-3841',
    abhaAddress: 'rahulkumar@abdm',
    verificationStatus: 'VERIFIED',
    bloodGroup: 'B+',
    allergies: ['Dust mite', 'Pollen'],
    chronicConditions: ['Seasonal Bronchitis (Mild)'],
    previousSurgeries: ['Appendectomy (2021)'],
    currentMedications: ['Paracetamol 500mg SOS', 'Cetirizine 10mg OD'],
    familyHistory: ['Father: Type 2 Diabetes', 'Mother: Normotensive'],
    vaccinationRecords: [
      { name: 'COVID-19 (Covishield Booster)', date: '2022-04-10', status: 'Completed' },
      { name: 'Tetanus Toxoid (TT)', date: '2023-11-05', status: 'Up to Date' },
      { name: 'Hepatitis B', date: '2019-06-20', status: 'Completed' }
    ],
    disabilityInfo: 'None',
    medicalNotes: 'Occasional wheezing during harvesting season. Stable vitals.',
    emergencyMedicalSummary: 'Blood Group B+, Seasonal allergy history. Emergency contact: Suresh Kumar (+91 98765 99881)',
    registeredByAshaId: 'asha-savita'
  },
  {
    id: 'pat-sunita',
    name: 'Sunita Devi',
    age: 48,
    gender: 'Female',
    dob: '1978-03-22',
    phone: '+91 98231 11223',
    email: 'sunita.devi@rediffmail.com',
    address: 'Plot 12, Main Bazaar, Sector 1',
    villageOrCity: 'Bori Village, Sector 1',
    district: 'Pune Rural',
    state: 'Maharashtra',
    pincode: '412207',
    emergencyContact: '+91 98231 44556',
    emergencyContactName: 'Ramesh Devi (Spouse)',
    preferredLanguage: 'hi',
    healthId: 'ABDM-4419-7821',
    abhaNumber: '91-5521-8891-2034',
    abhaAddress: 'sunitadevi@abdm',
    verificationStatus: 'VERIFIED',
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    chronicConditions: ['Hypertension (Grade 1)', 'Hypothyroidism'],
    previousSurgeries: ['Cholecystectomy (2018)'],
    currentMedications: ['Amlodipine 5mg OD', 'Thyronorm 50mcg empty stomach'],
    familyHistory: ['Mother: Hypertension'],
    vaccinationRecords: [
      { name: 'COVID-19 (Covaxin 2 Doses)', date: '2021-09-15', status: 'Completed' }
    ],
    disabilityInfo: 'None',
    medicalNotes: 'Hypertension controlled with daily medication. Regular BP check required.',
    emergencyMedicalSummary: 'Allergic to Penicillin. Blood Group O+. Hypertension patient.'
  },
  {
    id: 'pat-amit',
    name: 'Amit Verma',
    age: 36,
    gender: 'Male',
    dob: '1990-11-10',
    phone: '+91 97654 88776',
    email: 'amit.verma90@gmail.com',
    address: 'Flat 304, Green Palms, North Block',
    villageOrCity: 'Sub-District Town, North',
    district: 'Sangli District',
    state: 'Maharashtra',
    pincode: '415302',
    emergencyContact: '+91 97654 33221',
    emergencyContactName: 'Pooja Verma (Wife)',
    preferredLanguage: 'mr',
    healthId: 'ABDM-1122-3344',
    abhaNumber: '91-3312-9988-1200',
    abhaAddress: 'amitverma@abdm',
    verificationStatus: 'VERIFIED',
    bloodGroup: 'A+',
    allergies: ['Sulfa drugs'],
    chronicConditions: ['Hyperacidity / GERD'],
    previousSurgeries: [],
    currentMedications: ['Pantoprazole 40mg PRN'],
    familyHistory: ['No known hereditary illness'],
    vaccinationRecords: [
      { name: 'COVID-19 Booster', date: '2022-08-12', status: 'Completed' }
    ],
    disabilityInfo: 'None',
    medicalNotes: 'Occasional acid reflux after spicy diet.',
    emergencyMedicalSummary: 'Allergic to Sulfa Drugs. Blood Group A+.'
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Paracetamol 500mg',
    category: 'Antipyretic / Analgesic',
    stockCount: 842,
    minThreshold: 150,
    status: 'AVAILABLE',
    dosageForm: 'Tablet 500mg',
    unitPrice: 1.5
  },
  {
    id: 'med-2',
    name: 'Amoxicillin + Clavulanic Acid 625mg',
    category: 'Broad Spectrum Antibiotic',
    stockCount: 320,
    minThreshold: 80,
    status: 'AVAILABLE',
    dosageForm: 'Tablet 625mg',
    unitPrice: 12.0
  },
  {
    id: 'med-3',
    name: 'Cetirizine 10mg',
    category: 'Antihistamine',
    stockCount: 450,
    minThreshold: 100,
    status: 'AVAILABLE',
    dosageForm: 'Tablet 10mg',
    unitPrice: 2.0
  },
  {
    id: 'med-4',
    name: 'Azithromycin 500mg',
    category: 'Antibiotic (Macrolide)',
    stockCount: 18,
    minThreshold: 40,
    status: 'LOW_STOCK',
    dosageForm: 'Tablet 500mg',
    unitPrice: 18.0
  },
  {
    id: 'med-5',
    name: 'ORS Electrolyte Solution (WHO Formula)',
    category: 'Rehydration Salts',
    stockCount: 650,
    minThreshold: 100,
    status: 'AVAILABLE',
    dosageForm: 'Sachet 21.8g',
    unitPrice: 4.5
  },
  {
    id: 'med-6',
    name: 'Pantoprazole 40mg',
    category: 'Proton Pump Inhibitor (Antacid)',
    stockCount: 520,
    minThreshold: 90,
    status: 'AVAILABLE',
    dosageForm: 'Tablet 40mg',
    unitPrice: 5.0
  },
  {
    id: 'med-7',
    name: 'Inj. Ceftriaxone 1g',
    category: 'Injectable Antibiotic',
    stockCount: 0,
    minThreshold: 25,
    status: 'OUT_OF_STOCK',
    dosageForm: 'Vial 1g',
    unitPrice: 45.0
  },
  {
    id: 'med-8',
    name: 'Metformin 500mg',
    category: 'Anti-Diabetic',
    stockCount: 410,
    minThreshold: 80,
    status: 'AVAILABLE',
    dosageForm: 'Tablet 500mg',
    unitPrice: 3.0
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-000',
    patientId: 'pat-rahul',
    patientName: 'Rahul Kumar',
    patientAge: 24,
    patientGender: 'Male',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sharma',
    department: 'General Medicine',
    token: {
      tokenNumber: 'A-027',
      patientId: 'pat-rahul',
      patientName: 'Rahul Kumar',
      facilityId: 'fac-1',
      facilityName: 'District Health Centre (DHC)',
      department: 'General Medicine',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma',
      queuePosition: 2,
      estimatedWaitMins: 10,
      appointmentTime: '11:00 AM',
      createdAt: new Date().toISOString(),
      qrData: 'CARE4U:A-027:PAT-RAHUL:FAC-1'
    },
    scheduledTime: '11:00 AM',
    scheduledDate: new Date().toISOString().split('T')[0],
    consultationType: 'IN_PERSON',
    consultationFee: 150,
    paymentStatus: 'PAID',
    paymentRecordId: 'pay-001',
    status: 'CONFIRMED',
    symptomsSummary: 'Seasonal cough, throat irritation and mild fatigue for 2 days',
    triageLevel: 'SAME_DAY',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    messages: [
      {
        id: 'msg-1',
        sender: 'SYSTEM',
        senderName: 'CARE4U Desk',
        text: 'Appointment confirmed for 11:00 AM at District Health Centre with Dr. Ananya Sharma.',
        timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'msg-2',
        sender: 'DOCTOR',
        senderName: 'Dr. Ananya Sharma',
        text: 'Please bring your previous chest X-Ray and CBC report if available.',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  },
  {
    id: 'apt-000-past',
    patientId: 'pat-rahul',
    patientName: 'Rahul Kumar',
    patientAge: 24,
    patientGender: 'Male',
    facilityId: 'fac-4',
    facilityName: 'Rural Primary Health Centre (PHC Kadegaon)',
    doctorId: 'doc-7',
    doctorName: 'Dr. Arvind Deshmukh',
    department: 'General Medicine',
    token: {
      tokenNumber: 'A-012',
      patientId: 'pat-rahul',
      patientName: 'Rahul Kumar',
      facilityId: 'fac-4',
      facilityName: 'Rural Primary Health Centre (PHC Kadegaon)',
      department: 'General Medicine',
      doctorId: 'doc-7',
      doctorName: 'Dr. Arvind Deshmukh',
      queuePosition: 1,
      estimatedWaitMins: 0,
      appointmentTime: '10:00 AM',
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      qrData: 'CARE4U:A-012:PAT-RAHUL:FAC-4'
    },
    scheduledTime: '10:00 AM',
    scheduledDate: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
    consultationType: 'VIDEO',
    consultationFee: 100,
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    symptomsSummary: 'Seasonal wheezing and allergic rhinitis follow-up',
    triageLevel: 'ROUTINE',
    feedback: {
      rating: 5,
      waitTimeRating: 5,
      reviewText: 'Excellent doctor consultation. Prescribed medications helped quickly.',
      experienceSummary: 'Quick video connect, clear dosage instructions.',
      createdAt: new Date(Date.now() - 86400000 * 13).toISOString()
    },
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    id: 'apt-001',
    patientId: 'pat-sunita',
    patientName: 'Sunita Devi',
    patientAge: 48,
    patientGender: 'Female',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sharma',
    department: 'General Medicine',
    token: {
      tokenNumber: 'A-025',
      patientId: 'pat-sunita',
      patientName: 'Sunita Devi',
      facilityId: 'fac-1',
      facilityName: 'District Health Centre (DHC)',
      department: 'General Medicine',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma',
      queuePosition: 2,
      estimatedWaitMins: 12,
      appointmentTime: '09:45 AM',
      createdAt: new Date().toISOString(),
      qrData: 'CARE4U:A-025:PAT-SUNITA:FAC-1'
    },
    scheduledTime: '09:45 AM',
    status: 'IN_CONSULTATION',
    symptomsSummary: 'Persistent hypertension check & mild dizziness for 3 days',
    triageLevel: 'SAME_DAY',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'apt-002',
    patientId: 'pat-amit',
    patientName: 'Amit Verma',
    patientAge: 36,
    patientGender: 'Male',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    doctorId: 'doc-2',
    doctorName: 'Dr. Rajesh Kumar',
    department: 'General Medicine',
    token: {
      tokenNumber: 'A-026',
      patientId: 'pat-amit',
      patientName: 'Amit Verma',
      facilityId: 'fac-1',
      facilityName: 'District Health Centre (DHC)',
      department: 'General Medicine',
      doctorId: 'doc-2',
      doctorName: 'Dr. Rajesh Kumar',
      queuePosition: 3,
      estimatedWaitMins: 18,
      appointmentTime: '10:00 AM',
      createdAt: new Date().toISOString(),
      qrData: 'CARE4U:A-026:PAT-AMIT:FAC-1'
    },
    scheduledTime: '10:00 AM',
    status: 'BOOKED',
    symptomsSummary: 'Dry cough and throat irritation since 2 days',
    triageLevel: 'ROUTINE',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: 'lab-rahul-1',
    consultationId: 'con-rahul-prev',
    appointmentId: 'apt-000-past',
    patientId: 'pat-rahul',
    patientName: 'Rahul Kumar',
    facilityId: 'fac-1',
    testName: 'Complete Blood Count (CBC) with Differential',
    priority: 'Routine',
    status: 'REPORT_READY',
    orderedByDoctorName: 'Dr. Ananya Sharma',
    orderedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    sampleCollectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    reportSummary: 'All vital hemogram parameters within normal physiological limits. Eosinophils mildly elevated reflecting seasonal allergy history.',
    reportValues: [
      { parameter: 'Hemoglobin (Hb)', value: '14.8', unit: 'g/dL', referenceRange: '13.5 - 17.5', flag: 'Normal' },
      { parameter: 'Total Leukocyte Count (TLC)', value: '7,400', unit: '/mcL', referenceRange: '4,000 - 11,000', flag: 'Normal' },
      { parameter: 'Platelet Count', value: '265,000', unit: '/mcL', referenceRange: '150,000 - 450,000', flag: 'Normal' },
      { parameter: 'Absolute Eosinophil Count (AEC)', value: '480', unit: '/mcL', referenceRange: '40 - 400', flag: 'High' },
      { parameter: 'Neutrophils', value: '62', unit: '%', referenceRange: '40 - 70', flag: 'Normal' },
      { parameter: 'Lymphocytes', value: '31', unit: '%', referenceRange: '20 - 40', flag: 'Normal' }
    ],
    aiExtractedInsights: 'Hemogram shows normal RBC and Platelet indices. Mild eosinophilia (480 /mcL) is consistent with allergic rhinitis / seasonal reactive airway.'
  },
  {
    id: 'lab-rahul-2',
    consultationId: 'con-rahul-active',
    appointmentId: 'apt-000',
    patientId: 'pat-rahul',
    patientName: 'Rahul Kumar',
    facilityId: 'fac-1',
    testName: 'Serum IgE Level (Allergy Panel)',
    priority: 'Routine',
    status: 'PROCESSING',
    orderedByDoctorName: 'Dr. Ananya Sharma',
    orderedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    sampleCollectedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'lab-001',
    consultationId: 'con-prev-1',
    appointmentId: 'apt-001',
    patientId: 'pat-sunita',
    patientName: 'Sunita Devi',
    facilityId: 'fac-1',
    testName: 'Complete Blood Count (CBC) + Lipid Profile',
    priority: 'Routine',
    status: 'SAMPLE_COLLECTED',
    orderedByDoctorName: 'Dr. Ananya Sharma',
    orderedAt: new Date(Date.now() - 7200000).toISOString(),
    sampleCollectedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-rahul-01',
    consultationId: 'con-rahul-prev',
    appointmentId: 'apt-000-past',
    patientId: 'pat-rahul',
    patientName: 'Rahul Kumar',
    doctorId: 'doc-7',
    doctorName: 'Dr. Arvind Deshmukh',
    facilityId: 'fac-4',
    facilityName: 'Rural Primary Health Centre (PHC Kadegaon)',
    items: [
      {
        medicineId: 'med-1',
        medicineName: 'Paracetamol 500mg',
        dosage: '1 tablet SOS for fever/pain',
        frequency: 'As needed (SOS)',
        durationDays: 5,
        quantity: 10,
        availableInStock: true
      },
      {
        medicineId: 'med-3',
        medicineName: 'Cetirizine 10mg',
        dosage: '1 tablet at bedtime',
        frequency: 'Once Daily (Night)',
        durationDays: 10,
        quantity: 10,
        availableInStock: true
      },
      {
        medicineId: 'med-5',
        medicineName: 'ORS Electrolyte Solution',
        dosage: '1 sachet dissolved in 1L water',
        frequency: 'Twice daily',
        durationDays: 3,
        quantity: 3,
        availableInStock: true
      }
    ],
    status: 'DISPENSED',
    dispensedAt: new Date(Date.now() - 86400000 * 13).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    id: 'rx-001',
    consultationId: 'con-prev-1',
    appointmentId: 'apt-001',
    patientId: 'pat-sunita',
    patientName: 'Sunita Devi',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sharma',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    items: [
      {
        medicineId: 'med-6',
        medicineName: 'Pantoprazole 40mg',
        dosage: '1 tab OD (Before Breakfast)',
        frequency: 'Once Daily',
        durationDays: 14,
        quantity: 14,
        availableInStock: true
      },
      {
        medicineId: 'med-3',
        medicineName: 'Cetirizine 10mg',
        dosage: '1 tab HS (At Bedtime)',
        frequency: 'Once Daily',
        durationDays: 5,
        quantity: 5,
        availableInStock: true
      }
    ],
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'ref-rahul-01',
    patientId: 'pat-rahul',
    patientName: 'Rahul Kumar',
    fromFacilityId: 'fac-4',
    fromFacilityName: 'Rural Primary Health Centre (PHC Kadegaon)',
    toFacilityId: 'fac-1',
    toFacilityName: 'District Health Centre (DHC)',
    referringDoctorId: 'doc-7',
    referringDoctorName: 'Dr. Arvind Deshmukh',
    specialtyRequired: 'Pulmonology / Chest Medicine',
    priority: 'Routine',
    reasonForReferral: 'Seasonal wheezing requiring spirometry / specialist evaluation',
    clinicalSummary: 'Recurrent seasonal bronchospasm during winter months. Cleared on bronchodilators.',
    status: 'ACCEPTED',
    scheduledAppointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'ref-001',
    patientId: 'pat-sunita',
    patientName: 'Sunita Devi',
    fromFacilityId: 'fac-1',
    fromFacilityName: 'District Health Centre (DHC)',
    toFacilityId: 'fac-3',
    toFacilityName: 'Regional Apex Hospital & Trauma Centre',
    referringDoctorId: 'doc-1',
    referringDoctorName: 'Dr. Ananya Sharma',
    specialtyRequired: 'Cardiology',
    priority: 'Routine',
    reasonForReferral: 'Refractory Hypertension with suspected LVH; 2D Echo advised.',
    clinicalSummary: 'BP consistently > 150/95 despite 2-drug therapy. EKG shows mild voltage criteria for LVH.',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'flw-rahul-1',
    patientId: 'pat-rahul',
    patientName: 'Rahul Kumar',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sharma',
    targetDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    purpose: 'Review IgE allergy blood report and evaluate inhaler technique',
    status: 'SCHEDULED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'flw-001',
    patientId: 'pat-sunita',
    patientName: 'Sunita Devi',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sharma',
    targetDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    purpose: 'Post-medication BP review and lipid profile report check',
    status: 'SCHEDULED',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-rahul-1',
    targetRole: 'PATIENT',
    targetUserId: 'pat-rahul',
    title: 'Appointment Confirmed',
    message: 'Your OPD consultation with Dr. Ananya Sharma is confirmed for 11:00 AM (Token A-027).',
    type: 'APPOINTMENT_CONFIRMED',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'notif-rahul-2',
    targetRole: 'PATIENT',
    targetUserId: 'pat-rahul',
    title: 'Lab Report Ready',
    message: 'CBC Hemogram report is now verified and available in your Health Wallet.',
    type: 'LAB_REPORT_READY',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif-rahul-3',
    targetRole: 'PATIENT',
    targetUserId: 'pat-rahul',
    title: 'Follow-up Due Tomorrow',
    message: 'Scheduled follow-up with Dr. Ananya Sharma for allergy review tomorrow.',
    type: 'APPOINTMENT_CONFIRMED',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'notif-1',
    targetRole: 'ALL',
    title: 'NEXUS Network Online',
    message: 'All 5 district healthcare facilities are synchronized and live.',
    type: 'SYSTEM_ALERT',
    isRead: false,
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'notif-2',
    targetRole: 'HOSPITAL_ADMIN',
    title: 'Emergency Load Peak Alert',
    message: 'Regional Apex Hospital Emergency Load reached 93%. MedRoute routing active.',
    type: 'CAPACITY_ALERT',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif-3',
    targetRole: 'PHARMACY_STAFF',
    title: 'Stockout Alert: Inj. Ceftriaxone',
    message: 'Stock level reached 0 vials. Procurement reorder flagged in system.',
    type: 'STOCKOUT_ALERT',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: 'em-1',
    facilityId: 'fac-3',
    facilityName: 'Regional Apex Hospital & Trauma Centre',
    severity: 'CRITICAL',
    metric: 'Emergency Capacity',
    value: '93%',
    reason: 'High intake from multiple highway trauma referrals in past 2 hours.',
    recommendedAction: 'Reroute non-trauma emergency presentations to District Health Centre (DHC) (68% load).',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    acknowledged: false
  },
  {
    id: 'em-2',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    severity: 'WARNING',
    metric: 'Medicine Inventory',
    value: '0 Vials',
    reason: 'Inj. Ceftriaxone 1g stock depleted.',
    recommendedAction: 'Use Amoxicillin-Clavulanic 1.2g IV alternative; request pharmacy inter-facility transfer.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    acknowledged: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    action: 'SYSTEM_INITIALIZED',
    performedByRole: 'SUPER_ADMIN',
    userName: 'NEXUS Central Operator',
    details: '5 Facilities, 15 Clinicians, and MedRoute Engine initialized.',
    timestamp: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'aud-2',
    action: 'ROUTING_WEIGHTS_CALIBRATED',
    performedByRole: 'SUPER_ADMIN',
    userName: 'NEXUS Central Operator',
    details: 'Weights: Capability 30%, Doctor 20%, Queue 15%, Diagnostics 10%, Pharmacy 10%, Distance 10%, Emergency 5%',
    timestamp: new Date(Date.now() - 10800000).toISOString()
  }
];

export const DEFAULT_ROUTING_WEIGHTS: RoutingWeights = {
  capabilityWeight: 30,
  doctorAvailabilityWeight: 20,
  queueWeight: 15,
  diagnosticsWeight: 10,
  pharmacyWeight: 10,
  distanceWeight: 10,
  emergencyWeight: 5
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-pat-1',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@care4u.nexus',
    phone: '+91 98765 43210',
    role: 'PATIENT',
    verificationStatus: 'VERIFIED',
    dob: '1999-05-14',
    gender: 'Male',
    villageOrCity: 'Kadegaon Rural Block (Ward 3)',
    district: 'Sub-District Central',
    state: 'Maharashtra',
    emergencyContact: '+91 98220 11223 (Pooja Kumar - Sister)',
    healthId: 'ABDM-9821-4412-MH',
    preferredLanguage: 'en',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-doc-1',
    name: 'Dr. Rajesh Sharma, MD',
    email: 'dr.rajesh@district-hospital.gov.in',
    phone: '+91 98230 44556',
    role: 'DOCTOR',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    verificationStatus: 'VERIFIED',
    medicalRegistrationNumber: 'MCI-2014-98712',
    specialization: 'General Medicine & Infectious Pyrexia',
    qualification: 'MD (Internal Medicine), MBBS',
    department: 'General Medicine',
    experienceYears: 12,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-hosp-1',
    name: 'Dr. Anita Roy',
    email: 'admin@dhc.care4u.nexus',
    phone: '+91 98221 77889',
    role: 'HOSPITAL_ADMIN',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    hospitalName: 'District Health Centre (DHC)',
    facilityType: 'District Hospital',
    verificationStatus: 'VERIFIED',
    district: 'Sub-District Central',
    state: 'Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-lab-1',
    name: 'Priya Deshmukh',
    email: 'lab@dhc.care4u.nexus',
    phone: '+91 98711 22334',
    role: 'LAB_STAFF',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    labName: 'Central Pathology & Molecular Lab',
    verificationStatus: 'VERIFIED',
    avatar: 'https://images.unsplash.com/photo-1594824813504-d576136d4001?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-pharma-1',
    name: 'Manoj Verma',
    email: 'pharma@dhc.care4u.nexus',
    phone: '+91 98990 33445',
    role: 'PHARMACY_STAFF',
    facilityId: 'fac-1',
    facilityName: 'District Health Centre (DHC)',
    pharmacyName: 'DHC 24x7 Core Dispensary',
    verificationStatus: 'VERIFIED',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-asha-1',
    name: 'Savita Tai (ASHA)',
    email: 'asha.savita@kadegaon.health.in',
    phone: '+91 98229 88776',
    role: 'ASHA_WORKER',
    workerId: 'ASHA-KAD-09',
    villageOrCity: 'Kadegaon Rural Block (Ward 3)',
    district: 'Sub-District Central',
    state: 'Maharashtra',
    facilityName: 'Kadegaon Sub-Centre / PHC',
    verificationStatus: 'VERIFIED',
    preferredLanguage: 'hi',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-admin-1',
    name: 'Dr. Vikram Malhotra',
    email: 'admin@nexus.health',
    phone: '+91 99000 11223',
    role: 'SUPER_ADMIN',
    verificationStatus: 'VERIFIED',
    department: 'Health Authority Mission Control',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-amb-1',
    name: 'Suresh Patil (108 Pilot)',
    email: 'ambulance.108@nexus.health',
    phone: '+91 98225 99887',
    role: 'AMBULANCE_OPERATOR',
    verificationStatus: 'VERIFIED',
    facilityName: 'Maharashtra Emergency Response (EMS-108)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_AMBULANCE_TRIPS: AmbulanceTrip[] = [
  {
    id: 'amb-101',
    patientId: 'pat-1',
    patientName: 'Rahul Kumar',
    patientPhone: '+91 98765 43210',
    pickupAddress: 'Kadegaon Rural Block, House #14, Main Road',
    destinationFacilityId: 'fac-1',
    destinationFacilityName: 'District Health Centre (DHC)',
    ambulanceType: 'Basic Life Support (BLS)',
    emergencyLevel: 'URGENT',
    driverId: 'user-amb-1',
    driverName: 'Suresh Patil',
    driverPhone: '+91 98225 99887',
    vehicleNumber: 'MH-12-EM-1088',
    status: 'EN_ROUTE',
    otp: '4821',
    etaMinutes: 12,
    currentLat: 18.524,
    currentLng: 73.851,
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString()
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    orderId: 'order_care4u_98124',
    paymentId: 'pay_rzp_live_sim_77218',
    appointmentId: 'apt-000',
    patientId: 'pat-rahul',
    patientName: 'Rahul Kumar',
    doctorName: 'Dr. Ananya Sharma, MD',
    amount: 150,
    currency: 'INR',
    status: 'PAID',
    method: 'UPI',
    verifiedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

export const INITIAL_DOCUMENTS: MedicalRecordDocument[] = [
  {
    id: 'doc-001',
    patientId: 'pat-rahul',
    title: 'Hospital OPD Consultation & Vitals',
    recordType: 'CLINICAL_NOTE',
    date: '2026-09-18',
    provider: 'Dr. Ananya Sharma, MD',
    facility: 'District Health Centre (DHC)',
    fileName: 'OPD_Consultation_Summary_Sep2026.pdf',
    fileSize: '342 KB',
    tags: ['Pyrexia', 'Vitals', 'OPD'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'doc-002',
    patientId: 'pat-rahul',
    title: 'Complete Blood Count (CBC) Pathology Report',
    recordType: 'LAB_REPORT',
    date: '2026-09-19',
    provider: 'Priya Deshmukh (Biochemist)',
    facility: 'Central Pathology & Molecular Lab (DHC)',
    fileName: 'CBC_Comprehensive_Report_Sep2026.pdf',
    fileSize: '512 KB',
    tags: ['CBC', 'Hemoglobin', 'Platelets', 'Infection Profile'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'doc-003',
    patientId: 'pat-rahul',
    title: 'Previous Chest X-Ray PA View (Historical)',
    recordType: 'RADIOLOGY',
    date: '2025-11-10',
    provider: 'Apex Radiology Imaging',
    facility: 'Regional Apex Hospital',
    fileName: 'Chest_XRay_PA_Clear.png',
    fileSize: '1.2 MB',
    tags: ['Radiology', 'Chest', 'Clear Bronchial Trees'],
    createdAt: new Date(Date.now() - 26000000000).toISOString(),
    updatedAt: new Date(Date.now() - 26000000000).toISOString()
  },
  {
    id: 'doc-004',
    patientId: 'pat-rahul',
    title: 'COVID-19 Vaccination Certificate (Booster)',
    recordType: 'VACCINATION',
    date: '2022-04-10',
    provider: 'CoWIN / MoHFW India',
    facility: 'Rural PHC Kadegaon',
    fileName: 'CoWIN_Booster_Certificate_Rahul.pdf',
    fileSize: '220 KB',
    tags: ['Vaccination', 'CoWIN', 'Covishield'],
    createdAt: new Date(Date.now() - 86400000 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 300).toISOString()
  }
];

export const INITIAL_CONSENTS: ConsentToken[] = [
  {
    id: 'cst-001',
    patientId: 'pat-rahul',
    recipientRole: 'DOCTOR',
    recipientId: 'doc-1',
    recipientName: 'Dr. Ananya Sharma, MD',
    allowedRecordTypes: ['CLINICAL_NOTE', 'LAB_REPORT', 'PRESCRIPTION', 'RADIOLOGY'],
    allowedRecordIds: ['doc-001', 'doc-002', 'doc-003'],
    durationHours: 48,
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
    status: 'ACTIVE',
    token: 'NEXUS-CONSENT-9921-SHARMA',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  {
    service: 'GEMINI_AI',
    name: 'Google Gemini 2.5 AI SDK',
    status: 'ACTIVE',
    category: 'Clinical Intelligence',
    details: 'Powering automated symptom triage, MedRoute fit-scoring, and clinical note drafting.',
    setupInstructions: 'Managed via Google AI Studio API credentials in server environment.'
  },
  {
    service: 'FIREBASE_AUTH_FIRESTORE',
    name: 'Firebase Auth & Cloud Firestore',
    status: 'ACTIVE',
    category: 'Persistent Storage & Real-time State',
    details: 'Real-time sync listeners, cross-portal state coordination, and security rules.',
    setupInstructions: 'Provisioned with secure firestore.rules and multi-role RBAC.'
  },
  {
    service: 'RAZORPAY',
    name: 'Razorpay Payment Gateway (Test Mode)',
    status: 'ACTIVE',
    category: 'Payments & OPD Token Verification',
    details: 'Supports UPI, Cards, NetBanking, and Webhook transaction verification simulation.',
    setupInstructions: 'Set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in environment for live gateway.'
  },
  {
    service: 'LIVEKIT',
    name: 'LiveKit WebRTC Teleconsultation',
    status: 'ACTIVE',
    category: 'Telemedicine Video/Audio',
    details: 'Browser media streams, adaptive bandwidth, camera/mic controls, and clinical companion.',
    setupInstructions: 'Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET for cloud SFU.'
  },
  {
    service: 'SARVAM_AI',
    name: 'Sarvam AI Indic Voice Engine',
    status: 'ACTIVE',
    category: 'Indian Language Voice AI',
    details: 'Support for Hindi, Odia, Marathi, Bengali, Telugu, Tamil, Kannada, Gujarati, Punjabi.',
    setupInstructions: 'Set SARVAM_API_KEY for external Sarvam cloud neural models.'
  },
  {
    service: 'DOCUMENT_AI',
    name: 'Google Cloud Document AI / Prescription OCR',
    status: 'ACTIVE',
    category: 'Document Intelligence',
    details: 'Prescription document layout analysis, entity extraction, and uncertain field flagging.',
    setupInstructions: 'Configured with OCR confidence scoring and human-in-the-loop verification.'
  },
  {
    service: 'GOOGLE_MAPS',
    name: 'Google Maps Routes & Geocoding API',
    status: 'ACTIVE',
    category: 'Logistics & Geolocation',
    details: 'MedRoute multi-factor travel time, emergency radius, and ambulance dispatch tracking.',
    setupInstructions: 'Configured with dynamic road matrix calculation.'
  },
  {
    service: 'FCM',
    name: 'Firebase Cloud Messaging (FCM)',
    status: 'ACTIVE',
    category: 'Push Notifications',
    details: 'Backend push triggers for appointments, queue movements, lab results, and pharmacy alerts.',
    setupInstructions: 'FCM client service worker and web push notification token registry.'
  }
];

export const INITIAL_BIOMETRIC_LOGS: BiometricAccessLog[] = [
  {
    id: 'bio-log-1',
    patientId: 'pat-rahul',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    authMethod: 'FACE_ID',
    status: 'SUCCESS',
    resourceAccessed: 'Electronic Prescriptions',
    deviceInfo: 'Biometric Authenticator (Current Browser / Mobile)',
    ipAddress: '103.21.244.18 (India - Secure Session)',
    actorName: 'Subham Pradhan (Self)',
    actorRole: 'PATIENT'
  },
  {
    id: 'bio-log-2',
    patientId: 'pat-rahul',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), // 1 hr ago
    authMethod: 'FINGERPRINT',
    status: 'SUCCESS',
    resourceAccessed: 'Pathology & Diagnostic Reports',
    deviceInfo: 'TouchID Platform Sensor',
    ipAddress: '103.21.244.18 (India - Secure Session)',
    actorName: 'Subham Pradhan (Self)',
    actorRole: 'PATIENT'
  },
  {
    id: 'bio-log-3',
    patientId: 'pat-rahul',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hrs ago
    authMethod: 'PASSCODE_PIN',
    status: 'FAILED',
    resourceAccessed: 'Digital Health Wallet',
    deviceInfo: 'PIN Fallback Challenge',
    ipAddress: '103.21.244.18 (India - Secure Session)',
    actorName: 'Subham Pradhan (Self)',
    actorRole: 'PATIENT',
    failureReason: 'Incorrect PIN entered on 1st attempt (Security lock engaged)'
  },
  {
    id: 'bio-log-4',
    patientId: 'pat-rahul',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    authMethod: 'FACE_ID',
    status: 'SUCCESS',
    resourceAccessed: 'Clinical History & Timeline',
    deviceInfo: 'FaceID Biometric Camera Scanner',
    ipAddress: '103.21.244.18 (India - Secure Session)',
    actorName: 'Subham Pradhan (Self)',
    actorRole: 'PATIENT'
  },
  {
    id: 'bio-log-5',
    patientId: 'pat-rahul',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    authMethod: 'CONSENT_TOKEN',
    status: 'SUCCESS',
    resourceAccessed: 'ABDM Record Share: Full Consultation History',
    deviceInfo: 'ABDM Health Information Exchange (HIE-CM)',
    ipAddress: '14.139.122.90 (Hospital OPD Terminal 4)',
    actorName: 'Dr. Ananya Sharma',
    actorRole: 'DOCTOR'
  }
];


