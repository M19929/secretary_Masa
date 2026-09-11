import React, { useState } from 'react';
import {
  X,
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Printer,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Receipt,
  FileText,
  Smartphone,
  Wallet,
  Building,
  User,
  Edit3,
  Check
} from 'lucide-react';
import { Appointment, PaymentRecord, PaymentMethod } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { normalizeNumberInput, parseNumberSafe } from '../../utils/numberUtils';

interface InstallmentManagementModalProps {
  appointment: Appointment;
  onClose: () => void;
  onPrintStatement?: (apt: Appointment) => void;
}

export const InstallmentManagementModal: React.FC<InstallmentManagementModalProps> = ({
  appointment,
  onClose,
  onPrintStatement
}) => {
  const { recordPayment, updateAppointmentPayment, deletePaymentRecord, showToast } = useClinic();

  // Financial calculations
  const totalAmount = appointment.totalAmount !== undefined ? Number(appointment.totalAmount) : Number(appointment.price || 0);
  const paidAmount = appointment.paidAmount !== undefined ? Number(appointment.paidAmount) : (appointment.paymentStatus === 'paid' ? totalAmount : 0);
  const remainingAmount = appointment.remainingAmount !== undefined ? Number(appointment.remainingAmount) : Math.max(0, totalAmount - paidAmount);
  const isPaidInFull = remainingAmount <= 0;
  const paymentPercentage = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : (isPaidInFull ? 100 : 0);

  // New Payment Form State
  const [newAmount, setNewAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentTime, setPaymentTime] = useState<string>(
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  );
  const [paymentNote, setPaymentNote] = useState<string>(
    appointment.serviceName?.includes('تقويم') ? 'قسط جلسة شد التقويم' : 'دفعة سداد نقدية'
  );
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Edit Total Plan Amount State
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [editTotalInput, setEditTotalInput] = useState<string>(totalAmount.toString());

  // Edit Installment Plan Note State
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [installmentNoteInput, setInstallmentNoteInput] = useState<string>(
    appointment.installmentNote || (appointment.serviceName?.includes('تقويم') ? 'خطة علاج تقويم أسنان - أقساط شهرية متتالية' : '')
  );

  // Quick preset amount buttons
  const applyQuickAmount = (amount: number) => {
    setNewAmount(amount.toString());
  };

  const handleSaveTotalAmount = () => {
    const parsedTotal = parseNumberSafe(editTotalInput, -1);
    if (parsedTotal < 0) {
      showToast('يرجى إدخال مبلغ إجمالي صحيح بالأرقام');
      return;
    }
    const newRemaining = Math.max(0, parsedTotal - paidAmount);
    const newStatus = newRemaining <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid');

    updateAppointmentPayment(appointment.id, {
      totalAmount: parsedTotal,
      remainingAmount: newRemaining,
      paymentStatus: newStatus
    });
    setIsEditingTotal(false);
    showToast(`تم تعديل إجمالي خطة العلاج إلى ${parsedTotal.toLocaleString()} ج.م`);
  };

  const handleSaveInstallmentNote = () => {
    updateAppointmentPayment(appointment.id, {
      installmentNote: installmentNoteInput.trim(),
      isInstallment: true
    });
    setIsEditingNote(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseNumberSafe(newAmount, 0);
    if (amountNum <= 0) {
      showToast('يرجى إدخال مبلغ صحيح للدفعة بالأرقام');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      recordPayment(appointment.id, {
        amount: amountNum,
        date: paymentDate,
        time: paymentTime,
        paymentMethod,
        note: paymentNote.trim() || 'دفعة قسط بالاستقبال',
        recordedBy: 'السكرتارية والاستقبال',
        receiptNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`
      });

      // Reset form
      setNewAmount('');
      setPaymentNote(appointment.serviceName?.includes('تقويم') ? 'قسط جلسة شد الأسلاك' : 'دفعة سداد نقدية');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // WhatsApp Installment Reminder with full account breakdown
  const sendWhatsAppInstallmentReminder = () => {
    const text = `مرحباً بك ${appointment.patientName} 🌸،%0Aتحية طيبة من مركز د. محمد فوزي الماسة لطب وجراحة وتجميل الأسنان.%0Aنحيطكم علماً ببيان حساب خطة علاجكم (${appointment.serviceName}):%0A%0A💰 إجمالي التكلفة المتفق عليها: ${totalAmount.toLocaleString()} ج.م%0A✅ المسدد حتى الآن: ${paidAmount.toLocaleString()} ج.م%0A⚠️ المبلغ المتبقي للسداد: ${remainingAmount.toLocaleString()} ج.م%0A%0A📅 موعد جلستكم القادمة: ${appointment.date} (${appointment.timeSlot})%0A👨‍⚕️ الطبيب المعالج: ${appointment.doctorName}%0Aرقم الحجز / الملف: ${appointment.appointmentCode}%0A📍 العنوان: سكة طنطا - بجوار العيادة الشعبيه - برج النوري - المحلة الكبرى.%0Aشاكرين لثقتكم الغالية بمركز الماسة 💎`;
    const cleanPhone = appointment.patientPhone.replace(/[^0-9]/g, '');
    const internationalPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    window.open(`https://wa.me/${internationalPhone}?text=${text}`, '_blank');
  };

  const paymentMethodLabels: Record<PaymentMethod, { label: string; icon: any }> = {
    cash: { label: 'نقدي (كاش)', icon: DollarSign },
    instapay: { label: 'إنستاباي (InstaPay)', icon: Smartphone },
    vodafone_cash: { label: 'فودافون كاش', icon: Wallet },
    visa: { label: 'فيزا / بطاقة بنكية', icon: CreditCard },
    bank_transfer: { label: 'تحويل بنكي', icon: Building }
  };

  return (
    <div
      id="installment-management-modal"
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  إدارة الحساب المالي وأقساط المريض
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {appointment.appointmentCode}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {appointment.patientName} • {appointment.patientPhone} • {appointment.serviceName}
              </p>
            </div>
          </div>

          <button
            id="close-installment-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* Patient Info & Treatment Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">المريض والطبيب المعالج:</span>
                <span className="text-xs font-bold text-slate-900">
                  {appointment.patientName} — د. {appointment.doctorName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="send-whatsapp-installment-btn"
                onClick={sendWhatsAppInstallmentReminder}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="إرسال كشف حساب ومطالبة عبر واتساب"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>إرسال كشف واتساب 📲</span>
              </button>

              {onPrintStatement && (
                <button
                  id="print-statement-btn"
                  onClick={() => onPrintStatement(appointment)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  title="طباعة كشف حساب معتمد"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة كشف حساب 🖨️</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Prominent Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* 1. Total Treatment Contract Amount */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">إجمالي الخطة / التكلفة</span>
                <button
                  onClick={() => {
                    setEditTotalInput(totalAmount.toString());
                    setIsEditingTotal(!isEditingTotal);
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 underline cursor-pointer"
                  title="تعديل إجمالي التكلفة"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>تعديل</span>
                </button>
              </div>

              {isEditingTotal ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={editTotalInput}
                      onChange={(e) => setEditTotalInput(normalizeNumberInput(e.target.value))}
                      placeholder="إجمالي المبلغ"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-sm font-bold font-mono focus:outline-hidden focus:border-amber-500 pl-8 text-left"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                      ج.م
                    </span>
                  </div>
                  <button
                    onClick={handleSaveTotalAmount}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setIsEditingTotal(false)}
                    className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white font-mono">
                    {totalAmount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">ج.م</span>
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-2 block">
                {appointment.serviceName}
              </span>
            </div>

            {/* 2. Total Paid Amount */}
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-emerald-800">
                <span className="font-bold">المسدد حتى الآن</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                  {appointment.paymentHistory?.length || (paidAmount > 0 ? 1 : 0)} دفعات
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-900 font-mono">
                  {paidAmount.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-700 font-bold">ج.م</span>
              </div>
              <span className="text-[10px] text-emerald-700 mt-2 block">
                تم تحصيل {paymentPercentage}% من إجمالي العلاج
              </span>
            </div>

            {/* 3. Remaining Balance (KEY REQUIREMENT: هل باقي مبلغ ولا لا) */}
            <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
              isPaidInFull
                ? 'bg-blue-50 text-blue-950 border-blue-200'
                : 'bg-rose-50 text-rose-950 border-rose-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">
                  {isPaidInFull ? 'المبلغ المتبقي' : '⚠️ المبلغ المتبقي للسداد'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isPaidInFull ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                }`}>
                  {isPaidInFull ? 'خالص بالكامل ✓' : 'عليه أقساط متبقية'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-2xl font-black font-mono ${
                  isPaidInFull ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {remainingAmount.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-600">ج.م</span>
              </div>
              <span className="text-[10px] text-slate-600 mt-2 block">
                {isPaidInFull ? 'لا توجد أي مبالغ مستحقة على المريض' : 'مستحق السداد على دفعات التقويم'}
              </span>
            </div>

          </div>

          {/* Payment Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>نسبة سداد خطة العلاج:</span>
              <span className="font-mono text-emerald-700">{paymentPercentage}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isPaidInFull ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: `${paymentPercentage}%` }}
              />
            </div>
          </div>

          {/* Form: Record New Payment / Installment */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">
                    تسجيل واستلام دفعة قسط جديدة للمريض
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    أدخل المبلغ المستلم وسيتم خصمه فوراً من المتبقي وتحديث سجل حساب المريض
                  </p>
                </div>
              </div>

              {remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setNewAmount(remainingAmount.toString())}
                  className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition cursor-pointer"
                >
                  سداد كامل المتبقي ({remainingAmount} ج.م)
                </button>
              )}
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Amount */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المبلغ المدفوع (ج.م) *
                </label>
                <div className="relative">
                  <input
                    id="installment-amount-input"
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    required
                    placeholder="مثلاً: 500"
                    value={newAmount}
                    onChange={(e) => setNewAmount(normalizeNumberInput(e.target.value))}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-sm font-black font-mono text-slate-900 focus:outline-hidden focus:border-amber-500 pl-10 text-left"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    ج.م
                  </span>
                </div>
                {newAmount && parseNumberSafe(newAmount, 0) > 0 && (
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">
                    المبلغ المحدد: {parseNumberSafe(newAmount, 0).toLocaleString()} جنيه
                  </p>
                )}

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[200, 300, 500, 800, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => applyQuickAmount(amt)}
                      className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[10px] font-bold hover:bg-amber-100 transition cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  طريقة الدفع في العيادة *
                </label>
                <select
                  id="installment-method-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="cash">نقدي (كاش بالاستقبال)</option>
                  <option value="instapay">إنستاباي (InstaPay)</option>
                  <option value="vodafone_cash">فودافون كاش</option>
                  <option value="card">فيزا / ماستركارد (POS)</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                </select>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">التاريخ</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الوقت</label>
                    <input
                      type="text"
                      value={paymentTime}
                      onChange={(e) => setPaymentTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Note / Statement */}
              <div className="sm:col-span-1 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البيان / سبب الدفعة
                  </label>
                  <input
                    id="installment-note-input"
                    type="text"
                    placeholder="مثال: قسط جلسة تغيير الأسلاك لشهر سبتمبر"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <button
                  id="submit-installment-btn"
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="mt-3 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>تسجيل الدفعة وإصدار إيصال 💾</span>
                </button>
              </div>

            </form>
          </div>

          {/* Payment History Table (سجل الدفعات والأقساط السابقة) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                <h4 className="font-black text-sm text-slate-900">
                  سجل الدفعات والأقساط المستلمة من المريض ({appointment.paymentHistory?.length || 0})
                </h4>
              </div>
            </div>

            {!appointment.paymentHistory || appointment.paymentHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                لم يتم تسجيل أي دفعات سابقة لهذا الحجز حتى الآن. يمكنك تسجيل الدفعة الأولى من النموذج بالأعلى.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">رقم الإيصال</th>
                      <th className="py-2.5 px-3">التاريخ والوقت</th>
                      <th className="py-2.5 px-3">المبلغ المستلم</th>
                      <th className="py-2.5 px-3">طريقة الدفع</th>
                      <th className="py-2.5 px-3">البيان / الملاحظة</th>
                      <th className="py-2.5 px-3">المستلم</th>
                      <th className="py-2.5 px-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointment.paymentHistory.map((rec) => {
                      const MethodIcon = paymentMethodLabels[rec.paymentMethod]?.icon || DollarSign;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-800">
                            {rec.receiptNumber || 'REC-AUTO'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <span>{rec.date}</span>{' '}
                            <span className="text-[10px] text-slate-400 font-mono">({rec.time})</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-black text-emerald-700">
                            {rec.amount.toLocaleString()} ج.م
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              <MethodIcon className="w-3 h-3 text-slate-500" />
                              <span>{paymentMethodLabels[rec.paymentMethod]?.label || rec.paymentMethod}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">
                            {rec.note || 'دفعة قسط بالاستقبال'}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500">
                            {rec.recordedBy || 'السكرتارية'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف قيد الدفعة بقيمة ${rec.amount} ج.م؟ سيتم إعادة احتساب المبلغ المتبقي.`)) {
                                  deletePaymentRecord(appointment.id, rec.id);
                                }
                              }}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="حذف هذا القيد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Treatment & Installment Plan Notes */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                ملاحظات نظام الأقساط واتفاقية خطة العلاج:
              </span>
              <button
                onClick={() => setIsEditingNote(!isEditingNote)}
                className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingNote ? 'إغلاق التعديل' : 'تعديل الاتفاقية'}</span>
              </button>
            </div>

            {isEditingNote ? (
              <div className="flex flex-col gap-2">
                <textarea
                  rows={2}
                  value={installmentNoteInput}
                  onChange={(e) => setInstallmentNoteInput(e.target.value)}
                  placeholder="مثال: مدة التقويم المتوقعة 12 شهر، يتم دفع 800 ج.م شهرياً عند كل جلسة تبديل أسلاك"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleSaveInstallmentNote}
                  className="self-start px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  حفظ الملاحظة
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                {appointment.installmentNote || 'لم يتم تسجيل ملاحظات خاصة بالأقساط. ينطبق نظام أقساط جلسات التقويم الشهرية الافتراضي.'}
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 font-bold flex items-center gap-2">
            <span>الحالة الحالية:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black ${
              isPaidInFull ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isPaidInFull ? 'خالص بالكامل (0 ج.م متبقي)' : `متبقي ${remainingAmount.toLocaleString()} ج.م`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
