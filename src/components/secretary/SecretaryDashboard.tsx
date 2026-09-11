import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus, DentalOffer, DentalService, Doctor, PatientRecord, MedicalConsent } from '../../types';
import { InstallmentManagementModal } from './InstallmentManagementModal';
import { InstallmentStatementPrintModal } from './InstallmentStatementPrintModal';
import { InstallmentsBillingView } from './InstallmentsBillingView';
import { normalizeNumberInput, parseNumberSafe } from '../../utils/numberUtils';
import { printElement } from '../../utils/printHelper';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Search,
  Filter,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Printer,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  CalendarDays,
  Sparkles,
  ChevronDown,
  Building,
  UserPlus,
  RefreshCw,
  Send,
  FileSpreadsheet,
  Tag,
  Stethoscope,
  Bell,
  Megaphone,
  Percent,
  Layers,
  Check,
  Share2,
  AlertTriangle,
  Video,
  Facebook,
  MessageCircle,
  Folder,
  FileVideo,
  Upload,
  UploadCloud,
  Loader2,
  Film,
  Play,
  ExternalLink,
  RotateCcw,
  Image as ImageIcon,
  Camera,
  Star,
  CreditCard,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  HeartPulse,
  Lock,
  FileText,
  Receipt
} from 'lucide-react';
import { SendFollowupModal } from './SendFollowupModal';
import { MedicalConsentModal } from './MedicalConsentModal';
import { PatientInvoiceModal } from './PatientInvoiceModal';

export const SecretaryDashboard: React.FC = () => {
  const {
    appointments,
    services,
    offers,
    doctors,
    patients,
    registeredUsers,
    clinicInfo,
    updateClinicInfo,
    updateUserRole,
    deleteUser,
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
    recordPayment,
    updateAppointmentPayment,
    deletePaymentRecord,
    showToast,
    clinicGallery,
    addClinicPhoto,
    deleteClinicPhoto,
    doctorReviews,
    deleteDoctorReview,
    addPatientRecord,
    updatePatientRecord,
    addPatientMedicalNote,
    secretaryPassword,
    updateSecretaryPasswordInDb,
    sendPrivateFollowupMessage,
    saveMedicalConsent,
    createWalkinConsentAppointment,
    deleteMedicalConsent,
    notifications,
    activeSecretaryTab,
    setActiveSecretaryTab
  } = useClinic();

  // Patient Records Search, Filter & Detailed Modals
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientFilterTab, setPatientFilterTab] = useState<'all' | 'returning' | 'new' | 'consents'>('all');
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    phone: '',
    email: '',
    nationalId: '',
    bloodType: 'O+',
    gender: 'male' as 'male' | 'female',
    notes: ''
  });
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<PatientRecord | null>(null);
  const [newClinicalNoteText, setNewClinicalNoteText] = useState('');

  // 1-on-1 Patient Follow-up Modal State
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [followupModalPatient, setFollowupModalPatient] = useState<{
    name: string;
    phone: string;
    notes?: string;
  } | null>(null);

  // Secretary Custom Database Password Management State
  const [dbPassInput, setDbPassInput] = useState('');
  const [dbPassConfirm, setDbPassConfirm] = useState('');
  const [showDbPass, setShowDbPass] = useState(false);
  const [isUpdatingDbPass, setIsUpdatingDbPass] = useState(false);
  const [copiedDbPass, setCopiedDbPass] = useState(false);

  // Photo Gallery Management State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('تجهيزات المركز');
  const [photoFilterCategory, setPhotoFilterCategory] = useState('الكل');

  // Automatic client-side canvas image compression to keep app lightweight & fast
  const handleCompressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          callback(compressed);
        } else {
          callback(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Doctor Management Modal State
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [docFormName, setDocFormName] = useState('');
  const [docFormTitle, setDocFormTitle] = useState('');
  const [docFormSpecialty, setDocFormSpecialty] = useState('');
  const [docFormExp, setDocFormExp] = useState(10);
  const [docFormShift, setDocFormShift] = useState('02:00 م - 10:00 م');
  const [docFormAvatar, setDocFormAvatar] = useState('/assets/images/doctors/dr_asmaa.jpg');
  const [docFormDays, setDocFormDays] = useState<string[]>(['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']);

  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDocFormName('');
    setDocFormTitle('أخصائية طب وتجميل الأسنان');
    setDocFormSpecialty('اخصائي علاج تحفظي وتجميل');
    setDocFormExp(10);
    setDocFormShift('02:00 م - 10:00 م');
    setDocFormAvatar('/assets/images/doctors/dr_asmaa.jpg');
    setDocFormDays(['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']);
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDocFormName(doc.name);
    setDocFormTitle(doc.title);
    setDocFormSpecialty(doc.specialty);
    setDocFormExp(doc.experienceYears);
    setDocFormShift(doc.shift);
    setDocFormAvatar(doc.avatar);
    setDocFormDays(doc.availableDays);
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFormName.trim()) {
      showToast('يرجى إدخال اسم الطبيب / الدكتورة');
      return;
    }
    if (editingDoctor) {
      updateDoctor({
        ...editingDoctor,
        name: docFormName.trim(),
        title: docFormTitle.trim() || 'أخصائي طب وجراحة الفم والأسنان',
        specialty: docFormSpecialty.trim() || 'اخصائي أسنان',
        experienceYears: Number(docFormExp) || 1,
        shift: docFormShift.trim() || '02:00 م - 10:00 م',
        avatar: docFormAvatar.trim() || '/assets/images/doctors/dr_asmaa.jpg',
        availableDays: docFormDays.length > 0 ? docFormDays : ['السبت', 'الأحد', 'الثلاثاء']
      });
    } else {
      addDoctor({
        name: docFormName.trim(),
        title: docFormTitle.trim() || 'أخصائي طب وجراحة الفم والأسنان',
        specialty: docFormSpecialty.trim() || 'اخصائي أسنان',
        experienceYears: Number(docFormExp) || 5,
        rating: 5.0,
        reviewCount: 0,
        shift: docFormShift.trim() || '02:00 م - 10:00 م',
        avatar: docFormAvatar.trim() || '/assets/images/doctors/dr_asmaa.jpg',
        availableDays: docFormDays.length > 0 ? docFormDays : ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
      });
    }
    setIsDoctorModalOpen(false);
  };

  // Handler to update the custom database password in Firestore (clinic_settings/secretary_security)
  const handleUpdateSecretaryPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = dbPassInput.trim();
    if (!trimmed) {
      showToast('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (trimmed.length < 3) {
      showToast('كلمة المرور يجب أن تكون 3 أحرف أو أرقام على الأقل');
      return;
    }
    if (dbPassConfirm && trimmed !== dbPassConfirm.trim()) {
      showToast('كلمتا المرور غير متطابقتين، يرجى إعادة كتابة التأكيد بدقة');
      return;
    }
    if (trimmed === '1234') {
      showToast('يرجى اختيار كلمة مرور قوية وخاصة بك في الداتا بيز بدلاً من 1234');
      return;
    }

    setIsUpdatingDbPass(true);
    try {
      const success = await updateSecretaryPasswordInDb(trimmed);
      if (success) {
        setDbPassInput('');
        setDbPassConfirm('');
      }
    } finally {
      setIsUpdatingDbPass(false);
    }
  };

  const handleCopyDbPass = () => {
    const passToCopy = secretaryPassword || 'Almasa@2026';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(passToCopy);
      setCopiedDbPass(true);
      showToast('تم نسخ كلمة المرور المعتمدة إلى الحافظة بنجاح 📋');
      setTimeout(() => setCopiedDbPass(false), 2000);
    }
  };

  // Active Tab inside Secretary Panel
  const [activeTab, setActiveTab] = useState<'all_bookings' | 'consents' | 'installments_billing' | 'timeline' | 'patients' | 'doctors' | 'offers_and_notifs' | 'services' | 'users_roles' | 'media_settings'>('all_bookings');

  // Synchronize with ClinicContext activeSecretaryTab when navigating from notifications
  useEffect(() => {
    if (activeSecretaryTab && activeSecretaryTab !== activeTab) {
      setActiveTab(activeSecretaryTab);
    }
  }, [activeSecretaryTab]);

  // Medical Consent & Invoice Modals State
  const [selectedConsentApt, setSelectedConsentApt] = useState<Appointment | null>(null);
  const [selectedInvoiceApt, setSelectedInvoiceApt] = useState<Appointment | null>(null);
  const [consentSearchQuery, setConsentSearchQuery] = useState('');
  const [consentStatusFilter, setConsentStatusFilter] = useState<'all' | 'signed' | 'pending' | 'no_consent'>('all');
  const [isNewConsentModalOpen, setIsNewConsentModalOpen] = useState(false);
  const [newConsentPatientName, setNewConsentPatientName] = useState('');
  const [newConsentPatientPhone, setNewConsentPatientPhone] = useState('');
  const [newConsentNationalId, setNewConsentNationalId] = useState('');
  const [newConsentProcedure, setNewConsentProcedure] = useState('زراعة الأسنان');
  const [newConsentDoctor, setNewConsentDoctor] = useState(doctors[0]?.name || 'د. محمد فوزي');
  const [isCreatingConsent, setIsCreatingConsent] = useState(false);

  // Installments & Payment Tracking Modals State
  const [selectedPaymentApt, setSelectedPaymentApt] = useState<Appointment | null>(null);
  const [selectedPrintStatementApt, setSelectedPrintStatementApt] = useState<Appointment | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Quick New Booking Modal
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [modalPatientName, setModalPatientName] = useState('');
  const [modalPatientPhone, setModalPatientPhone] = useState('');
  const [modalServiceId, setModalServiceId] = useState(services?.[0]?.id || '');
  const [modalDoctorId, setModalDoctorId] = useState(doctors?.[0]?.id || '');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalTimeSlot, setModalTimeSlot] = useState('11:00 ص');
  const [modalNotes, setModalNotes] = useState('');
  const [modalSource, setModalSource] = useState<'reception_walkin' | 'phone'>('reception_walkin');
  const [modalPaymentStatus, setModalPaymentStatus] = useState<'unpaid' | 'paid'>('unpaid');
  const [modalIsInstallment, setModalIsInstallment] = useState(false);
  const [modalTotalAmount, setModalTotalAmount] = useState<string>('');
  const [modalPaidAmount, setModalPaidAmount] = useState<string>('0');
  const [modalInstallmentNote, setModalInstallmentNote] = useState('');

  // New Offer Form State
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerSubtitle, setOfferSubtitle] = useState('');
  const [offerCategory, setOfferCategory] = useState('تنظيف وتبييض');
  const [offerOriginalPrice, setOfferOriginalPrice] = useState<number>(600);
  const [offerDiscountedPrice, setOfferDiscountedPrice] = useState<number>(350);
  const [offerBadge, setOfferBadge] = useState('خصم 40%');
  const [offerFeaturesText, setOfferFeaturesText] = useState('تنظيف وتلميع بالموجات الصوتية, جلسة فلورايد لحماية المينا, كشف واستشارة مجانية');
  const [offerExpiresAt, setOfferExpiresAt] = useState('2026-10-30');
  const [offerImageTheme, setOfferImageTheme] = useState<DentalOffer['imageTheme']>('blue');
  const [offerNotifyClients, setOfferNotifyClients] = useState(true);

  // New Service & Price Form State
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('الوقاية والتنظيف');
  const [serviceBasePrice, setServiceBasePrice] = useState<number>(450);
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceFeaturesText, setServiceFeaturesText] = useState('فحص دقيق بأحدث الأجهزة, تعقيم فائق الجودة, استشارة مجانية');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<number>(0);

  // Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'offer' | 'system' | 'appointment'>('offer');

  // Print/Receipt preview modal
  const [selectedReceiptApt, setSelectedReceiptApt] = useState<Appointment | null>(null);

  // In-App Confirm Dialog (Replaces native window.confirm to guarantee 100% functionality in iframe sandboxes)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Quick stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const todayConfirmed = todayAppointments.filter(a => a.status === 'confirmed').length;
  const allConfirmed = appointments.filter(a => a.status === 'confirmed').length;
  const allPending = appointments.filter(a => a.status === 'pending').length;
  const inClinicNow = appointments.filter(a => a.status === 'arrived' || a.status === 'in_progress').length;
  const completedTotal = appointments.filter(a => a.status === 'completed').length;

  const totalRevenue = appointments
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const todayRevenue = todayAppointments
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const confirmedRevenue = appointments
    .filter(a => a.status === 'confirmed' || a.status === 'completed' || a.status === 'arrived' || a.status === 'in_progress')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  // Filtered appointments list
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      apt.appointmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === 'all' || apt.doctorId === doctorFilter;
    const matchesDate = !dateFilter || apt.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
  });

  const handleCreateWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPatientName.trim() || !modalPatientPhone.trim()) {
      showToast('الرجاء إدخال اسم المريض ورقم الهاتف');
      return;
    }

    const srv = services?.find(s => s.id === modalServiceId) || services?.[0] || { id: 'srv-default', name: 'كشف عام', basePrice: 150 };
    const doc = doctors?.find(d => d.id === modalDoctorId) || doctors?.[0] || { id: 'doc-1', name: 'د. محمد فوزي' };

    const total = modalTotalAmount ? parseNumberSafe(modalTotalAmount, srv.basePrice) : srv.basePrice;
    const paid = modalPaymentStatus === 'paid' && !modalPaidAmount
      ? total
      : (modalPaidAmount ? parseNumberSafe(modalPaidAmount, 0) : 0);
    const remaining = Math.max(0, total - paid);
    const finalPaymentStatus = remaining <= 0 ? 'paid' : (paid > 0 ? 'partial' : 'unpaid');
    const isInstallment = modalIsInstallment || srv.name.includes('تقويم') || remaining > 0;

    createAppointment({
      patientName: modalPatientName.trim(),
      patientPhone: modalPatientPhone.trim(),
      serviceId: srv.id,
      serviceName: srv.name,
      doctorId: doc.id,
      doctorName: doc.name,
      date: modalDate,
      timeSlot: modalTimeSlot,
      status: 'confirmed',
      notes: modalNotes.trim() || (modalSource === 'reception_walkin' ? 'حضور مباشر بالمركز' : 'حجز هاتفي عبر السكرتارية'),
      price: srv.basePrice,
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      isInstallment,
      installmentNote: modalInstallmentNote.trim() || (isInstallment ? 'خطة علاج تقسيط' : undefined),
      isOffer: false,
      paymentStatus: finalPaymentStatus,
      source: modalSource
    });

    setIsNewBookingModalOpen(false);
    setModalPatientName('');
    setModalPatientPhone('');
    setModalNotes('');
    setModalTotalAmount('');
    setModalPaidAmount('0');
    setModalInstallmentNote('');
    setModalIsInstallment(false);
  };

  const handleCreateOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) {
      showToast('يرجى كتابة عنوان العرض');
      return;
    }

    const discountPercent = Math.round(((offerOriginalPrice - offerDiscountedPrice) / offerOriginalPrice) * 100);
    const features = offerFeaturesText
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    addOffer(
      {
        title: offerTitle.trim(),
        subtitle: offerSubtitle.trim() || `خصم مميز لفترة محدودة بسعر ${offerDiscountedPrice} ج.م فقط`,
        category: offerCategory,
        originalPrice: Number(offerOriginalPrice),
        discountedPrice: Number(offerDiscountedPrice),
        discountPercent: discountPercent > 0 ? discountPercent : 20,
        badge: offerBadge || `خصم ${discountPercent}%`,
        features: features.length > 0 ? features : ['كشف واستشارة مجانية', 'جلسة علاجية متكاملة', 'أحدث الأجهزة الرقمية'],
        expiresAt: offerExpiresAt,
        imageTheme: offerImageTheme
      },
      offerNotifyClients
    );

    setIsAddOfferModalOpen(false);
    setOfferTitle('');
    setOfferSubtitle('');
    setOfferFeaturesText('تنظيف وتلميع بالموجات الصوتية, جلسة فلورايد لحماية المينا');
  };

  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      showToast('يرجى إدخال اسم الخدمة');
      return;
    }

    const feats = serviceFeaturesText
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    addService({
      name: serviceName.trim(),
      category: serviceCategory,
      basePrice: Number(serviceBasePrice) || 300,
      durationMinutes: Number(serviceDuration) || 30,
      description: serviceDescription.trim() || `خدمة ${serviceName.trim()} بأحدث تقنيات طب وجراحة الأسنان بالمركز`,
      features: feats.length > 0 ? feats : ['فحص واستشارة دقيقة', 'أحدث الأجهزة الألمانية والتعقيم الفائق'],
      imageTheme: 'blue'
    });

    setIsAddServiceOpen(false);
    setServiceName('');
    setServiceDescription('');
    setServiceBasePrice(450);
  };

  const handleUpdateServicePrice = (srv: DentalService, newPrice: number) => {
    if (newPrice <= 0) {
      showToast('يرجى إدخال سعر صحيح');
      return;
    }
    updateService({
      ...srv,
      basePrice: newPrice
    });
    setEditingServiceId(null);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('يرجى كتابة عنوان ونص الإشعار');
      return;
    }

    broadcastNotification(broadcastTitle.trim(), broadcastMessage.trim(), broadcastType);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const sendWhatsAppReminder = (apt: Appointment) => {
    const text = `مرحباً ${apt.patientName}،%0Aنذكركم بموعدكم في مركز الماسة لطب وجراحة الأسنان.%0A📅 التاريخ: ${apt.date}%0A⏰ الوقت: ${apt.timeSlot}%0A🩺 الخدمة: ${apt.serviceName}%0A👨‍⚕️ الطبيب: ${apt.doctorName}%0Aرقم الحجز: ${apt.appointmentCode}%0A📍 العنوان: سكة طنطا - بجوار العيادة الشعبيه - برج النوري.%0Aيرجى الحضور قبل الموعد بـ 10 دقائق.`;
    const cleanPhone = apt.patientPhone.replace(/[^0-9]/g, '');
    const internationalPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    window.open(`https://wa.me/${internationalPhone}?text=${text}`, '_blank');
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full">مؤكد</span>;
      case 'arrived':
        return <span className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">وصل للمركز</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-full animate-pulse">في الكشف</span>;
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-200 rounded-full">قيد المراجعة</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-bold text-purple-800 bg-purple-100 rounded-full">مكتمل</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-bold text-rose-800 bg-rose-100 rounded-full">ملغي</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 flex flex-col gap-6 font-['Cairo',sans-serif]">
      
      {/* Top Banner & Quick Action */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold">
              لوحة التحكم المركزية للسكرتارية
            </span>
            <span className="text-xs text-slate-400 font-mono">
              القاهرة | {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            إدارة مواعيد واستقبال مركز الماسة لطب وجراحة الأسنان
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            متابعة فورية للحجوزات، إضافة العروض وإرسال إشعارات فورية للمرضى، وإدارة جداول الأطباء
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setActiveTab('offers_and_notifs');
              setIsAddOfferModalOpen(true);
            }}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>+ إضافة عرض وإرسال إشعار للمرضى</span>
          </button>

          <button
            onClick={() => setIsNewBookingModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>حجز موعد سريع (استقبال / هاتف)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Stat 1: المواعيد المؤكدة */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500">المواعيد المؤكدة</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900">{allConfirmed}</span>
              <span className="text-xs font-bold text-emerald-600">موعد مؤكد</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
              {todayConfirmed} اليوم • {appointments.length} إجمالي الحجوزات
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: بالانتظار وغرفة الكشف */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500">في المركز الآن</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-amber-600">{inClinicNow}</span>
              <span className="text-xs font-bold text-amber-700">مريض</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
              {allPending} طلب حجز بانتظار التأكيد
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: العروض النشطة والخدمات */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500">العروض والخدمات</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-purple-600">{offers.length}</span>
              <span className="text-xs font-bold text-purple-700">عروض نشطة</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
              {services.length} خدمة طبية مسعرة
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4: الإيراد الفعلي والمقدر بالجنيه المصري */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيراد</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-700">{totalRevenue.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-600">ج.م</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
              {todayRevenue.toLocaleString()} ج.م اليوم • {confirmedRevenue.toLocaleString()} ج.م مؤكد
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('all_bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'all_bookings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>إدارة الحجوزات ({appointments.length})</span>
        </button>

        {/* Medical Consents Tab */}
        <button
          onClick={() => setActiveTab('consents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'consents'
              ? 'bg-amber-600 text-white shadow-md font-black'
              : 'text-amber-900 hover:bg-amber-50 bg-amber-50/70 border border-amber-200'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-600" />
          <span>إقرارات الإجراء الطبي (Consent) 📝</span>
          {appointments.some(a => a.consent?.status === 'pending_signature') && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          )}
        </button>

        <button
          id="tab-installments-billing"
          onClick={() => setActiveTab('installments_billing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'installments_billing'
              ? 'bg-emerald-600 text-white shadow-md font-black'
              : 'text-emerald-800 hover:bg-emerald-50 bg-emerald-50/70 border border-emerald-200'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>أقساط التقويم والخزينة 💰</span>
          {appointments.some(a => (a.remainingAmount && a.remainingAmount > 0) || a.paymentStatus === 'partial') && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('offers_and_notifs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'offers_and_notifs'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-slate-700 hover:bg-amber-50 bg-amber-50/50'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>إدارة العروض والإشعارات ({offers.length}) 🔥</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>المخطط الزمني اليوم</span>
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'patients'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>سجل المرضى ({patients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'doctors'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>أطباء المركز ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'services'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>الخدمات والأسعار ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users_roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'users_roles'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-800 hover:bg-emerald-50 bg-emerald-50/60 border border-emerald-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>إدارة المستخدمين والصلاحيات ({registeredUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('media_settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'media_settings'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-emerald-900 hover:bg-emerald-100 bg-emerald-50/80 border border-emerald-300'
          }`}
        >
          <Share2 className="w-4 h-4 text-emerald-600" />
          <span>السوشيال ميديا والتواصل 💬</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-amber-800 hover:bg-amber-50 bg-amber-50/70 border border-amber-200'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>إدارة تقييمات المرضى ({doctorReviews.length}) ⭐</span>
        </button>
      </div>

      {/* TAB 1: ALL BOOKINGS MANAGEMENT */}
      {activeTab === 'all_bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المريض، رقم الهاتف، أو رقم الحجز..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 pl-8 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-bold focus:outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="confirmed">مؤكد</option>
                <option value="arrived">وصل للمركز</option>
                <option value="in_progress">في غرفة الكشف</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>

              {/* Doctor filter */}
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-bold focus:outline-none"
              >
                <option value="all">جميع الأطباء ({doctors.length})</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                ))}
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-700 focus:outline-none"
              />

              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                >
                  إلغاء التاريخ
                </button>
              )}

              {appointments.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('هل أنت متأكد من مسح جميع الحجوزات لتجربة الحجز من الصفر؟')) {
                      clearAllAppointments();
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                  title="مسح الحجوزات للتجربة"
                >
                  مسح الحجوزات
                </button>
              )}
            </div>

          </div>

          {/* Bookings Table or Empty State */}
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-800">
                لا توجد حجوزات مسجلة حالياً
              </h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                تم تنظيف جدول الحجوزات. يمكنك حجز موعد جديد للمريض الآن من زر &quot;حجز موعد سريع&quot; بالأعلى، أو تجربة الحجز مباشرة عبر واجهة تطبيق العميل.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setIsNewBookingModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>حجز موعد جديد للاستقبال</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-700 font-extrabold border-b border-slate-200">
                    <th className="py-3 px-4">رقم الحجز</th>
                    <th className="py-3 px-4">المريض</th>
                    <th className="py-3 px-4">الخدمة / العرض</th>
                    <th className="py-3 px-4">الطبيب</th>
                    <th className="py-3 px-4">التاريخ والوقت</th>
                    <th className="py-3 px-4">المبلغ والدفع</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات السكرتيرة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-1 rounded-md">{apt.appointmentCode}</span>
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                          <span className="text-slate-500 font-mono" dir="ltr">{apt.patientPhone}</span>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{apt.serviceName}</span>
                          {apt.isOffer && (
                            <span className="text-[10px] text-amber-600 font-bold">عرض مخفض</span>
                          )}
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {apt.doctorName}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{apt.date}</span>
                          <span className="text-amber-700 font-semibold">{apt.timeSlot}</span>
                        </div>
                      </td>

                      {/* Price, Paid, Remaining & Installment Tracking */}
                      <td className="py-3 px-4">
                        {(() => {
                          const total = apt.totalAmount !== undefined ? Number(apt.totalAmount) : Number(apt.price || 0);
                          const paid = apt.paidAmount !== undefined ? Number(apt.paidAmount) : (apt.paymentStatus === 'paid' ? total : 0);
                          const remaining = apt.remainingAmount !== undefined ? Number(apt.remainingAmount) : Math.max(0, total - paid);
                          const isFullyPaid = remaining <= 0;
                          const isOrtho = apt.serviceName?.includes('تقويم') || apt.isInstallment;

                          return (
                            <div className="flex flex-col gap-1 min-w-[130px]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-bold">الإجمالي:</span>
                                <span className="font-mono font-black text-slate-900">{total.toLocaleString()} ج.م</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-emerald-700 font-bold">المدفوع:</span>
                                <span className="font-mono font-bold text-emerald-700">{paid.toLocaleString()} ج.م</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-slate-100">
                                <span className="text-rose-700 font-bold">المتبقي:</span>
                                <span className={`font-mono font-black ${isFullyPaid ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {remaining.toLocaleString()} ج.م
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isFullyPaid
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : (paid > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                                }`}>
                                  {isFullyPaid ? 'خالص بالكامل ✓' : (paid > 0 ? 'مسدد جزئياً' : 'غير مسدد')}
                                </span>
                                {isOrtho && (
                                  <span className="text-[9px] font-black bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-md">
                                    أقساط تقويم
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status with dropdown selector */}
                      <td className="py-3 px-4">
                        <select
                          value={apt.status}
                          onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="pending">قيد المراجعة</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="arrived">وصل للمركز</option>
                          <option value="in_progress">في غرفة الكشف</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>

                      {/* Secretary Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">

                          {/* Installment & Payment Action Button */}
                          <button
                            id={`btn-manage-installment-${apt.id}`}
                            onClick={() => setSelectedPaymentApt(apt)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition cursor-pointer flex items-center gap-1 border border-emerald-200 shadow-2xs"
                            title="إدارة الدفعات وتحصيل قسط التقويم"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span className="text-[10px] font-black hidden lg:inline">الدفعات</span>
                          </button>
                          
                          {/* WhatsApp Reminder Button */}
                          <button
                            onClick={() => sendWhatsAppReminder(apt)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            title="إرسال تذكير واتساب للمريض"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* 1-on-1 Patient Follow-up Message Button */}
                          <button
                            onClick={() => {
                              setFollowupModalPatient({
                                name: apt.patientName,
                                phone: apt.patientPhone
                              });
                              setIsFollowupModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer flex items-center gap-1 border border-amber-200"
                            title="إرسال رسالة متابعة خاصة للمريض (داخل التطبيق أو واتساب)"
                          >
                            <HeartPulse className="w-4 h-4" />
                            <span className="text-[10px] font-bold hidden xl:inline">متابعة</span>
                          </button>

                          {/* Medical Consent Form Button */}
                          <button
                            onClick={() => setSelectedConsentApt(apt)}
                            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 border ${
                              apt.consent && (apt.consent.status === 'signed' || apt.consent.status === 'approved' || apt.consent.status === 'signed_by_patient' || Boolean(apt.consent.patientSignature))
                                ? (apt.consent.status === 'approved' || apt.consent.status === 'signed')
                                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-300'
                                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-300 ring-2 ring-blue-200 animate-pulse'
                                : apt.consent
                                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-300'
                                : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-900 border-slate-200'
                            }`}
                            title="إقرار وموافقة على الإجراء الطبي (Consent) - طباعة ورقة وتوقيع المريض"
                          >
                            <FileText className={`w-4 h-4 ${
                              apt.consent && (apt.consent.status === 'approved' || apt.consent.status === 'signed')
                                ? 'text-emerald-600'
                                : apt.consent?.status === 'signed_by_patient'
                                ? 'text-blue-600'
                                : 'text-amber-600'
                            }`} />
                            <span className="text-[10px] font-bold hidden sm:inline-block">
                              {apt.consent?.status === 'signed_by_patient' || (apt.consent && !['approved', 'signed'].includes(apt.consent.status) && (Boolean(apt.consent.patientSignature) || Boolean(apt.consent.signedAt)))
                                ? '✍️ إقرار موقع (مطلوب اعتمادك)'
                                : (apt.consent?.status === 'signed' || apt.consent?.status === 'approved')
                                ? 'إقرار موقع ومعتمد ✓'
                                : apt.consent
                                ? 'إقرار طبي 📝'
                                : 'إقرار طبي 📝'}
                            </span>
                          </button>

                          {/* Patient Treatment Invoice & Auto Clinic Print Button */}
                          <button
                            onClick={() => setSelectedInvoiceApt(apt)}
                            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 border ${
                              apt.invoice
                                ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 border-teal-300'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title="فاتورة الكشف والعلاج - إرسال للمريض والطباعة التلقائية لطابعة العيادة"
                          >
                            <Receipt className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] font-bold hidden xl:inline">
                              {apt.invoice ? 'فاتورة معتمدة 🧾' : 'إصدار فاتورة 🧾'}
                            </span>
                          </button>

                          {/* Print Invoice/Receipt */}
                          <button
                            onClick={() => setSelectedReceiptApt(apt)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                            title="طباعة سند الاستقبال وتذكرة الموعد"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Cancel */}
                          {apt.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'إلغاء الموعد',
                                  message: `هل تريد بالتأكيد إلغاء موعد المريض "${apt.patientName}"؟`,
                                  confirmText: 'نعم، إلغاء الموعد',
                                  cancelText: 'تراجع',
                                  isDestructive: true,
                                  onConfirm: () => {
                                    cancelAppointment(apt.id);
                                    showToast(`تم إلغاء موعد المريض ${apt.patientName}`);
                                    setConfirmModal(null);
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                              title="إلغاء الموعد"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Permanently */}
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'حذف الموعد نهائياً',
                                message: `هل تريد حذف موعد المريض "${apt.patientName}" نهائياً من قاعدة البيانات والسجلات؟ لا يمكن التراجع عن هذا الإجراء.`,
                                confirmText: 'نعم، حذف نهائي',
                                cancelText: 'إلغاء',
                                isDestructive: true,
                                onConfirm: () => {
                                  deleteAppointment(apt.id);
                                  showToast(`تم حذف الموعد نهائياً من قاعدة البيانات`);
                                  setConfirmModal(null);
                                }
                              });
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                            title="حذف الموعد نهائياً من الداتا بيز"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* TAB: MEDICAL CONSENT MANAGEMENT VIEW */}
      {activeTab === 'consents' && (
        <div className="flex flex-col gap-6">
          
          {/* Header Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-white to-teal-500/10 rounded-3xl border border-amber-200/80 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg font-['Cairo']">
                    إقرارات الموافقة الطبية المستنيرة (Medical Consents)
                  </h3>
                  <p className="text-xs text-slate-600">
                    طباعة ورقة الإقرار الطبي الرسمية لتوقيع المريض عليها في الاستقبال، وتوثيق التوقيع الورقي لربطه بالحجز
                  </p>
                </div>
              </div>

              {/* Header Actions & Stats */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                <button
                  type="button"
                  onClick={() => setIsNewConsentModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ إنشاء إقرار طبي جديد لمريض</span>
                </button>

                {/* Stats Counters */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
                    <span className="block text-[10px] text-slate-500">تم التوقيع والاعتماد ✓</span>
                    <span className="text-sm font-black text-emerald-700">
                      {appointments.filter(a => a.consent && (a.consent.status === 'signed' || a.consent.status === 'approved' || a.consent.status === 'signed_by_patient' || Boolean(a.consent.patientSignature))).length}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
                    <span className="block text-[10px] text-slate-500">بانتظار التوقيع</span>
                    <span className="text-sm font-black text-amber-700">
                      {appointments.filter(a => a.consent && !a.consent.patientSignature && a.consent.status !== 'signed' && a.consent.status !== 'approved' && a.consent.status !== 'signed_by_patient').length}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
                    <span className="block text-[10px] text-slate-500">إجمالي الحالات</span>
                    <span className="text-sm font-black text-slate-800">{appointments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={consentSearchQuery}
                onChange={(e) => setConsentSearchQuery(e.target.value)}
                placeholder="بحث باسم المريض، الهاتف، كود الحجز..."
                className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
              />
              {consentSearchQuery && (
                <button
                  onClick={() => setConsentSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setConsentStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  consentStatusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({appointments.length})
              </button>
              <button
                type="button"
                onClick={() => setConsentStatusFilter('signed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  consentStatusFilter === 'signed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                تم التوقيع والاعتماد ✓ ({appointments.filter(a => a.consent && (a.consent.status === 'signed' || a.consent.status === 'approved' || a.consent.status === 'signed_by_patient' || Boolean(a.consent.patientSignature))).length})
              </button>
              <button
                type="button"
                onClick={() => setConsentStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  consentStatusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                بانتظار التوقيع ✍️ ({appointments.filter(a => a.consent && !a.consent.patientSignature && a.consent.status !== 'signed' && a.consent.status !== 'approved' && a.consent.status !== 'signed_by_patient').length})
              </button>
              <button
                type="button"
                onClick={() => setConsentStatusFilter('no_consent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  consentStatusFilter === 'no_consent'
                    ? 'bg-slate-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                بدون إقرار 📄 ({appointments.filter(a => !a.consent).length})
              </button>
            </div>
          </div>

          {/* Consents Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>قائمة الحالات والإقرارات الطبية ({appointments.filter(apt => {
                  const q = consentSearchQuery.toLowerCase().trim();
                  const matches = !q ||
                    (apt.patientName || '').toLowerCase().includes(q) ||
                    (apt.patientPhone || '').includes(q) ||
                    (apt.appointmentCode || '').toLowerCase().includes(q) ||
                    (apt.consent?.procedureName || '').toLowerCase().includes(q);
                  if (!matches) return false;
                  const isSigned = Boolean(apt.consent && (apt.consent.status === 'signed' || apt.consent.status === 'approved' || apt.consent.status === 'signed_by_patient' || Boolean(apt.consent.patientSignature)));
                  if (consentStatusFilter === 'signed') return isSigned;
                  if (consentStatusFilter === 'pending') return Boolean(apt.consent && !isSigned);
                  if (consentStatusFilter === 'no_consent') return !apt.consent;
                  return true;
                }).length} حالة):</span>
              </div>
              <div className="text-xs text-slate-500">
                يمكنك تجهيز وطباعة ورقة الإقرار لأي مريض، أو تأكيد توقيع الورقة بنقرة واحدة.
              </div>
            </div>

            {appointments.filter(apt => {
              const q = consentSearchQuery.toLowerCase().trim();
              const matches = !q ||
                (apt.patientName || '').toLowerCase().includes(q) ||
                (apt.patientPhone || '').includes(q) ||
                (apt.appointmentCode || '').toLowerCase().includes(q) ||
                (apt.consent?.procedureName || '').toLowerCase().includes(q);
              if (!matches) return false;
              const isSigned = Boolean(apt.consent && (apt.consent.status === 'signed' || apt.consent.status === 'approved' || apt.consent.status === 'signed_by_patient' || Boolean(apt.consent.patientSignature)));
              if (consentStatusFilter === 'signed') return isSigned;
              if (consentStatusFilter === 'pending') return Boolean(apt.consent && !isSigned);
              if (consentStatusFilter === 'no_consent') return !apt.consent;
              return true;
            }).length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  لا توجد إقرارات تطابق البحث أو الفلتر المحدد
                </h4>
                <p className="text-xs text-slate-500 max-w-md">
                  يمكنك تغيير كلمات البحث أو إنشاء إقرار طبي جديد فوراً لأي مريض يزور الاستقبال.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewConsentModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء إقرار طبي جديد لمريض</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">كود الحجز</th>
                      <th className="py-3.5 px-4">اسم المريض</th>
                      <th className="py-3.5 px-4">الإجراء الطبي</th>
                      <th className="py-3.5 px-4">الطبيب المعالج</th>
                      <th className="py-3.5 px-4">تاريخ الموعد</th>
                      <th className="py-3.5 px-4">حالة التوقيع</th>
                      <th className="py-3.5 px-4 text-center">إجراءات الإقرار والطباعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.filter(apt => {
                      const q = consentSearchQuery.toLowerCase().trim();
                      const matches = !q ||
                        (apt.patientName || '').toLowerCase().includes(q) ||
                        (apt.patientPhone || '').includes(q) ||
                        (apt.appointmentCode || '').toLowerCase().includes(q) ||
                        (apt.consent?.procedureName || '').toLowerCase().includes(q);
                      if (!matches) return false;
                      if (consentStatusFilter === 'signed') return apt.consent?.status === 'signed';
                      if (consentStatusFilter === 'pending') return apt.consent?.status === 'pending_signature';
                      if (consentStatusFilter === 'no_consent') return !apt.consent;
                      return true;
                    }).map((apt) => {
                      const consent = apt.consent;
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-amber-700">
                            {apt.appointmentCode}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{apt.patientName}</div>
                            <div className="text-[11px] text-slate-500" dir="ltr">{apt.patientPhone}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {consent?.procedureName || apt.serviceName || 'إجراء طبي علاجي'}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {consent?.doctorName || apt.doctorName}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-600">
                            {apt.date}
                          </td>
                          <td className="py-3 px-4">
                            {consent ? (() => {
                              const isApproved = consent.status === 'approved' || consent.status === 'signed';
                              const isSignedByPatient = consent.status === 'signed_by_patient' || (Boolean(consent.patientSignature) && !isApproved);
                              return (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : isSignedByPatient
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {isApproved
                                    ? 'معتمد وموثق رسمياً ✓'
                                    : isSignedByPatient
                                    ? '✍️ إقرار موقع (بانتظار اعتمادك)'
                                    : 'بانتظار توقيع المريض ✍️'}
                                </span>
                              );
                            })() : (
                              <span className="text-slate-400 text-xs italic">
                                لم يتم إعداد إقرار بعد
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Open Print & Edit Modal */}
                              <button
                                type="button"
                                onClick={() => setSelectedConsentApt(apt)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                                  consent?.status === 'approved' || consent?.status === 'signed'
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : consent?.status === 'signed_by_patient' || Boolean(consent?.patientSignature)
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : consent
                                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-600'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>
                                  {consent?.status === 'approved' || consent?.status === 'signed'
                                    ? 'عرض وطباعة الإقرار 🖨️'
                                    : consent?.status === 'signed_by_patient' || Boolean(consent?.patientSignature)
                                    ? 'مراجعة واعتماد التوقيع ✍️'
                                    : consent
                                    ? 'طباعة ورقة التوقيع ✍️'
                                    : 'تجهيز وطباعة إقرار 📋'}
                                </span>
                              </button>

                              {/* Quick 1-Click Signature / Approval Confirmation */}
                              {consent && (consent.status === 'pending_signature' || consent.status === 'signed_by_patient') && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const updatedConsent: MedicalConsent = {
                                      ...consent,
                                      status: 'approved',
                                      signedAt: consent.signedAt || new Date().toISOString()
                                    };
                                    await saveMedicalConsent(apt.id, updatedConsent);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                                  title="اعتماد الإقرار وتوثيقه فوراً"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>اعتماد الإقرار ✓</span>
                                </button>
                              )}

                              {/* Shortcut: Issue & Auto-Print Invoice */}
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceApt(apt)}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition cursor-pointer"
                                title="فاتورة الكشف والعلاج وطباعة العيادة"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>

                              {/* Delete Consent */}
                              {consent && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`هل تريد بالتأكيد حذف الإقرار الطبي للمريض ${apt.patientName}؟`)) {
                                      await deleteMedicalConsent(apt.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                  title="حذف الإقرار"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* QUICK NEW MEDICAL CONSENT MODAL */}
      {isNewConsentModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          dir="rtl"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-teal-500/10">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>إصدار إقرار طبي جديد لمريض (استقبال فوري / كشف)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewConsentModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newConsentPatientName.trim() || !newConsentPatientPhone.trim()) {
                  showToast('يرجى إدخال اسم المريض ورقم الهاتف');
                  return;
                }
                setIsCreatingConsent(true);
                try {
                  const newApt = await createWalkinConsentAppointment(
                    newConsentPatientName,
                    newConsentPatientPhone,
                    newConsentProcedure,
                    newConsentDoctor,
                    newConsentNationalId
                  );
                  setIsNewConsentModalOpen(false);
                  setNewConsentPatientName('');
                  setNewConsentPatientPhone('');
                  setNewConsentNationalId('');
                  setSelectedConsentApt(newApt);
                } catch (err) {
                  console.error('Create walkin consent error:', err);
                } finally {
                  setIsCreatingConsent(false);
                }
              }}
              className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-700"
            >
              <div>
                <label className="block mb-1 font-bold text-slate-900">اسم المريض ثلاثي *</label>
                <input
                  type="text"
                  required
                  value={newConsentPatientName}
                  onChange={(e) => setNewConsentPatientName(e.target.value)}
                  placeholder="مثال: أحمد محمود إبراهيم"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-900">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={newConsentPatientPhone}
                    onChange={(e) => setNewConsentPatientPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-700">الرقم القومي (اختياري)</label>
                  <input
                    type="text"
                    value={newConsentNationalId}
                    onChange={(e) => setNewConsentNationalId(e.target.value)}
                    placeholder="14 رقماً"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-900">الإجراء الطبي أو الجراحي *</label>
                <div className="flex flex-col gap-2">
                  <select
                    value={newConsentProcedure}
                    onChange={(e) => setNewConsentProcedure(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="زراعة الأسنان وتثبيت الغرسة">زراعة الأسنان وتثبيت الغرسة</option>
                    <option value="تركيب تقويم الأسنان الثابت">تركيب تقويم الأسنان الثابت</option>
                    <option value="خلع ضرس العقل جراحياً">خلع ضرس العقل جراحياً</option>
                    <option value="علاج جذور وحشو عصب دقيق">علاج جذور وحشو عصب دقيق</option>
                    <option value="تركيب فينير وابتسامة هوليوود">تركيب فينير وابتسامة هوليوود</option>
                    <option value="تركيبات وزركونيا ثابتة">تركيبات وزركونيا ثابتة</option>
                    <option value="تبييض الأسنان بالليزر وجلسة فلورايد">تبييض الأسنان بالليزر وجلسة فلورايد</option>
                    <option value="جراحة تجميل اللثة بالليزر">جراحة تجميل اللثة بالليزر</option>
                    <option value="إجراء جراحي طبي عام بالعيادة">إجراء جراحي طبي عام بالعيادة</option>
                  </select>
                  <input
                    type="text"
                    value={newConsentProcedure}
                    onChange={(e) => setNewConsentProcedure(e.target.value)}
                    placeholder="أو اكتب اسم الإجراء الطبي يدوياً..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-900">الطبيب المعالج *</label>
                <select
                  value={newConsentDoctor}
                  onChange={(e) => setNewConsentDoctor(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>{doc.name} - {doc.specialty}</option>
                  ))}
                  <option value="د. محمد فوزي">د. محمد فوزي - استشاري زراعة وتجميل الأسنان</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewConsentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreatingConsent}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isCreatingConsent ? 'جاري التجهيز...' : 'تجهيز الإقرار والطباعة الآن 📋'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: INSTALLMENTS & BILLING VIEW */}
      {activeTab === 'installments_billing' && (
        <InstallmentsBillingView
          onManageInstallment={(apt) => setSelectedPaymentApt(apt)}
          onPrintStatement={(apt) => setSelectedPrintStatementApt(apt)}
        />
      )}

      {/* TAB 2: OFFERS & BROADCAST NOTIFICATIONS (New requested feature!) */}
      {activeTab === 'offers_and_notifs' && (
        <div className="flex flex-col gap-6">
          
          {/* Top Callout: Secretary Offer & Push Notification Tool */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Action 1: Add Offer with Instant Push Notification */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      إضافة عرض ترويجي جديد وإرسال إشعار فوري للعملاء
                    </h3>
                    <p className="text-xs text-slate-500">
                      يتم نشر العرض في قسم عروض التطبيق وإرسال إشعار فوري (Push Notification) لجميع المرضى المسجلين
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateOfferSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان العرض الترويجي *
                  </label>
                  <input
                    type="text"
                    required
                    value={offerTitle}
                    onChange={e => setOfferTitle(e.target.value)}
                    placeholder="مثال: عرض الصيف لتبييض الأسنان بالليزر زووم + تنظيف مجاني"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                {/* Subtitle */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الوصف المختصر للعرض
                  </label>
                  <input
                    type="text"
                    value={offerSubtitle}
                    onChange={e => setOfferSubtitle(e.target.value)}
                    placeholder="مثال: تبييض ليزري بأحدث جهاز أمريكي مع كشف وفلورايد مجاناً"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    قسم العرض
                  </label>
                  <select
                    value={offerCategory}
                    onChange={e => setOfferCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="تنظيف وتبييض">تنظيف وتبييض</option>
                    <option value="عروض التقويم">عروض التقويم</option>
                    <option value="التركيبات والزراعة">التركيبات والزراعة</option>
                    <option value="علاج العصب والحشوات">علاج العصب والحشوات</option>
                  </select>
                </div>

                {/* Badge text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شارة الخصم (Badge)
                  </label>
                  <input
                    type="text"
                    value={offerBadge}
                    onChange={e => setOfferBadge(e.target.value)}
                    placeholder="مثال: خصم 40% لفترة محدودة"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر الأصلي (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={offerOriginalPrice}
                    onChange={e => setOfferOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {/* Discounted Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر بعد الخصم (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={offerDiscountedPrice}
                    onChange={e => setOfferDiscountedPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold text-amber-700"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ انتهاء العرض
                  </label>
                  <input
                    type="date"
                    value={offerExpiresAt}
                    onChange={e => setOfferExpiresAt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Color Theme */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الثيم اللوني للبطاقة
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {(['blue', 'teal', 'gold', 'purple'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setOfferImageTheme(t)}
                        className={`py-1 text-[11px] font-bold rounded-lg transition border ${
                          offerImageTheme === t
                            ? 'border-amber-500 bg-slate-900 text-amber-400 shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {t === 'blue' && 'أزرق ملكي'}
                        {t === 'teal' && 'زمردي'}
                        {t === 'gold' && 'ذهبي'}
                        {t === 'purple' && 'بنفسجي'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features (comma-separated) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مميزات العرض (افصل بينها بفاصلة ,)
                  </label>
                  <textarea
                    rows={2}
                    value={offerFeaturesText}
                    onChange={e => setOfferFeaturesText(e.target.value)}
                    placeholder="ميزة 1, ميزة 2, ميزة 3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Push Notification Toggle */}
                <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        إرسال إشعار فوري لجميع المرضى على التطبيق (Push Notification)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        سيظهر الإشعار فوراً في جرس التنبيهات بخصم {Math.round(((offerOriginalPrice - offerDiscountedPrice) / offerOriginalPrice) * 100)}%
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={offerNotifyClients}
                    onChange={e => setOfferNotifyClients(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded-md cursor-pointer"
                  />
                </div>

                {/* Submit button */}
                <div className="sm:col-span-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>نشر العرض الترويجي وإرسال الإشعار للمرضى الآن</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Action 2: Quick Broadcast Custom Alert to Clients */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-black text-base">بث تنبيه عام للمرضى</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  أرسل تنبيهاً فورياً أو إشعاراً مخصصاً (مثل مواعيد العمل، الإجازات، تهنئة العيد، أو تنبيهات هامة) ليصل فوراً لجميع مستخدمي التطبيق.
                </p>

                <form onSubmit={handleBroadcastSubmit} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      عنوان الإشعار
                    </label>
                    <input
                      type="text"
                      required
                      value={broadcastTitle}
                      onChange={e => setBroadcastTitle(e.target.value)}
                      placeholder="مثال: تنبيه بخصوص مواعيد العمل في العيد"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      نص الرسالة للمرضى
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={broadcastMessage}
                      onChange={e => setBroadcastMessage(e.target.value)}
                      placeholder="مثال: يسعد مركز الماسة استقبالكم من الساعة 10 صباحاً وحتى 10 مساءً طوال أيام الأسبوع..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      نوع الإشعار
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBroadcastType('offer')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition ${
                          broadcastType === 'offer' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        عرض ترويجي
                      </button>
                      <button
                        type="button"
                        onClick={() => setBroadcastType('system')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition ${
                          broadcastType === 'system' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        تنبيه عام
                      </button>
                      <button
                        type="button"
                        onClick={() => setBroadcastType('appointment')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition ${
                          broadcastType === 'appointment' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        مواعيد
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال التنبيه الفوري للمرضى</span>
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>يصل الإشعار في الوقت الفعلي إلى شريط الإشعارات بالتطبيق</span>
              </div>
            </div>

          </div>

          {/* Action 3: 1-on-1 Private Patient Follow-up Management Card */}
          <div className="bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-white rounded-3xl border border-amber-200/80 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">
                      نظام المتابعة الخاصة بالمرضى (1-on-1 Follow-up)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                      ميزة السكرتارية الحصرية
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    إرسال تعليمات طبية مخصصة، متابعة بعد الجراحة أو الحشو أو التبييض، وتذكير الأقساط لمريض محدد على حسابه أو مباشرة بالواتساب.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFollowupModalPatient(null);
                  setIsFollowupModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/15 transition shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>إرسال رسالة متابعة جديدة لمريض 💬</span>
              </button>
            </div>

            {/* List of Recent Private Messages Sent */}
            {(() => {
              const privateNotifs = notifications.filter(n => n.type === 'private_message' || !!n.patientPhone);
              if (privateNotifs.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-slate-500 bg-white/70 rounded-2xl border border-dashed border-amber-200">
                    لم يتم إرسال أي رسائل متابعة خاصة حتى الآن. اضغط على زر "إرسال رسالة متابعة جديدة" لبدء التواصل الخاص مع أي مريض.
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                    <span>آخر رسائل المتابعة الخاصة المرسلة للمرضى ({privateNotifs.length} رسائل):</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {privateNotifs.slice(0, 6).map((msg) => (
                      <div key={msg.id} className="bg-white rounded-2xl border border-amber-100 p-3.5 shadow-2xs flex flex-col justify-between gap-2">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-amber-500" />
                              <span>{msg.patientName || 'المريض'}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono" dir="ltr">
                              {msg.patientPhone}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-xs leading-snug mb-1">{msg.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{msg.message}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : msg.time}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFollowupModalPatient({
                                name: msg.patientName || '',
                                phone: msg.patientPhone || ''
                              });
                              setIsFollowupModalOpen(true);
                            }}
                            className="text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>متابعة جديدة</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Active Offers Management List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  قائمة العروض الترويجية النشطة على التطبيق
                </h3>
                <p className="text-xs text-slate-500">
                  يمكن للمرضى تصفح هذه العروض وحجز الموعد مباشرة مع الخصم المحدد
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {offers.length} عروض مفعلة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {offers.map((off) => (
                <div
                  key={off.id}
                  className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col justify-between gap-4 border border-slate-800 shadow-md relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full inline-block w-fit">
                        {off.badge}
                      </span>
                      <h4 className="font-black text-base text-white mt-1">{off.title}</h4>
                      <span className="text-xs text-slate-300">{off.subtitle}</span>
                      
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xs line-through text-slate-400">{off.originalPrice} ج.م</span>
                        <span className="text-lg font-black text-amber-300">{off.discountedPrice} ج.م فقط</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'حذف العرض الترويجي',
                          message: `هل تريد بالتأكيد حذف العرض "${off.title}" من قائمة العروض والتطبيق؟`,
                          confirmText: 'نعم، حذف العرض',
                          cancelText: 'إلغاء',
                          isDestructive: true,
                          onConfirm: () => {
                            deleteOffer(off.id);
                            showToast(`تم حذف العرض "${off.title}" بنجاح`);
                            setConfirmModal(null);
                          }
                        });
                      }}
                      className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                      title="حذف العرض"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                    {off.features.map((f, i) => (
                      <span key={i} className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3 text-amber-400" />
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>ينتهي في: <strong className="text-white font-mono">{off.expiresAt}</strong></span>
                    <span className="text-amber-400 font-bold">القسم: {off.category}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: TIMELINE & ROOMS */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base">المخطط الزمني للعيادات اليوم</h3>
              <p className="text-xs text-slate-500">متابعة إشغال غرف الكشف وأوقات انتظار المرضى</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
              {todayStr}
            </span>
          </div>

          {/* Doctors Schedule Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {doctors.map((doc) => {
              const docApts = appointments.filter(a => a.doctorId === doc.id && a.date === todayStr);

              return (
                <div key={doc.id} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                      {doc.name.charAt(3)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-900">{doc.name}</span>
                      <span className="text-[10px] text-slate-500">{doc.shift}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-h-[140px]">
                    {docApts.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center p-3 text-slate-400 text-xs">
                        لا توجد مواعيد اليوم لهذا الطبيب
                      </div>
                    ) : (
                      docApts.map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-2 rounded-xl text-xs flex flex-col gap-1 border shadow-2xs ${
                            apt.status === 'in_progress'
                              ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                              : apt.status === 'arrived'
                              ? 'bg-blue-50 border-blue-200 text-blue-900'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{apt.timeSlot}</span>
                            {getStatusBadge(apt.status)}
                          </div>
                          <span className="font-semibold text-slate-900">{apt.patientName}</span>
                          <span className="text-[10px] text-slate-500">{apt.serviceName}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PATIENTS DIRECTORY */}
      {activeTab === 'patients' && (() => {
        const filteredPatients = patients.filter((pat) => {
          // Tab filter
          if (patientFilterTab === 'returning' && (pat.totalVisits || 0) <= 1) return false;
          if (patientFilterTab === 'new' && (pat.totalVisits || 0) > 1) return false;
          if (patientFilterTab === 'consents') {
            const hasConsent = appointments.some(
              (a) => (a.patientPhone === pat.phone || a.patientName === pat.name) && a.medicalConsent
            );
            if (!hasConsent) return false;
          }

          // Search query
          if (!patientSearchQuery.trim()) return true;
          const q = patientSearchQuery.trim().toLowerCase();
          const nameMatch = (pat.name || '').toLowerCase().includes(q);
          const phoneMatch = (pat.phone || '').includes(q);
          const nationalIdMatch = (pat.nationalId || '').includes(q);
          const notesMatch = (pat.notes || '').toLowerCase().includes(q);
          return nameMatch || phoneMatch || nationalIdMatch || notesMatch;
        });

        const consentCount = patients.filter((p) =>
          appointments.some((a) => (a.patientPhone === p.phone || a.patientName === p.name) && a.medicalConsent)
        ).length;

        return (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
            {/* Header & Main Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-lg">سجل المرضى والملفات الطبية</h3>
                  <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                    {patients.length} ملف نشط
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  قاعدة بيانات مركز الماسة الطبية الموحدة المتزامنة سحابياً مع التطبيق
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setFollowupModalPatient(null);
                    setIsFollowupModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>إرسال رسالة متابعة خاصة 💬</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة ملف مريض جديد</span>
                </button>
              </div>
            </div>

            {/* Search Bar & Filter Chips */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  placeholder="بحث باسم المريض، رقم الهاتف، الرقم القومي أو الملاحظات..."
                  className="w-full pr-10 pl-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden transition"
                />
                {patientSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPatientSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPatientFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    patientFilterTab === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  الكل ({patients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPatientFilterTab('returning')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    patientFilterTab === 'returning'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  زيارات متكررة ({patients.filter((p) => (p.totalVisits || 0) > 1).length})
                </button>
                <button
                  type="button"
                  onClick={() => setPatientFilterTab('new')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    patientFilterTab === 'new'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  مرضى جدد ({patients.filter((p) => (p.totalVisits || 0) <= 1).length})
                </button>
                <button
                  type="button"
                  onClick={() => setPatientFilterTab('consents')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    patientFilterTab === 'consents'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  موافقات طبية موقعة ({consentCount})
                </button>
              </div>
            </div>

            {/* Patients List Grid */}
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">لا توجد ملفات مرضى مطابقة للبحث</h4>
                <p className="text-xs text-slate-400 max-w-sm text-center">
                  يمكنك البحث باسم آخر أو إضافة ملف مريض جديد يدوياً في أي وقت.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(true)}
                  className="mt-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  + إضافة ملف مريض الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredPatients.map((pat) => {
                  const patientAppts = appointments.filter(
                    (a) => a.patientPhone === pat.phone || a.patientName === pat.name
                  );
                  const hasConsent = patientAppts.some((a) => !!a.medicalConsent);

                  return (
                    <div
                      key={pat.id}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-300 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition group"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 font-black text-sm flex items-center justify-center shrink-0">
                              {(pat.name || 'م')[0]}
                            </div>
                            <div>
                              <span className="font-black text-slate-900 text-sm block leading-tight">
                                {pat.name}
                              </span>
                              <span className="text-xs font-mono text-slate-500 block mt-0.5" dir="ltr">
                                {pat.phone}
                              </span>
                            </div>
                          </div>

                          {/* Blood Type / Consent Badges */}
                          <div className="flex flex-col items-end gap-1">
                            {pat.bloodType && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200" dir="ltr">
                                {pat.bloodType}
                              </span>
                            )}
                            {hasConsent && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3" />
                                <span>إقرار موقع</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Visit Metrics */}
                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between mb-2">
                          <div>
                            <span className="text-slate-400 text-[10px] block">عدد الكشوفات</span>
                            <span className="font-black text-slate-900 text-xs">
                              {pat.totalVisits || patientAppts.length || 1} زيارة
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-slate-400 text-[10px] block">آخر زيارة</span>
                            <span className="font-bold text-slate-700 text-xs">
                              {pat.lastVisitDate || (patientAppts[0]?.date) || 'حديثاً'}
                            </span>
                          </div>
                        </div>

                        {/* Notes Preview */}
                        <p className="text-[11px] text-slate-500 bg-white/70 p-2 rounded-lg border border-slate-100 line-clamp-2">
                          {pat.notes ? pat.notes : 'سجل منتظم - لا توجد تحذيرات طبية مسجلة'}
                        </p>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2.5 border-t border-slate-200/70 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPatientDetail(pat)}
                          className="flex-1 py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>الملف الشامل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFollowupModalPatient({
                              name: pat.name,
                              phone: pat.phone,
                              notes: pat.notes
                            });
                            setIsFollowupModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-800 text-xs font-bold transition border border-amber-500/30 cursor-pointer"
                          title="إرسال رسالة متابعة خاصة"
                        >
                          <HeartPulse className="w-4 h-4 text-amber-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsNewBookingModalOpen(true);
                            setModalPatientName(pat.name);
                            setModalPatientPhone(pat.phone);
                          }}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          حجز
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 5: DOCTORS DIRECTORY */}
      {activeTab === 'doctors' && (
        <div className="flex flex-col gap-6">
          {/* Top Bar for Doctors */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-lg">
                    أطباء مركز الماسة ({doctors.length} أطباء)
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    متاحين للحجز الفوري
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  فريق المركز الطبي متكامل ومتاح للحجز المباشر عبر التطبيق ولوحة السكرتيرة
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAddDoctor}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة طبيب / دكتورة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3 relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/doctors/dr_asmaa.jpg';
                      }}
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-base">{doc.name}</span>
                        {(doc.id === 'doc-7' || doc.name.includes('أسماء') || doc.name.includes('اسماء')) && (
                          <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                            جديد
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-amber-700 font-semibold">{doc.title}</span>
                      <span className="text-[11px] text-slate-500">{doc.specialty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditDoctor(doc)}
                      title="تعديل بيانات الطبيب"
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {doctors.length > 1 && (
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'حذف طبيب من المركز',
                            message: `هل أنتِ متأكدة من حذف (${doc.name}) من قائمة أطباء المركز؟ لن يتمكن المرضى من حجزه.`,
                            confirmText: 'نعم، احذف الطبيب',
                            cancelText: 'إلغاء',
                            isDestructive: true,
                            onConfirm: () => {
                              deleteDoctor(doc.id);
                              setConfirmModal(null);
                            }
                          });
                        }}
                        title="حذف الطبيب"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الخبرة:</span>
                    <span className="font-bold text-slate-800">{doc.experienceYears} عاماً</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">التقييم:</span>
                    <span className="font-bold text-slate-800">⭐ {doc.rating} ({doc.reviewCount} تقييم)</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">أيام العمل المتاحة بالعيادة:</span>
                  <div className="flex flex-wrap gap-1">
                    {doc.availableDays.map((day, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-800 font-bold text-[10px] px-2 py-1 rounded-md border border-emerald-200">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>مواعيد النوبتجية:</span>
                  <span className="font-bold text-slate-800">{doc.shift}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SERVICES & PRICING */}
      {activeTab === 'services' && (
        <div className="flex flex-col gap-6">
          
          {/* Top Form to Add New Service & Price */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    إضافة خدمة وسعر جديد وتحديثها في فلاتر وقاعدة البيانات
                  </h3>
                  <p className="text-xs text-slate-500">
                    يمكنك تسجيل خدمات جديدة بالمركز أو تعديل أسعار الخدمات القائمة فوراً
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddServiceOpen(!isAddServiceOpen)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 self-start transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddServiceOpen ? 'إغلاق نموذج الإضافة' : 'إضافة خدمة وسعر جديد'}</span>
              </button>
            </div>

            {isAddServiceOpen && (
              <form onSubmit={handleCreateServiceSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخدمة الطبية *</label>
                  <input
                    type="text"
                    required
                    value={serviceName}
                    onChange={e => setServiceName(e.target.value)}
                    placeholder="مثال: تركيب تقويم شفاف إنفزلاين (Invisalign)"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">قسم / تصنيف الخدمة</label>
                  <select
                    value={serviceCategory}
                    onChange={e => setServiceCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="الوقاية والتنظيف">الوقاية والتنظيف</option>
                    <option value="العلاج التجميلي">العلاج التجميلي</option>
                    <option value="التركيبات">التركيبات</option>
                    <option value="التقويم">التقويم</option>
                    <option value="التجميل">التجميل</option>
                    <option value="علاج العصب">علاج العصب</option>
                    <option value="الجراحة والزراعة">الجراحة والزراعة</option>
                    <option value="طب أسنان الأطفال">طب أسنان الأطفال</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر الرسمي بالجنيه المصري (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={serviceBasePrice}
                    onChange={e => setServiceBasePrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مدة الجلسة التقديرية (بالدقائق)</label>
                  <input
                    type="number"
                    min={10}
                    step={5}
                    value={serviceDuration}
                    onChange={e => setServiceDuration(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">المميزات الرئيسية (مفصولة بفواصل)</label>
                  <input
                    type="text"
                    value={serviceFeaturesText}
                    onChange={e => setServiceFeaturesText(e.target.value)}
                    placeholder="مثال: فحص دقيق, تعقيم كامل, نتائج سريعة"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">وصف مختصر للخدمة</label>
                  <input
                    type="text"
                    value={serviceDescription}
                    onChange={e => setServiceDescription(e.target.value)}
                    placeholder="اكتب وصفاً توضيحياً يظهر للمرضى في قائمة الحجز والخدمات..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddServiceOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
                  >
                    حفظ الخدمة وتحديث الأسعار فوراً ✓
                  </button>
                </div>
              </form>
            )}

            {/* List of active services */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <h4 className="font-bold text-slate-900 text-sm">
                قائمة الخدمات والأسعار الرسمية ({services.length} خدمة مفعلة)
              </h4>
              <span className="text-xs text-slate-500">تنعكس في تطبيق فلاتر فوراً</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((srv) => (
                <div key={srv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md inline-block mb-1">
                        {srv.category}
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm">{srv.name}</h5>
                    </div>

                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'حذف الخدمة والسعر',
                          message: `هل أنت متأكد من حذف خدمة "${srv.name}" وسعرها نهائياً من قاعدة البيانات؟`,
                          confirmText: 'نعم، احذف الخدمة',
                          cancelText: 'إلغاء',
                          isDestructive: true,
                          onConfirm: () => {
                            deleteService(srv.id);
                            showToast(`تم حذف خدمة "${srv.name}" بنجاح`);
                            setConfirmModal(null);
                          }
                        });
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer shrink-0"
                      title="حذف الخدمة والسعر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {srv.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    {editingServiceId === srv.id ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="number"
                          value={editPriceInput}
                          onChange={e => setEditPriceInput(Number(e.target.value))}
                          className="w-24 p-1 bg-white border border-amber-400 rounded-lg text-xs font-bold text-slate-900"
                        />
                        <button
                          onClick={() => handleUpdateServicePrice(srv, editPriceInput)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => setEditingServiceId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px]"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg text-sm">
                            {srv.basePrice} ج.م
                          </span>
                          <button
                            onClick={() => {
                              setEditingServiceId(srv.id);
                              setEditPriceInput(srv.basePrice);
                            }}
                            className="text-[10px] text-slate-500 hover:text-amber-700 underline font-semibold cursor-pointer"
                          >
                            تعديل السعر
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ⏱ {srv.durationMinutes} دقيقة
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: USERS & ROLES MANAGEMENT */}
      {activeTab === 'users_roles' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">

          {/* Custom Secretary Database Password Management Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-white text-base sm:text-lg">
                      كلمة مرور السكرتارية في قاعدة البيانات (Firestore Security Password)
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>متصل بالداتا بيز مباشرة</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30">
                      تم إلغاء 1234 نهائياً
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    هذه هي كلمة المرور التي تدخل بها السكرتارية لوحة الاستقبال وإلغاء قفل الشاشة. يتم حفظها وتحديثها في مستند <code className="text-amber-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded-sm">clinic_settings/secretary_security</code> في قاعدة بيانات Firestore.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Current Password Display Card */}
              <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>كلمة المرور الحالية المعتمدة:</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>نشطة حالياً</span>
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-amber-300 tracking-wider">
                      {showDbPass ? (secretaryPassword || 'Almasa@2026') : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowDbPass(!showDbPass)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title={showDbPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showDbPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyDbPass}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                        title="نسخ كلمة المرور"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>ملاحظة هامة:</strong> لن يتمكن أي شخص من الدخول أو فك قفل شاشة الاستقبال برمز <span className="text-rose-400 line-through font-mono">1234</span>، بل حصرياً بكلمة المرور المسجلة هنا في قاعدة البيانات.
                </div>
              </div>

              {/* Form to Update Password in Database */}
              <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <form onSubmit={handleUpdateSecretaryPassword} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>تعيين وحفظ كلمة مرور خاصة جديدة في الداتا بيز:</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        كلمة المرور الجديدة *
                      </label>
                      <input
                        type="text"
                        required
                        value={dbPassInput}
                        onChange={e => setDbPassInput(e.target.value)}
                        placeholder="اكتب كلمة المرور الجديدة الخاصة بك..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="text"
                        value={dbPassConfirm}
                        onChange={e => setDbPassConfirm(e.target.value)}
                        placeholder="أعد كتابة كلمة المرور..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[10px] text-slate-400">
                      يتم حفظ التغيير فوراً في Firestore ومزامنتها لحظياً لجميع أجهزة الاستقبال.
                    </span>
                    <button
                      type="submit"
                      disabled={isUpdatingDbPass}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50 shrink-0"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isUpdatingDbPass ? 'جارِ الحفظ في الداتا بيز...' : 'حفظ في الداتا بيز الآن 💾'}</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  إدارة حسابات المستخدمين وصلاحيات السكرتارية
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                جميع المستخدمين يدخلون بحساب عميل افتراضياً. يمكنك ترقية أي مستخدم إلى طاقم السكرتارية أو تعديل صلاحياته بضغطة زر وتنعكس التغييرات فوراً.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو رقم الموبايل..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pl-8 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* User List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredUsers
              .filter(u =>
                u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                u.phone.includes(userSearchQuery) ||
                (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
              )
              .map((u) => {
                const isSec = u.role === 'secretary';
                const isAdmin = u.role === 'admin';

                return (
                  <div
                    key={u.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs ${
                      isSec
                        ? 'bg-sky-50/60 border-sky-200'
                        : isAdmin
                        ? 'bg-purple-50/60 border-purple-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                            isSec
                              ? 'bg-sky-600 text-white'
                              : isAdmin
                              ? 'bg-purple-600 text-white'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{u.name}</h4>
                          <span className="text-xs text-slate-600 font-mono" dir="ltr">{u.phone}</span>
                          {u.email && (
                            <span className="text-[10px] text-slate-400 block font-mono" dir="ltr">{u.email}</span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                          isSec
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : isAdmin
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {isSec ? 'طاقم السكرتارية' : isAdmin ? 'مدير نظام' : 'مريض / عميل'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/70">
                      <span>انضم في: {u.memberSince || '2026'}</span>
                      <span className="font-bold text-slate-600">
                        {u.gender === 'female' ? 'أنثى' : 'ذكر'}
                      </span>
                    </div>

                    {/* Role Actions */}
                    <div className="pt-2 border-t border-slate-200/70 flex items-center gap-2">
                      {u.role !== 'secretary' && (
                        <button
                          type="button"
                          onClick={() => {
                            updateUserRole(u.id, 'secretary');
                            showToast(`تم ترقية ${u.name} إلى طاقم السكرتارية`);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          ترقية لسكرتارية
                        </button>
                      )}

                      {u.role !== 'patient' && (
                        <button
                          type="button"
                          onClick={() => {
                            updateUserRole(u.id, 'patient');
                            showToast(`تم تحويل ${u.name} إلى حساب مريض عادي`);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                        >
                          تحويل لمريض
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'حذف حساب المستخدم',
                            message: `هل أنت متأكد من حذف حساب ${u.name} (${u.phone}) نهائياً؟`,
                            confirmText: 'نعم، حذف الحساب',
                            cancelText: 'إلغاء',
                            isDestructive: true,
                            onConfirm: () => {
                              deleteUser(u.id);
                              showToast(`تم حذف الحساب بنجاح`);
                              setConfirmModal(null);
                            }
                          });
                        }}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="حذف الحساب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 8: MEDIA & SOCIAL SETTINGS (Video Slot & Facebook Link) */}
      {activeTab === 'media_settings' && (
        <div className="flex flex-col gap-6" dir="rtl">
          
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                <Share2 className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  إدارة وسائل التواصل والسوشيال ميديا 💬
                </h3>
                <p className="text-xs text-slate-300">
                  إعدادات صفحة الفيسبوك الرسمية ورقم واتساب الحجوزات والاستفسارات المعتمد
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-full">
                تحديث فوري لجميع الأجهزة ✓
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Facebook Page Settings */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shadow-xs">
                    <Facebook className="w-5 h-5 fill-[#1877F2]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      رابط صفحة الفيسبوك الرسمية
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      يفتح للمرضى مباشرة عند الضغط على أيقونة الفيسبوك
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <label className="text-xs font-bold text-slate-700">رابط الصفحة الحالي:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={clinicInfo.facebookUrl || 'https://www.facebook.com/share/1KL7zrcN3G/'}
                      id="secretary-fb-input"
                      dir="ltr"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-[#1877F2]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('secretary-fb-input') as HTMLInputElement;
                        if (input && input.value) {
                          updateClinicInfo({ facebookUrl: input.value.trim() });
                          showToast('تم حفظ رابط صفحة الفيسبوك بنجاح! 👍');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      حفظ
                    </button>
                  </div>

                  <div className="pt-2">
                    <a
                      href={clinicInfo.facebookUrl || 'https://www.facebook.com/share/1KL7zrcN3G/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#1877F2] font-bold hover:underline bg-[#1877F2]/5 px-3 py-2 rounded-xl border border-[#1877F2]/10 w-full"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">تجربة فتح الصفحة: {clinicInfo.facebookUrl || 'https://www.facebook.com/share/1KL7zrcN3G/'}</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs text-blue-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>الرابط متصل بأيقونة الفيسبوك في جميع واجهات التطبيق.</span>
              </div>
            </div>

            {/* Card 2: WhatsApp Number Settings */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center shadow-xs">
                    <MessageCircle className="w-5 h-5 fill-[#25D366] text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      رقم واتساب العيادة والحجوزات
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      يفتح محادثة واتساب فورية مع المركز عند الضغط على أيقونة الواتس
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <label className="text-xs font-bold text-slate-700">رقم الهاتف الدولي للواتساب:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={clinicInfo.whatsapp || '+201101722551'}
                      id="secretary-whatsapp-input"
                      dir="ltr"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('secretary-whatsapp-input') as HTMLInputElement;
                        if (input && input.value) {
                          updateClinicInfo({ whatsapp: input.value.trim() });
                          showToast('تم حفظ رقم الواتساب وتحديثه في التطبيق بنجاح! 💬');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition cursor-pointer"
                    >
                      حفظ
                    </button>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${(clinicInfo.whatsapp || '+201101722551').replace(/\+/g, '').replace(/\s+/g, '')}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار وحجز موعد في مركز دكتور محمد فوزي الماسة لطب وجراحة الأسنان')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-full"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>تجربة فتح محادثة الواتساب: {clinicInfo.whatsapp || '01101722551'}</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>أيقونة الواتساب مفعلة باللون الأخضر الرسمي ومربوطة بهذا الرقم.</span>
              </div>
            </div>

          </div>

          {/* Full-width Section: Clinic Photos & Equipment Gallery */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-base">
                      معرض صور المركز والعيادات والتجهيزات 📸
                    </h4>
                    <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                      {clinicGallery.length} صور منشورة
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    أي صورة يتم إضافتها هنا تظهر فوراً لجميع المرضى في الصفحة الرئيسية وصفحة «عن المركز»
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewPhotoTitle('');
                  setNewPhotoUrl('');
                  setNewPhotoCategory('تجهيزات المركز');
                  setIsPhotoModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صورة جديدة للمركز الآن</span>
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {['الكل', 'تجهيزات المركز', 'عيادات الكشف', 'حالات قبل وبعد', 'فريق العمل'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPhotoFilterCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    photoFilterCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            {clinicGallery.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">لا توجد صور مضافة في المعرض حتى الآن</span>
                <span className="text-[11px] text-slate-400">اضغط على زر «إضافة صورة جديدة» لرفع صور العيادات والأجهزة</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {clinicGallery
                  .filter(p => photoFilterCategory === 'الكل' || p.category === photoFilterCategory)
                  .map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs hover:shadow-md transition flex flex-col"
                    >
                      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold">
                          {photo.category}
                        </span>
                      </div>
                      <div className="p-3 flex items-center justify-between gap-2 flex-1">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-slate-900 truncate" title={photo.title}>
                            {photo.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            تاريخ الإضافة: {photo.createdAt}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`هل أنتِ متأكدة من حذف صورة "${photo.title}" من معرض المركز؟`)) {
                              deleteClinicPhoto(photo.id);
                            }
                          }}
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 transition cursor-pointer border border-rose-100"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: PATIENT REVIEWS MANAGEMENT & MODERATION */}
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-6" dir="rtl">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl">
                  إدارة ومراجعة تقييمات وآراء المرضى ⭐
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  يمكن للسكرتيرة مراجعة كافة التقييمات المسجلة من المرضى للأطباء والخدمات، وحذف أي تقييم غير لائق بنقرة واحدة
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30">
                إجمالي التقييمات: {doctorReviews.length}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                ⭐
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">متوسط التقييم العام</span>
                <p className="text-lg font-black text-slate-900">
                  {doctorReviews.length > 0
                    ? (doctorReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / doctorReviews.length).toFixed(1)
                    : '5.0'} / 5.0
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">تقييمات 5 نجوم (ممتاز)</span>
                <p className="text-lg font-black text-slate-900">
                  {doctorReviews.filter(r => (r.rating || 0) >= 5).length} تقييم
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                👥
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">مرضى قيموا الخدمة</span>
                <p className="text-lg font-black text-slate-900">
                  {doctorReviews.length} مريض
                </p>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>سجل تقييمات المرضى الحقيقية</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {doctorReviews.length}
                </span>
              </h4>
              <span className="text-[11px] text-slate-400">
                حذف التقييم يمسحه فوراً من لوحة التحكم ومن تطبيق الموبايل لجميع المرضى
              </span>
            </div>

            {doctorReviews.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <h5 className="font-bold text-slate-800 text-sm">لا توجد تقييمات مسجلة حالياً</h5>
                <p className="text-xs text-slate-400 max-w-sm text-center">
                  عند قيام المرضى بتقييم تجربة الكشف أو الأطباء من خلال التطبيق، ستظهر جميع التقييمات هنا وستتمكن السكرتيرة من إدارتها وحذفها
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctorReviews.map((rev) => {
                  const revRating = rev.rating || 5;
                  return (
                    <div
                      key={rev.id || rev.appointmentId}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition shadow-xs flex flex-col justify-between gap-3"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              {rev.patientName || 'مريض المركز'}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              مريض موثق ✓
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-0.5">
                            مع: {rev.doctorName || 'طبيب المركز'} • {rev.serviceName || 'كشف واستشارة طبية'}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(revRating)
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-black text-amber-800 mr-1">{revRating}</span>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                        "{rev.comment || 'خدمة ممتازة واهتمام فائق ⭐'}"
                      </p>

                      {/* Footer Row with Date and Delete button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px]">
                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                          <span>{rev.date || rev.createdAt || 'مؤخراً'}</span>
                          {rev.appointmentCode && (
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {rev.appointmentCode}
                            </span>
                          )}
                        </div>

                        {/* Delete Review Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'حذف تقييم المريض نهائياً',
                              message: `هل أنتِ متأكدة من رغبتك في حذف تقييم المريض (${rev.patientName}) للطبيب (${rev.doctorName})؟ سيتم مسح التقييم فوراً من قاعدة البيانات وتطبيق الموبايل.`,
                              isDestructive: true,
                              confirmText: 'نعم، احذف التقييم',
                              cancelText: 'إلغاء',
                              onConfirm: () => {
                                deleteDoctorReview(rev.id || rev.appointmentId);
                                setConfirmModal(null);
                                showToast('تم حذف التقييم بنجاح من قاعدة البيانات والتطبيق 🗑️');
                              }
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف التقييم 🗑️</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD PHOTO TO GALLERY MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
                  <Camera className="w-4 h-4 font-bold" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  إضافة صورة جديدة لمعرض صور المركز
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">عنوان أو وصف الصورة الظاهر للمرضى:</label>
                <input
                  type="text"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder="مثال: أحدث جهاز مسح رقمي 3D للأسنان أو عيادة الأطفال"
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">تصنيف وقسم الصورة:</label>
                <select
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-amber-500 bg-white"
                >
                  <option value="تجهيزات المركز">تجهيزات المركز</option>
                  <option value="عيادات الكشف">عيادات الكشف</option>
                  <option value="حالات قبل وبعد">حالات قبل وبعد (ابتسامة هوليوود)</option>
                  <option value="فريق العمل">فريق العمل والمركز</option>
                </select>
              </div>

              {/* Upload file or enter URL */}
              <div className="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>اختيار الصورة من الموبايل أو الكمبيوتر:</span>
                </label>
                
                <label className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition">
                  <Upload className="w-4 h-4" />
                  <span>اضغطي لاختيار صورة من جهازك الآن 🖼️</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCompressImage(file, (base64) => {
                          setNewPhotoUrl(base64);
                          if (!newPhotoTitle) {
                            setNewPhotoTitle(file.name.replace(/\.[^/.]+$/, ""));
                          }
                          showToast('تم تجهيز وضغط الصورة بنجاح ✅');
                        });
                      }
                    }}
                  />
                </label>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 text-[11px]">أو رابط صورة مباشر:</span>
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    dir="ltr"
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* Preview */}
              {newPhotoUrl && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-600">معاينة الصورة قبل النشر:</span>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={newPhotoUrl} alt="معاينة" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!newPhotoUrl) {
                      alert('يرجى اختيار صورة من جهازك أو وضع رابط الصورة أولاً');
                      return;
                    }
                    addClinicPhoto({
                      title: newPhotoTitle.trim() || 'صورة من مركز الماسة للأسنان',
                      url: newPhotoUrl,
                      category: newPhotoCategory
                    });
                    setIsPhotoModalOpen(false);
                    setNewPhotoTitle('');
                    setNewPhotoUrl('');
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer shadow-md"
                >
                  حفظ ونشر الصورة فوراً في التطبيق ✅
                </button>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK NEW BOOKING MODAL (For walk-in / phone booking) */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
                  <Plus className="w-5 h-5 font-bold" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  حجز موعد جديد سريع في المركز
                </h3>
              </div>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWalkinSubmit} className="flex flex-col gap-3.5">
              
              {/* Source */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setModalSource('reception_walkin')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    modalSource === 'reception_walkin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  حضور شخصي بالاستقبال
                </button>
                <button
                  type="button"
                  onClick={() => setModalSource('phone')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    modalSource === 'phone' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  حجز باتصال هاتفي
                </button>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المريض *</label>
                <input
                  type="text"
                  required
                  value={modalPatientName}
                  onChange={(e) => setModalPatientName(e.target.value)}
                  placeholder="مثال: أحمد محمود السيد"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Patient Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الموبايل للتأكيد والواتساب *</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={modalPatientPhone}
                  onChange={(e) => setModalPatientPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الخدمة المطلوبة</label>
                <select
                  value={modalServiceId}
                  onChange={(e) => setModalServiceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - ({s.basePrice} ج.م)
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الطبيب المعالج</label>
                <select
                  value={modalDoctorId}
                  onChange={(e) => setModalDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الموعد</label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوقت المحدد</label>
                  <select
                    value={modalTimeSlot}
                    onChange={(e) => setModalTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="02:00 م">02:00 م</option>
                    <option value="03:00 م">03:00 م</option>
                    <option value="04:00 م">04:00 م</option>
                    <option value="05:00 م">05:00 م</option>
                    <option value="06:00 م">06:00 م</option>
                    <option value="07:00 م">07:00 م</option>
                    <option value="08:00 م">08:00 م</option>
                    <option value="09:00 م">09:00 م</option>
                    <option value="10:00 م">10:00 م</option>
                  </select>
                </div>
              </div>

              {/* Payment Status & Installments */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>النظام المالي وخطة السداد</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalIsInstallment}
                      onChange={(e) => setModalIsInstallment(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>نظام تقسيط (تقويم / جراحة)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalPaymentStatus('unpaid')}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      modalPaymentStatus === 'unpaid'
                        ? 'bg-amber-50 border-amber-400 text-amber-900'
                        : 'border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    دفع لاحقاً عند الحضور
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalPaymentStatus('paid')}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      modalPaymentStatus === 'paid'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                        : 'border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    سداد في الاستقبال ✓
                  </button>
                </div>

                {modalIsInstallment && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">إجمالي تكلفة العلاج المتفق عليها</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          dir="ltr"
                          value={modalTotalAmount}
                          onChange={(e) => setModalTotalAmount(normalizeNumberInput(e.target.value))}
                          placeholder="مثال: 12000"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-500 pl-8 text-left"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          ج.م
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">المقدم المدفوع الآن بالاستقبال</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          dir="ltr"
                          value={modalPaidAmount}
                          onChange={(e) => setModalPaidAmount(normalizeNumberInput(e.target.value))}
                          placeholder="مثال: 3000"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-500 pl-8 text-left"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          ج.م
                        </span>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ملاحظة خطة التقسيط</label>
                      <input
                        type="text"
                        value={modalInstallmentNote}
                        onChange={(e) => setModalInstallmentNote(e.target.value)}
                        placeholder="مثال: قسط شهري 1000 ج.م في موعد شد التقويم"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية (اختياري)</label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="مثال: مريض لديه حساسية أسنان أو طلب استشارة أولية"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
                >
                  تأكيد الحجز وطباعة التذكرة
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition"
                >
                  إلغاء
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT DOCTOR MODAL */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingDoctor ? `تعديل بيانات: ${editingDoctor.name}` : 'إضافة طبيب / دكتورة جديدة للمركز'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    سيظهر الطبيب مباشرة في جدول الحجوزات وصفحة المركز وقائمة المواعيد
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDoctorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">اسم الطبيب / الدكتورة:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: د. أسماء"
                    value={docFormName}
                    onChange={(e) => setDocFormName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">المسمى المهني والدرجة العلمية:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أخصائية طب وتجميل الأسنان وعلاج الجذور"
                    value={docFormTitle}
                    onChange={(e) => setDocFormTitle(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">التخصص الدقيق:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: اخصائي تجميل وعلاج تحفظي"
                    value={docFormSpecialty}
                    onChange={(e) => setDocFormSpecialty(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">سنوات الخبرة:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={docFormExp}
                    onChange={(e) => setDocFormExp(Number(e.target.value) || 1)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">مواعيد النوبتجية / الشفت:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 02:00 م - 10:00 م"
                    value={docFormShift}
                    onChange={(e) => setDocFormShift(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Avatar / Photo */}
                <div className="flex flex-col gap-1.5 sm:col-span-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-700">صورة الطبيب / الدكتورة:</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={docFormAvatar}
                      alt="معاينة"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/doctors/dr_asmaa.jpg';
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="text"
                        value={docFormAvatar}
                        onChange={(e) => setDocFormAvatar(e.target.value)}
                        placeholder="مسار الصورة أو رابط مباشر"
                        dir="ltr"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                      <label className="text-[10px] text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>اختيار صورة من الجهاز (يتم ضغطها وتحديثها فوراً)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCompressImage(file, (compressedBase64) => {
                                setDocFormAvatar(compressedBase64);
                                showToast('تم تجهيز وضغط صورة الطبيب بنجاح ✅');
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Available Days */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">أيام العمل الأسبوعية:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => {
                      const isSelected = docFormDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setDocFormDays(docFormDays.filter(d => d !== day));
                            } else {
                              setDocFormDays([...docFormDays, day]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer"
                >
                  {editingDoctor ? 'حفظ التعديلات' : 'إضافة الطبيب الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT / TICKET PRINT MODAL (Classic Clinic Receipt) */}
      {selectedReceiptApt && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div id="secretary-receipt-ticket-paper" className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-slate-900 border-2 border-slate-200 print:border-none print:shadow-none print:p-4 print:w-full">
            
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <div className="w-10 h-10 rounded-full bg-slate-950 text-amber-400 mx-auto flex items-center justify-center font-black text-sm mb-1.5 border border-amber-400">
                💎
              </div>
              <h3 className="font-black text-sm text-slate-950 font-['Cairo']">مركز د. محمد فوزي الماسة</h3>
              <p className="text-[11px] text-amber-800 font-bold">سند قبض وفاتورة كشف واستقبال مريض</p>
              <div className="text-[10px] text-slate-500 mt-1 space-y-0.5 leading-tight">
                <p>{clinicInfo.address || 'المحلة الكبرى - ميدان الشون - مقابل حلواني هبة - أعلى معمل الذرة'}</p>
                <p className="font-mono" dir="ltr">{clinicInfo.phones?.[0] || clinicInfo.phoneDisplay || '01101722551'} - {clinicInfo.phones?.[1] || '0402218878'}</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">رقم الحجز / السند:</span>
                <span className="font-black text-amber-700 font-mono text-sm">{selectedReceiptApt.appointmentCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">اسم المريض:</span>
                <span className="font-bold text-slate-950 font-['Cairo']">{selectedReceiptApt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-bold font-mono" dir="ltr">{selectedReceiptApt.patientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الخدمة الطبية:</span>
                <span className="font-bold text-slate-900 font-['Cairo']">{selectedReceiptApt.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الطبيب المعالج:</span>
                <span className="font-bold font-['Cairo']">{selectedReceiptApt.doctorName || 'د. محمد فوزي'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تاريخ الكشف:</span>
                <span className="font-bold">{selectedReceiptApt.date} {selectedReceiptApt.timeSlot ? `(${selectedReceiptApt.timeSlot})` : ''}</span>
              </div>

              {/* Financial line */}
              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-700">المبلغ المطلوب:</span>
                  <span className="text-slate-950 font-black">{selectedReceiptApt.price || 0} ج.م</span>
                </div>
                {selectedReceiptApt.paidAmount !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">المبلغ المسدد:</span>
                    <span className="font-bold text-emerald-700">{selectedReceiptApt.paidAmount} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-xs items-center pt-1">
                  <span className="text-slate-500">حالة السداد:</span>
                  <span className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                    selectedReceiptApt.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedReceiptApt.paymentStatus === 'paid' ? 'خالص السداد بالكامل ✓' : 'دفع عند الكشف في العيادة'}
                  </span>
                </div>
              </div>

              {/* Stamp & Verification */}
              <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
                <div className="text-[10px] text-slate-400">
                  <p>قسم الاستقبال والخزينة</p>
                  <p className="font-mono text-[9px]">{new Date().toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="w-14 h-14 rounded-full border border-dashed border-emerald-600 text-emerald-800 font-bold text-[8px] flex flex-col items-center justify-center rotate-[-6deg] bg-emerald-50/50">
                  <span>مركز الماسة</span>
                  <span>معتمد مالياً</span>
                  <span>✓ PAID</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => {
                  showToast('جارٍ تجهيز وإرسال السند للطابعة 🖨️...');
                  printElement('secretary-receipt-ticket-paper', {
                    title: `سند استلام وقبض - ${selectedReceiptApt.patientName}`
                  });
                }}
                className="flex-1 min-w-[130px] py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>طباعة السند 🖨️</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('جارٍ فتح السند في نافذة طباعة مخصصة 🖨️...');
                  printElement('secretary-receipt-ticket-paper', {
                    title: `سند استلام وقبض - ${selectedReceiptApt.patientName}`,
                    preferPopup: true
                  });
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/15 text-amber-900 hover:bg-amber-500/25 border border-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                title="فتح في نافذة طباعة مستقلة (لتخطي أي قيود بالمتصفح)"
              >
                <span>نافذة طباعة ↗</span>
              </button>
              <button
                onClick={() => setSelectedReceiptApt(null)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDICAL CONSENT MODAL (Print paper & Patient Signature) */}
      {selectedConsentApt && (
        <MedicalConsentModal
          appointment={appointments.find(a => a.id === selectedConsentApt.id) || selectedConsentApt}
          onClose={() => setSelectedConsentApt(null)}
        />
      )}

      {/* PATIENT INVOICE & AUTO CLINIC PRINT MODAL */}
      {selectedInvoiceApt && (
        <PatientInvoiceModal
          appointment={appointments.find(a => a.id === selectedInvoiceApt.id) || selectedInvoiceApt}
          onClose={() => setSelectedInvoiceApt(null)}
        />
      )}

      {/* INSTALLMENT MANAGEMENT MODAL */}
      {selectedPaymentApt && (
        <InstallmentManagementModal
          appointment={appointments.find(a => a.id === selectedPaymentApt.id) || selectedPaymentApt}
          onClose={() => setSelectedPaymentApt(null)}
          onPrintStatement={(apt) => {
            setSelectedPrintStatementApt(apt);
          }}
        />
      )}

      {/* INSTALLMENT STATEMENT PRINT MODAL */}
      {selectedPrintStatementApt && (
        <InstallmentStatementPrintModal
          appointment={selectedPrintStatementApt}
          onClose={() => setSelectedPrintStatementApt(null)}
        />
      )}

      {/* CUSTOM IN-APP CONFIRMATION DIALOG (Works 100% reliably in all iframe and browser environments) */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmModal.isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
              }`}>
                {confirmModal.isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">{confirmModal.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">تأكيد الإجراء في النظام</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {confirmModal.message}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition cursor-pointer ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                {confirmModal.confirmText || 'تأكيد'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {confirmModal.cancelText || 'إلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-ON-1 PATIENT PRIVATE FOLLOW-UP MODAL */}
      <SendFollowupModal
        isOpen={isFollowupModalOpen}
        onClose={() => {
          setIsFollowupModalOpen(false);
          setFollowupModalPatient(null);
        }}
        initialPatient={followupModalPatient}
      />

      {/* MODAL: ADD NEW PATIENT RECORD */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">إضافة ملف مريض جديد</h3>
                  <p className="text-xs text-slate-500">حفظ ملف المريض الموحد في قاعدة بيانات المركز</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPatientModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPatientForm.name.trim() || !newPatientForm.phone.trim()) {
                  showToast('يرجى كتابة اسم المريض ورقم الهاتف على الأقل');
                  return;
                }
                addPatientRecord({
                  name: newPatientForm.name.trim(),
                  phone: newPatientForm.phone.trim(),
                  email: newPatientForm.email.trim() || undefined,
                  nationalId: newPatientForm.nationalId.trim() || undefined,
                  bloodType: newPatientForm.bloodType,
                  gender: newPatientForm.gender,
                  notes: newPatientForm.notes.trim() || 'ملف طبي جديد مسجل عبر لوحة السكرتيرة',
                  medicalHistory: []
                });
                setNewPatientForm({
                  name: '',
                  phone: '',
                  email: '',
                  nationalId: '',
                  bloodType: 'O+',
                  gender: 'male',
                  notes: ''
                });
                setIsAddPatientModalOpen(false);
              }}
              className="flex flex-col gap-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المريض الرباعي / الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف / الواتساب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الرقم القومي (اختياري)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newPatientForm.nationalId}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, nationalId: e.target.value })}
                    placeholder="14 رقماً"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فصيلة الدم
                  </label>
                  <select
                    value={newPatientForm.bloodType}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodType: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="O+">O+ (موجب)</option>
                    <option value="A+">A+ (موجب)</option>
                    <option value="B+">B+ (موجب)</option>
                    <option value="AB+">AB+ (موجب)</option>
                    <option value="O-">O- (سالب)</option>
                    <option value="A-">A- (سالب)</option>
                    <option value="B-">B- (سالب)</option>
                    <option value="AB-">AB- (سالب)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    النوع / الجنس
                  </label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={newPatientForm.email}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات طبية / أمراض مزمنة أو حساسية
                </label>
                <textarea
                  rows={3}
                  value={newPatientForm.notes}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, notes: e.target.value })}
                  placeholder="مثال: يعاني من حساسية البنسلين، مريض ضغط وسكر، يحتاج عناية خاصة بالتخدير..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  حفظ وتسجيل الملف الطبي ✓
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPREHENSIVE PATIENT MEDICAL FILE */}
      {selectedPatientDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-4 border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 font-black text-lg flex items-center justify-center">
                  {(selectedPatientDetail.name || 'م')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-lg">
                      {selectedPatientDetail.name}
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      ملف معتمد ✓
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span dir="ltr" className="font-mono">{selectedPatientDetail.phone}</span>
                    {selectedPatientDetail.nationalId && (
                      <span>الرقم القومي: {selectedPatientDetail.nationalId}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPatientDetail(null);
                  setNewClinicalNoteText('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">فصيلة الدم</span>
                <span className="text-xs font-black text-rose-700" dir="ltr">
                  {selectedPatientDetail.bloodType || 'غير محدد'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">عدد الزيارات</span>
                <span className="text-xs font-black text-slate-900">
                  {selectedPatientDetail.totalVisits || 1} زيارة
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">آخر كشف</span>
                <span className="text-xs font-black text-slate-900">
                  {selectedPatientDetail.lastVisitDate || 'حديثاً'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">البريد الإلكتروني</span>
                <span className="text-[11px] font-bold text-slate-600 truncate block" dir="ltr">
                  {selectedPatientDetail.email || 'غير مسجل'}
                </span>
              </div>
            </div>

            {/* Treatment Timeline & Visits */}
            {(() => {
              const patientAppts = appointments.filter(
                (a) =>
                  a.patientPhone === selectedPatientDetail.phone ||
                  a.patientName === selectedPatientDetail.name
              );

              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>سجل الزيارات والكشوفات السابقة ({patientAppts.length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewBookingModalOpen(true);
                        setModalPatientName(selectedPatientDetail.name);
                        setModalPatientPhone(selectedPatientDetail.phone);
                      }}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                    >
                      + حجز موعد جديد للمريض
                    </button>
                  </div>

                  {patientAppts.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400 border border-slate-100">
                      لا توجد حجوزات سابقة مسجلة لهذا المريض.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                      {patientAppts.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900">{apt.serviceName}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                apt.status === 'confirmed' || apt.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'completed' ? 'مكتمل' : apt.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                              </span>
                              {apt.medicalConsent && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                  إقرار طبي موقع ✓
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">
                              الطبيب: {apt.doctorName} • التاريخ: {apt.date} الساعة {apt.timeSlot} • كود الحجز: {apt.appointmentCode}
                            </span>
                          </div>

                          <div className="text-left font-mono font-black text-xs text-slate-800 shrink-0">
                            {apt.totalAmount ? `${apt.totalAmount} ج.م` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Medical Notes & Doctor Diagnosis */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>الملاحظات الطبية وسجل التشخيص</span>
              </h4>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-slate-800 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line">
                {selectedPatientDetail.notes ? selectedPatientDetail.notes : 'لا توجد ملاحظات طبية مسجلة حتى الآن.'}
              </div>

              {/* Add Clinical Note Input */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newClinicalNoteText}
                  onChange={(e) => setNewClinicalNoteText(e.target.value)}
                  placeholder="إضافة ملاحظة سريرية أو تشخيص علاجي جديد..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newClinicalNoteText.trim()) {
                        addPatientMedicalNote(selectedPatientDetail.id, newClinicalNoteText.trim());
                        setNewClinicalNoteText('');
                        // Update local modal state immediately
                        const nowStr = new Date().toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        const line = `[ملاحظة طبية ${nowStr}]: ${newClinicalNoteText.trim()}`;
                        setSelectedPatientDetail({
                          ...selectedPatientDetail,
                          notes: selectedPatientDetail.notes ? `${selectedPatientDetail.notes}\n${line}` : line
                        });
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newClinicalNoteText.trim()) {
                      addPatientMedicalNote(selectedPatientDetail.id, newClinicalNoteText.trim());
                      setNewClinicalNoteText('');
                      const nowStr = new Date().toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      const line = `[ملاحظة طبية ${nowStr}]: ${newClinicalNoteText.trim()}`;
                      setSelectedPatientDetail({
                        ...selectedPatientDetail,
                        notes: selectedPatientDetail.notes ? `${selectedPatientDetail.notes}\n${line}` : line
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  حفظ الملاحظة ✓
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
              <button
                type="button"
                onClick={() => {
                  setFollowupModalPatient({
                    name: selectedPatientDetail.name,
                    phone: selectedPatientDetail.phone,
                    notes: selectedPatientDetail.notes
                  });
                  setIsFollowupModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>إرسال متابعة خاصة للمريض</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPatientDetail(null);
                  setNewClinicalNoteText('');
                }}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                إغلاق الملف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
