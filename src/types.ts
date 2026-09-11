export interface DentalService {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  iconName: string;
  popular?: boolean;
  features: string[];
}

export interface DentalOffer {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  badge: string;
  features: string[];
  expiresAt: string;
  serviceId?: string;
  imageTheme: 'blue' | 'teal' | 'gold' | 'purple';
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  avatar: string;
  availableDays: string[];
  shift: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export type PaymentMethod = 'cash' | 'instapay' | 'vodafone_cash' | 'visa' | 'bank_transfer';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD or ISO
  time?: string;
  paymentMethod: PaymentMethod;
  note?: string; // e.g. "دفعة مقدمة تقويم", "قسط شهر سبتمبر", "جلسة شد"
  recordedBy?: string; // اسم الموظف / السكرتيرة
  receiptNumber?: string;
}

export interface TreatmentPlanStage {
  id: string;
  stageName: string; // اسم المرحلة أو الإجراء العلاجي
  toothNumber?: string; // رقم أو موضع السن (اختياري، مثلاً #16 أو الفك العلوي)
  sessionsCount?: number; // عدد الجلسات المتوقعة
  estimatedCost?: number; // التكلفة التقديرية بالجنيه
  details?: string; // تفاصيل أو ملاحظات المرحلة
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface MedicalConsent {
  id: string;
  appointmentId: string;
  appointmentCode: string;
  patientName: string;
  patientPhone: string;
  patientNationalId?: string;
  procedureName: string;
  doctorName: string;
  date: string;
  procedureDetails?: string;
  
  // الخطة العلاجية المعتمدة
  treatmentPlan?: string; // ملخص ونص الخطة العلاجية المقررة
  treatmentPlanStages?: TreatmentPlanStage[]; // مراحل وخطوات الخطة العلاجية المنظمة
  estimatedDuration?: string; // المدة الزمنية المقدرة (مثلاً: شهرين، 4 جلسات)
  totalEstimatedCost?: number; // إجمالي التكلفة التقديرية للخطة العلاجية

  risksAcknowledged: string[];
  status: 'draft' | 'sent_to_patient' | 'signed_by_patient' | 'approved' | 'pending_signature' | 'signed';
  signatureType: 'paper_physical' | 'digital' | 'name_ack';
  patientSignature?: string;
  signerName?: string;
  touchStrokes?: Array<Array<{ dx: number; dy: number }>> | any[];
  signedAt?: string;
  witnessName?: string; // اسم السكرتيرة أو الشاهد
  notes?: string;
  createdAt: string;

  // مسار اعتماد الإقرار ثلاثي المراحل: السكرتيرة ترسل -> العميل يوقع -> السكرتيرة تعتمد
  sentToPatientAt?: string; // تاريخ إرسال الإقرار للمريض
  sentBy?: string; // اسم السكرتيرة التي أرسلت الإقرار
  approvedAt?: string; // تاريخ اعتماد السكرتارية النهائي
  approvedBy?: string; // اسم السكرتيرة التي اعتمدت الإقرار
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PatientInvoice {
  invoiceNumber: string;
  appointmentId: string;
  appointmentCode: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  date: string;
  time?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  issuedAt: string;
  issuedBy: string;
  clinicStamp: boolean;
}

export interface Appointment {
  id: string;
  appointmentCode: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientNationalId?: string;
  serviceId: string;
  serviceName: string;
  doctorId: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "04:00 م"
  status: AppointmentStatus;
  notes?: string;
  price: number; // إجمالي التكلفة / سعر العلاج
  totalAmount?: number; // إجمالي تكلفة خطة العلاج أو كورس التقويم
  paidAmount?: number; // إجمالي المبلغ المدفوع حتى الآن
  remainingAmount?: number; // المبلغ المتبقي للسداد
  isInstallment?: boolean; // هل الحالة نظام تقسيط (مثل تقويم الأسنان والزراعة)
  installmentNote?: string;
  paymentHistory?: PaymentRecord[];
  isOffer: boolean;
  offerTitle?: string;
  paymentStatus: 'unpaid' | 'paid' | 'partial';
  createdAt: string;
  source: 'app' | 'reception_walkin' | 'phone';
  rating?: number;
  reviewComment?: string;
  reviewedAt?: string;
  consent?: MedicalConsent;
  invoice?: PatientInvoice;
}

export interface ClinicPhoto {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  appointmentCode?: string;
  appointmentId?: string;
  serviceName?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  date?: string;
  read: boolean;
  type: 'appointment' | 'consent' | 'offer' | 'system' | 'announcement' | 'private_message' | 'followup' | 'invoice';
  targetRole?: 'all' | 'patient' | 'secretary';
  appointmentId?: string;
  patientPhone?: string;
  patientName?: string;
  createdAt?: string;
  followupCategory?: 'surgery' | 'whitening' | 'reminder' | 'billing' | 'general';
}

export interface SecretarySecurityConfig {
  secretaryPassword: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalVisits: number;
  lastVisitDate?: string;
  notes: string;
  medicalHistory?: string[];
  bloodType?: string;
  nationalId?: string;
  gender?: string;
  memberSince?: string;
  appointments?: Appointment[];
  age?: number;
  allergies?: string[];
  chronicDiseases?: string[];
  createdAt?: string;
}

export type UserRole = 'patient' | 'secretary' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  nationalId?: string;
  role: UserRole;
  avatar?: string;
  memberSince?: string;
  gender?: 'male' | 'female';
  bloodType?: string;
  emergencyContact?: string;
}

export type AuthMode = 'login' | 'register' | 'otp' | 'forgot_password';

export type AppViewMode = 'client' | 'secretary';
export type ClientTab = 'home' | 'services' | 'offers' | 'appointments' | 'about' | 'profile' | 'booking' | 'auth';
