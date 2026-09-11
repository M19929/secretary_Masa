import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Plus,
  ChevronLeft,
  Share2,
  CalendarCheck,
  Star,
  Edit3,
  Trash2,
  FileText,
  Receipt,
  PenTool
} from 'lucide-react';
import { motion } from 'motion/react';
import { PatientInvoiceViewModal } from '../common/PatientInvoiceViewModal';
import { MedicalConsentViewModal } from '../common/MedicalConsentViewModal';

export const ClientAppointments: React.FC = () => {
  const {
    appointments,
    rescheduleAppointment,
    cancelAppointment,
    rateAppointment,
    deleteDoctorReview,
    startBooking,
    setClientTab,
    currentUser,
    openAuthModal,
    openRatingModal,
    getBlockingConsentAppointment,
    showToast
  } = useClinic();

  const [activeSegment, setActiveSegment] = useState<'upcoming' | 'past'>('upcoming');
  const [filterByUser, setFilterByUser] = useState<boolean>(true);
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [viewTicketApt, setViewTicketApt] = useState<Appointment | null>(null);
  const [ratingModalApt, setRatingModalApt] = useState<Appointment | null>(null);
  const [selectedClientConsentApt, setSelectedClientConsentApt] = useState<Appointment | null>(null);
  const [selectedClientInvoiceApt, setSelectedClientInvoiceApt] = useState<Appointment | null>(null);
  const [starCount, setStarCount] = useState<number>(5);
  const [patientFeedback, setPatientFeedback] = useState<string>('');
  
  // Find any previous unconsented appointment for current user
  const blockingConsentApt = getBlockingConsentAppointment(currentUser?.phone, currentUser?.name);

  const handleBookingWithConsentGate = () => {
    if (blockingConsentApt) {
      setSelectedClientConsentApt(blockingConsentApt);
      showToast('يرجى توقيع الإقرار الطبي للموعد السابق أولاً لتتمكن من حجز كشف جديد ✍️');
      return;
    }
    startBooking();
  };
  
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [newDate, setNewDate] = useState<string>(getTomorrowStr);
  const [newTime, setNewTime] = useState<string>('05:00 م');
  const [confirmModalApt, setConfirmModalApt] = useState<Appointment | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const minRescheduleDate = getTomorrowStr();

  // Filter list by current user if requested and user is logged in
  const relevantAppointments = appointments.filter(a => {
    if (!filterByUser || !currentUser) return true;
    return a.patientPhone === currentUser.phone || a.patientName === currentUser.name;
  });

  const upcomingList = relevantAppointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const pastList = relevantAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const displayList = activeSegment === 'upcoming' ? upcomingList : pastList;

  const handleSaveReschedule = () => {
    if (!rescheduleModalApt) return;
    rescheduleAppointment(rescheduleModalApt.id, newDate, newTime);
    setRescheduleModalApt(null);
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>مؤكد</span>
          </span>
        );
      case 'arrived':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>وصل للمركز</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>في غرفة الكشف</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>قيد مراجعة الاستقبال</span>
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>مكتمل</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>ملغي</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      
      {/* Top Header matching Screenshot 5 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setClientTab('home')}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
          مواعيدي
        </h2>

        <div className="w-8"></div>
      </div>

      {/* Blocking Unsigned Consent Banner if patient has an appointment missing consent */}
      {blockingConsentApt && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-400/90 rounded-2xl p-4 text-xs shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-base shadow-xs">
              ⚠️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-slate-950 text-sm">
                  تنبيه إلزامي: توقيع الإقرار الطبي مطلوب للمتابعة
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                  الحجز الجديد معلّق
                </span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                لديك موعد كشف سابق (كود: <span className="font-mono font-bold text-amber-900">#{blockingConsentApt.appointmentCode}</span> - {blockingConsentApt.serviceName}) يتطلب توقيع الإقرار الطبي أولاً حتى يُسمح لك بحجز كشف جديد.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedClientConsentApt(blockingConsentApt)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            <PenTool className="w-4 h-4" />
            <span>توقيع الإقرار الطبي الآن ✍️</span>
          </button>
        </div>
      )}

      {/* Segmented Control: القادمة vs السابقة matching Screenshot 5 */}
      <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveSegment('upcoming')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeSegment === 'upcoming'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          القادمة ({upcomingList.length})
        </button>

        <button
          onClick={() => setActiveSegment('past')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeSegment === 'past'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          السابقة ({pastList.length})
        </button>
      </div>

      {/* Filter Toggle (My appointments vs All clinic demo appointments) */}
      {currentUser && (
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-slate-500 font-medium">عرض المواعيد:</span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px]">
            <button
              onClick={() => setFilterByUser(true)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filterByUser
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              حسابي ({currentUser?.name ? currentUser.name.split(' ')[0] : 'حسابي'})
            </button>
            <button
              onClick={() => setFilterByUser(false)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                !filterByUser
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              جميع المواعيد ({appointments.length})
            </button>
          </div>
        </div>
      )}

      {/* Appointment Cards */}
      <div className="flex flex-col gap-3">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              لا توجد مواعيد {activeSegment === 'upcoming' ? 'قادمة' : 'سابقة'} مسجلة
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              يمكنك حجز موعد جديد في أقل من دقيقة واختيار الطبيب والوقت المناسب لك.
            </p>
            <button
              onClick={handleBookingWithConsentGate}
              className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-sm transition cursor-pointer"
            >
              + حجز موعد الآن
            </button>
          </div>
        ) : (
          displayList.map((apt) => (
          <div
            key={apt.id}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3"
          >
            {/* Header & Status */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400">
                  {apt.appointmentCode}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {apt.serviceName}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{apt.doctorName}</span>
                </p>
              </div>

              {/* Status badge matching screenshot + Consent Indicator */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {getStatusBadge(apt.status)}
                {apt.consent ? (() => {
                  const isSigned = apt.consent.status === 'signed' || apt.consent.status === 'approved' || apt.consent.status === 'signed_by_patient' || Boolean(apt.consent.patientSignature);
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      isSigned
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-950 border-amber-300 animate-pulse'
                    }`}>
                      {apt.consent.status === 'approved' || apt.consent.status === 'signed'
                        ? '📋 إقرار موقع ومعتمد ✓'
                        : apt.consent.status === 'signed_by_patient'
                        ? '✍️ تم توقيعك (بانتظار الاعتماد)'
                        : '✍️ إقرار بانتظار التوقيع'}
                    </span>
                  );
                })() : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                    بدون إقرار
                  </span>
                )}
              </div>
            </div>

            {/* Date & Time display */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>{apt.date}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{apt.timeSlot}</span>
              </div>
            </div>

            {/* Medical Consent Document Card (Always clearly indicated for every appointment) */}
            {apt.consent ? (() => {
              const isSigned = apt.consent.status === 'signed' || apt.consent.status === 'approved' || apt.consent.status === 'signed_by_patient' || Boolean(apt.consent.patientSignature);
              return (
                <div className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs shadow-2xs ${
                  isSigned
                    ? 'bg-emerald-50/90 border-emerald-300'
                    : 'bg-amber-50/90 border-amber-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
                      isSigned ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-slate-900 text-xs sm:text-sm">إقرار وموافقة طبية مستنيرة (Consent)</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isSigned
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-200 text-amber-950'
                        }`}>
                          {apt.consent.status === 'approved' || apt.consent.status === 'signed'
                            ? 'موقع ومعتمد ✓'
                            : apt.consent.status === 'signed_by_patient'
                            ? 'تم توقيعك ✓'
                            : 'مطلوب توقيعك ✍️'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                        الإجراء: {apt.consent.procedureName} • {
                          isSigned
                            ? 'تم التوقيع بنجاح ومحفوظ بالسجل'
                            : 'يمكنك التوقيع باللمس أو بكتابة الكيبورد للموبايل'
                        }
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClientConsentApt(apt)}
                    className={`px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer shadow-xs shrink-0 ${
                      isSigned
                        ? 'bg-white hover:bg-emerald-100 border border-emerald-400 text-emerald-950'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                    }`}
                  >
                    {isSigned ? 'عرض الإقرار 📋' : 'توقيع الإقرار ✍️'}
                  </button>
                </div>
              );
            })() : null}

            {/* Official Patient Invoice Card (if issued) */}
            {apt.invoice && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900">فاتورة العلاج والكشف الرسمية</div>
                    <div className="text-[11px] text-emerald-800 font-bold">
                      #{apt.invoice.invoiceNumber} • الإجمالي: {apt.invoice.total} ج.م
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClientInvoiceApt(apt)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-xs"
                >
                  عرض الفاتورة 🧾
                </button>
              </div>
            )}

            {/* Rating Section */}
            {apt.rating ? (
              <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">تقييم المريض للزيارة:</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= apt.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    ))}
                    <span className="text-[11px] font-bold text-amber-900 mr-1">({apt.rating}/5)</span>
                  </div>
                </div>
                {apt.reviewComment && (
                  <p className="text-[11px] text-slate-600 bg-white/70 p-1.5 rounded-lg border border-amber-100 italic">
                    "{apt.reviewComment}"
                  </p>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 mt-1">
                  <button
                    type="button"
                    onClick={() => openRatingModal(apt)}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer bg-white/60 hover:bg-white px-2 py-0.5 rounded-md transition"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>تعديل التقييم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم؟')) {
                        deleteDoctorReview(apt.id);
                      }
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer hover:bg-rose-50 px-2 py-0.5 rounded-md transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف التقييم</span>
                  </button>
                </div>
              </div>
            ) : (
              (apt.status === 'completed' || activeSegment === 'past') && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openRatingModal(apt)}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                    <span>تقييم تجربة الكشف والطبيب ⭐</span>
                  </button>
                </div>
              )
            )}

            {/* Actions for upcoming appointments */}
            {activeSegment === 'upcoming' && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setViewTicketApt(apt)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>عرض بطاقة وتذكرة الحجز ⏳</span>
                </button>

                {apt.status !== 'cancelled' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setRescheduleModalApt(apt);
                        setNewDate(apt.date > minRescheduleDate ? apt.date : minRescheduleDate);
                        setNewTime(apt.timeSlot);
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>إعادة جدولة</span>
                    </button>

                    <button
                      onClick={() => setConfirmModalApt(apt)}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>إلغاء الموعد</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )))}

        {/* Empty / Next appointment prompt box matching Screenshot 5 */}
        <div className="bg-white p-6 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center gap-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <CalendarCheck className="w-7 h-7 text-slate-400" />
          </div>
          
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
              {displayList.length === 0 ? 'لا توجد مواعيد حالياً' : 'لا توجد مواعيد أخرى'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              احجز موعدك التالي الآن بسهولة وسرعة
            </p>
          </div>

          <button
            onClick={() => startBooking()}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>احجز موعد</span>
          </button>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalApt && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                إعادة جدولة الموعد ({rescheduleModalApt.serviceName})
              </h3>
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اختر التاريخ الجديد (بدءاً من الغد):</label>
                <input
                  type="date"
                  min={minRescheduleDate}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اختر الوقت الجديد:</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
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

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleSaveReschedule}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                تأكيد التعديل
              </button>
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TICKET MODAL (Exact design matching user screenshot) */}
      {viewTicketApt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="max-w-sm w-full my-auto flex flex-col gap-3 animate-in zoom-in-95 duration-150">
            {/* Ticket Card */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden text-slate-900 relative">
              {/* Top Amber / Orange Header with Icon and Titles */}
              <div className="bg-gradient-to-b from-[#FFA000] via-[#FF9100] to-[#FF8F00] p-6 pb-7 text-slate-950 text-center relative rounded-t-[32px]">
                <button
                  onClick={() => setViewTicketApt(null)}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
                <div className="w-14 h-14 rounded-full bg-[#0b1528] text-amber-400 flex items-center justify-center mx-auto mb-3.5 shadow-lg border border-amber-400/20">
                  <Clock className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 mb-1.5 flex items-center justify-center gap-1.5">
                  <span>طلب الحجز قيد المراجعة</span>
                  <span>⏳</span>
                </h3>
                <p className="text-xs font-bold text-slate-950/90 max-w-xs mx-auto leading-relaxed">
                  تم إرسال طلبك للاستقبال وقاعدة البيانات وسيتم مراجعته والتواصل معك
                </p>
              </div>

              {/* Ticket Body Details */}
              <div className="p-5 pt-4 flex flex-col gap-4 bg-white">
                {/* Status Alert */}
                <div className="bg-[#FEF9E7] border border-[#FDE68A] rounded-2xl p-2.5 px-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#78350F]">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>حالة الطلب:</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#FEF08A] text-[#713F12] border border-[#FACC15] shadow-xs">
                    ⏳ {viewTicketApt.status === 'confirmed' ? 'تم تأكيد الحجز بنجاح' : 'قيد مراجعة وتأكيد الاستقبال'}
                  </span>
                </div>
                
                {/* Booking Reference Code Dark Banner */}
                <div className="bg-[#0B1528] text-white py-3.5 px-4 rounded-2xl text-center flex flex-col items-center justify-center gap-1 shadow-md">
                  <span className="text-[11px] text-slate-400 font-bold tracking-wider">كود الحجز المرجعي</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#FACC15] tracking-widest font-mono">
                    {viewTicketApt.appointmentCode || 'MASA-1661'}
                  </span>
                </div>

                {/* 2-Column Details Grid */}
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs sm:text-sm border-b border-dashed border-slate-200 pb-4 pt-1">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">اسم المريض:</span>
                    <span className="font-black text-slate-900 text-sm sm:text-base leading-tight block truncate">
                      {viewTicketApt.patientName}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">رقم الموبايل:</span>
                    <span className="font-black text-slate-900 text-sm sm:text-base font-mono leading-tight block" dir="ltr">
                      {viewTicketApt.patientPhone}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">الخدمة:</span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug block">
                      {viewTicketApt.serviceName}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">الطبيب:</span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                      {viewTicketApt.doctorName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">التاريخ واليوم:</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono block">
                      {viewTicketApt.date}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">الوقت المحدد:</span>
                    <span className="font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md inline-block text-xs sm:text-sm font-mono">
                      {viewTicketApt.timeSlot}
                    </span>
                  </div>
                </div>

                {/* Barcode representation */}
                <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <span>أظهر هذه التذكرة عند وصولك للاستقبال</span>
                  </div>
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

            {/* Actions */}
            <button
              onClick={() => {
                const whatsappMsg = `طلب تأكيد حجز موعد في مركز د. محمد فوزي الماسة لطب وزراعة الأسنان:%0A━━━━━━━━━━━━━━%0A🔖 كود الحجز: ${viewTicketApt.appointmentCode}%0A👤 اسم المريض: ${viewTicketApt.patientName}%0A📱 رقم الموبايل: ${viewTicketApt.patientPhone}%0A🦷 الخدمة: ${viewTicketApt.serviceName}%0A👨‍⚕️ الطبيب: ${viewTicketApt.doctorName}%0A📅 التاريخ: ${viewTicketApt.date}%0A⏰ الوقت: ${viewTicketApt.timeSlot}%0A📍 العنوان: المحلة الكبرى - سكة طنطا - برج النوري`;
                window.open(`https://wa.me/201026031803?text=${whatsappMsg}`, '_blank');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#00A859] hover:bg-[#008f4c] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 active:scale-98 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>إرسال تأكيد الحجز عبر واتساب</span>
            </button>

            <button
              onClick={() => setViewTicketApt(null)}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs text-center cursor-pointer"
            >
              إغلاق التذكرة
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {confirmModalApt && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">إلغاء الموعد</h3>
                <p className="text-xs text-slate-500">تأكيد إلغاء الحجز في المركز</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              هل أنت متأكد من رغبتك في إلغاء موعد <strong className="text-slate-950">({confirmModalApt.serviceName})</strong> المحدد يوم <strong className="text-slate-950">{confirmModalApt.date}</strong> الساعة <strong className="text-slate-950">{confirmModalApt.timeSlot}</strong>؟
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  cancelAppointment(confirmModalApt.id);
                  setConfirmModalApt(null);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                نعم، إلغاء الموعد
              </button>
              <button
                type="button"
                onClick={() => setConfirmModalApt(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating & Review Modal */}
      {ratingModalApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-slate-100 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>تقييم تجربة الكشف مع الطبيب</span>
              </h3>
              <button
                type="button"
                onClick={() => setRatingModalApt(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2">
              <p className="text-xs text-slate-500 mb-1">الخدمة: {ratingModalApt.serviceName}</p>
              <p className="text-sm font-bold text-slate-900 mb-4">{ratingModalApt.doctorName}</p>

              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarCount(star)}
                    className="p-1 transition transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= starCount
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-900 rounded-full font-bold text-xs border border-amber-200 mb-4">
                {starCount === 5 && 'ممتاز جداً 🌟🌟🌟🌟🌟'}
                {starCount === 4 && 'جيد جداً ⭐⭐⭐⭐'}
                {starCount === 3 && 'جيد ⭐⭐⭐'}
                {starCount === 2 && 'مقبول ⭐⭐'}
                {starCount === 1 && 'يحتاج لتحسين ⭐'}
              </span>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                رأيك أو تعليقك (اختياري):
              </label>
              <textarea
                value={patientFeedback}
                onChange={(e) => setPatientFeedback(e.target.value)}
                placeholder="اكتب تجربتك مع الطبيب والمركز..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  rateAppointment(ratingModalApt.id, ratingModalApt.doctorId, starCount, patientFeedback);
                  setRatingModalApt(null);
                  setPatientFeedback('');
                  setStarCount(5);
                }}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer shadow-xs"
              >
                إرسال التقييم
              </button>
              <button
                type="button"
                onClick={() => setRatingModalApt(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT INVOICE VIEW & PRINT MODAL */}
      {selectedClientInvoiceApt && (
        <PatientInvoiceViewModal
          appointment={selectedClientInvoiceApt}
          onClose={() => setSelectedClientInvoiceApt(null)}
        />
      )}

      {/* MEDICAL CONSENT VIEW & PRINT MODAL */}
      {selectedClientConsentApt && (
        <MedicalConsentViewModal
          appointment={selectedClientConsentApt}
          onClose={() => setSelectedClientConsentApt(null)}
        />
      )}

    </div>
  );
};
