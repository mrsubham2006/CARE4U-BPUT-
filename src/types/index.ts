export type UserRole =
  | 'PATIENT'
  | 'ASHA_WORKER'
  | 'DOCTOR'
  | 'HOSPITAL_ADMIN'
  | 'LAB_STAFF'
  | 'PHARMACY_STAFF'
  | 'AMBULANCE_OPERATOR'
  | 'SUPER_ADMIN'
  | 'HEALTH_AUTHORITY';

export type Language = 'en' | 'hi' | 'mr' | 'or' | 'bn' | 'te' | 'ta' | 'kn' | 'gu' | 'ml' | 'pa';

export type TriageUrgency = 'EMERGENCY' | 'URGENT' | 'SAME_DAY' | 'ROUTINE';

export type AppointmentStatus =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_CONSULTATION'
  | 'CONSULTATION_COMPLETED'
  | 'LAB_PENDING'
  | 'PHARMACY_PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type LabOrderStatus = 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'REPORT_READY';

export type PrescriptionStatus = 'PENDING' | 'DISPENSED' | 'CANCELLED';

export type ReferralStatus =
  | 'CREATED'
  | 'RECEIVED'
  | 'ACCEPTED'
  | 'APPOINTMENT_SCHEDULED'
  | 'COMPLETED'
  | 'DECLINED';

export type StockStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type VerificationStatus = 'VERIFIED' | 'PENDING_VERIFICATION' | 'REJECTED';

export interface BiometricSecuritySettings {
  enabled: boolean;
  biometricType: 'FACE_ID' | 'FINGERPRINT' | 'SYSTEM_BIOMETRIC';
  requireForPrescriptions: boolean;
  requireForLabReports: boolean;
  requireForHealthWallet: boolean;
  requireForMedicalHistory: boolean;
  lockTimeoutMinutes: number; // 0 = immediate, 5 = 5 mins, 15 = 15 mins
  lastUnlockedTimestamp?: number;
  passcodeFallback: string; // e.g. "1234"
}

export interface BiometricAccessLog {
  id: string;
  patientId: string;
  timestamp: string;
  authMethod: 'FACE_ID' | 'FINGERPRINT' | 'SYSTEM_BIOMETRIC' | 'PASSCODE_PIN' | 'CONSENT_TOKEN' | 'EMERGENCY_OVERRIDE';
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  resourceAccessed: string;
  deviceInfo: string;
  ipAddress?: string;
  actorName: string;
  actorRole: string;
  failureReason?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  facilityId?: string;
  facilityName?: string;
  verificationStatus: VerificationStatus;
  avatar?: string;
  biometricSecurity?: BiometricSecuritySettings;
  // Patient specific
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  villageOrCity?: string;
  district?: string;
  state?: string;
  emergencyContact?: string;
  healthId?: string;
  preferredLanguage?: Language;
  // Clinician specific
  medicalRegistrationNumber?: string;
  specialization?: string;
  qualification?: string;
  department?: string;
  experienceYears?: number;
  // Staff specific
  workerId?: string;
  hospitalName?: string;
  labName?: string;
  pharmacyName?: string;
  facilityType?: string;
  token?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  villageOrCity: string;
  district?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  preferredLanguage?: Language;
  healthId: string; // e.g. "ABDM-9821-4412"
  abhaNumber?: string;
  abhaAddress?: string;
  verificationStatus?: 'VERIFIED' | 'PENDING';
  allergies?: string[];
  chronicConditions?: string[];
  previousSurgeries?: string[];
  currentMedications?: string[];
  familyHistory?: string[];
  familyMedicalHistory?: string[];
  vaccinationRecords?: { name: string; date: string; status: string; verified?: boolean }[];
  disabilityInfo?: string;
  medicalNotes?: string;
  emergencyMedicalSummary?: string;
  registeredByAshaId?: string;
  biometricSecurity?: BiometricSecuritySettings;
}

export interface MedicationReminderItem {
  id: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'CUSTOM';
  scheduledTime: string;
  takenToday: boolean;
  takenAt?: string;
  streakDays: number;
  notes?: string;
}

export interface HealthMetricRecord {
  id: string;
  date: string;
  systolicBp: number;
  diastolicBp: number;
  bloodGlucose: number;
  heartRate: number;
  spO2: number;
  weightKg: number;
  steps: number;
  sleepHours: number;
}

export interface WearableDevice {
  id: string;
  name: string;
  type: 'APPLE_WATCH' | 'FITBIT' | 'GOOGLE_FIT' | 'SAMSUNG_HEALTH' | 'GARMIN' | 'SMART_BAND';
  isConnected: boolean;
  lastSync: string;
  batteryPercent: number;
  iconName: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'District Hospital' | 'Community Health Centre' | 'Primary Health Centre' | 'Specialty Hospital' | 'Private Clinic';
  distanceKm: number;
  latitude: number;
  longitude: number;
  address: string;
  contactPhone: string;
  openStatus: 'OPEN_24_7' | 'OPEN_REGULAR' | 'BUSY' | 'OVERLOADED';
  departments: string[];
  doctorsCount: number;
  doctorsAvailable: number;
  currentQueue: number;
  estimatedWaitMins: number;
  emergencyCapability: boolean;
  emergencyLoadPercent: number;
  bedOccupancyPercent: number;
  opdCapacityPercent: number;
  diagnostics: {
    cbc: boolean;
    xray: boolean;
    mri: boolean;
    ctScan: boolean;
    ultrasound: boolean;
  };
  pharmacyStatus: 'FULL' | 'LIMITED' | 'STOCKOUT';
  statusColor: 'GREEN' | 'YELLOW' | 'RED';
  location?: string;
  avgWaitTimeMinutes?: number;
  emergencyBedsAvailable?: number;
  totalEmergencyBeds?: number;
  icuBedsAvailable?: number;
  totalIcuBeds?: number;
  hasLab?: boolean;
  specialties?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  facilityId: string;
  facilityName: string;
  department: string;
  specialty: string;
  isAvailable: boolean;
  activeQueueCount: number;
  avgConsultationMins: number;
  nextAvailableSlot: string;
  rating: number;
  consultationFee?: number;
  experienceYears?: number;
  qualifications?: string;
  languages?: string[];
}

export interface DigitalToken {
  tokenNumber: string; // e.g. "A-027"
  patientId: string;
  patientName: string;
  facilityId: string;
  facilityName: string;
  department: string;
  doctorId: string;
  doctorName: string;
  queuePosition: number;
  estimatedWaitMins: number;
  appointmentTime: string;
  createdAt: string;
  qrData: string;
}

export interface StructuredIntakeData {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  temperatureRecorded?: string;
  additionalNotes?: string;
  redFlagsDetected: boolean;
  redFlagDetails: string[];
  rawQuery?: string;
  language: Language;
  recommendedDepartment?: string;
  triageUrgency?: TriageUrgency;
}

export interface TriageAssessment {
  id: string;
  patientId: string;
  careLevel: TriageUrgency;
  urgencyLabel: string;
  recommendedService: string;
  confidenceScore: number;
  screeningChecks: {
    checkName: string;
    passed: boolean;
    detail: string;
  }[];
  suggestedAction: string;
  informationGaps: string[];
  disclaimer: string;
  createdAt: string;
}

export interface MedRouteCandidate {
  facility: Facility;
  fitScore: number; // 0 - 100
  recommended: boolean;
  isAvailableForNeed: boolean;
  reasons: string[];
  penaltyReasons?: string[];
  breakdown: {
    capabilityScore: number;
    doctorAvailabilityScore: number;
    queueScore: number;
    diagnosticsScore: number;
    pharmacyScore: number;
    distanceScore: number;
    emergencyCompatibilityScore: number;
  };
  estimatedTravelMins: number;
  estimatedWaitMins: number;
  availableDoctors: Doctor[];
}

export interface AppointmentMessage {
  id: string;
  sender: 'PATIENT' | 'DOCTOR' | 'SYSTEM';
  senderName: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface AppointmentFeedback {
  rating: number; // 1 to 5
  waitTimeRating?: number; // 1 to 5
  reviewText: string;
  experienceSummary?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  facilityId: string;
  facilityName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  token: DigitalToken;
  scheduledTime: string;
  scheduledDate?: string;
  consultationType?: 'IN_PERSON' | 'VIDEO';
  consultationFee?: number;
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentRecordId?: string;
  status: AppointmentStatus;
  symptomsSummary: string;
  triageLevel: TriageUrgency;
  documentsAttached?: string[];
  feedback?: AppointmentFeedback;
  messages?: AppointmentMessage[];
  createdAt: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  vitals: {
    temperature: string;
    bloodPressure: string;
    pulseRate: string;
    spO2: string;
    weightKg?: string;
  };
  clinicalObservations: string;
  provisionalDiagnosis: string;
  doctorNotes: string;
  prescribedMedicines: {
    medicineName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string;
  }[];
  orderedLabTests: string[];
  referralId?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface LabOrder {
  id: string;
  consultationId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  facilityId: string;
  facilityName?: string;
  testName: string;
  priority: 'Routine' | 'Urgent' | 'Stat';
  status: LabOrderStatus;
  orderedByDoctorName: string;
  orderedAt: string;
  createdAt?: string;
  sampleCollectedAt?: string;
  completedAt?: string;
  reportSummary?: string;
  reportValues?: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag?: 'Normal' | 'High' | 'Low';
  }[];
  parameters?: {
    parameterName: string;
    value: string | number;
    unit: string;
    normalRange: string;
    flag: string;
  }[];
  aiExtractedInsights?: string;
  reportFileUrl?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stockCount: number;
  minThreshold: number;
  status: StockStatus;
  dosageForm: string; // e.g. "Tablet 500mg", "Syrup 100ml"
  unitPrice: number;
}

export interface Prescription {
  id: string;
  consultationId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  items: {
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    availableInStock: boolean;
    instructions?: string;
  }[];
  status: PrescriptionStatus;
  notes?: string;
  dispensedAt?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromFacilityId: string;
  fromFacilityName: string;
  toFacilityId: string;
  toFacilityName: string;
  referringDoctorId: string;
  referringDoctorName: string;
  specialtyRequired: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  reasonForReferral: string;
  clinicalSummary: string;
  status: ReferralStatus;
  scheduledAppointmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  facilityId: string;
  facilityName: string;
  doctorId: string;
  doctorName: string;
  targetDate: string;
  purpose: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'OVERDUE';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole | 'ALL';
  targetUserId?: string;
  title: string;
  message: string;
  type:
    | 'APPOINTMENT_CONFIRMED'
    | 'QUEUE_UPDATE'
    | 'DOCTOR_ASSIGNED'
    | 'LAB_ORDER_CREATED'
    | 'LAB_REPORT_READY'
    | 'PRESCRIPTION_CREATED'
    | 'MEDICINE_READY'
    | 'REFERRAL_CREATED'
    | 'REFERRAL_ACCEPTED'
    | 'FOLLOWUP_DUE'
    | 'CAPACITY_ALERT'
    | 'STOCKOUT_ALERT'
    | 'SYSTEM_ALERT';
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface EmergencyAlert {
  id: string;
  facilityId: string;
  facilityName: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  metric: string;
  value: string;
  reason: string;
  recommendedAction: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedByRole: UserRole;
  userName: string;
  details: string;
  timestamp: string;
}

export interface RoutingWeights {
  capabilityWeight: number; // default 30
  doctorAvailabilityWeight: number; // default 20
  queueWeight: number; // default 15
  diagnosticsWeight: number; // default 10
  pharmacyWeight: number; // default 10
  distanceWeight: number; // default 10
  emergencyWeight: number; // default 5
}

export type AmbulanceTripStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'PATIENT_PICKED'
  | 'HOSPITAL_ARRIVAL'
  | 'COMPLETED';

export interface AmbulanceTrip {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  pickupAddress: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  ambulanceType: 'Basic Life Support (BLS)' | 'Advanced Life Support (ALS)' | 'Patient Transport' | 'Neonatal Ambulance' | 'Advanced Cardiac Life Support (ACLS)';
  emergencyLevel: 'CRITICAL' | 'URGENT' | 'STANDARD';
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  status: AmbulanceTripStatus;
  otp: string;
  etaMinutes: number;
  currentLat: number;
  currentLng: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId?: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  amount: number; // in INR
  currency: string;
  status: PaymentStatus;
  method?: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  verifiedAt?: string;
  createdAt: string;
}

export type MedicalDocType =
  | 'PRESCRIPTION'
  | 'LAB_REPORT'
  | 'RADIOLOGY'
  | 'DISCHARGE_SUMMARY'
  | 'CLINICAL_NOTE'
  | 'VACCINATION'
  | 'REFERRAL_LETTER'
  | 'OTHER';

export interface MedicalRecordDocument {
  id: string;
  patientId: string;
  title: string;
  recordType: MedicalDocType;
  date?: string;
  recordDate?: string;
  provider?: string;
  doctorName?: string;
  facility?: string;
  facilityName?: string;
  documentUrl?: string;
  fileName?: string;
  fileSize?: string;
  structuredMetadata?: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConsentToken {
  id: string;
  patientId: string;
  recipientRole: 'DOCTOR' | 'HOSPITAL' | 'LAB' | 'PHARMACY' | 'ASHA_WORKER' | 'CLINIC';
  recipientId?: string;
  recipientName: string;
  allowedRecordTypes: MedicalDocType[];
  allowedRecordIds?: string[];
  durationHours: number;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  token: string;
  createdAt: string;
}

export interface VideoConsultationSession {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  roomName: string;
  token: string;
  status: 'WAITING' | 'CONNECTED' | 'ENDED';
  startedAt?: string;
  endedAt?: string;
  clinicalNotesDraft?: string;
  provisionalDiagnosisDraft?: string;
}

export interface PrescriptionDraft {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityName: string;
  rawInput?: string;
  items: {
    medicineName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string;
  }[];
  clinicalNotes: string;
  status: 'DRAFT_REQUIRES_APPROVAL' | 'APPROVED';
  createdAt: string;
}

export interface OCRScanResult {
  fileName: string;
  confidenceScore: number;
  extractedMedicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    confidence: number; // 0-100
    isUncertain: boolean;
  }[];
  extractedDoctor?: string;
  extractedDate?: string;
  extractedFacility?: string;
}

export interface IntegrationStatus {
  service: string;
  name: string;
  status: 'ACTIVE' | 'CONFIGURED' | 'CREDENTIAL_REQUIRED';
  category: string;
  details: string;
  setupInstructions: string;
}

export type PatientViewTab =
  | 'HOME'
  | 'PROFILE'
  | 'AI_INTAKE'
  | 'FIND_CARE'
  | 'BOOK_APPOINTMENT'
  | 'MY_APPOINTMENTS'
  | 'QUEUE_PASS'
  | 'PRESCRIPTIONS'
  | 'MEDICINES_SCHEDULE'
  | 'LAB_REPORTS'
  | 'HEALTH_WALLET'
  | 'TIMELINE'
  | 'CONSENT_SHARING'
  | 'HEALTH_ID_QR'
  | 'VIDEO_CONSULTATION'
  | 'DOCTOR_MESSAGING'
  | 'EMERGENCY_SOS'
  | 'VITALS_ANALYTICS'
  | 'FAMILY_PROFILES'
  | 'INSURANCE_PMJAY'
  | 'PAYMENTS_BILLING';


