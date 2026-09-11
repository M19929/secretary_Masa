import React, { useState } from 'react';
import { Appointment, PatientInvoice, InvoiceItem, PaymentMethod } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';
import { printElement } from '../../utils/printHelper';
import {
  Receipt,
  Printer,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Send,
  CreditCard,
  Building2,
  DollarSign,
  Calendar,
  User,
  Stethoscope,
  Sparkles,
  PenTool
} from 'lucide-react';

interface PatientInvoiceModalProps {
  appointment: Appointment;
  onClose: () => void;
  defaultAutoPrint?: boolean;
}

export const PatientInvoiceModal: React.FC<PatientInvoiceModalProps> = ({
  appointment,
  onClose,
  defaultAutoPrint = false
}) => {
  const { issuePatientInvoice, clinicInfo, showToast } = useClinic();

  const existingInvoice = appointment.invoice;

  // Generate an invoice number if new
  const initialInvoiceNumber =
    existingInvoice?.invoiceNumber ||
    `INV-${new Date().getFullYear()}-${appointment.appointmentCode.replace(/[^a-zA-Z0-9]/g, '') || Date.now().toString().slice(-4)}`;

  const [invoiceNumber] = useState(initialInvoiceNumber);
  const [patientName] = useState(existingInvoice?.patientName || appointment.patientName);
  const [patientPhone] = useState(existingInvoice?.patientPhone || appointment.patientPhone);
  const [doctorName, setDoctorName] = useState(existingInvoice?.doctorName || appointment.doctorName || 'د. محمد فوزي');
  const [date] = useState(existingInvoice?.date || appointment.date);
  const [time] = useState(existingInvoice?.time || appointment.timeSlot);

  // Format mode: classic clinic receipt / old invoice format vs detailed table
  const [invoiceLayout, setInvoiceLayout] = useState<'classic_receipt' | 'table_detailed'>('classic_receipt');
  
  // Optional digital signature
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [cashierSignature, setCashierSignature] = useState<string | undefined>(undefined);

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>(
    existingInvoice?.items || [
      {
        id: '1',
        description: appointment.serviceName || 'كشف واستشارة طبية متخصصة',
        quantity: 1,
        unitPrice: appointment.price || 0,
        total: appointment.price || 0
      }
    ]
  );

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  const [discount, setDiscount] = useState<number>(existingInvoice?.discount || 0);
  const [tax] = useState<number>(existingInvoice?.tax || 0);
  const [paidAmount, setPaidAmount] = useState<number>(
    existingInvoice?.paidAmount !== undefined ? existingInvoice.paidAmount : (appointment.paidAmount || appointment.price || 0)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    existingInvoice?.paymentMethod || 'cash'
  );
  const [notes, setNotes] = useState(existingInvoice?.notes || 'شكراً لثقتكم بمركز د. محمد فوزي الماسة لطب وزراعة الأسنان');
  const [autoPrintOnSave, setAutoPrintOnSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const total = Math.max(0, subtotal - discount + tax);
  const remainingAmount = Math.max(0, total - paidAmount);

  const handleAddItem = () => {
    if (!newItemDesc.trim() || newItemPrice < 0) {
      showToast('يرجى كتابة اسم البند والسعر بصورة صحيحة');
      return;
    }
    const itemTotal = newItemQty * newItemPrice;
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: newItemDesc.trim(),
      quantity: newItemQty,
      unitPrice: newItemPrice,
      total: itemTotal
    };
    setItems([...items, newItem]);
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      showToast('يجب أن تحتوي الفاتورة على بند واحد على الأقل');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleIssueInvoice = async (triggerDirectPrint: boolean = autoPrintOnSave) => {
    setIsSaving(true);
    try {
      const invoiceObj: PatientInvoice = {
        invoiceNumber,
        appointmentId: appointment.id,
        appointmentCode: appointment.appointmentCode,
        patientName,
        patientPhone,
        doctorName,
        date,
        time,
        items,
        subtotal,
        discount,
        tax,
        total,
        paidAmount,
        remainingAmount,
        paymentMethod,
        notes,
        issuedAt: existingInvoice?.issuedAt || new Date().toISOString(),
        issuedBy: 'موظف الاستقبال / السكرتارية',
        clinicStamp: true
      };

      await issuePatientInvoice(appointment.id, invoiceObj, triggerDirectPrint);
      setIsSaving(false);
      if (!triggerDirectPrint) {
        onClose();
      }
    } catch (e) {
      setIsSaving(false);
      showToast('حدث خطأ أثناء حفظ الفاتورة');
    }
  };

  const handleManualPrint = (preferPopup: boolean = false) => {
    showToast(preferPopup ? 'جارٍ فتح الفاتورة في نافذة طباعة مخصصة 🖨️...' : 'جارٍ إرسال الفاتورة للطابعة 🖨️...');
    printElement('printable-patient-invoice-paper', {
      title: `فاتورة كشف - ${appointment.patientName}`,
      preferPopup
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full print:m-0">
        
        {/* Header - Screen only */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-slate-50 to-amber-500/10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  فاتورة وسند قبض كشف المريض
                </h3>
                {existingInvoice ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    معتمدة ومسجلة ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    سند قبض وفاتورة جديدة
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                المريض: {appointment.patientName} | كود الحجز: {appointment.appointmentCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle classic vs detailed table layout */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setInvoiceLayout('classic_receipt')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  invoiceLayout === 'classic_receipt'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="نمط سند القبض وفاتورة العيادة المعتمدة"
              >
                🧾 نمط سند القبض الأصلي
              </button>
              <button
                type="button"
                onClick={() => setInvoiceLayout('table_detailed')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  invoiceLayout === 'table_detailed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="نمط جدول البنود المحاسبي"
              >
                📊 جدول البنود
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 print:overflow-visible print:p-0">
          
          {/* ============================================================== */}
          {/* PRINTABLE INVOICE RECEIPT (Optimized for Screen & Clinic Printer) */}
          {/* ============================================================== */}
          <div id="printable-patient-invoice-paper" className="border border-slate-300 rounded-2xl p-6 sm:p-8 bg-white shadow-xs print:border-none print:p-6 print:w-full">
            
            {/* Clinic Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl border-2 border-amber-400 shadow-sm print:border-black">
                  💎
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-950 font-['Cairo']">
                    {clinicInfo.name || 'مركز د. محمد فوزي الماسة لطب وزراعة الأسنان'}
                  </h1>
                  <p className="text-xs text-amber-900 font-bold">
                    سند قبض وفاتورة كشف واستقبال مريض معتمدة
                  </p>
                  <p className="text-[11px] text-slate-600 font-sans">
                    {clinicInfo.address || 'المحلة الكبرى - ميدان الشون - مقابل حلواني هبة - أعلى معمل الذرة'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono" dir="ltr">
                    هاتف: {clinicInfo.phones?.[0] || clinicInfo.phoneDisplay || '01101722551'} - {clinicInfo.phones?.[1] || '0402218878'}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-amber-800 font-mono" dir="ltr">
                  #{invoiceNumber}
                </div>
                <div className="text-xs text-slate-600">التاريخ: {date}</div>
                <div className="text-xs text-slate-600">الوقت: {time}</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  معتمدة ومسجلة ✓
                </span>
              </div>
            </div>

            {/* CLASSIC CLINIC VOUCHER LAYOUT */}
            {invoiceLayout === 'classic_receipt' ? (
              <div className="space-y-4">
                
                {/* Details Grid (Like the classic receipt) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs sm:text-sm print:bg-transparent print:border-slate-400">
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">رقم الحجز / السند:</span>
                    <span className="font-bold text-amber-800 font-mono">{appointment.appointmentCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">اسم المريض:</span>
                    <span className="font-black text-slate-950 font-['Cairo']">{patientName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">رقم الهاتف:</span>
                    <span className="font-bold font-mono" dir="ltr">{patientPhone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">الطبيب المعالج:</span>
                    <span className="font-bold text-slate-900 font-['Cairo']">{doctorName}</span>
                  </div>
                  <div className="flex justify-between py-1 sm:col-span-2">
                    <span className="text-slate-500">بيان الخدمة / الإجراء الطبي:</span>
                    <span className="font-bold text-slate-950 font-['Cairo']">
                      {items.map(i => i.description).join(' + ')}
                    </span>
                  </div>
                </div>

                {/* Multiple Items list if more than 1 */}
                {items.length > 1 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-2">تفصيل الخدمات الإضافية:</span>
                    <div className="divide-y divide-slate-100">
                      {items.map((it, idx) => (
                        <div key={it.id || idx} className="py-1.5 flex justify-between items-center">
                          <span>{it.description} {it.quantity > 1 ? `(×${it.quantity})` : ''}</span>
                          <span className="font-bold">{it.total} ج.م</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Breakdown (سند القبض المالي القديم) */}
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-900 text-xs sm:text-sm space-y-2 print:bg-transparent">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>قيمة الكشف أو العلاج:</span>
                    <span className="font-bold text-slate-950">{subtotal} ج.م</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-rose-600 font-bold">
                      <span>الخصم الممنوح:</span>
                      <span>- {discount} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t-2 border-slate-900 pt-2 text-base sm:text-lg font-black text-slate-950">
                    <span>صافي المبلغ المطلوب:</span>
                    <span className="text-emerald-700">{total} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-slate-300 pt-2 text-slate-800">
                    <span className="font-bold">المبلغ المسدد / المقبوض:</span>
                    <span className="font-black text-slate-950 text-sm sm:text-base">{paidAmount} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-bold">
                    <span>المبلغ المتبقي:</span>
                    <span className={`font-black ${remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {remainingAmount > 0 ? `${remainingAmount} ج.م` : 'خالص السداد بالكامل ✓'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-slate-300 pt-2 text-xs">
                    <span className="text-slate-600">طريقة السداد:</span>
                    <span className="font-bold text-slate-900 px-2 py-0.5 bg-white rounded-md border border-slate-300">
                      {paymentMethod === 'cash' ? 'نقداً (Cash)' :
                       paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' :
                       paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                       paymentMethod === 'visa' ? 'بطاقة بنكية / فيزا' : 'تحويل بنكي'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">حالة الفاتورة والسداد:</span>
                    <span className={`font-black px-2.5 py-0.5 rounded-full text-xs ${
                      paidAmount >= total
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {paidAmount >= total ? 'مدفوع بالكامل وخالص الحساب ✓' : `متبقي حساب (${remainingAmount} ج.م)`}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              /* DETAILED TABLE LAYOUT */
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6 print:bg-transparent print:border-slate-400">
                  <div>
                    <span className="text-slate-500 block">اسم المريض:</span>
                    <span className="font-bold text-slate-900 text-sm">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">رقم الهاتف:</span>
                    <span className="font-bold text-slate-900 text-sm" dir="ltr">{patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الطبيب المعالج:</span>
                    <span className="font-bold text-slate-900">{doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">كود الحجز:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block print:border-none print:p-0">
                      {appointment.appointmentCode}
                    </span>
                  </div>
                </div>

                {/* Line items Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-900 text-slate-900">
                        <th className="py-2.5 px-2 font-black">#</th>
                        <th className="py-2.5 px-3 font-black">بيان الخدمة / الإجراء الطبي</th>
                        <th className="py-2.5 px-3 font-black text-center">الكمية</th>
                        <th className="py-2.5 px-3 font-black text-center">سعر الوحدة</th>
                        <th className="py-2.5 px-3 font-black text-left">الإجمالي</th>
                        <th className="py-2.5 px-2 print:hidden w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{item.description}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.unitPrice} ج.م</td>
                          <td className="py-2.5 px-3 text-left font-black text-slate-950">{item.total} ج.م</td>
                          <td className="py-2.5 px-2 print:hidden text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="حذف البند"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary calculations */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t-2 border-slate-900 pt-4">
                  <div className="flex-1 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600">طريقة الدفع:</span>
                      <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-300">
                        {paymentMethod === 'cash' ? 'نقداً (Cash)' :
                         paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' :
                         paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                         paymentMethod === 'visa' ? 'بطاقة بنكية / فيزا' : 'تحويل بنكي'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 print:bg-transparent print:border-slate-800">
                    <div className="flex justify-between text-slate-600">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold">{subtotal} ج.م</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>الخصم:</span>
                        <span>- {discount} ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-black text-slate-950">
                      <span>إجمالي الفاتورة:</span>
                      <span className="text-base text-emerald-700">{total} ج.م</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-300 pt-2 text-slate-800">
                      <span className="font-bold">المبلغ المسدد:</span>
                      <span className="font-black text-slate-900">{paidAmount} ج.م</span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold">
                      <span>المبلغ المتبقي:</span>
                      <span className={`font-black ${remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {remainingAmount > 0 ? `${remainingAmount} ج.م` : 'خالص السداد بالكامل ✓'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes if any */}
            {notes && (
              <p className="mt-4 text-slate-500 text-[11px] leading-relaxed italic border-t border-slate-200 pt-2">
                ملاحظات: {notes}
              </p>
            )}

            {/* Stamp & Signatures Area */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-4">
              
              {/* Official Stamp */}
              <div className="flex items-center gap-3">
                <div className="w-18 h-18 rounded-full border-2 border-dashed border-emerald-600 text-emerald-800 font-black text-[9px] flex flex-col items-center justify-center rotate-[-4deg] bg-emerald-50/40 print:bg-transparent">
                  <span>مركز الماسة</span>
                  <span>فاتورة معتمدة</span>
                  <span>PAID / VERIFIED</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold text-slate-700">خاتم المركز والاعتماد المالي</p>
                  <p>المحلة الكبرى - ميدان الشون</p>
                </div>
              </div>

              {/* Digital signature if signed */}
              {cashierSignature && (
                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-emerald-200">
                  <img src={cashierSignature} alt="توقيع الاستقبال" className="max-h-12 w-auto object-contain" />
                  <span className="text-[9px] text-emerald-700 font-bold">توقيع معتمد إلكترونياً ✓</span>
                </div>
              )}

              {/* Signatures placeholders */}
              <div className="text-left text-[11px] text-slate-600 space-y-1">
                <p>توقيع مسؤول الخزينة: ........................</p>
                <p>توقيع المستلم / المريض: ........................</p>
              </div>
            </div>

            {/* Print Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 flex justify-between">
              <span>تاريخ الطباعة: {new Date().toLocaleString('ar-EG')}</span>
              <span>مركز د. محمد فوزي الماسة لطب وزراعة الأسنان - المحلة الكبرى</span>
            </div>

          </div>

          {/* ============================================================== */}
          {/* SECRETARY CONTROLS (Hidden during printing) */}
          {/* ============================================================== */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 print:hidden space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>تعديل حسابات وبيانات الفاتورة وسند القبض:</span>
            </h4>

            {/* Quick Price and Paid presets */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">اسم الطبيب المعالج:</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">الخصم الممنوح (ج.م):</label>
                <input
                  type="number"
                  min={0}
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="0 ج.م"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-600 font-bold">المبلغ المسدد (ج.م):</label>
                  <button
                    type="button"
                    onClick={() => setPaidAmount(total)}
                    className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    [سداد كامل]
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">طريقة السداد:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="cash">نقداً (كاش)</option>
                  <option value="instapay">إنستاباي (InstaPay)</option>
                  <option value="vodafone_cash">فودافون كاش</option>
                  <option value="visa">بطاقة بنكية / فيزا</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                </select>
              </div>
            </div>

            {/* Quick Add item if needed */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">إضافة بند أو علاج إضافي للسند:</label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <input
                  type="text"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="اسم الخدمة (مثال: حشو ليزر، أشعة، علاج عصب...)"
                  className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  min={1}
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Math.max(1, Number(e.target.value) || 1))}
                  placeholder="الكمية"
                  className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={newItemPrice || ''}
                    onChange={(e) => setNewItemPrice(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="السعر ج.م"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Digital Signature on Invoice Toggle */}
            <div className="flex items-center justify-between p-3 bg-amber-50/70 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-950">
                  إضافة توقيع إلكتروني حي للفاتورة (توقيع الشاشة)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSignaturePad(!showSignaturePad)}
                className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 transition cursor-pointer"
              >
                {showSignaturePad ? 'إخفاء لوحة التوقيع' : 'فتح لوحة التوقيع ✍️'}
              </button>
            </div>

            {showSignaturePad && (
              <div className="p-3 bg-white rounded-xl border border-amber-300">
                <DigitalSignaturePad
                  initialSignature={cashierSignature}
                  onSaveSignature={(sigUrl) => {
                    setCashierSignature(sigUrl);
                    showToast('تم اعتماد التوقيع الإلكتروني على الفاتورة ✓');
                  }}
                  onClearSignature={() => setCashierSignature(undefined)}
                />
              </div>
            )}

            {/* Direct Printer trigger toggle */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950">
                  تحويل الفاتورة تلقائياً لطابعة العيادة فور الضغط على إصدار
                </span>
              </div>
              <input
                type="checkbox"
                id="autoPrintCheckbox"
                checked={autoPrintOnSave}
                onChange={(e) => setAutoPrintOnSave(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Footer Actions - Screen only */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleManualPrint(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة نسخة لطابعة العيادة 🖨️</span>
            </button>
            <button
              type="button"
              onClick={() => handleManualPrint(true)}
              className="px-3 py-2.5 rounded-xl bg-amber-500/15 text-amber-900 hover:bg-amber-500/25 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="فتح في نافذة طباعة خارجية مستقلة لتخطي قيود المتصفح"
            >
              <span>نافذة طباعة ↗</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
            >
              إغلاق
            </button>

            {/* Issue, send to patient, and auto-print to clinic printer */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleIssueInvoice(autoPrintOnSave)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSaving ? 'جارِ الإصدار والطباعة...' : 'إصدار الفاتورة واعتمادها وطباعتها 🧾🖨️'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
