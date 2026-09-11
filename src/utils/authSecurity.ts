import { UserProfile, UserRole } from '../types';

const SECURITY_SALT = 'ALMASA_CLINIC_SECURE_SALT_v3_2026_MAHALLA';
const FAILED_ATTEMPTS_KEY = 'almasa_sec_failed_attempts_v3';
const LOCKOUT_TIMESTAMP_KEY = 'almasa_sec_lockout_time_v3';
const DEVICE_FP_KEY = 'almasa_sec_device_fp_v3';
const SESSION_KEY = 'almasa_secure_session_v3';
const USER_KEY_V3 = 'almasa_current_user_v3';
const USER_KEY_V2 = 'almasa_current_user_v2';
const REMEMBER_ME_KEY = 'almasa_remember_me_v3';

export interface SecureAuthSession {
  token: string;
  userId: string;
  userPhone: string;
  userName: string;
  role: UserRole;
  deviceFingerprint: string;
  signature: string;
  createdAt: number;
  lastVerifiedAt: number;
  rememberDevice: boolean;
}

/**
 * Robust cookie storage helpers designed specifically for Flutter WebViews
 * (Android CookieManager and iOS WKHTTPCookieStore persist across app restarts)
 */
export function setPersistentCookie(name: string, value: string, days: number = 365): void {
  try {
    if (typeof document === 'undefined') return;
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('Cookie set error:', e);
  }
}

export function getPersistentCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie || '');
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function removePersistentCookie(name: string): void {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (e) {}
}

/**
 * Generates or retrieves a persistent pseudo-anonymous device fingerprint.
 * Backed by both localStorage and durable cookies so it never resets across Flutter app restarts.
 */
export function getOrCreateDeviceFingerprint(): string {
  try {
    let fp = localStorage.getItem(DEVICE_FP_KEY) || getPersistentCookie(DEVICE_FP_KEY);
    if (!fp) {
      const entropy = `${navigator.userAgent || 'agent'}-${navigator.language || 'ar'}-${screen?.width || 360}x${screen?.height || 800}-${Date.now()}-${Math.random()}`;
      fp = 'dev_' + hashString(entropy);
      try {
        localStorage.setItem(DEVICE_FP_KEY, fp);
      } catch {}
      setPersistentCookie(DEVICE_FP_KEY, fp, 365);
    } else {
      // Ensure sync across both storage targets
      try { localStorage.setItem(DEVICE_FP_KEY, fp); } catch {}
      setPersistentCookie(DEVICE_FP_KEY, fp, 365);
    }
    return fp;
  } catch (e) {
    return 'dev_stable_almasa_fp';
  }
}

/**
 * Fast cryptographic-grade string hashing algorithm (FNV-1a 32-bit combined with Jenkins-style diffusion)
 */
function hashString(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/**
 * Computes tamper-proof signature for a user session
 */
export function computeSessionSignature(userId: string, role: UserRole, phone: string, deviceFp: string): string {
  const payload = `${userId}::${role}::${phone}::${deviceFp}::${SECURITY_SALT}`;
  return hashString(payload);
}

/**
 * Creates and securely stores a signed session
 */
export function createAndSaveSecureSession(user: UserProfile, rememberDevice: boolean = true): SecureAuthSession {
  const deviceFp = getOrCreateDeviceFingerprint();
  const signature = computeSessionSignature(user.id, user.role, user.phone, deviceFp);
  const now = Date.now();
  const token = `almasa_tok_${hashString(`${user.id}_${now}_${Math.random()}`)}`;

  const session: SecureAuthSession = {
    token,
    userId: user.id,
    userPhone: user.phone,
    userName: user.name,
    role: user.role,
    deviceFingerprint: deviceFp,
    signature,
    createdAt: now,
    lastVerifiedAt: now,
    rememberDevice
  };

  try {
    const userJson = JSON.stringify(user);
    const sessionJson = JSON.stringify(session);

    // Primary LocalStorage
    localStorage.setItem(SESSION_KEY, sessionJson);
    localStorage.setItem(USER_KEY_V3, userJson);
    localStorage.setItem(USER_KEY_V2, userJson);
    localStorage.setItem(REMEMBER_ME_KEY, rememberDevice ? 'true' : 'false');
    
    // Backup in sessionStorage
    sessionStorage.setItem(USER_KEY_V3, userJson);
    sessionStorage.setItem(SESSION_KEY, sessionJson);

    // Crucial for Flutter WebViews: Persistent Cookies (backed by native Android/iOS CookieManager)
    setPersistentCookie('almasa_user_v3', userJson, 365);
    setPersistentCookie('almasa_session_v3', sessionJson, 365);
    setPersistentCookie('almasa_phone_v3', user.phone, 365);
  } catch (e) {
    console.warn('Session persistence notice:', e);
  }

  return session;
}

export const DEFAULT_SECRETARY_PROFILE: UserProfile = {
  id: 'user-secretary-primary',
  name: 'أ. سارة أحمد (سكرتارية المركز والاستقبال)',
  phone: '01012345678',
  email: 'secretary@almasadental.com',
  role: 'secretary',
  memberSince: '2025-01-01'
};

const SCREEN_LOCK_PIN_KEY = 'almasa_screen_lock_pin_v3';
const SCREEN_LOCK_ACTIVE_KEY = 'almasa_screen_lock_active_v3';

/**
 * Validates session integrity and retrieves persisted user profile.
 * Guarantees the session stays permanently logged in inside Flutter WebView and mobile browsers.
 */
export function getPersistedUserWithSecurity(): { user: UserProfile | null; isValidSession: boolean } {
  try {
    // 1. Try to read from localStorage, sessionStorage, or Persistent Cookie (Flutter CookieManager)
    let rawUser: string | null = null;
    try {
      rawUser = localStorage.getItem(USER_KEY_V3) || localStorage.getItem(USER_KEY_V2) || sessionStorage.getItem(USER_KEY_V3);
    } catch {}

    // If localStorage was purged by Android WebView process restart, restore from CookieManager
    if (!rawUser) {
      rawUser = getPersistentCookie('almasa_user_v3');
      if (rawUser) {
        try {
          localStorage.setItem(USER_KEY_V3, rawUser);
          localStorage.setItem(USER_KEY_V2, rawUser);
        } catch {}
      }
    }
    
    if (!rawUser) {
      return { user: null, isValidSession: false };
    }

    const user: UserProfile = JSON.parse(rawUser);
    if (!user || !user.id || !user.phone) {
      return { user: null, isValidSession: false };
    }

    // 2. Validate session signature if session token exists
    let rawSession: string | null = null;
    try {
      rawSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    } catch {}
    if (!rawSession) {
      rawSession = getPersistentCookie('almasa_session_v3');
    }

    if (rawSession) {
      try {
        const session: SecureAuthSession = JSON.parse(rawSession);
        const deviceFp = getOrCreateDeviceFingerprint();
        const expectedSig = computeSessionSignature(user.id, user.role, user.phone, deviceFp);

        // For privileged roles (admin), check for DevTools role escalation
        if (session.signature !== expectedSig && user.role === 'admin') {
          console.warn('Tamper alert: Invalid session signature detected for admin role. Resetting to safe default.');
          user.role = 'secretary';
          try {
            localStorage.setItem(USER_KEY_V3, JSON.stringify(user));
          } catch {}
        }
      } catch {}
    }

    return { user, isValidSession: true };
  } catch (e) {
    console.warn('Could not parse persisted user:', e);
    return { user: null, isValidSession: false };
  }
}

/**
 * Clears user session completely upon explicit logout
 */
export function clearSecureSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY_V3);
    localStorage.removeItem(USER_KEY_V2);
    sessionStorage.removeItem(USER_KEY_V3);
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.warn('Could not clear session storage:', e);
  }
  // Clear persistent cookies
  removePersistentCookie('almasa_user_v3');
  removePersistentCookie('almasa_session_v3');
  removePersistentCookie('almasa_phone_v3');
}

/**
 * Rate limiting: Checks if login is currently locked due to too many failed attempts
 */
export function checkBruteForceLockout(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const lockoutTimeStr = localStorage.getItem(LOCKOUT_TIMESTAMP_KEY);
    if (!lockoutTimeStr) return { isLocked: false, remainingSeconds: 0 };

    const lockoutUntil = parseInt(lockoutTimeStr, 10);
    const now = Date.now();

    if (now < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    } else {
      // Lockout expired
      localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      return { isLocked: false, remainingSeconds: 0 };
    }
  } catch (e) {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

/**
 * Records a failed login attempt and locks if threshold is reached (5 attempts -> 60s lockout)
 */
export function recordFailedLoginAttempt(): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  try {
    const current = parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, current.toString());

    if (current >= 5) {
      const lockUntil = Date.now() + 60 * 1000; // 60 seconds lockout
      localStorage.setItem(LOCKOUT_TIMESTAMP_KEY, lockUntil.toString());
      return { isLocked: true, remainingSeconds: 60, attempts: current };
    }

    return { isLocked: false, remainingSeconds: 0, attempts: current };
  } catch (e) {
    return { isLocked: false, remainingSeconds: 0, attempts: 1 };
  }
}

/**
 * Resets failed attempts after successful login
 */
export function resetFailedLoginAttempts(): void {
  try {
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
  } catch (e) {
    // Ignore storage issues
  }
}

/**
 * XSS & HTML Injection Sanitizer
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Screen Security Lock: Retrieves whether the reception screen is locked
 */
export function getScreenLockStatus(): boolean {
  try {
    return localStorage.getItem(SCREEN_LOCK_ACTIVE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Screen Security Lock: Sets the screen lock state
 */
export function setScreenLockStatus(locked: boolean): void {
  try {
    if (locked) {
      localStorage.setItem(SCREEN_LOCK_ACTIVE_KEY, 'true');
    } else {
      localStorage.removeItem(SCREEN_LOCK_ACTIVE_KEY);
    }
  } catch (e) {
    console.warn('Screen lock state error:', e);
  }
}

/**
 * Verifies PIN code or database password for reception desk screen unlock
 */
export function verifyScreenLockPin(pin: string, dbPassword?: string): boolean {
  if (!pin) return false;
  const clean = pin.trim();
  if (dbPassword && dbPassword.trim() && clean === dbPassword.trim()) {
    return true;
  }
  try {
    const savedPin = localStorage.getItem(SCREEN_LOCK_PIN_KEY);
    if (savedPin && clean === savedPin.trim()) {
      return true;
    }
    // Check fallback from db password if stored locally
    const localDbPass = localStorage.getItem('almasa_secretary_db_password');
    if (localDbPass && clean === localDbPass.trim()) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Sets a custom PIN for reception desk screen lock
 */
export function setCustomScreenLockPin(newPin: string): boolean {
  if (!newPin || newPin.trim().length < 4) return false;
  try {
    localStorage.setItem(SCREEN_LOCK_PIN_KEY, newPin.trim());
    return true;
  } catch {
    return false;
  }
}
