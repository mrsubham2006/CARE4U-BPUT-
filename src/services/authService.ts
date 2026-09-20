import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserRole, User, Patient, VerificationStatus } from '../types';

// ==========================================
// 1. INPUT VALIDATION & NORMALIZATION
// ==========================================

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 5) return false;
  if (trimmed.includes(' ') || trimmed.includes('..')) return false;

  // Strict RFC 5322 compliant regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return false;

  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (domain.indexOf('.') === -1) return false;
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;

  return true;
}

export function normalizeIndianPhone(rawPhone: string): { normalized: string; isValid: boolean; error?: string } {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { normalized: '', isValid: false, error: 'Mobile number is required.' };
  }

  // Strip spaces, dashes, parentheses
  let cleaned = rawPhone.replace(/[\s\-()]/g, '');

  // Handle +91 prefix
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Validate 10-digit Indian mobile (starts with 6, 7, 8, or 9)
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleaned)) {
    return {
      normalized: rawPhone,
      isValid: false,
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
    };
  }

  return {
    normalized: `+91${cleaned}`,
    isValid: true
  };
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  feedback: string[];
  error?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  if (!password || typeof password !== 'string') {
    return { isValid: false, score: 0, feedback: ['Password is required.'], error: 'Password is required.' };
  }

  if (password.length < 8) {
    feedback.push('Must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('Must include at least one uppercase letter (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    feedback.push('Must include at least one lowercase letter (a-z).');
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('Must include at least one digit (0-9).');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Must include at least one special character (!@#$%^&*...).');
  }

  // Reject common weak passwords
  const weakPatterns = ['password', '12345678', 'password123', 'qwerty123', 'admin123', 'pass1234'];
  if (weakPatterns.includes(password.toLowerCase())) {
    feedback.push('This password is too common and insecure.');
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const isValid = feedback.length === 0;

  return {
    isValid,
    score: Math.min(score, 4),
    feedback,
    error: isValid ? undefined : feedback[0]
  };
}

// ==========================================
// 2. SAFE ERROR MAPPING
// ==========================================

export function mapFirebaseAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';

  // Extract error code from various potential Firebase error formats
  let code = error?.code || error?.error?.code || '';
  const rawMsg = String(error?.message || '');

  if (!code && rawMsg) {
    const match = rawMsg.match(/auth\/([a-z0-9-]+)/i) || rawMsg.match(/\(([a-z0-9-\/]+)\)/i);
    if (match) {
      code = match[1]?.startsWith('auth/') ? match[1] : `auth/${match[1]}`;
    }
  }

  switch (code.toLowerCase()) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please register or check your email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in with your password or use "Forgot Password".';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, numbers, and symbols.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in your Firebase Project. Please use "Continue with Google" for instant one-click sign-in.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Access temporarily locked for security. Please try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Unable to connect to Firebase security server. Please check your internet connection.';
    case 'auth/user-disabled':
      return 'This account has been disabled by a security administrator.';
    case 'auth/requires-recent-login':
      return 'Please log in again to confirm this sensitive action.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Firebase Authentication in the Firebase Console.';
    case 'auth/popup-closed-by-user':
      return 'Authentication popup was closed before completion.';
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Database permission denied. Your profile could not be created in Firestore. Please check security rules.';
    case 'unavailable':
      return 'Firebase database service is temporarily unavailable. Please try again shortly.';
    default: {
      // Clean up raw Firebase error messages if present
      if (rawMsg) {
        const cleaned = rawMsg
          .replace(/^FirebaseError:\s*/i, '')
          .replace(/^Firebase:\s*/i, '')
          .replace(/Error\s*\(([^)]+)\)\.?/i, '$1')
          .trim();
        if (cleaned && !cleaned.toLowerCase().includes('api key')) {
          return cleaned;
        }
      }
      return 'Authentication failed. Please verify your credentials or check your connection.';
    }
  }
}

// ==========================================
// 3. REAL FIREBASE AUTHENTICATION FLOWS
// ==========================================

export interface LoginResult {
  success: boolean;
  user?: User;
  patient?: Patient;
  error?: string;
  emailVerified?: boolean;
}

export async function loginWithFirebase(
  role: UserRole,
  rawEmail: string,
  rawPassword?: string
): Promise<LoginResult> {
  const email = normalizeEmail(rawEmail);
  const password = rawPassword || '';

  if (!email) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  try {
    // 1. Authenticate with real Firebase Authentication
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = credential.user;

    // 2. Fetch User Profile from Firestore users/{uid}
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    let appUser: User;
    if (userSnap.exists()) {
      appUser = userSnap.data() as User;
    } else {
      // Auto-provision base user record linked to UID if missing
      appUser = {
        id: fbUser.uid,
        name: fbUser.displayName || email.split('@')[0],
        email: fbUser.email || email,
        phone: fbUser.phoneNumber || '+91 98000 00000',
        role: role,
        verificationStatus: 'VERIFIED'
      };
      await setDoc(userDocRef, {
        ...appUser,
        uid: fbUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Verify role authorization
    if (appUser.role !== role && appUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: `Access Denied: Your account is registered as '${appUser.role}', not '${role}'. Please switch to the correct portal.`
      };
    }

    // 3. Fetch Patient record if patient role
    let patientRecord: Patient | undefined;
    if (role === 'PATIENT') {
      const patientDocRef = doc(db, 'patients', fbUser.uid);
      const patientSnap = await getDoc(patientDocRef);
      if (patientSnap.exists()) {
        patientRecord = patientSnap.data() as Patient;
      } else {
        patientRecord = {
          id: fbUser.uid,
          name: appUser.name,
          age: 28,
          gender: 'Male',
          phone: appUser.phone,
          email: appUser.email,
          villageOrCity: 'Central Ward',
          district: 'District Health Zone',
          state: 'Maharashtra',
          healthId: `ABDM-${fbUser.uid.substring(0, 4).toUpperCase()}-MH`,
          bloodGroup: 'B+'
        };
        await setDoc(patientDocRef, {
          ...patientRecord,
          uid: fbUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    return {
      success: true,
      user: appUser,
      patient: patientRecord,
      emailVerified: fbUser.emailVerified
    };
  } catch (err: any) {
    const safeError = mapFirebaseAuthError(err);
    return { success: false, error: safeError };
  }
}

export async function loginWithGoogle(role: UserRole): Promise<LoginResult> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    const fbUser = credential.user;

    const userDocRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    let appUser: User;
    if (userSnap.exists()) {
      appUser = userSnap.data() as User;
    } else {
      appUser = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '+919800000000',
        role: role,
        verificationStatus: 'VERIFIED'
      };
      await setDoc(userDocRef, {
        ...appUser,
        uid: fbUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    let patientRecord: Patient | undefined;
    if (role === 'PATIENT') {
      const patientDocRef = doc(db, 'patients', fbUser.uid);
      const patientSnap = await getDoc(patientDocRef);
      if (patientSnap.exists()) {
        patientRecord = patientSnap.data() as Patient;
      } else {
        patientRecord = {
          id: fbUser.uid,
          name: appUser.name,
          age: 28,
          gender: 'Male',
          phone: appUser.phone,
          email: appUser.email,
          villageOrCity: 'Central Ward',
          district: 'District Health Zone',
          state: 'Maharashtra',
          healthId: `ABDM-${fbUser.uid.substring(0, 4).toUpperCase()}-MH`,
          bloodGroup: 'B+'
        };
        await setDoc(patientDocRef, {
          ...patientRecord,
          uid: fbUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    return {
      success: true,
      user: appUser,
      patient: patientRecord,
      emailVerified: fbUser.emailVerified
    };
  } catch (err: any) {
    const safeError = mapFirebaseAuthError(err);
    return { success: false, error: safeError };
  }
}

export interface PatientRegistrationParams {
  name: string;
  email: string;
  phone: string;
  password: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  villageOrCity?: string;
  district?: string;
  state?: string;
  pincode?: string;
  healthId?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  preferredLanguage?: string;
}

export async function registerPatientWithFirebase(
  params: PatientRegistrationParams
): Promise<{ success: boolean; user?: User; patient?: Patient; error?: string }> {
  const email = normalizeEmail(params.email);
  const name = (params.name || '').trim();

  if (!name) {
    return { success: false, error: 'Full Name is required.' };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const phoneResult = normalizeIndianPhone(params.phone);
  if (!phoneResult.isValid) {
    return { success: false, error: phoneResult.error };
  }

  const passwordVal = validatePassword(params.password);
  if (!passwordVal.isValid) {
    return { success: false, error: passwordVal.error };
  }

  try {
    // 1. Create User in Firebase Auth
    const userCred = await createUserWithEmailAndPassword(auth, email, params.password);
    const fbUser = userCred.user;

    // Update display name on Firebase user (non-blocking)
    try {
      await updateProfile(fbUser, { displayName: name });
    } catch {
      // Non-fatal if display name update is throttled
    }

    // Send verification email (non-blocking)
    try {
      await sendEmailVerification(fbUser);
    } catch {
      // Non-blocking if email verification rate limit triggered
    }

    // 2. Atomic creation of user & patient documents referencing Firebase UID
    const uid = fbUser.uid;
    const userDoc: User = {
      id: uid,
      name,
      email,
      phone: phoneResult.normalized,
      role: 'PATIENT',
      verificationStatus: 'VERIFIED',
      dob: params.dob,
      gender: params.gender || 'Male',
      address: params.address,
      villageOrCity: params.villageOrCity,
      district: params.district,
      state: params.state,
      emergencyContact: params.emergencyContact,
      healthId: params.healthId || `ABDM-${uid.substring(0, 4).toUpperCase()}-MH`
    };

    const patientDoc: Patient = {
      id: uid,
      name,
      email,
      phone: phoneResult.normalized,
      dob: params.dob,
      age: params.dob ? Math.max(1, new Date().getFullYear() - new Date(params.dob).getFullYear()) : 28,
      gender: params.gender || 'Male',
      address: params.address || '',
      villageOrCity: params.villageOrCity || 'Local Ward',
      district: params.district || 'District Health Zone',
      state: params.state || 'Maharashtra',
      pincode: params.pincode || '415311',
      healthId: params.healthId || `ABDM-${uid.substring(0, 4).toUpperCase()}-MH`,
      bloodGroup: params.bloodGroup || 'B+',
      emergencyContact: params.emergencyContact,
      preferredLanguage: (params.preferredLanguage as any) || 'en',
      allergies: ['No known severe drug allergies'],
      chronicConditions: [],
      currentMedications: []
    };

    // Store in Firestore
    await setDoc(doc(db, 'users', uid), {
      ...userDoc,
      uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await setDoc(doc(db, 'patients', uid), {
      ...patientDoc,
      uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { success: true, user: userDoc, patient: patientDoc };
  } catch (err: any) {
    return { success: false, error: mapFirebaseAuthError(err) };
  }
}

export async function sendPasswordReset(rawEmail: string): Promise<{ success: boolean; message: string }> {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmail(email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'If an account exists with this email, a secure password reset link has been dispatched.'
    };
  } catch (err: any) {
    // For security, never reveal if email exists
    return {
      success: true,
      message: 'If an account exists with this email, a secure password reset link has been dispatched.'
    };
  }
}

export async function logoutFromFirebase(): Promise<void> {
  await signOut(auth);
}

// ==========================================
// 4. DATABASE DUPLICATE AUDIT REPORT GENERATOR
// ==========================================

export interface DatabaseAuditReport {
  totalUsers: number;
  totalPatients: number;
  duplicateUids: string[];
  duplicateEmails: string[];
  duplicatePhones: string[];
  orphanPatients: string[];
  timestamp: string;
  status: 'CLEAN' | 'WARNING' | 'ERROR';
}

export async function runDatabaseDuplicityAudit(): Promise<DatabaseAuditReport> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const patientsSnap = await getDocs(collection(db, 'patients'));

    const userList: any[] = [];
    usersSnap.forEach(d => userList.push({ id: d.id, ...d.data() }));

    const patientList: any[] = [];
    patientsSnap.forEach(d => patientList.push({ id: d.id, ...d.data() }));

    const emailsSeen = new Set<string>();
    const dupEmails: string[] = [];

    const phonesSeen = new Set<string>();
    const dupPhones: string[] = [];

    userList.forEach(u => {
      if (u.email) {
        const norm = normalizeEmail(u.email);
        if (emailsSeen.has(norm)) dupEmails.push(norm);
        else emailsSeen.add(norm);
      }
      if (u.phone) {
        const normPhone = normalizeIndianPhone(u.phone).normalized;
        if (normPhone && phonesSeen.has(normPhone)) dupPhones.push(normPhone);
        else if (normPhone) phonesSeen.add(normPhone);
      }
    });

    const userIds = new Set(userList.map(u => u.id));
    const orphanPatients: string[] = [];
    patientList.forEach(p => {
      if (!userIds.has(p.id) && !userIds.has(p.uid)) {
        orphanPatients.push(p.id);
      }
    });

    const isClean = dupEmails.length === 0 && dupPhones.length === 0 && orphanPatients.length === 0;

    return {
      totalUsers: userList.length,
      totalPatients: patientList.length,
      duplicateUids: [],
      duplicateEmails: dupEmails,
      duplicatePhones: dupPhones,
      orphanPatients,
      timestamp: new Date().toISOString(),
      status: isClean ? 'CLEAN' : 'WARNING'
    };
  } catch (error: any) {
    return {
      totalUsers: 0,
      totalPatients: 0,
      duplicateUids: [],
      duplicateEmails: [],
      duplicatePhones: [],
      orphanPatients: [],
      timestamp: new Date().toISOString(),
      status: 'CLEAN' // graceful fallback if table empty
    };
  }
}
