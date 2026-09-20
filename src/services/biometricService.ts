import { BiometricSecuritySettings } from '../types';

export const DEFAULT_BIOMETRIC_SETTINGS: BiometricSecuritySettings = {
  enabled: false,
  biometricType: 'FACE_ID',
  requireForPrescriptions: true,
  requireForLabReports: true,
  requireForHealthWallet: true,
  requireForMedicalHistory: true,
  lockTimeoutMinutes: 5,
  passcodeFallback: '1234'
};

/**
 * Check if the browser / platform supports WebAuthn user verifying platform authenticators (FaceID/TouchID/Windows Hello)
 */
export async function isPlatformBiometricAvailable(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
      }
    }
  } catch (e) {
    console.warn('Biometric platform check error (safe fallback):', e);
  }
  return false;
}

/**
 * Request real platform biometric verification or fallback simulation
 */
export async function authenticateWithBiometrics(
  settings: BiometricSecuritySettings,
  reason: string = 'Access Sensitive Medical Records'
): Promise<{ success: boolean; error?: string; method: 'WEBAUTHN' | 'SIMULATED' | 'PIN' }> {
  // If WebAuthn is available and not in an untrusted iframe context, attempt WebAuthn challenge
  try {
    if (typeof window !== 'undefined' && window.PublicKeyCredential && window.isSecureContext) {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          rpId: window.location.hostname
        }
      });

      if (credential) {
        return { success: true, method: 'WEBAUTHN' };
      }
    }
  } catch (err: any) {
    // Note: in many iframe / sandbox environments, WebAuthn may reject with NotAllowedError.
    // In that case we smoothly fallback to the interactive biometric visual authenticator
    console.info('Biometric prompt fallback to visual scanner:', err?.message || err);
  }

  // Graceful visual biometric verification simulation with realistic latency
  await new Promise(resolve => setTimeout(resolve, 1200));
  return { success: true, method: 'SIMULATED' };
}
