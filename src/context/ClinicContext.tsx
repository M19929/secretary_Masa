import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  DentalService,
  DentalOffer,
  Doctor,
  Appointment,
  PatientRecord,
  NotificationItem,
  AppViewMode,
  ClientTab,
  AppointmentStatus,
  UserProfile,
  UserRole,
  AuthMode,
  DoctorReview,
  ClinicPhoto,
  PaymentRecord,
  PaymentMethod,
  MedicalConsent,
  PatientInvoice
} from '../types';
import { formatNotificationTime, getNotificationTimestamps } from '../utils/notificationTime';
import {
  INITIAL_SERVICES,
  INITIAL_OFFERS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_PATIENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DOCTOR_REVIEWS,
  CLINIC_INFO,
  INITIAL_GALLERY
} from '../data/mockData';
import { db, collection, doc, setDoc, getDocs, onSnapshot, updateDoc, deleteDoc, cleanForFirestore } from '../firebase';
import { playNotificationSound, sendBrowserNotification } from '../utils/notificationSound';
import { printElement } from '../utils/printHelper';
import {
  createAndSaveSecureSession,
  getPersistedUserWithSecurity,
  clearSecureSession,
  checkBruteForceLockout,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  sanitizeText,
  getScreenLockStatus,
  setScreenLockStatus,
  verifyScreenLockPin,
  setCustomScreenLockPin,
  DEFAULT_SECRETARY_PROFILE
} from '../utils/authSecurity';
import { isFlutterApkPlatform } from '../utils/platformHelper';

interface ClinicContextType {
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  clientTab: ClientTab;
  setClientTab: (tab: ClientTab) => void;

  // Authentication & Current User
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isSessionEncrypted: boolean;
  lockoutRemainingSeconds: number;
  rememberMeEnabled: boolean;
  setRememberMeEnabled: (val: boolean) => void;
  registeredUsers: UserProfile[];
  authModalOpen: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  login: (phoneOrEmail: string, passwordOrOtp: string, role?: UserRole) => boolean;
  register: (data: Partial<UserProfile> & { password?: string }) => UserProfile;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  deleteUser: (userId: string) => void;

  // Reception Desk Security Screen Lock & Secretary Dashboard Gate
  isScreenLocked: boolean;
  lockScreen: () => void;
  unlockScreen: (pin: string) => boolean;
  changeScreenLockPin: (newPin: string) => boolean;
  isSecretaryDashboardUnlocked: boolean;
  unlockSecretaryDashboard: (password: string, rememberMe?: boolean) => boolean;
  lockSecretaryDashboard: () => void;
  
  // Data
  services: DentalService[];
  offers: DentalOffer[];
  doctors: Doctor[];
  appointments: Appointment[];
  patients: PatientRecord[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  clinicInfo: typeof CLINIC_INFO;

  // Booking Flow State
  selectedService: DentalService | null;
  setSelectedService: (service: DentalService | null) => void;
  selectedOffer: DentalOffer | null;
  setSelectedOffer: (offer: DentalOffer | null) => void;
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doctor: Doctor | null) => void;
  bookingStep: number;
  setBookingStep: (step: number) => void;
  startBooking: (service?: DentalService, offer?: DentalOffer) => void;
  
  // Actions
  createAppointment: (data: Omit<Appointment, 'id' | 'appointmentCode' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (id: string, newDate: string, newTimeSlot: string) => void;
  cancelAppointment: (id: string) => void;
  deleteAppointment: (id: string) => void;
  clearAllAppointments: () => void;
  addService: (service: Omit<DentalService, 'id'>) => void;
  updateService: (service: DentalService) => void;
  deleteService: (id: string) => void;
  addOffer: (offer: Omit<DentalOffer, 'id'>, notifyClients?: boolean) => void;
  updateOffer: (offer: DentalOffer) => void;
  deleteOffer: (id: string) => void;
  addDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  updateDoctor: (doctor: Doctor) => void;
  deleteDoctor: (id: string) => void;
  broadcastNotification: (title: string, message: string, type?: 'offer' | 'system' | 'appointment') => void;
  markNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  activeBannerNotification: NotificationItem | null;
  dismissBannerNotification: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  playNotificationChime: () => void;
  handleNotificationClick: (notif: NotificationItem) => void;
  activeConsentModalApt: Appointment | null;
  openConsentModal: (apt: Appointment) => void;
  closeConsentModal: () => void;
  activeInvoiceModalApt: Appointment | null;
  openInvoiceModal: (apt: Appointment) => void;
  closeInvoiceModal: () => void;
  activeSecretaryTab: 'all_bookings' | 'consents' | 'installments_billing' | 'timeline' | 'patients' | 'doctors' | 'offers_and_notifs' | 'services' | 'users_roles' | 'media_settings';
  setActiveSecretaryTab: (tab: 'all_bookings' | 'consents' | 'installments_billing' | 'timeline' | 'patients' | 'doctors' | 'offers_and_notifs' | 'services' | 'users_roles' | 'media_settings') => void;
  rateAppointment: (appointmentId: string, doctorId: string, rating: number, comment?: string) => void;
  deleteDoctorReview: (appointmentId: string) => void;
  doctorReviews: DoctorReview[];
  ratingModalApt: Appointment | null;
  openRatingModal: (apt: Appointment) => void;
  closeRatingModal: () => void;

  // Patient Medical Files Directory
  addPatientRecord: (data: Omit<PatientRecord, 'id' | 'totalVisits'>) => void;
  updatePatientRecord: (patient: PatientRecord) => void;
  addPatientMedicalNote: (patientId: string, noteText: string) => void;
  
  // Installments and Payments Tracking (Orthodontics & Treatments)
  recordPayment: (appointmentId: string, payment: Omit<PaymentRecord, 'id'>, newTotalAmount?: number) => void;
  updateAppointmentPayment: (
    appointmentId: string,
    updates: {
      totalAmount?: number;
      paidAmount?: number;
      remainingAmount?: number;
      paymentStatus?: 'unpaid' | 'paid' | 'partial';
      isInstallment?: boolean;
      installmentNote?: string;
    }
  ) => void;
  deletePaymentRecord: (appointmentId: string, paymentRecordId: string) => void;

  // Secretary Database Password (Firestore)
  secretaryPassword: string;
  updateSecretaryPasswordInDb: (newPassword: string) => Promise<boolean>;

  // Private 1-on-1 Patient Follow-up Messaging
  sendPrivateFollowupMessage: (params: {
    patientPhone: string;
    patientName: string;
    title: string;
    message: string;
    category?: 'surgery' | 'whitening' | 'reminder' | 'billing' | 'general';
  }) => Promise<boolean>;

  // Medical Consent Forms & Auto-Invoices
  saveMedicalConsent: (appointmentId: string, consent: MedicalConsent) => Promise<void>;
  createWalkinConsentAppointment: (
    patientName: string,
    patientPhone: string,
    procedureName: string,
    doctorName: string,
    patientNationalId?: string
  ) => Promise<Appointment>;
  deleteMedicalConsent: (appointmentId: string) => Promise<void>;
  getBlockingConsentAppointment: (userPhone?: string, userName?: string) => Appointment | null;
  issuePatientInvoice: (appointmentId: string, invoice: PatientInvoice, autoPrint?: boolean) => Promise<void>;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
  updateClinicInfo: (info: Partial<typeof CLINIC_INFO>) => void;

  // Gallery
  clinicGallery: ClinicPhoto[];
  addClinicPhoto: (photo: Omit<ClinicPhoto, 'id' | 'createdAt'>) => void;
  deleteClinicPhoto: (photoId: string) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Active App View Mode: Strictly Secretary for Web; Patient mode only for Flutter APK / mobile client
  const [viewMode, setViewModeState] = useState<AppViewMode>(() => {
    try {
      if (isFlutterApkPlatform()) {
        return 'client';
      }
      // On Web: strictly and exclusively Secretary
      return 'secretary';
    } catch {
      return 'secretary';
    }
  });

  const setViewMode = (mode: AppViewMode) => {
    // If not in Flutter APK and client mode is requested, on web we enforce secretary
    if (!isFlutterApkPlatform() && mode === 'client') {
      setViewModeState('secretary');
      try {
        localStorage.setItem('almasa_view_mode_v4', 'secretary');
      } catch {}
      return;
    }
    setViewModeState(mode);
    try {
      localStorage.setItem('almasa_view_mode_v4', mode);
    } catch {}
  };
  const [clientTab, setClientTab] = useState<ClientTab>('home');

  // Registered users list from localStorage & Firestore
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('almasa_registered_users_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistent Authenticated User (hydrated with signature verification)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const { user } = getPersistedUserWithSecurity();
    return user;
  });

  const [isSessionEncrypted] = useState<boolean>(true);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(() => {
    const lockout = checkBruteForceLockout();
    return lockout.isLocked ? lockout.remainingSeconds : 0;
  });
  const [rememberMeEnabled, setRememberMeEnabled] = useState<boolean>(true);

  // Countdown timer for security lockout if active
  useEffect(() => {
    if (lockoutRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemainingSeconds]);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Secretary Database Password (stored in Firestore clinic_settings/secretary_security)
  const [secretaryPassword, setSecretaryPassword] = useState<string>(() => {
    return localStorage.getItem('almasa_secretary_db_password') || 'Almasa@2026';
  });

  // Reception Desk Screen Lock State
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(() => getScreenLockStatus());

  const lockScreen = () => {
    setIsScreenLocked(true);
    setScreenLockStatus(true);
    showToast('تم قفل شاشة الاستقبال لتأمين بيانات وحسابات المرضى 🔒');
  };

  const unlockScreen = (pin: string): boolean => {
    if (verifyScreenLockPin(pin, secretaryPassword)) {
      setIsScreenLocked(false);
      setScreenLockStatus(false);
      showToast('تم فتح قفل الشاشة بنجاح ✓');
      return true;
    } else {
      showToast('رمز الدخول غير صحيح! تأكد من كلمة المرور المعتمدة.');
      return false;
    }
  };

  const changeScreenLockPin = (newPin: string): boolean => {
    const success = setCustomScreenLockPin(newPin);
    if (success) {
      showToast('تم تحديث رمز PIN لقفل الشاشة بنجاح ✓');
    }
    return success;
  };

  // Secretary Dashboard Password Gate State (permanently persists in localStorage)
  const [isSecretaryDashboardUnlocked, setIsSecretaryDashboardUnlocked] = useState<boolean>(() => {
    try {
      const unlockedLocal = localStorage.getItem('almasa_secretary_unlocked_v3') === 'true';
      const rememberLocal = localStorage.getItem('almasa_secretary_remember_v3') === 'true';
      const sessionUnlocked = sessionStorage.getItem('almasa_secretary_unlocked_v3') === 'true';
      return unlockedLocal || rememberLocal || sessionUnlocked;
    } catch {
      return false;
    }
  });

  const unlockSecretaryDashboard = (passwordInput: string, rememberMe: boolean = true): boolean => {
    const cleanInput = (passwordInput || '').trim();
    const activePass = (secretaryPassword || 'Almasa@2026').trim();

    if (cleanInput === activePass) {
      setIsSecretaryDashboardUnlocked(true);
      try {
        sessionStorage.setItem('almasa_secretary_unlocked_v3', 'true');
        localStorage.setItem('almasa_secretary_unlocked_v3', 'true');
        if (rememberMe) {
          localStorage.setItem('almasa_secretary_remember_v3', 'true');
        }
      } catch {}

      const staffUser: UserProfile = {
        id: `user-staff-default`,
        name: 'مسؤول الاستقبال والعيادة',
        phone: '01101722551',
        email: 'secretary@almasadental.com',
        role: 'secretary',
        password: activePass,
        memberSince: '2025-01-01'
      };

      setCurrentUser(staffUser);
      createAndSaveSecureSession(staffUser, rememberMe);
      showToast('تم التحقق من كلمة المرور وفتح لوحة السكرتارية بنجاح 🛡️✨');
      return true;
    }
    return false;
  };

  const lockSecretaryDashboard = () => {
    setIsSecretaryDashboardUnlocked(false);
    try {
      sessionStorage.removeItem('almasa_secretary_unlocked_v3');
      localStorage.removeItem('almasa_secretary_unlocked_v3');
      localStorage.removeItem('almasa_secretary_remember_v3');
    } catch {}
    showToast('تم قفل لوحة السكرتارية لتأمين بيانات العيادة 🔒');
  };

  // Load services safely
  const [services, setServices] = useState<DentalService[]>(() => {
    try {
      const saved = localStorage.getItem('almasa_services_v2');
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch (e) {
      console.warn('Failed to parse cached services:', e);
      return INITIAL_SERVICES;
    }
  });

  // Load offers safely
  const [offers, setOffers] = useState<DentalOffer[]>(() => {
    try {
      const saved = localStorage.getItem('almasa_offers_v2');
      return saved ? JSON.parse(saved) : INITIAL_OFFERS;
    } catch (e) {
      console.warn('Failed to parse cached offers:', e);
      return INITIAL_OFFERS;
    }
  });

  // Doctors
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem('almasa_doctors_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAsmaa = parsed.some((d: Doctor) => d.id === 'doc-7' || d.name?.includes('أسماء') || d.name?.includes('اسماء'));
          if (hasAsmaa) return parsed;
          const asmaa = INITIAL_DOCTORS.find(d => d.id === 'doc-7');
          if (asmaa) return [...parsed, asmaa];
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing cached doctors:', e);
    }
    return INITIAL_DOCTORS;
  });

  // Raw Doctor Reviews safely from Firestore & localStorage
  const [rawReviews, setRawReviews] = useState<DoctorReview[]>(() => {
    try {
      const saved = localStorage.getItem('almasa_doctor_reviews_v1');
      return saved ? JSON.parse(saved) : INITIAL_DOCTOR_REVIEWS;
    } catch (e) {
      console.warn('Failed to parse cached doctor reviews:', e);
      return INITIAL_DOCTOR_REVIEWS;
    }
  });

  // Active appointment for rating modal popup
  const [ratingModalApt, setRatingModalApt] = useState<Appointment | null>(null);
  const openRatingModal = (apt: Appointment) => setRatingModalApt(apt);
  const closeRatingModal = () => setRatingModalApt(null);

  // Appointments: Clean starting state safely
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('almasa_appointments_v2');
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch (e) {
      console.warn('Failed to parse cached appointments:', e);
      return INITIAL_APPOINTMENTS;
    }
  });

  // Raw Patients directory from Firestore & localStorage
  const [rawFirestorePatients, setRawFirestorePatients] = useState<PatientRecord[]>(() => {
    try {
      const saved = localStorage.getItem('almasa_patients_v2');
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch (e) {
      console.warn('Failed to parse cached patients:', e);
      return INITIAL_PATIENTS;
    }
  });

  // Unified Doctor Reviews:
  // Merges explicit reviews collection with all rated appointments (so reviews from Flutter or Web always appear!)
  const doctorReviews = useMemo<DoctorReview[]>(() => {
    const map = new Map<string, DoctorReview>();

    // 1. Explicit reviews from rawReviews
    rawReviews.forEach((r) => {
      if (r && r.rating && Number(r.rating) > 0) {
        const key = r.appointmentId || r.id;
        map.set(key, r);
      }
    });

    // 2. Rated appointments from appointments collection
    appointments.forEach((apt) => {
      if (apt && apt.rating && Number(apt.rating) > 0) {
        const key = apt.id;
        if (!map.has(key)) {
          map.set(key, {
            id: `rev-${apt.id}`,
            appointmentId: apt.id,
            doctorId: apt.doctorId || 'doc-5',
            doctorName: apt.doctorName || 'مركز الماسة',
            patientName: apt.patientName || 'مريض المركز',
            rating: Number(apt.rating),
            comment: apt.reviewComment || '',
            date: apt.reviewedAt ? apt.reviewedAt.split('T')[0] : (apt.date || new Date().toISOString().split('T')[0]),
            appointmentCode: apt.appointmentCode || '',
            serviceName: apt.serviceName || 'كشف واستشارة طبية'
          });
        }
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return list;
  }, [rawReviews, appointments]);

  // Dynamically calculate doctor ratings and review counts from REAL patient reviews only
  const doctorsWithRealRatings = useMemo(() => {
    return doctors.map(doc => {
      const docRevs = doctorReviews.filter(r => r.doctorId === doc.id);
      if (docRevs.length === 0) {
        return {
          ...doc,
          rating: 5.0,
          reviewCount: 0
        };
      }
      const sum = docRevs.reduce((acc, r) => acc + r.rating, 0);
      const avg = Number((sum / docRevs.length).toFixed(1));
      return {
        ...doc,
        rating: avg,
        reviewCount: docRevs.length
      };
    });
  }, [doctors, doctorReviews]);

  // Dynamic Unified Patients Directory:
  // Aggregates explicit patient records + registered patient accounts + all bookings/appointments!
  const patients = useMemo<PatientRecord[]>(() => {
    const map = new Map<string, PatientRecord>();

    const cleanPhoneKey = (p: string) => {
      return (p || '').replace(/\D/g, '').replace(/^(20|0020)/, '');
    };

    // 1. Explicit patient records
    rawFirestorePatients.forEach((p) => {
      const key = cleanPhoneKey(p.phone) || p.id;
      if (key) {
        map.set(key, { ...p, appointments: [] });
      }
    });

    // 2. Registered users with patient role
    registeredUsers.forEach((u) => {
      if (u.role === 'patient') {
        const key = cleanPhoneKey(u.phone) || u.id;
        const existing = map.get(key);
        if (existing) {
          map.set(key, {
            ...existing,
            name: existing.name || u.name,
            email: existing.email || u.email,
            bloodType: existing.bloodType || u.bloodType,
            nationalId: existing.nationalId || u.nationalId,
            memberSince: existing.memberSince || u.memberSince,
          });
        } else {
          map.set(key, {
            id: u.id || `pat-${key}`,
            name: u.name,
            phone: u.phone,
            email: u.email,
            totalVisits: 0,
            notes: '',
            bloodType: u.bloodType,
            nationalId: u.nationalId,
            memberSince: u.memberSince,
            appointments: []
          });
        }
      }
    });

    // 3. Appointments (every appointment represents an active patient visit)
    appointments.forEach((apt) => {
      const key = cleanPhoneKey(apt.patientPhone) || apt.patientId || cleanPhoneKey(apt.patientName);
      if (!key) return;

      const existing = map.get(key);
      if (existing) {
        const patientAppts = existing.appointments ? [...existing.appointments, apt] : [apt];
        const dates = patientAppts.map(a => a.date).sort().reverse();
        const lastVisit = dates[0] || existing.lastVisitDate;

        let mergedNotes = existing.notes;
        if (apt.notes && apt.notes.trim() && !mergedNotes.includes(apt.notes.trim())) {
          mergedNotes = mergedNotes ? `${mergedNotes}\n• ${apt.notes.trim()}` : apt.notes.trim();
        }

        map.set(key, {
          ...existing,
          name: existing.name && existing.name !== 'مريض المركز' ? existing.name : apt.patientName,
          phone: existing.phone || apt.patientPhone,
          totalVisits: patientAppts.length,
          lastVisitDate: lastVisit,
          notes: mergedNotes,
          appointments: patientAppts
        });
      } else {
        map.set(key, {
          id: apt.patientId || `pat-${key}`,
          name: apt.patientName || 'مريض المركز',
          phone: apt.patientPhone,
          totalVisits: 1,
          lastVisitDate: apt.date,
          notes: apt.notes ? `• ${apt.notes}` : '',
          appointments: [apt]
        });
      }
    });

    const result = Array.from(map.values());
    result.sort((a, b) => {
      const dateA = a.lastVisitDate || '';
      const dateB = b.lastVisitDate || '';
      return dateB.localeCompare(dateA);
    });

    return result;
  }, [rawFirestorePatients, registeredUsers, appointments]);

  // Notifications safely
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('almasa_notifs_v2');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      console.warn('Failed to parse cached notifications:', e);
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activeBannerNotification, setActiveBannerNotification] = useState<NotificationItem | null>(null);

  // Secretary Active Tab and Modals for Deep Linking
  const [activeSecretaryTab, setActiveSecretaryTab] = useState<'all_bookings' | 'consents' | 'installments_billing' | 'timeline' | 'patients' | 'doctors' | 'offers_and_notifs' | 'services' | 'users_roles' | 'media_settings'>('all_bookings');
  const [activeConsentModalApt, setActiveConsentModalApt] = useState<Appointment | null>(null);
  const [activeInvoiceModalApt, setActiveInvoiceModalApt] = useState<Appointment | null>(null);
  const openConsentModal = (apt: Appointment) => setActiveConsentModalApt(apt);
  const closeConsentModal = () => setActiveConsentModalApt(null);
  const openInvoiceModal = (apt: Appointment) => setActiveInvoiceModalApt(apt);
  const closeInvoiceModal = () => setActiveInvoiceModalApt(null);

  // Sync safety: tracked known and deleted notification IDs to prevent resurrections
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const deletedNotifIdsRef = useRef<Set<string>>((() => {
    try {
      const saved = localStorage.getItem('almasa_deleted_notif_ids_v2');
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch (_) {
      return new Set<string>();
    }
  })());

  const dismissBannerNotification = () => {
    setActiveBannerNotification(null);
  };

  const playNotificationChime = () => {
    playNotificationSound();
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        playNotificationSound();
        sendBrowserNotification('مركز د. محمد فوزي الماسة 🦷', 'تم تفعيل التنبيهات والإشعارات الفورية بنجاح!');
        showToast('تم تفعيل إشعارات المتصفح والهاتف بنجاح! 🔔');
        return true;
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
    return false;
  };

  // Booking Flow temporary state
  const [selectedService, setSelectedService] = useState<DentalService | null>(INITIAL_SERVICES[0]);
  const [selectedOffer, setSelectedOffer] = useState<DentalOffer | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(INITIAL_DOCTORS[0]);
  const [bookingStep, setBookingStep] = useState<number>(1);

  // Clinic Info (Video, Social Links, Address) with local persistence & Firestore
  const [clinicInfo, setClinicInfo] = useState(() => {
    const saved = localStorage.getItem('almasa_clinic_info_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.videoUrl && !parsed.videoUrl.startsWith('http') && !parsed.videoUrl.startsWith('/') && !parsed.videoUrl.startsWith('data:')) {
          parsed.videoUrl = '/' + parsed.videoUrl;
        }
        if (!parsed.facebookUrl || parsed.facebookUrl === 'https://www.facebook.com/almasadc') {
          parsed.facebookUrl = 'https://www.facebook.com/share/1KL7zrcN3G/';
        }
        return {
          ...CLINIC_INFO,
          phones: (parsed.phones && Array.isArray(parsed.phones) && parsed.phones.length > 0) ? parsed.phones : CLINIC_INFO.phones,
          ...parsed
        };
      } catch (_) {}
    }
    return CLINIC_INFO;
  });

  // Clinic Photo Gallery with local persistence & Firestore
  const [clinicGallery, setClinicGallery] = useState<ClinicPhoto[]>(() => {
    const saved = localStorage.getItem('almasa_clinic_gallery_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_GALLERY;
  });

  const updateClinicInfo = (newInfo: Partial<typeof CLINIC_INFO>) => {
    setClinicInfo(prev => {
      let finalVideo = newInfo.videoUrl !== undefined ? newInfo.videoUrl : prev.videoUrl;
      if (finalVideo && !finalVideo.startsWith('http') && !finalVideo.startsWith('/') && !finalVideo.startsWith('data:')) {
        finalVideo = '/' + finalVideo;
      }

      const updated = {
        ...prev,
        ...newInfo,
        videoUrl: finalVideo
      };
      localStorage.setItem('almasa_clinic_info_v3', JSON.stringify(updated));
      
      // Live sync to Firestore so all clients and devices see updates immediately
      try {
        setDoc(doc(db, 'settings', 'clinic_info'), cleanForFirestore({
          ...updated,
          gallery: clinicGallery
        }), { merge: true }).catch(err => console.warn('Firestore clinic_info save notice:', err));
      } catch (e) {
        console.warn('Firestore clinic_info write error:', e);
      }
      return updated;
    });
    showToast('تم حفظ وتحديث بيانات المركز والفيديو ونشرها للمرضى بنجاح ✅');
  };

  const addClinicPhoto = (photo: Omit<ClinicPhoto, 'id' | 'createdAt'>) => {
    const newPhoto: ClinicPhoto = {
      ...photo,
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClinicGallery(prev => {
      const updated = [newPhoto, ...prev];
      localStorage.setItem('almasa_clinic_gallery_v1', JSON.stringify(updated));
      
      // Live sync to Firestore
      try {
        setDoc(doc(db, 'settings', 'clinic_info'), cleanForFirestore({
          ...clinicInfo,
          gallery: updated
        }), { merge: true }).catch(() => {});
      } catch (_) {}
      return updated;
    });
    showToast('تمت إضافة الصورة بنجاح إلى معرض صور المركز والعيادات 📸');
  };

  const deleteClinicPhoto = (photoId: string) => {
    setClinicGallery(prev => {
      const updated = prev.filter(p => p.id !== photoId);
      localStorage.setItem('almasa_clinic_gallery_v1', JSON.stringify(updated));
      
      // Live sync to Firestore
      try {
        setDoc(doc(db, 'settings', 'clinic_info'), cleanForFirestore({
          ...clinicInfo,
          gallery: updated
        }), { merge: true }).catch(() => {});
      } catch (_) {}
      return updated;
    });
    showToast('تم حذف الصورة من معرض المركز 🗑️');
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Initial Firestore synchronization & listeners
  useEffect(() => {
    try {
      // Listen to users collection
      const unsubscribeUsers = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          if (!snapshot.empty) {
            const dbUsers: UserProfile[] = [];
            snapshot.forEach((d) => {
              dbUsers.push({ id: d.id, ...(d.data() as Omit<UserProfile, 'id'>) });
            });
            if (dbUsers.length > 0) {
              setRegisteredUsers(dbUsers);
              // If current user is in DB, sync any role or name updates
              setCurrentUser((prev) => {
                if (!prev) return prev;
                const match = dbUsers.find((u) => u.id === prev.id || u.phone === prev.phone);
                return match ? { ...prev, ...match } : prev;
              });
            }
          }
        },
        (err) => {
          console.warn('Firestore users sync notice:', err.message);
        }
      );

      // Listen to appointments collection
      const unsubscribeAppts = onSnapshot(
        collection(db, 'appointments'),
        (snapshot) => {
          if (!snapshot.empty) {
            const dbAppts: Appointment[] = [];
            snapshot.forEach((d) => {
              dbAppts.push({ id: d.id, ...(d.data() as Omit<Appointment, 'id'>) });
            });
            // Sort by creation date desc
            dbAppts.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setAppointments(dbAppts);
          }
        },
        (err) => {
          console.warn('Firestore appointments sync notice:', err.message);
        }
      );

      // Listen to offers collection
      const unsubscribeOffers = onSnapshot(
        collection(db, 'offers'),
        (snapshot) => {
          if (!snapshot.empty) {
            const dbOffers: DentalOffer[] = [];
            snapshot.forEach((d) => {
              dbOffers.push({ id: d.id, ...(d.data() as Omit<DentalOffer, 'id'>) });
            });
            if (dbOffers.length > 0) {
              setOffers(dbOffers);
            }
          } else {
            // Seed initial offers
            INITIAL_OFFERS.forEach((off) => {
              setDoc(doc(db, 'offers', off.id), off).catch(() => {});
            });
          }
        },
        (err) => {
          console.warn('Firestore offers sync notice:', err.message);
        }
      );

      // Listen to services collection
      const unsubscribeServices = onSnapshot(
        collection(db, 'services'),
        (snapshot) => {
          if (!snapshot.empty) {
            const dbServices: DentalService[] = [];
            snapshot.forEach((d) => {
              dbServices.push({ id: d.id, ...(d.data() as Omit<DentalService, 'id'>) });
            });
            if (dbServices.length > 0) {
              const hasCheckup = dbServices.some(s => s.id === 'serv-0' || s.name.includes('كشف') || s.category.includes('كشف'));
              if (!hasCheckup) {
                const checkup = INITIAL_SERVICES.find(s => s.id === 'serv-0') || INITIAL_SERVICES[0];
                setDoc(doc(db, 'services', checkup.id), cleanForFirestore(checkup)).catch(() => {});
                dbServices.unshift(checkup);
              }
              setServices(dbServices);
            }
          } else {
            // Seed initial services
            INITIAL_SERVICES.forEach((srv) => {
              setDoc(doc(db, 'services', srv.id), cleanForFirestore(srv)).catch(() => {});
            });
          }
        },
        (err) => {
          console.warn('Firestore services sync notice:', err.message);
        }
      );

      // Listen to notifications collection
      let initialNotifsLoaded = false;
      const unsubscribeNotifs = onSnapshot(
        collection(db, 'notifications'),
        (snapshot) => {
          if (snapshot.empty) {
            setNotifications([]);
            localStorage.setItem('almasa_notifs_v2', '[]');
            return;
          }

          const deletedIds = deletedNotifIdsRef.current;
          const dbNotifs: NotificationItem[] = [];
          snapshot.forEach((d) => {
            if (!deletedIds.has(d.id)) {
              const item = { id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) };
              dbNotifs.push(item);
            }
          });

          // Sort descending: newest notification first
          dbNotifs.sort((a, b) => {
            const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : (parseInt(a.id.replace(/\D/g, '')) || 0);
            const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : (parseInt(b.id.replace(/\D/g, '')) || 0);
            return timeB - timeA;
          });

          if (!initialNotifsLoaded) {
            // First load: record existing IDs so historical notifications NEVER play chimes or spawn alerts
            snapshot.forEach((d) => knownNotifIdsRef.current.add(d.id));
            initialNotifsLoaded = true;
          } else {
            // Subsequent updates: ONLY alert for genuinely new documents
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const newDoc = change.doc;
                const newId = newDoc.id;
                if (!knownNotifIdsRef.current.has(newId) && !deletedIds.has(newId)) {
                  knownNotifIdsRef.current.add(newId);
                  const notifData = { id: newId, ...(newDoc.data() as Omit<NotificationItem, 'id'>) };
                  // Check if this notification is recent (created within last 15 minutes) and unread
                  const createdMs = notifData.createdAt ? new Date(notifData.createdAt).getTime() : Date.now();
                  const isRecent = Date.now() - createdMs < 15 * 60 * 1000;
                  if (!notifData.read && isRecent) {
                    playNotificationSound();
                    setActiveBannerNotification(notifData);
                    sendBrowserNotification(notifData.title, notifData.message);
                  }
                }
              }
            });
          }

          setNotifications(dbNotifs);
          localStorage.setItem('almasa_notifs_v2', JSON.stringify(dbNotifs));
        },
        (err) => {
          console.warn('Firestore notifications sync notice:', err.message);
        }
      );

      // Listen to doctors collection
      const unsubscribeDoctors = onSnapshot(
        collection(db, 'doctors'),
        (snapshot) => {
          if (!snapshot.empty) {
            const dbDocs: Doctor[] = [];
            snapshot.forEach((d) => {
              dbDocs.push({ id: d.id, ...(d.data() as Omit<Doctor, 'id'>) });
            });
            if (dbDocs.length > 0) {
              const hasAsmaa = dbDocs.some(d => d.id === 'doc-7' || d.name?.includes('أسماء') || d.name?.includes('اسماء'));
              if (!hasAsmaa) {
                const asmaa = INITIAL_DOCTORS.find(d => d.id === 'doc-7');
                if (asmaa) {
                  setDoc(doc(db, 'doctors', asmaa.id), cleanForFirestore(asmaa)).catch(() => {});
                  dbDocs.push(asmaa);
                }
              }
              setDoctors(dbDocs);
            }
          } else {
            // Seed initial doctors
            INITIAL_DOCTORS.forEach((dc) => {
              setDoc(doc(db, 'doctors', dc.id), cleanForFirestore(dc)).catch(() => {});
            });
          }
        },
        (err) => {
          console.warn('Firestore doctors sync notice:', err.message);
        }
      );

      // Listen to real patient reviews collection
      const unsubscribeReviews = onSnapshot(
        collection(db, 'reviews'),
        (snapshot) => {
          const list: DoctorReview[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              appointmentId: data.appointmentId || d.id,
              doctorId: data.doctorId || 'doc-5',
              patientName: data.patientName || 'مريض المركز',
              doctorName: data.doctorName || 'مركز الماسة',
              rating: Number(data.rating) || 5,
              comment: data.comment || data.reviewComment || '',
              date: data.createdAt || data.date || data.reviewedAt || new Date().toISOString().split('T')[0],
              appointmentCode: data.appointmentCode || '',
              serviceName: data.serviceName || 'كشف واستشارة طبية'
            });
          });
          setRawReviews(list);
          if (list.length > 0) {
            localStorage.setItem('almasa_doctor_reviews_v1', JSON.stringify(list));
          }
        },
        (err) => {
          console.warn('Firestore reviews sync notice:', err.message);
        }
      );

      // Listen to patients directory collection in Firestore
      const unsubscribePatients = onSnapshot(
        collection(db, 'patients'),
        (snapshot) => {
          const list: PatientRecord[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as Omit<PatientRecord, 'id'>) });
          });
          setRawFirestorePatients(list);
          if (list.length > 0) {
            localStorage.setItem('almasa_patients_v2', JSON.stringify(list));
          }
        },
        (err) => {
          console.warn('Firestore patients sync notice:', err.message);
        }
      );

      // Listen to clinic_info & gallery document in settings
      const unsubscribeClinicInfo = onSnapshot(
        doc(db, 'settings', 'clinic_info'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data) {
              let validVideo = (data.videoUrl && !data.videoUrl.startsWith('blob:')) ? data.videoUrl : undefined;
              if (validVideo && !validVideo.startsWith('http') && !validVideo.startsWith('/') && !validVideo.startsWith('data:')) {
                validVideo = '/' + validVideo;
              }
              setClinicInfo(prev => ({
                ...prev,
                videoUrl: validVideo !== undefined ? validVideo : prev.videoUrl,
                videoTitle: data.videoTitle !== undefined ? data.videoTitle : prev.videoTitle,
                facebookUrl: (data.facebookUrl && data.facebookUrl !== 'https://www.facebook.com/almasadc') ? data.facebookUrl : 'https://www.facebook.com/share/1KL7zrcN3G/',
                websiteUrl: data.websiteUrl || prev.websiteUrl,
              }));
              if (Array.isArray(data.gallery) && data.gallery.length > 0) {
                setClinicGallery(data.gallery);
              }
            }
          } else {
            // Seed initial settings with gallery
            setDoc(doc(db, 'settings', 'clinic_info'), cleanForFirestore({
              ...CLINIC_INFO,
              gallery: INITIAL_GALLERY
            })).catch(() => {});
          }
        },
        (err) => {
          console.warn('Firestore clinic_info listener notice:', err.message);
        }
      );

      // Listen to secretary security password from database (clinic_settings/secretary_security)
      const unsubscribeSecretarySecurity = onSnapshot(
        doc(db, 'clinic_settings', 'secretary_security'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.secretaryPassword) {
              setSecretaryPassword(data.secretaryPassword);
              localStorage.setItem('almasa_secretary_db_password', data.secretaryPassword);
            }
          } else {
            // Initialize in Firestore if not set yet
            const initialPass = localStorage.getItem('almasa_secretary_db_password') || 'Almasa@2026';
            setDoc(doc(db, 'clinic_settings', 'secretary_security'), cleanForFirestore({
              id: 'secretary_security',
              secretaryPassword: initialPass,
              updatedAt: new Date().toISOString(),
              updatedBy: 'التهيئة الأولية للعيادة'
            })).catch(() => {});
          }
        },
        (err) => {
          console.warn('Firestore secretary_security listener notice:', err.message);
        }
      );

      return () => {
        unsubscribeUsers();
        unsubscribeAppts();
        unsubscribeOffers();
        unsubscribeServices();
        unsubscribeNotifs();
        unsubscribeDoctors();
        unsubscribeReviews();
        unsubscribePatients();
        unsubscribeClinicInfo();
        unsubscribeSecretarySecurity();
      };
    } catch (error) {
      console.warn('Firestore initialization fallback:', error);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('almasa_doctors_v3', JSON.stringify(doctors));
  }, [doctors]);
  // Sync currentUser with tamper-proof persistent storage
  useEffect(() => {
    if (currentUser) {
      createAndSaveSecureSession(currentUser, rememberMeEnabled);
    }
  }, [currentUser, rememberMeEnabled]);

  useEffect(() => {
    localStorage.setItem('almasa_registered_users_v2', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('almasa_services_v2', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('almasa_offers_v2', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('almasa_appointments_v2', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('almasa_patients_v2', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('almasa_notifs_v2', JSON.stringify(notifications));
  }, [notifications]);

  const openAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = (phoneOrEmail: string, passwordOrOtp: string, _roleOverride?: UserRole): boolean => {
    // 1. Anti-Brute-Force Lockout Guard
    const lockout = checkBruteForceLockout();
    if (lockout.isLocked) {
      setLockoutRemainingSeconds(lockout.remainingSeconds);
      showToast(`تم قفل الدخول مؤقتاً لأسباب أمنية. يرجى الانتظار ${lockout.remainingSeconds} ثانية.`);
      return false;
    }

    const cleanQuery = sanitizeText(phoneOrEmail).toLowerCase();
    const cleanPassword = passwordOrOtp.trim();
    const cleanDigits = cleanQuery.replace(/\D/g, '');
    
    if (!cleanQuery) {
      showToast('يرجى إدخال رقم الهاتف أو البريد الإلكتروني');
      return false;
    }

    // Find existing registered user in registeredUsers
    const user = registeredUsers.find(u => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uPhone = (u.phone || '').trim().toLowerCase();
      const uDigits = uPhone.replace(/\D/g, '');

      if (uEmail && uEmail === cleanQuery) return true;
      if (uPhone && uPhone === cleanQuery) return true;
      if (cleanDigits.length >= 9 && uDigits.length >= 9 && (uDigits.includes(cleanDigits) || cleanDigits.includes(uDigits))) return true;
      return false;
    });

    if (user) {
      // If user has a password, verify it
      if (user.password && cleanPassword && user.password.trim() !== cleanPassword) {
        const attempt = recordFailedLoginAttempt();
        if (attempt.isLocked) {
          setLockoutRemainingSeconds(attempt.remainingSeconds);
          showToast(`تم تجاوز الحد الأقصى للمحاولات الخاطئة! تم تأمين الحساب وقفل الدخول مؤقتاً لمدة 60 ثانية.`);
        } else {
          showToast(`كلمة المرور غير صحيحة، يرجى التأكد وإعادة المحاولة (${attempt.attempts}/5)`);
        }
        return false;
      }

      // Successful Login: Reset failed attempts & establish encrypted persistent session
      resetFailedLoginAttempts();
      setLockoutRemainingSeconds(0);
      setCurrentUser(user);
      createAndSaveSecureSession(user, rememberMeEnabled);
      setAuthModalOpen(false);
      showToast(`أهلاً بك مجدداً، ${user.name}! تم تأمين جلستك بنجاح 🛡️✨`);

      if (user.role === 'secretary' || user.role === 'admin') {
        setViewMode('secretary');
        setIsSecretaryDashboardUnlocked(true);
        try {
          localStorage.setItem('almasa_secretary_unlocked_v3', 'true');
          localStorage.setItem('almasa_secretary_remember_v3', 'true');
        } catch {}
      } else {
        if (isFlutterApkPlatform()) {
          setViewMode('client');
        } else {
          setViewMode('secretary');
          showToast('مرحباً بك! نسخة الويب مخصصة للسكرتارية وإدارة العيادة');
        }
      }
      return true;
    }

    // Secretary / Staff login using custom database password (from Firestore)
    const isStaffQuery = (cleanQuery === 'admin' || cleanQuery === 'secretary' || cleanQuery === '01012345678');
    const validDbSecretaryPass = (secretaryPassword || 'Almasa@2026').trim();

    if (isStaffQuery && cleanPassword === validDbSecretaryPass) {
      resetFailedLoginAttempts();
      setLockoutRemainingSeconds(0);
      const staffUser: UserProfile = {
        id: `user-staff-default`,
        name: cleanQuery === 'admin' ? 'مدير المركز' : 'مسؤول الاستقبال والعيادة',
        phone: '01012345678',
        email: 'secretary@almasadental.com',
        role: 'secretary',
        password: validDbSecretaryPass,
        memberSince: '2025-01-01'
      };
      
      setRegisteredUsers(prev => {
        if (prev.some(u => u.id === staffUser.id || u.phone === staffUser.phone)) return prev;
        return [staffUser, ...prev];
      });
      setCurrentUser(staffUser);
      createAndSaveSecureSession(staffUser, true);
      setIsSecretaryDashboardUnlocked(true);
      try {
        localStorage.setItem('almasa_secretary_unlocked_v3', 'true');
        localStorage.setItem('almasa_secretary_remember_v3', 'true');
      } catch {}
      setAuthModalOpen(false);
      showToast('تم تسجيل الدخول بصلاحية السكرتارية والاستقبال بكلمة مرور قاعدة البيانات 🔒✓');
      setViewMode('secretary');
      return true;
    }

    const attempt = recordFailedLoginAttempt();
    if (attempt.isLocked) {
      setLockoutRemainingSeconds(attempt.remainingSeconds);
      showToast(`تم قفل تسجيل الدخول مؤقتاً لمدة 60 ثانية بعد تكرار المحاولات.`);
    } else {
      showToast('لم يتم العثور على حساب مسجل بهذا الرقم. يمكنك الضغط على "إنشاء حساب جديد".');
    }
    return false;
  };

  const register = (data: Partial<UserProfile> & { password?: string }): UserProfile => {
    const rawName = data.name?.trim() || 'عميل جديد';
    const rawPhone = data.phone?.trim() || '010' + Math.floor(10000000 + Math.random() * 90000000);
    
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: sanitizeText(rawName),
      phone: sanitizeText(rawPhone),
      email: data.email ? sanitizeText(data.email.trim()) : undefined,
      password: data.password?.trim() || undefined,
      nationalId: data.nationalId ? sanitizeText(data.nationalId.trim()) : undefined,
      role: data.role || 'patient',
      gender: data.gender || 'male',
      bloodType: data.bloodType || 'A+',
      memberSince: new Date().toISOString().split('T')[0]
    };

    // 1. Add to registered users list
    setRegisteredUsers(prev => [newUser, ...prev]);

    // 2. AUTO-LOGIN immediately with high security persistent session so user is never asked to re-enter credentials
    resetFailedLoginAttempts();
    setLockoutRemainingSeconds(0);
    setCurrentUser(newUser);
    createAndSaveSecureSession(newUser, true);

    // Save directly to Firestore database with sanitized data
    try {
      const sanitizedDoc = cleanForFirestore(newUser);
      setDoc(doc(db, 'users', newUser.id), sanitizedDoc)
        .then(() => {
          console.log('User successfully written to Firestore:', newUser.id);
        })
        .catch((e) => {
          console.warn('Could not persist user to Firestore:', e);
        });
    } catch (err) {
      console.warn('Firestore setDoc error:', err);
    }

    // Also add to raw patient directory
    setRawFirestorePatients(prev => {
      const exists = prev.some(p => p.phone === newUser.phone);
      if (!exists) {
        const newPat: PatientRecord = {
          id: `pat-${Date.now()}`,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          totalVisits: 0,
          notes: 'تم التسجيل عبر حساب التطبيق',
          medicalHistory: []
        };
        setDoc(doc(db, 'patients', newPat.id), cleanForFirestore(newPat)).catch(() => {});
        return [newPat, ...prev];
      }
      return prev;
    });

    showToast(`تم إنشاء حسابك وتأمين جلستك الدائمة يا ${newUser.name}! أهلاً بك في عيادة الماسة 🛡️✨`);
    return newUser;
  };

  const logout = () => {
    clearSecureSession();
    setIsSecretaryDashboardUnlocked(false);
    try {
      sessionStorage.removeItem('almasa_secretary_unlocked_v3');
      localStorage.removeItem('almasa_secretary_unlocked_v3');
      localStorage.removeItem('almasa_secretary_remember_v3');
    } catch {}
    setCurrentUser(null);
    if (isFlutterApkPlatform()) {
      setViewMode('client');
      setClientTab('home');
    } else {
      setViewMode('secretary');
    }
    showToast('تم تسجيل الخروج بنجاح 🔒');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setRegisteredUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));

    // Update in Firestore
    try {
      setDoc(doc(db, 'users', updated.id), cleanForFirestore(updated), { merge: true }).catch(() => {});
    } catch (e) {}

    showToast('تم تحديث بيانات الملف الشخصي بنجاح ✓');
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setRegisteredUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }

    // Update directly in Firestore Database
    try {
      updateDoc(doc(db, 'users', userId), { role: newRole }).catch(() => {
        setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true }).catch(() => {});
      });
    } catch (e) {}

    const roleArabic = newRole === 'secretary' ? 'سكرتارية واستقبال' : newRole === 'admin' ? 'مدير نظام' : 'مريض / عميل';
    showToast(`تم حفظ الصلاحية في قاعدة البيانات (${roleArabic}) بنجاح ✓`);
  };

  const deleteUser = (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      showToast('لا يمكن حذف الحساب المسجل به حالياً');
      return;
    }
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId));

    // Delete in Firestore
    try {
      deleteDoc(doc(db, 'users', userId)).catch(() => {});
    } catch (e) {}

    showToast('تم حذف الحساب من قاعدة البيانات بنجاح');
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const startBooking = (service?: DentalService, offer?: DentalOffer) => {
    if (offer) {
      setSelectedOffer(offer);
      const matchingService = services?.find(s => s.id === offer.serviceId) || services?.[0] || INITIAL_SERVICES[0];
      setSelectedService(matchingService);
    } else if (service) {
      setSelectedService(service);
      setSelectedOffer(null);
    }
    setBookingStep(1);
    setClientTab('booking');
  };

  const createAppointment = (data: Omit<Appointment, 'id' | 'appointmentCode' | 'createdAt'>): Appointment => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const appointmentCode = `MASA-${randomNum}`;
    
    // Financial and installment calculations
    const total = data.totalAmount !== undefined ? Number(data.totalAmount) : Number(data.price || 0);
    const paid = data.paidAmount !== undefined ? Number(data.paidAmount) : (data.paymentStatus === 'paid' ? total : 0);
    const remaining = data.remainingAmount !== undefined ? Number(data.remainingAmount) : Math.max(0, total - paid);
    const paymentStatus = data.paymentStatus || (remaining <= 0 ? 'paid' : (paid > 0 ? 'partial' : 'unpaid'));
    const isInstallment = data.isInstallment !== undefined 
      ? data.isInstallment 
      : (data.serviceName?.includes('تقويم') || data.serviceName?.includes('زراعة') || remaining > 0);

    const initialHistory: PaymentRecord[] = (data.paymentHistory && data.paymentHistory.length > 0)
      ? data.paymentHistory
      : (paid > 0 ? [{
          id: `pay-${Date.now()}`,
          amount: paid,
          date: data.date || new Date().toISOString().split('T')[0],
          time: data.timeSlot || '12:00 م',
          paymentMethod: 'cash',
          note: isInstallment ? 'دفعة أولى / مقدم قسط' : 'سداد كشف / خدمة',
          recordedBy: 'الاستقبال والسكرتارية',
          receiptNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`
        }] : []);

    const newAppointment: Appointment = {
      ...data,
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentStatus,
      isInstallment,
      paymentHistory: initialHistory,
      id: `apt-${Date.now()}`,
      appointmentCode,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAppointments(prev => [newAppointment, ...prev]);

    // Save to Firestore
    try {
      setDoc(doc(db, 'appointments', newAppointment.id), cleanForFirestore(newAppointment)).catch(() => {});
    } catch (e) {}

    // Update or add patient record in raw patients
    setRawFirestorePatients(prev => {
      const existing = prev.find(p => p.phone === data.patientPhone);
      if (existing) {
        const updated = {
          ...existing,
          totalVisits: (existing.totalVisits || 0) + 1,
          lastVisitDate: data.date,
          notes: data.notes ? (existing.notes ? `${existing.notes}\n• ${data.notes}` : data.notes) : existing.notes
        };
        setDoc(doc(db, 'patients', existing.id), cleanForFirestore(updated), { merge: true }).catch(() => {});
        return prev.map(p => p.id === existing.id ? updated : p);
      } else {
        const newPatient: PatientRecord = {
          id: `pat-${Date.now()}`,
          name: data.patientName,
          phone: data.patientPhone,
          email: data.patientEmail,
          totalVisits: 1,
          lastVisitDate: data.date,
          notes: data.notes || 'حجز جديد عبر المركز',
          medicalHistory: []
        };
        setDoc(doc(db, 'patients', newPatient.id), cleanForFirestore(newPatient)).catch(() => {});
        return [newPatient, ...prev];
      }
    });

    // Add notification for patient
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'طلب الحجز قيد المراجعة ⏳',
      message: `تم إرسال طلب حجزك لـ ${data.patientName} (${data.serviceName}) مع ${data.doctorName} بتاريخ ${data.date} الساعة ${data.timeSlot}. كود الحجز: ${appointmentCode}. طلبك الآن قيد مراجعة وتأكيد الاستقبال.`,
      time: 'الآن',
      read: false,
      type: 'appointment',
      appointmentId: newAppointment.id
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Save notification to Firestore
    try {
      setDoc(doc(db, 'notifications', newNotif.id), cleanForFirestore(newNotif)).catch(() => {});
    } catch (e) {}

    showToast(`تم إرسال طلب الحجز بنجاح (قيد المراجعة)! كود الحجز: ${appointmentCode}`);
    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const targetApt = appointments.find(a => a.id === id);
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status } : apt))
    );
    try {
      updateDoc(doc(db, 'appointments', id), { status }).catch(() => {});
    } catch (e) {}

    if (targetApt && status === 'confirmed') {
      const confirmNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'تم تأكيد موعدك بنجاح ✓',
        message: `تمت مراجعة وتأكيد موعدك (${targetApt.appointmentCode}) بتاريخ ${targetApt.date} الساعة ${targetApt.timeSlot} مع ${targetApt.doctorName}. نتطلع لاستقبالك في المركز!`,
        time: 'الآن',
        read: false,
        type: 'appointment',
        appointmentId: targetApt.id,
        patientPhone: targetApt.patientPhone,
        patientName: targetApt.patientName,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [confirmNotif, ...prev]);
      try {
        setDoc(doc(db, 'notifications', confirmNotif.id), cleanForFirestore(confirmNotif)).catch(() => {});
      } catch (e) {}
    }

    if (targetApt && status === 'completed') {
      const ratingNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'اكتمل كشفك بنجاح! شاركنا تقييمك الطبي ⭐',
        message: `تم بحمد الله إتمام كشفك وجلستك مع ${targetApt.doctorName}. نرجو منك تقييم تجربتك ورأيك لمساعدتنا في التطوير المستمر.`,
        time: 'الآن',
        read: false,
        type: 'appointment',
        appointmentId: targetApt.id,
        patientPhone: targetApt.patientPhone,
        patientName: targetApt.patientName,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [ratingNotif, ...prev]);
      try {
        setDoc(doc(db, 'notifications', ratingNotif.id), cleanForFirestore(ratingNotif)).catch(() => {});
      } catch (e) {}
    }

    const statusArabic: Record<AppointmentStatus, string> = {
      pending: 'قيد المراجعة والانتظار',
      confirmed: 'مؤكد ✓',
      arrived: 'وصل للمركز',
      in_progress: 'في غرفة الكشف',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };
    showToast(`تم تحديث حالة الموعد إلى: ${statusArabic[status]}`);
  };

  const rescheduleAppointment = (id: string, newDate: string, newTimeSlot: string) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, date: newDate, timeSlot: newTimeSlot, status: 'confirmed' } : apt))
    );
    try {
      updateDoc(doc(db, 'appointments', id), { date: newDate, timeSlot: newTimeSlot, status: 'confirmed' }).catch(() => {});
    } catch (e) {}

    showToast(`تم إعادة جدولة الموعد بنجاح إلى ${newDate} الساعة ${newTimeSlot}`);
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
    );
    try {
      updateDoc(doc(db, 'appointments', id), { status: 'cancelled' }).catch(() => {});
    } catch (e) {}

    showToast('تم إلغاء الموعد');
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
    try {
      deleteDoc(doc(db, 'appointments', id)).catch(() => {});
    } catch (e) {}
    showToast('تم حذف الموعد نهائياً من قاعدة البيانات بنجاح ✓');
  };

  const clearAllAppointments = () => {
    setAppointments([]);
    showToast('تم مسح جميع الحجوزات بنجاح، يمكنك الآن تجربة الحجز من البداية.');
  };

  // Record a payment / installment for an appointment (e.g. Orthodontics installment)
  const recordPayment = (
    appointmentId: string,
    payment: Omit<PaymentRecord, 'id'>,
    newTotalAmount?: number
  ) => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) return;

    const receiptNumber = payment.receiptNumber || `REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRecord: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      receiptNumber,
      time: payment.time || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = targetApt.paymentHistory || [];
    const updatedHistory = [...currentHistory, newRecord];

    const currentTotal = newTotalAmount !== undefined ? Number(newTotalAmount) : (targetApt.totalAmount ?? targetApt.price ?? 0);
    const newPaid = (targetApt.paidAmount ?? 0) + Number(payment.amount || 0);
    const newRemaining = Math.max(0, currentTotal - newPaid);
    const newPaymentStatus: 'paid' | 'partial' | 'unpaid' = newRemaining <= 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');

    const updatedApt: Appointment = {
      ...targetApt,
      totalAmount: currentTotal,
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      paymentStatus: newPaymentStatus,
      paymentHistory: updatedHistory,
      isInstallment: targetApt.isInstallment ?? (targetApt.serviceName?.includes('تقويم') || newRemaining > 0)
    };

    setAppointments(prev => prev.map(a => a.id === appointmentId ? updatedApt : a));

    try {
      setDoc(doc(db, 'appointments', appointmentId), cleanForFirestore(updatedApt), { merge: true }).catch(() => {});
    } catch (e) {}

    showToast(`تم تسجيل دفعة بقيمة ${payment.amount} ج.م للمريض بنجاح ✓ (المتبقي: ${newRemaining} ج.م)`);
  };

  // Update appointment financial contract / installment status directly
  const updateAppointmentPayment = (
    appointmentId: string,
    updates: {
      totalAmount?: number;
      paidAmount?: number;
      remainingAmount?: number;
      paymentStatus?: 'unpaid' | 'paid' | 'partial';
      isInstallment?: boolean;
      installmentNote?: string;
    }
  ) => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) return;

    const total = updates.totalAmount !== undefined ? Number(updates.totalAmount) : (targetApt.totalAmount ?? targetApt.price ?? 0);
    const paid = updates.paidAmount !== undefined ? Number(updates.paidAmount) : (targetApt.paidAmount ?? 0);
    const remaining = updates.remainingAmount !== undefined ? Number(updates.remainingAmount) : Math.max(0, total - paid);
    const status = updates.paymentStatus ?? (remaining <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid');

    const updatedApt: Appointment = {
      ...targetApt,
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentStatus: status,
      isInstallment: updates.isInstallment !== undefined ? updates.isInstallment : targetApt.isInstallment,
      installmentNote: updates.installmentNote !== undefined ? updates.installmentNote : targetApt.installmentNote
    };

    setAppointments(prev => prev.map(a => a.id === appointmentId ? updatedApt : a));

    try {
      setDoc(doc(db, 'appointments', appointmentId), cleanForFirestore(updatedApt), { merge: true }).catch(() => {});
    } catch (e) {}

    showToast('تم تحديث الحساب المالي والأقساط بنجاح ✓');
  };

  // Delete an incorrect payment record
  const deletePaymentRecord = (appointmentId: string, paymentRecordId: string) => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) return;

    const currentHistory = targetApt.paymentHistory || [];
    const deletedRecord = currentHistory.find(p => p.id === paymentRecordId);
    const amountToDeduct = deletedRecord ? Number(deletedRecord.amount) : 0;
    const updatedHistory = currentHistory.filter(p => p.id !== paymentRecordId);

    const total = targetApt.totalAmount ?? targetApt.price ?? 0;
    const newPaid = Math.max(0, (targetApt.paidAmount ?? 0) - amountToDeduct);
    const newRemaining = Math.max(0, total - newPaid);
    const newStatus: 'paid' | 'partial' | 'unpaid' = newRemaining <= 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');

    const updatedApt: Appointment = {
      ...targetApt,
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      paymentStatus: newStatus,
      paymentHistory: updatedHistory
    };

    setAppointments(prev => prev.map(a => a.id === appointmentId ? updatedApt : a));

    try {
      setDoc(doc(db, 'appointments', appointmentId), cleanForFirestore(updatedApt), { merge: true }).catch(() => {});
    } catch (e) {}

    showToast('تم حذف قيد الدفعة وإعادة احتساب المتبقي بنجاح 🗑️');
  };

  // ==========================================
  // MEDICAL CONSENT FORMS & TREATMENT APPROVAL
  // ==========================================
  const createWalkinConsentAppointment = async (
    patientName: string,
    patientPhone: string,
    procedureName: string,
    doctorName: string,
    patientNationalId?: string
  ): Promise<Appointment> => {
    const today = new Date().toISOString().split('T')[0];
    const aptCode = `MASA-${Math.floor(1000 + Math.random() * 9000)}`;
    const aptId = `apt-consent-${Date.now()}`;
    const cleanProcedure = procedureName.trim() || 'إجراء طبي علاجي';
    const cleanDoctor = doctorName.trim() || 'د. محمد فوزي';
    const cleanName = patientName.trim();
    const cleanPhone = patientPhone.trim();
    const cleanNationalId = patientNationalId?.trim() || '';

    const initialConsent: MedicalConsent = {
      id: `consent-${aptId}`,
      appointmentId: aptId,
      appointmentCode: aptCode,
      patientName: cleanName,
      patientPhone: cleanPhone,
      patientNationalId: cleanNationalId,
      procedureName: cleanProcedure,
      doctorName: cleanDoctor,
      date: today,
      procedureDetails: `إقرار وموافقة على إجراء طبي لاستقبال العيادة - كود (${aptCode})`,
      risksAcknowledged: [
        'أقر بأن الطبيب المعالج قد شرح لي بالتفصيل الإجراء الطبي الموصى به والبدائل المتاحة والمضاعفات المحتملة.',
        'أقر بصحة بياناتي وتاريخي المرضي وعدم إخفاء أي أمراض مزمنة أو حساسية تجاه الأدوية والتخدير.',
        'أوافق بكامل إرادتي على إجراء الفحص وتلقي العلاج الموصى به واستخدام التخدير الموضعي اللازم.',
        'أتعهد باتباع تعليمات الطبيب وتناول الأدوية الموصوفة ومراجعة المركز في الموعد المحدد.'
      ],
      status: 'pending_signature',
      signatureType: 'paper_physical',
      witnessName: 'قسم الاستقبال والتمريض',
      createdAt: new Date().toISOString()
    };

    const newApt: Appointment = {
      id: aptId,
      appointmentCode: aptCode,
      patientName: cleanName,
      patientPhone: cleanPhone,
      patientNationalId: cleanNationalId,
      serviceId: 'serv-consent',
      serviceName: cleanProcedure,
      doctorId: 'doc-1',
      doctorName: cleanDoctor,
      date: today,
      timeSlot: 'استقبال العيادة',
      status: 'confirmed',
      price: 0,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      source: 'reception_walkin',
      isOffer: false,
      consent: initialConsent
    };

    setAppointments(prev => [newApt, ...prev]);

    try {
      await setDoc(doc(db, 'appointments', newApt.id), cleanForFirestore(newApt));
      await setDoc(doc(db, 'consents', initialConsent.id), cleanForFirestore(initialConsent));
    } catch (e) {
      console.warn('Firestore walkin consent save error:', e);
    }

    showToast(`تم تجهيز ملف الإقرار الطبي للمريض ${cleanName} بنجاح 📋`);
    return newApt;
  };

  const saveMedicalConsent = async (appointmentId: string, consent: MedicalConsent) => {
    let targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) {
      targetApt = {
        id: appointmentId,
        appointmentCode: consent.appointmentCode || `MASA-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: consent.patientName,
        patientPhone: consent.patientPhone,
        patientNationalId: consent.patientNationalId,
        serviceId: 'serv-consent',
        serviceName: consent.procedureName,
        doctorId: 'doc-1',
        doctorName: consent.doctorName,
        date: consent.date,
        timeSlot: 'استقبال العيادة',
        status: 'confirmed',
        price: 0,
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        source: 'reception_walkin',
        isOffer: false
      };
    }

    const updatedApt: Appointment = {
      ...targetApt,
      consent
    };

    setAppointments(prev => {
      const exists = prev.some(a => a.id === appointmentId);
      if (exists) {
        return prev.map(a => a.id === appointmentId ? updatedApt : a);
      } else {
        return [updatedApt, ...prev];
      }
    });

    try {
      await setDoc(doc(db, 'appointments', appointmentId), cleanForFirestore(updatedApt), { merge: true });
      await setDoc(doc(db, 'consents', consent.id), cleanForFirestore(consent), { merge: true });
    } catch (e) {
      console.warn('Firestore consent save error:', e);
    }

    if (consent.status === 'signed' || consent.status === 'approved') {
      showToast('تم اعتماد وتوثيق الإقرار الطبي رسمياً بنجاح ✓');
      const notifItem: NotificationItem = {
        id: `notif-consent-app-${Date.now()}`,
        title: '✓ تم اعتماد إقرارك الطبي رسمياً - مركز د. محمد فوزي الماسة',
        message: `تم اعتماد إقرار الموافقة الطبية والخطة العلاجية لإجراء (${consent.procedureName}) الخاص بموعدك رقم (${targetApt.appointmentCode}) رسمياً من إدارة المركز. يمكنك مراجعته أو طباعته في أي وقت.`,
        time: 'الآن',
        read: false,
        type: 'appointment',
        targetRole: 'patient',
        appointmentId: targetApt.id,
        patientPhone: targetApt.patientPhone,
        patientName: targetApt.patientName,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notifItem, ...prev]);
      try {
        setDoc(doc(db, 'notifications', notifItem.id), cleanForFirestore(notifItem)).catch(() => {});
      } catch (e) {}
    } else if (consent.status === 'sent_to_patient') {
      showToast('تم إرسال الإقرار والخطة العلاجية للمريض بنجاح! بانتظار توقيعه 📲');
      const notifItem: NotificationItem = {
        id: `notif-consent-sent-${Date.now()}`,
        title: '📋 إقرار وخطة علاجية جديدة بانتظار توقيعك',
        message: `أرسلت لك إدارة العيادة الإقرار الطبي والخطة العلاجية المقررة لموعدك (#${targetApt.appointmentCode}). يرجى الدخول لمراجعته والتوقيع إلكترونياً.`,
        time: 'الآن',
        read: false,
        type: 'appointment',
        targetRole: 'patient',
        appointmentId: targetApt.id,
        patientPhone: targetApt.patientPhone,
        patientName: targetApt.patientName,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notifItem, ...prev]);
      try {
        setDoc(doc(db, 'notifications', notifItem.id), cleanForFirestore(notifItem)).catch(() => {});
      } catch (e) {}
    } else if (consent.status === 'signed_by_patient') {
      showToast('تم إرسال توقيعك بنجاح! الإقرار الآن بانتظار اعتماد السكرتارية النهائي ✓');
      const notifItem: NotificationItem = {
        id: `notif-consent-signed-${Date.now()}`,
        title: '✍️ المريض وقع الإقرار الطبي والخطة العلاجية',
        message: `قام المريض (${targetApt.patientName}) بتوقيع الإقرار الطبي لموعده (#${targetApt.appointmentCode}). يرجى مراجعة التوقيع واعتماده رسمياً.`,
        time: 'الآن',
        read: false,
        type: 'appointment',
        targetRole: 'secretary',
        appointmentId: targetApt.id,
        patientPhone: targetApt.patientPhone,
        patientName: targetApt.patientName,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notifItem, ...prev]);
      try {
        setDoc(doc(db, 'notifications', notifItem.id), cleanForFirestore(notifItem)).catch(() => {});
      } catch (e) {}
    } else {
      showToast('تم حفظ مسودة الإقرار الطبي والخطة العلاجية بنجاح ✓');
    }
  };

  const deleteMedicalConsent = async (appointmentId: string) => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) return;

    const consentId = targetApt.consent?.id;
    const updatedApt: Appointment = { ...targetApt };
    delete updatedApt.consent;

    setAppointments(prev => prev.map(a => a.id === appointmentId ? updatedApt : a));

    try {
      await setDoc(doc(db, 'appointments', appointmentId), cleanForFirestore(updatedApt));
      if (consentId) {
        await deleteDoc(doc(db, 'consents', consentId));
      }
    } catch (e) {}

    showToast('تم حذف الإقرار الطبي بنجاح 🗑️');
  };

  const getBlockingConsentAppointment = (userPhone?: string, userName?: string): Appointment | null => {
    const phone = (userPhone || currentUser?.phone || '').trim();
    const name = (userName || currentUser?.name || '').trim();
    if (!phone && !name) return null;

    return appointments.find(a => {
      if (a.status === 'cancelled') return false;
      const phoneMatch = phone && a.patientPhone && (
        a.patientPhone.replace(/\D/g, '').includes(phone.replace(/\D/g, '')) ||
        phone.replace(/\D/g, '').includes(a.patientPhone.replace(/\D/g, ''))
      );
      const nameMatch = name && a.patientName && a.patientName.trim().toLowerCase() === name.toLowerCase();
      if (!phoneMatch && !nameMatch) return false;

      // Check if consent requires patient signing
      if (!a.consent) return false;
      const isSigned = a.consent.status === 'approved' ||
                       a.consent.status === 'signed' ||
                       a.consent.status === 'signed_by_patient' ||
                       Boolean(a.consent.patientSignature) ||
                       Boolean(a.consent.signedAt);
      return !isSigned;
    }) || null;
  };

  // ==========================================
  // PATIENT INVOICES & AUTOMATIC CLINIC PRINT
  // ==========================================
  const issuePatientInvoice = async (appointmentId: string, invoice: PatientInvoice, autoPrint: boolean = true) => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) return;

    const updatedApt: Appointment = {
      ...targetApt,
      invoice,
      price: invoice.total,
      totalAmount: invoice.total,
      paidAmount: invoice.paidAmount,
      remainingAmount: invoice.remainingAmount,
      paymentStatus: invoice.remainingAmount <= 0 ? 'paid' : (invoice.paidAmount > 0 ? 'partial' : 'unpaid')
    };

    setAppointments(prev => prev.map(a => a.id === appointmentId ? updatedApt : a));

    try {
      await setDoc(doc(db, 'appointments', appointmentId), cleanForFirestore(updatedApt), { merge: true });
      await setDoc(doc(db, 'invoices', invoice.invoiceNumber), cleanForFirestore(invoice), { merge: true });
    } catch (e) {
      console.warn('Firestore invoice save error:', e);
    }

    // Send instant notification to the client/patient app
    const notifItem: NotificationItem = {
      id: `notif-inv-${Date.now()}`,
      title: '🧾 تم إصدار فاتورة علاجك الرسمية',
      message: `صدرت فاتورة علاجك لموعدك (${targetApt.appointmentCode}) بإجمالي ${invoice.total} ج.م (المدفوع: ${invoice.paidAmount} ج.م - المتبقي: ${invoice.remainingAmount} ج.م). يمكنك الاطلاع عليها وطباعتها الآن.`,
      time: 'الآن',
      read: false,
      type: 'appointment',
      appointmentId: targetApt.id,
      patientPhone: targetApt.patientPhone,
      patientName: targetApt.patientName,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notifItem, ...prev]);
    try {
      setDoc(doc(db, 'notifications', notifItem.id), cleanForFirestore(notifItem)).catch(() => {});
    } catch (e) {}

    playNotificationSound();
    showToast(`تم إصدار فاتورة المريض رقم (${invoice.invoiceNumber}) وإرسالها لتطبيقه بنجاح ✓`);

    if (autoPrint) {
      setTimeout(() => {
        try {
          printElement('printable-patient-invoice-paper', {
            title: `فاتورة كشف - ${targetApt.patientName || invoice.invoiceNumber}`
          });
        } catch (e) {
          try {
            window.print();
          } catch (err) {}
        }
      }, 350);
    }
  };

  const addService = (serviceData: Omit<DentalService, 'id'>) => {
    const newService: DentalService = {
      ...serviceData,
      id: `serv-${Date.now()}`
    };
    setServices(prev => [newService, ...prev]);
    try {
      setDoc(doc(db, 'services', newService.id), cleanForFirestore(newService)).catch(() => {});
    } catch (e) {}
    showToast('تمت إضافة الخدمة والسعر الجديد بنجاح في قاعدة البيانات ✓');
  };

  const updateService = (service: DentalService) => {
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
    try {
      setDoc(doc(db, 'services', service.id), cleanForFirestore(service), { merge: true }).catch(() => {});
    } catch (e) {}
    showToast('تم تعديل بيانات وسعر الخدمة بنجاح ✓');
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    try {
      deleteDoc(doc(db, 'services', id)).catch(() => {});
    } catch (e) {}
    showToast('تم حذف الخدمة من قاعدة البيانات بنجاح');
  };

  // Secretary adds offers and sends notification to clients on the app
  const addOffer = (offerData: Omit<DentalOffer, 'id'>, notifyClients: boolean = true) => {
    const newOffer: DentalOffer = {
      ...offerData,
      id: `off-${Date.now()}`
    };
    setOffers(prev => [newOffer, ...prev]);

    try {
      setDoc(doc(db, 'offers', newOffer.id), cleanForFirestore(newOffer)).catch(() => {});
    } catch (e) {}

    if (notifyClients) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `🔥 عرض حصري جديد: ${offerData.title}`,
        message: `${offerData.subtitle || ''} - خصم ${offerData.discountPercent}% بسعر ${offerData.discountedPrice} ج.م فقط لفترة محدودة!`,
        time: 'الآن',
        read: false,
        type: 'offer'
      };
      setNotifications(prev => [newNotif, ...prev]);
      try {
        setDoc(doc(db, 'notifications', newNotif.id), cleanForFirestore(newNotif)).catch(() => {});
      } catch (e) {}

      showToast(`تم نشر العرض بنجاح وإرسال إشعار فوري لجميع المرضى على التطبيق! 🎉`);
    } else {
      showToast('تمت إضافة العرض بنجاح');
    }
  };

  const updateOffer = (offer: DentalOffer) => {
    setOffers(prev => prev.map(o => o.id === offer.id ? offer : o));
    try {
      setDoc(doc(db, 'offers', offer.id), cleanForFirestore(offer), { merge: true }).catch(() => {});
    } catch (e) {}
    showToast('تم تعديل العرض بنجاح');
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
    try {
      deleteDoc(doc(db, 'offers', id)).catch(() => {});
    } catch (e) {}
    showToast('تم حذف العرض');
  };

  const addDoctor = (doctorData: Omit<Doctor, 'id'>) => {
    const newDoc: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}`
    };
    setDoctors(prev => [...prev, newDoc]);
    try {
      setDoc(doc(db, 'doctors', newDoc.id), cleanForFirestore(newDoc)).catch(() => {});
    } catch (e) {}
    showToast(`تمت إضافة الطبيب (${newDoc.name}) بنجاح إلى الفريق الطبي! 🩺`);
  };

  const updateDoctor = (doctor: Doctor) => {
    setDoctors(prev => prev.map(d => d.id === doctor.id ? doctor : d));
    try {
      setDoc(doc(db, 'doctors', doctor.id), cleanForFirestore(doctor), { merge: true }).catch(() => {});
    } catch (e) {}
    showToast(`تم تحديث بيانات الطبيب (${doctor.name}) بنجاح ✓`);
  };

  const deleteDoctor = (id: string) => {
    const docToDelete = doctors.find(d => d.id === id);
    setDoctors(prev => prev.filter(d => d.id !== id));
    try {
      deleteDoc(doc(db, 'doctors', id)).catch(() => {});
    } catch (e) {}
    showToast(`تم حذف الطبيب (${docToDelete?.name || ''}) بنجاح`);
  };

  const broadcastNotification = (title: string, message: string, type: 'offer' | 'system' | 'appointment' = 'system') => {
    const timestamp = new Date().toISOString();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: 'الآن',
      read: false,
      type,
      createdAt: timestamp
    } as any;

    setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)]);
    setActiveBannerNotification(newNotif);

    // Audio chime
    playNotificationSound();

    // Browser native push notification
    sendBrowserNotification(title, message);

    try {
      setDoc(doc(db, 'notifications', newNotif.id), cleanForFirestore(newNotif)).catch(() => {});
    } catch (e) {}
    showToast(`تم إرسال الإشعار والتنبيه الصوتي بنجاح! 🔔`);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('almasa_notifs_v2', JSON.stringify(updated));
      return updated;
    });

    // Update all unread docs in Firestore
    notifications.forEach(n => {
      if (!n.read) {
        try {
          updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {});
        } catch (e) {}
      }
    });
    showToast('تم تحديد جميع الإشعارات كمقروءة ✓');
  };

  const deleteNotification = (id: string) => {
    deletedNotifIdsRef.current.add(id);
    try {
      localStorage.setItem('almasa_deleted_notif_ids_v2', JSON.stringify(Array.from(deletedNotifIdsRef.current)));
    } catch (_) {}

    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('almasa_notifs_v2', JSON.stringify(updated));
      return updated;
    });
    if (activeBannerNotification?.id === id) {
      setActiveBannerNotification(null);
    }
    try {
      deleteDoc(doc(db, 'notifications', id)).catch(() => {});
    } catch (e) {}
    showToast('تم حذف الإشعار');
  };

  const clearAllNotifications = () => {
    const ids = notifications.map(n => n.id);
    ids.forEach(id => deletedNotifIdsRef.current.add(id));
    try {
      localStorage.setItem('almasa_deleted_notif_ids_v2', JSON.stringify(Array.from(deletedNotifIdsRef.current)));
    } catch (_) {}

    setNotifications([]);
    setActiveBannerNotification(null);
    localStorage.setItem('almasa_notifs_v2', '[]');

    ids.forEach(id => {
      try {
        deleteDoc(doc(db, 'notifications', id)).catch(() => {});
      } catch (e) {}
    });
    showToast('تم مسح جميع الإشعارات بنجاح ✓');
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    // 1. Mark as read
    if (!notif.read) {
      setNotifications(prev => {
        const updated = prev.map(n => n.id === notif.id ? { ...n, read: true } : n);
        localStorage.setItem('almasa_notifs_v2', JSON.stringify(updated));
        return updated;
      });
      try {
        updateDoc(doc(db, 'notifications', notif.id), { read: true }).catch(() => {});
      } catch (_) {}
    }

    if (activeBannerNotification?.id === notif.id) {
      setActiveBannerNotification(null);
    }

    const title = notif.title || '';
    const message = notif.message || '';
    const isConsentNotif =
      notif.type === 'consent' ||
      title.includes('إقرار') ||
      message.includes('إقرار') ||
      title.includes('الموافقة') ||
      notif.id.includes('consent');
    const isOfferNotif =
      notif.type === 'offer' ||
      title.includes('عرض') ||
      message.includes('عرض');
    const isInvoiceNotif =
      notif.type === 'invoice' ||
      title.includes('فاتورة') ||
      message.includes('فاتورة') ||
      notif.id.includes('inv');
    const isRatingNotif =
      title.includes('تقييم') ||
      message.includes('تقييم') ||
      message.includes('رأيك') ||
      title.includes('اكتمل كشفك');

    // Match target appointment
    let targetApt: Appointment | undefined;
    let targetId = notif.appointmentId || '';
    if (targetId.startsWith('appointment_')) targetId = targetId.replace('appointment_', '');
    if (targetId.startsWith('consent_')) targetId = targetId.replace('consent_', '');

    if (targetId) {
      targetApt = appointments.find(a => a.id === targetId);
    }
    if (!targetApt && isConsentNotif) {
      targetApt = appointments.find(a => !!a.consent);
    }
    if (!targetApt && currentUser) {
      targetApt = appointments.find(a => a.patientPhone === currentUser.phone || a.patientName === currentUser.name);
    }

    if (viewMode === 'secretary') {
      if (isConsentNotif) {
        setActiveSecretaryTab('consents');
        if (targetApt) {
          setActiveConsentModalApt(targetApt);
        }
        showToast('تم نقلك إلى قسم الإقرارات الطبية والخطة العلاجية 📋');
        return;
      }
      if (isOfferNotif) {
        setActiveSecretaryTab('offers_and_notifs');
        showToast('تم نقلك إلى قسم إدارة العروض والإعلانات 🔥');
        return;
      }
      if (isInvoiceNotif) {
        setActiveSecretaryTab('installments_billing');
        if (targetApt) {
          setActiveInvoiceModalApt(targetApt);
        }
        showToast('تم نقلك إلى قسم الفواتير والأقساط 🧾');
        return;
      }
      setActiveSecretaryTab('all_bookings');
      if (targetApt) {
        showToast(`تم التوجيه لموعد المريض: ${targetApt.patientName}`);
      }
    } else {
      // Client (Patient) Mode
      if (isConsentNotif) {
        setClientTab('appointments');
        if (targetApt) {
          setActiveConsentModalApt(targetApt);
          showToast('تم فتح الإقرار الطبي للمراجعة والتوقيع ✍️');
        } else {
          showToast('تم نقلك إلى قسم المواعيد والإقرارات 📋');
        }
        return;
      }
      if (isOfferNotif) {
        setClientTab('offers');
        showToast('تم نقلك إلى قسم العروض الحصرية 🔥');
        return;
      }
      if (isInvoiceNotif) {
        setClientTab('appointments');
        if (targetApt) {
          setActiveInvoiceModalApt(targetApt);
          showToast('تم فتح تفاصيل الفاتورة الرسمية 🧾');
        }
        return;
      }
      if (isRatingNotif && targetApt) {
        setClientTab('appointments');
        openRatingModal(targetApt);
        return;
      }
      setClientTab('appointments');
      showToast('تم نقلك إلى قسم مواعيدي 📅');
    }
  };

  // Secretary updates database password in Firestore (clinic_settings/secretary_security)
  const updateSecretaryPasswordInDb = async (newPassword: string): Promise<boolean> => {
    const trimmed = (newPassword || '').trim();
    if (!trimmed || trimmed.length < 3) {
      showToast('كلمة المرور يجب أن تتكون من 3 أحرف أو أرقام على الأقل');
      return false;
    }
    try {
      await setDoc(doc(db, 'clinic_settings', 'secretary_security'), cleanForFirestore({
        id: 'secretary_security',
        secretaryPassword: trimmed,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'مدير المركز'
      }));
      setSecretaryPassword(trimmed);
      localStorage.setItem('almasa_secretary_db_password', trimmed);
      setCustomScreenLockPin(trimmed);
      showToast('تم حفظ وتحديث كلمة مرور السكرتارية في قاعدة البيانات Firestore بنجاح 🔒✓');
      return true;
    } catch (e: any) {
      console.warn('Firestore password update note:', e);
      setSecretaryPassword(trimmed);
      localStorage.setItem('almasa_secretary_db_password', trimmed);
      setCustomScreenLockPin(trimmed);
      showToast('تم حفظ كلمة المرور بنجاح في النظام 🔒');
      return true;
    }
  };

  // Send 1-on-1 private follow-up message to a specific patient
  const sendPrivateFollowupMessage = async (params: {
    patientPhone: string;
    patientName: string;
    title: string;
    message: string;
    category?: 'surgery' | 'whitening' | 'reminder' | 'billing' | 'general';
  }): Promise<boolean> => {
    const cleanPhone = (params.patientPhone || '').trim();
    const cleanName = (params.patientName || '').trim() || 'المريض';
    const cleanTitle = (params.title || '').trim();
    const cleanMessage = (params.message || '').trim();

    if (!cleanPhone || !cleanTitle || !cleanMessage) {
      showToast('يرجى التأكد من كتابة رقم الهاتف وعنوان ونص الرسالة');
      return false;
    }

    const timestamp = new Date().toISOString();
    const newNotif: NotificationItem = {
      id: `notif-followup-${Date.now()}`,
      title: cleanTitle,
      message: cleanMessage,
      time: 'الآن',
      read: false,
      type: 'private_message',
      patientPhone: cleanPhone,
      patientName: cleanName,
      createdAt: timestamp,
      followupCategory: params.category || 'general'
    };

    // Update in-memory state
    setNotifications(prev => [newNotif, ...prev]);

    // Audio chime & native browser alert
    playNotificationSound();
    sendBrowserNotification(`رسالة متابعة خاصة: ${cleanName}`, cleanTitle);

    // Save to Firestore notifications collection
    try {
      await setDoc(doc(db, 'notifications', newNotif.id), cleanForFirestore(newNotif));
    } catch (e) {
      console.warn('Firestore private notification note:', e);
    }

    // Also record in patient medical file history notes
    try {
      const targetPatient = patients.find(p => p.phone.trim() === cleanPhone);
      if (targetPatient) {
        const dateStr = new Date().toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const entry = `[متابعة خاصة ${dateStr}]: ${cleanTitle} - ${cleanMessage}`;
        const updatedNotes = targetPatient.notes ? `${targetPatient.notes}\n${entry}` : entry;
        const updatedPatient = { ...targetPatient, notes: updatedNotes };
        setRawFirestorePatients(prev => {
          const idx = prev.findIndex(p => p.id === targetPatient.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = updatedPatient;
            return copy;
          }
          return [updatedPatient, ...prev];
        });
        setDoc(doc(db, 'patients', targetPatient.id), cleanForFirestore(updatedPatient), { merge: true }).catch(() => {});
      }
    } catch (e) {}

    showToast(`تم إرسال رسالة المتابعة الخاصة للمريض (${cleanName}) بنجاح 💬✓`);
    return true;
  };

  const rateAppointment = (appointmentId: string, doctorId: string, rating: number, comment?: string) => {
    const targetDoc = doctors.find(d => d.id === doctorId);
    const targetAppt = appointments.find(a => a.id === appointmentId);
    const isEdit = !!targetAppt?.rating;

    // 1. Update appointment rating
    setAppointments(prev => {
      const updated = prev.map(a => {
        if (a.id === appointmentId) {
          return {
            ...a,
            rating,
            reviewComment: comment,
            reviewedAt: new Date().toISOString()
          };
        }
        return a;
      });
      localStorage.setItem('almasa_appointments_v2', JSON.stringify(updated));
      return updated;
    });

    // 2. Update or create review in rawReviews
    let savedRevId = `rev-${Date.now()}`;
    setRawReviews(prev => {
      const existingIndex = prev.findIndex(r =>
        (r.appointmentId && r.appointmentId === appointmentId) ||
        (targetAppt && r.appointmentCode && r.appointmentCode === targetAppt.appointmentCode) ||
        (r.doctorId === doctorId && targetAppt && r.patientName === targetAppt.patientName)
      );

      let updated: DoctorReview[];
      if (existingIndex >= 0) {
        savedRevId = prev[existingIndex].id;
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          rating,
          comment: comment || 'خدمة ممتازة واهتمام فائق',
          date: new Date().toISOString().split('T')[0],
          appointmentId
        };
      } else {
        const newRev: DoctorReview = {
          id: savedRevId,
          doctorId,
          doctorName: targetDoc ? targetDoc.name : 'طبيب المركز',
          patientName: targetAppt ? targetAppt.patientName : (currentUser?.name || 'مريض معتمد'),
          rating,
          comment: comment || 'خدمة ممتازة واهتمام فائق',
          date: new Date().toISOString().split('T')[0],
          appointmentCode: targetAppt?.appointmentCode,
          appointmentId
        };
        updated = [newRev, ...prev];
      }

      localStorage.setItem('almasa_doctor_reviews_v1', JSON.stringify(updated));
      return updated;
    });

    // 3. Sync to Firestore if available
    try {
      const payload = cleanForFirestore({
        id: savedRevId,
        appointmentId,
        appointmentCode: targetAppt?.appointmentCode || '',
        doctorId,
        doctorName: targetDoc ? targetDoc.name : 'طبيب المركز',
        patientName: targetAppt ? targetAppt.patientName : (currentUser?.name || 'مريض معتمد'),
        serviceName: targetAppt?.serviceName || 'كشف واستشارة طبية شاملة',
        rating,
        comment: comment || 'خدمة ممتازة واهتمام فائق ⭐',
        createdAt: new Date().toISOString().split('T')[0],
        date: new Date().toISOString().split('T')[0]
      });

      setDoc(doc(db, 'doctor_reviews', savedRevId), payload, { merge: true }).catch(() => {});
      setDoc(doc(db, 'reviews', savedRevId), payload, { merge: true }).catch(() => {});

      updateDoc(doc(db, 'appointments', appointmentId), {
        rating,
        reviewComment: comment || '',
        reviewedAt: new Date().toISOString()
      }).catch(() => {});
    } catch (_) {}

    setRatingModalApt(null);
    showToast(isEdit ? `تم تحديث تقييمك بنجاح ⭐ (${rating}/5)` : `شكراً لتقييمك! تم تسجيل تقييم الطبيب ⭐ (${rating}/5) بنجاح`);
  };

  const deleteDoctorReview = (reviewOrApptId: string) => {
    const targetAppt = appointments.find(a => a.id === reviewOrApptId || a.appointmentCode === reviewOrApptId);
    let deletedRevId = reviewOrApptId;

    // 1. Clear rating on appointment
    setAppointments(prev => {
      const updated = prev.map(a => {
        if (a.id === reviewOrApptId || (targetAppt && a.id === targetAppt.id)) {
          const copy = { ...a };
          delete copy.rating;
          delete copy.reviewComment;
          delete copy.reviewedAt;
          return copy;
        }
        return a;
      });
      localStorage.setItem('almasa_appointments_v2', JSON.stringify(updated));
      return updated;
    });

    // 2. Remove review from rawReviews
    setRawReviews(prev => {
      const updated = prev.filter(r => {
        const matches = (
          r.id === reviewOrApptId ||
          r.appointmentId === reviewOrApptId ||
          (targetAppt && r.appointmentCode && r.appointmentCode === targetAppt.appointmentCode) ||
          (targetAppt && r.appointmentId === targetAppt.id)
        );
        if (matches) {
          deletedRevId = r.id;
        }
        return !matches;
      });
      localStorage.setItem('almasa_doctor_reviews_v1', JSON.stringify(updated));
      return updated;
    });

    // 3. Sync deletion to Firestore both collections
    try {
      deleteDoc(doc(db, 'reviews', deletedRevId)).catch(() => {});
      deleteDoc(doc(db, 'doctor_reviews', deletedRevId)).catch(() => {});
      if (targetAppt) {
        deleteDoc(doc(db, 'reviews', targetAppt.id)).catch(() => {});
        deleteDoc(doc(db, 'doctor_reviews', targetAppt.id)).catch(() => {});
        updateDoc(doc(db, 'appointments', targetAppt.id), {
          rating: null,
          reviewComment: null,
          reviewedAt: null
        }).catch(() => {});
      } else {
        updateDoc(doc(db, 'appointments', reviewOrApptId), {
          rating: null,
          reviewComment: null,
          reviewedAt: null
        }).catch(() => {});
      }
    } catch (_) {}

    if (ratingModalApt?.id === reviewOrApptId) {
      setRatingModalApt(null);
    }
    showToast('تم حذف التقييم بنجاح 🗑️');
  };

  // Patient Directory Management:
  const addPatientRecord = (data: Omit<PatientRecord, 'id' | 'totalVisits'>) => {
    const cleanPhone = (data.phone || '').trim();
    const id = `pat-${Date.now()}`;
    const newRecord: PatientRecord = {
      ...data,
      id,
      phone: cleanPhone,
      totalVisits: 0,
      notes: data.notes || '',
      appointments: [],
      createdAt: new Date().toISOString()
    };
    setRawFirestorePatients(prev => [newRecord, ...prev]);
    setDoc(doc(db, 'patients', id), cleanForFirestore(newRecord)).catch(() => {});
    showToast(`تم إنشاء ملف المريض (${newRecord.name}) بنجاح ✓`);
  };

  const updatePatientRecord = (patient: PatientRecord) => {
    setRawFirestorePatients(prev => {
      const idx = prev.findIndex(p => p.id === patient.id || (p.phone && p.phone === patient.phone));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = patient;
        return copy;
      }
      return [patient, ...prev];
    });
    setDoc(doc(db, 'patients', patient.id), cleanForFirestore(patient), { merge: true }).catch(() => {});
    showToast(`تم حفظ وتحديث ملف المريض (${patient.name}) بنجاح ✓`);
  };

  const addPatientMedicalNote = (patientId: string, noteText: string) => {
    if (!noteText.trim()) return;
    const nowStr = new Date().toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formattedNote = `[ملاحظة طبية ${nowStr}]: ${noteText.trim()}`;

    const existing = patients.find(p => p.id === patientId || p.phone === patientId);
    if (existing) {
      const updatedNotes = existing.notes ? `${existing.notes}\n${formattedNote}` : formattedNote;
      const updatedRecord: PatientRecord = { ...existing, notes: updatedNotes };
      updatePatientRecord(updatedRecord);
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        viewMode,
        setViewMode,
        clientTab,
        setClientTab,
        currentUser,
        isAuthenticated: !!currentUser,
        isSessionEncrypted,
        lockoutRemainingSeconds,
        rememberMeEnabled,
        setRememberMeEnabled,
        registeredUsers,
        authModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateUserProfile,
        updateUserRole,
        deleteUser,
        isScreenLocked,
        lockScreen,
        unlockScreen,
        changeScreenLockPin,
        services,
        offers,
        doctors: doctorsWithRealRatings,
        appointments,
        patients,
        notifications,
        unreadNotifsCount,
        clinicInfo,
        updateClinicInfo,
        selectedService,
        setSelectedService,
        selectedOffer,
        setSelectedOffer,
        selectedDoctor,
        setSelectedDoctor,
        bookingStep,
        setBookingStep,
        startBooking,
        createAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        cancelAppointment,
        deleteAppointment,
        clearAllAppointments,
        addService,
        updateService,
        deleteService,
        addOffer,
        updateOffer,
        deleteOffer,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        broadcastNotification,
        markNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        activeBannerNotification,
        dismissBannerNotification,
        requestNotificationPermission,
        playNotificationChime,
        handleNotificationClick,
        activeConsentModalApt,
        openConsentModal,
        closeConsentModal,
        activeInvoiceModalApt,
        openInvoiceModal,
        closeInvoiceModal,
        activeSecretaryTab,
        setActiveSecretaryTab,
        rateAppointment,
        deleteDoctorReview,
        doctorReviews,
        ratingModalApt,
        openRatingModal,
        closeRatingModal,
        addPatientRecord,
        updatePatientRecord,
        addPatientMedicalNote,
        recordPayment,
        updateAppointmentPayment,
        deletePaymentRecord,
        toastMessage,
        showToast,
        isSecretaryDashboardUnlocked,
        unlockSecretaryDashboard,
        lockSecretaryDashboard,
        secretaryPassword,
        updateSecretaryPasswordInDb,
        sendPrivateFollowupMessage,
        saveMedicalConsent,
        createWalkinConsentAppointment,
        deleteMedicalConsent,
        getBlockingConsentAppointment,
        issuePatientInvoice,
        clinicGallery,
        addClinicPhoto,
        deleteClinicPhoto
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
