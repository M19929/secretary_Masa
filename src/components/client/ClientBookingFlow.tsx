import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { DentalService, Doctor, Appointment } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  QrCode,
  Share2,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { MedicalConsentViewModal } from '../common/MedicalConsentViewModal';

export const ClientBookingFlow: React.FC = () => {
  const {
    services,
    offers,
    doctors,
    selectedService,
    setSelectedService,
    selectedOffer,
    setSelectedOffer,
    selectedDoctor,
    setSelectedDoctor,
    bookingStep,
    setBookingStep,
    setClientTab,
    createAppointment,
    currentUser,
    isAuthenticated,
    openAuthModal,
    getBlockingConsentAppointment,
    showToast
  } = useClinic();

  // Helper to get tomorrow's date string YYYY-MM-DD
  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getTodayDateStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Booking Form State - defaults to tomorrow because same-day booking is strictly disabled
  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowDateStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('04:00 م');
  const [patientName, setPatientName] = useState<string>(() => currentUser?.name || '');
  const [patientPhone, setPatientPhone] = useState<string>(() => currentUser?.phone || '');
  const [patientEmail, setPatientEmail] = useState<string>(() => currentUser?.email || '');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'clinic' | 'online' | 'insurance'>('clinic');
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [signingConsentApt, setSigningConsentApt] = useState<Appointment | null>(null);

  // Find any previous unconsented appointment for patient
  const blockingConsentApt = getBlockingConsentAppointment(patientPhone, patientName);

  // Update fields whenever currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (!patientName) setPatientName(currentUser.name);
      if (!patientPhone) setPatientPhone(currentUser.phone);
      if (!patientEmail && currentUser.email) setPatientEmail(currentUser.email);
    }
  }, [currentUser]);

  // Time Slots for 2:00 PM to 10:00 PM (مواعيد العمل الرسمية من 2:00 م حتى 10:00 م)
  const timeSlots = [
    '02:00 م',
    '03:00 م',
    '04:00 م',
    '05:00 م',
    '06:00 م',
    '07:00 م',
    '08:00 م',
    '09:00 م',
    '10:00 م'
  ];

  // Days of current/next month
  // We'll generate an authentic Month Calendar View (مايو / سبتمبر) matching screenshot 3
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() + currentMonthOffset);
  
  const monthName = baseDate.toLocaleString('ar-SA', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).getDay(); // 0 is Sunday, 6 is Saturday
  
  // Weekday names in Arabic matching screenshot: السبت، الأحد، الإثنين، الثلاثاء، الأربعاء، الخميس، الجمعة
  const weekDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  
  // Adjusted offset for Saturday start (Saturday = 0)
  const saturdayIndex = (firstDayIndex + 1) % 7;

  const handleSelectDay = (dayNum: number) => {
    const y = baseDate.getFullYear();
    const m = String(baseDate.getMonth() + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    const targetDate = `${y}-${m}-${d}`;
    const todayStr = getTodayDateStr();

    if (targetDate <= todayStr) {
      setDateError('عفواً، لا يمكن الحجز في نفس اليوم. الحجز متاح مسبقاً بدءاً من يوم الغد.');
      return;
    }

    setDateError(null);
    setSelectedDate(targetDate);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      alert('الرجاء إدخال اسم المريض ورقم الجوال');
      return;
    }

    // Gate: Patient cannot book new appointment if previous appointment lacks signed consent
    if (blockingConsentApt) {
      setSigningConsentApt(blockingConsentApt);
      showToast('عفواً، يجب توقيع الإقرار الطبي للموعد السابق أولاً قبل إتمام حجز كشف جديد ✍️');
      return;
    }

    const todayStr = getTodayDateStr();
    if (selectedDate <= todayStr) {
      alert('عفواً، الحجز متاح مسبقاً بدءاً من يوم الغد، ولا يمكن الحجز في نفس اليوم.');
      return;
    }

    const effectiveService = selectedService || services?.[0] || { id: 'serv-default', name: 'كشف عام', basePrice: 150 };
    const effectiveDoctor = selectedDoctor || doctors?.[0] || { id: 'doc-1', name: 'د. محمد فوزي' };
    const price = selectedOffer ? selectedOffer.discountedPrice : effectiveService.basePrice;

    const newApt = createAppointment({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || undefined,
      serviceId: effectiveService.id,
      serviceName: selectedOffer ? `${selectedOffer.title} (${effectiveService.name})` : effectiveService.name,
      doctorId: effectiveDoctor.id,
      doctorName: effectiveDoctor.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      status: 'pending',
      notes: notes.trim() || (selectedOffer ? `تم الحجز عبر ${selectedOffer.title}` : 'حجز عبر التطبيق'),
      price,
      isOffer: !!selectedOffer,
      offerTitle: selectedOffer?.title,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'unpaid',
      source: 'app'
    });

    setConfirmedBooking(newApt);
    setBookingStep(4); // 4 = Success Ticket screen

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore in iframe
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      
      {/* Top Header with Back button */}
      <div className="flex items-center justify-between">
        {bookingStep > 1 && bookingStep < 4 ? (
          <button
            onClick={() => setBookingStep(bookingStep - 1)}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>
        ) : (
          <button
            onClick={() => setClientTab('home')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
        )}

        <div className="text-center">
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
            {bookingStep === 1 && 'حجز موعد - اختر الخدمة'}
            {bookingStep === 2 && 'اختر الموعد المناسب'}
            {bookingStep === 3 && 'تأكيد الحجز والبيانات'}
            {bookingStep === 4 && 'تم تأكيد حجزك بنجاح!'}
          </h2>
          {bookingStep < 4 && (
            <p className="text-[11px] text-slate-400">خطوة {bookingStep} من 3</p>
          )}
        </div>

        <div className="w-12"></div>
      </div>

      {/* Stepper matching Screenshot 2 & 3 */}
      {bookingStep <= 3 && (
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative px-6">
          <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                bookingStep >= 1 ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
              }`}
            >
              1
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-700">اختر الخدمة</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                bookingStep >= 2 ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-700">اختر الموعد</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                bookingStep >= 3 ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-700">تأكيد الحجز</span>
          </div>
        </div>
      )}

      {/* Blocking Consent Alert Banner */}
      {bookingStep <= 3 && blockingConsentApt && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-400/90 rounded-2xl p-4 text-xs shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-base shadow-xs">
              ⚠️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-slate-950 text-sm">
                  توقيع الإقرار الطبي للموعد السابق مطلوب أولاً 📝
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                  الحجز الجديد معلّق
                </span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                عزيزي المريض، لديك موعد كشف سابق (كود: <span className="font-mono font-bold text-amber-900">#{blockingConsentApt.appointmentCode}</span> - {blockingConsentApt.serviceName}) يتطلب توقيع الإقرار الطبي أولاً لتتمكن من إتمام وتأكيد حجز كشف جديد.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSigningConsentApt(blockingConsentApt)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>توقيع الإقرار الطبي الآن ✍️</span>
          </button>
        </div>
      )}

      {/* STEP 1: CHOOSE SERVICE & DOCTOR */}
      {bookingStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Selected Offer Banner if exists */}
          {selectedOffer && (
            <div className="p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-slate-950 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full">
                  عرض ترويجي نشط ({selectedOffer.badge})
                </span>
                <h4 className="font-extrabold text-sm mt-1">{selectedOffer.title}</h4>
                <p className="text-xs font-semibold">{selectedOffer.discountedPrice} ريال بدلاً من {selectedOffer.originalPrice} ريال</p>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="text-xs bg-slate-950/20 hover:bg-slate-950/30 px-2.5 py-1 rounded-lg font-bold"
              >
                إلغاء العرض
              </button>
            </div>
          )}

          {/* Services list */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700">اختر نوع العلاج أو الخدمة:</span>
            
            <div className="flex flex-col gap-2">
              {services.map((serv) => {
                const isSelected = selectedService?.id === serv.id;
                return (
                  <button
                    key={serv.id}
                    onClick={() => {
                      setSelectedService(serv);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/50'
                        : 'bg-white text-slate-800 border-slate-100 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {serv.basePrice} ج.م
                      </span>
                      <ChevronLeft className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-300 group-hover:text-slate-600'}`} />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs sm:text-sm">{serv.name}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {serv.durationMinutes} دقيقة • {serv.category}
                        </span>
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">اختر الطبيب المعالج (اختياري):</span>
            <div className="grid grid-cols-2 gap-2.5">
              {doctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-right transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-500 shadow-xs ring-1 ring-amber-400'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-300 shrink-0"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-xs text-slate-900 truncate">{doc.name}</span>
                      <span className="text-[9px] text-slate-500 truncate">{doc.specialty}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setBookingStep(2)}
            disabled={!selectedService}
            className="w-full mt-3 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>متابعة لاختيار التاريخ والوقت</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* STEP 2: CHOOSE DATE & TIME (Matching Screenshot 3) */}
      {bookingStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Month Calendar Box matching Screenshot 3 */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            
            {/* Month Header with chevrons */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <button
                onClick={() => setCurrentMonthOffset(prev => Math.max(0, prev - 1))}
                disabled={currentMonthOffset <= 0}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="font-black text-slate-800 text-sm sm:text-base">
                {monthName}
              </span>

              <button
                onClick={() => setCurrentMonthOffset(prev => prev + 1)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Advance booking policy notice */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-amber-900 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>الحجز متاح مسبقاً بدءاً من يوم الغد (لا يمكن الحجز في نفس اليوم).</span>
            </div>

            {dateError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-2.5 text-xs font-bold flex items-center gap-2">
                <span>⚠️ {dateError}</span>
              </div>
            )}

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 pb-1">
              {weekDays.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
              {/* Empty offset days */}
              {Array.from({ length: saturdayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8"></div>
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const y = baseDate.getFullYear();
                const m = String(baseDate.getMonth() + 1).padStart(2, '0');
                const d = String(dayNum).padStart(2, '0');
                const thisDateStr = `${y}-${m}-${d}`;
                const todayStr = getTodayDateStr();
                const isPastOrToday = thisDateStr <= todayStr;
                const isSelected = selectedDate === thisDateStr;

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleSelectDay(dayNum)}
                    disabled={isPastOrToday}
                    title={isPastOrToday ? 'غير متاح - الحجز مسبق من يوم الغد' : undefined}
                    className={`h-8 sm:h-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                      isSelected
                        ? 'bg-slate-900 text-white font-black shadow-md scale-105 ring-2 ring-amber-400'
                        : isPastOrToday
                        ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed line-through opacity-45'
                        : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Selection matching Screenshot 3 */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-slate-800">أختر الوقت المناسب:</span>
            
            <div className="grid grid-cols-3 gap-2.5">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md ring-2 ring-amber-400/60'
                        : 'bg-white border border-slate-100 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected summary & next button */}
          <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              <span>{selectedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{selectedTimeSlot}</span>
            </div>
          </div>

          <button
            onClick={() => setBookingStep(3)}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>متابعة لتأكيد البيانات</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* STEP 3: PATIENT DETAILS & CONFIRMATION */}
      {bookingStep === 3 && (
        <motion.form
          onSubmit={handleConfirmSubmit}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-4 rounded-3xl text-white shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] text-amber-400 font-bold">الخدمة المختارة</span>
                <h4 className="font-extrabold text-sm sm:text-base text-white">
                  {selectedOffer ? selectedOffer.title : selectedService?.name}
                </h4>
              </div>
              <div className="text-left">
                <span className="text-base sm:text-lg font-black text-amber-300">
                  {selectedOffer ? selectedOffer.discountedPrice : selectedService?.basePrice} ج.م
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedTimeSlot}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>الطبيب: {selectedDoctor?.name || 'أي طبيب متاح'}</span>
              </div>
            </div>
          </div>

          {/* Patient Form Fields */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-50 pb-2">
              بيانات المريض للتأكيد:
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                اسم المريض الثلاثي *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="مثال: أحمد محمود السيد"
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl py-2.5 px-3 pl-9 text-slate-900 focus:outline-none focus:border-amber-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                رقم الموبايل للتواصل وتأكيد الحجز *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl py-2.5 px-3 text-right pr-9 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                البريد الإلكتروني (اختياري)
              </label>
              <div className="relative">
                <input
                  type="email"
                  dir="ltr"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl py-2.5 px-3 text-right pr-9 text-slate-900 focus:outline-none focus:border-amber-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                ملاحظات أو أعراض خاصة بالطبيب (اختياري)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ألم في ضرس معين، حساسية أدوية..."
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Payment options */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-700">طريقة الدفع المفضلة:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('clinic')}
                  className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition ${
                    paymentMethod === 'clinic' ? 'bg-amber-50 border-amber-500 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>في المركز</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition ${
                    paymentMethod === 'online' ? 'bg-amber-50 border-amber-500 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>دفع إلكتروني</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('insurance')}
                  className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition ${
                    paymentMethod === 'insurance' ? 'bg-amber-50 border-amber-500 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>تأمين طبي</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
              blockingConsentApt
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {blockingConsentApt ? (
              <>
                <FileText className="w-5 h-5" />
                <span>توقيع إقرار الموعد السابق مطلوب لحجز كشف جديد ✍️</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>تأكيد حجز الموعد الآن</span>
              </>
            )}
          </button>
        </motion.form>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION TICKET MATCHING EXACT USER SCREENSHOT */}
      {bookingStep === 4 && confirmedBooking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-3.5 max-w-md mx-auto w-full"
        >
          {/* Main Card Container */}
          <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xl overflow-hidden text-slate-900 relative">
            
            {/* Top Amber / Orange Header with Icon and Titles */}
            <div className="bg-gradient-to-b from-[#FFA000] via-[#FF9100] to-[#FF8F00] p-6 pb-7 text-slate-950 text-center relative rounded-t-[32px]">
              {/* Center Dark Circular Badge with Clock Icon */}
              <div className="w-14 h-14 rounded-full bg-[#0b1528] text-amber-400 flex items-center justify-center mx-auto mb-3.5 shadow-lg border border-amber-400/20">
                <Clock className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 mb-1.5 flex items-center justify-center gap-1.5">
                <span>طلب الحجز قيد المراجعة</span>
                <span>⏳</span>
              </h3>
              <p className="text-xs sm:text-[13px] font-bold text-slate-950/90 max-w-xs mx-auto leading-relaxed">
                تم إرسال طلبك للاستقبال وقاعدة البيانات وسيتم مراجعته والتواصل معك
              </p>
            </div>

            {/* Ticket Body Details */}
            <div className="p-5 pt-4 flex flex-col gap-4 bg-white">
              
              {/* Status Alert matching screenshot: "حالة الطلب: ⏳ قيد مراجعة وتأكيد الاستقبال" */}
              <div className="bg-[#FEF9E7] border border-[#FDE68A] rounded-2xl p-2.5 px-3.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#78350F]">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>حالة الطلب:</span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-[#FEF08A] text-[#713F12] border border-[#FACC15] shadow-xs">
                  ⏳ قيد مراجعة وتأكيد الاستقبال
                </span>
              </div>
              
              {/* Booking Reference Code Dark Banner */}
              <div className="bg-[#0B1528] text-white py-3.5 px-4 rounded-2xl text-center flex flex-col items-center justify-center gap-1 shadow-md">
                <span className="text-[11px] text-slate-400 font-bold tracking-wider">كود الحجز المرجعي</span>
                <span className="text-2xl sm:text-3xl font-black text-[#FACC15] tracking-widest font-mono">
                  {confirmedBooking.appointmentCode || 'MASA-1661'}
                </span>
              </div>

              {/* 2-Column Details Grid */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs sm:text-sm border-b border-dashed border-slate-200 pb-4 pt-1">
                {/* Right: Patient Name */}
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">اسم المريض:</span>
                  <span className="font-black text-slate-900 text-sm sm:text-base leading-tight block truncate">
                    {confirmedBooking.patientName}
                  </span>
                </div>
                {/* Left: Phone */}
                <div className="text-left">
                  <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">رقم الموبايل:</span>
                  <span className="font-black text-slate-900 text-sm sm:text-base font-mono leading-tight block" dir="ltr">
                    {confirmedBooking.patientPhone}
                  </span>
                </div>

                {/* Right: Service */}
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">الخدمة:</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug block">
                    {confirmedBooking.serviceName}
                  </span>
                </div>
                {/* Left: Doctor */}
                <div className="text-left">
                  <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">الطبيب:</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                    {confirmedBooking.doctorName}
                  </span>
                </div>

                {/* Right: Date */}
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">التاريخ واليوم:</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono block">
                    {confirmedBooking.date}
                  </span>
                </div>
                {/* Left: Time Slot */}
                <div className="text-left">
                  <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">الوقت المحدد:</span>
                  <span className="font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md inline-block text-xs sm:text-sm font-mono">
                    {confirmedBooking.timeSlot}
                  </span>
                </div>
              </div>

              {/* Barcode representation matching user screenshot */}
              <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                  <QrCode className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px]">أظهر هذه التذكرة عند وصولك للاستقبال</span>
                </div>
                {/* Clean Realistic Barcode SVG */}
                <svg className="w-48 h-12 text-slate-900" viewBox="0 0 160 40" fill="currentColor">
                  <rect x="0" y="0" width="3" height="40"/>
                  <rect x="5" y="0" width="1.5" height="40"/>
                  <rect x="9" y="0" width="4" height="40"/>
                  <rect x="15" y="0" width="2" height="40"/>
                  <rect x="19" y="0" width="5" height="40"/>
                  <rect x="26" y="0" width="1.5" height="40"/>
                  <rect x="30" y="0" width="3" height="40"/>
                  <rect x="35" y="0" width="2" height="40"/>
                  <rect x="39" y="0" width="6" height="40"/>
                  <rect x="47" y="0" width="1.5" height="40"/>
                  <rect x="51" y="0" width="4" height="40"/>
                  <rect x="57" y="0" width="2" height="40"/>
                  <rect x="61" y="0" width="5" height="40"/>
                  <rect x="68" y="0" width="1.5" height="40"/>
                  <rect x="72" y="0" width="3" height="40"/>
                  <rect x="77" y="0" width="2" height="40"/>
                  <rect x="81" y="0" width="6" height="40"/>
                  <rect x="89" y="0" width="1.5" height="40"/>
                  <rect x="93" y="0" width="4" height="40"/>
                  <rect x="99" y="0" width="2" height="40"/>
                  <rect x="103" y="0" width="5" height="40"/>
                  <rect x="110" y="0" width="1.5" height="40"/>
                  <rect x="114" y="0" width="3" height="40"/>
                  <rect x="119" y="0" width="2" height="40"/>
                  <rect x="123" y="0" width="6" height="40"/>
                  <rect x="131" y="0" width="1.5" height="40"/>
                  <rect x="135" y="0" width="4" height="40"/>
                  <rect x="141" y="0" width="2" height="40"/>
                  <rect x="145" y="0" width="5" height="40"/>
                  <rect x="152" y="0" width="2" height="40"/>
                  <rect x="156" y="0" width="4" height="40"/>
                </svg>
              </div>

            </div>

            {/* Bottom info strip */}
            <div className="bg-[#F8FAFC] p-3 text-center text-[10px] sm:text-[11px] text-slate-600 border-t border-slate-100 font-medium leading-relaxed">
              📍 سكة طنطا - بجوار العيادة الشعبيه - برج النوري | 📞 للاستفسار: 01026031803
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {/* Primary Green WhatsApp button */}
            <button
              onClick={() => {
                const whatsappMsg = `طلب تأكيد حجز موعد في مركز د. محمد فوزي الماسة لطب وزراعة الأسنان:%0A━━━━━━━━━━━━━━%0A🔖 كود الحجز: ${confirmedBooking.appointmentCode}%0A👤 اسم المريض: ${confirmedBooking.patientName}%0A📱 رقم الموبايل: ${confirmedBooking.patientPhone}%0A🦷 الخدمة: ${confirmedBooking.serviceName}%0A👨‍⚕️ الطبيب: ${confirmedBooking.doctorName}%0A📅 التاريخ: ${confirmedBooking.date}%0A⏰ الوقت: ${confirmedBooking.timeSlot}%0A📍 العنوان: المحلة الكبرى - سكة طنطا - برج النوري`;
                window.open(`https://wa.me/201026031803?text=${whatsappMsg}`, '_blank');
              }}
              className="w-full py-4 rounded-2xl bg-[#00A859] hover:bg-[#008f4c] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 active:scale-98 transition cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
              <span>إرسال تأكيد الحجز عبر واتساب</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setClientTab('appointments')}
                className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>عرض قائمة مواعيدي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setClientTab('home')}
                className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Medical Consent Modal for Signing Directly in Booking Flow */}
      {signingConsentApt && (
        <MedicalConsentViewModal
          appointment={signingConsentApt}
          onClose={() => setSigningConsentApt(null)}
        />
      )}

    </div>
  );
};
