import React, { useState } from 'react';
import { Appointment, PatientInvoice } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { printElement } from '../../utils/printHelper';
import {
  Receipt,
  Printer,
  X,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Share2
} from 'lucide-react';

interface PatientInvoiceViewModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const PatientInvoiceViewModal: React.FC<PatientInvoiceViewModalProps> = ({
  appointment,
  onClose
}) => {
  const { clinicInfo } = useClinic();
  const invoice = appointment.invoice;
  const [viewMode, setViewMode] = useState<'classic_receipt' | 'table_detailed'>('classic_receipt');

  if (!invoice) return null;

  const handlePrint = (preferPopup: boolean = false) => {
    printElement('patient-invoice-view-paper', {
      title: `سند وفاتورة - ${appointment.patientName}`,
      preferPopup
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:m-0">
        
        {/* Modal Top Header (Screen only) */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-slate-50 to-amber-500/10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                فاتورة وسند قبض العلاج المعتمد
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                رقم الفاتورة: #{invoice.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('classic_receipt')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'classic_receipt'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧾 سند القبض الأصلي
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table_detailed')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'table_detailed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 جدول البنود
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 print:overflow-visible print:p-0">
          <div id="patient-invoice-view-paper" className="border border-slate-300 rounded-2xl p-6 sm:p-8 bg-white shadow-xs print:border-none print:p-6 print:w-full">
            
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
                  <p className="text-[11px] text-slate-600">
                    {clinicInfo.address || 'المحلة الكبرى - ميدان الشون - مقابل حلواني هبة - أعلى معمل الذرة'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono" dir="ltr">
                    هاتف: {clinicInfo.phones?.[0] || clinicInfo.phoneDisplay || '01101722551'} - {clinicInfo.phones?.[1] || '0402218878'}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-amber-800 font-mono" dir="ltr">
                  #{invoice.invoiceNumber}
                </div>
                <div className="text-xs text-slate-600">التاريخ: {invoice.date}</div>
                <div className="text-xs text-slate-600">الوقت: {invoice.time}</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  معتمدة ومسجلة ✓
                </span>
              </div>
            </div>

            {/* CLASSIC CLINIC VOUCHER FORMAT */}
            {viewMode === 'classic_receipt' ? (
              <div className="space-y-4">
                
                {/* Details Grid (Matching classic receipt) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm print:bg-transparent print:border-slate-400">
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">رقم الحجز / السند:</span>
                    <span className="font-bold text-amber-800 font-mono">{invoice.appointmentCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">اسم المريض:</span>
                    <span className="font-black text-slate-950 font-['Cairo']">{invoice.patientName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">رقم الهاتف:</span>
                    <span className="font-bold font-mono" dir="ltr">{invoice.patientPhone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">الطبيب المعالج:</span>
                    <span className="font-bold text-slate-900 font-['Cairo']">{invoice.doctorName || 'د. محمد فوزي'}</span>
                  </div>
                  <div className="flex justify-between py-1 sm:col-span-2">
                    <span className="text-slate-500">بيان الخدمة / الإجراء الطبي:</span>
                    <span className="font-bold text-slate-950 font-['Cairo']">
                      {invoice.items?.map(i => i.description).join(' + ') || appointment.serviceName}
                    </span>
                  </div>
                </div>

                {/* Multiple items breakdown if more than 1 */}
                {invoice.items && invoice.items.length > 1 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-2">تفصيل الخدمات:</span>
                    <div className="divide-y divide-slate-100">
                      {invoice.items.map((it, idx) => (
                        <div key={it.id || idx} className="py-1 flex justify-between items-center">
                          <span>{it.description} {it.quantity > 1 ? `(×${it.quantity})` : ''}</span>
                          <span className="font-bold">{it.total} ج.م</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classic Financial Box */}
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-900 text-xs sm:text-sm space-y-2 print:bg-transparent">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>قيمة الكشف أو العلاج:</span>
                    <span className="font-bold text-slate-950">{invoice.subtotal} ج.م</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between items-center text-rose-600 font-bold">
                      <span>الخصم الممنوح:</span>
                      <span>- {invoice.discount} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t-2 border-slate-900 pt-2 text-base sm:text-lg font-black text-slate-950">
                    <span>صافي المبلغ المطلوب:</span>
                    <span className="text-emerald-700">{invoice.total} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-slate-300 pt-2 text-slate-800">
                    <span className="font-bold">المبلغ المسدد / المستلم:</span>
                    <span className="font-black text-slate-950 text-sm sm:text-base">{invoice.paidAmount} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-bold">
                    <span>المبلغ المتبقي:</span>
                    <span className={`font-black ${invoice.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {invoice.remainingAmount > 0 ? `${invoice.remainingAmount} ج.م` : 'خالص السداد بالكامل ✓'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-slate-300 pt-2 text-xs">
                    <span className="text-slate-600">طريقة السداد:</span>
                    <span className="font-bold text-slate-900 px-2 py-0.5 bg-white rounded-md border border-slate-300">
                      {invoice.paymentMethod === 'cash' ? 'نقداً (Cash)' :
                       invoice.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' :
                       invoice.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                       invoice.paymentMethod === 'visa' ? 'بطاقة بنكية / فيزا' : 'تحويل بنكي'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">حالة السداد:</span>
                    <span className={`font-black px-2.5 py-0.5 rounded-full text-xs ${
                      invoice.paidAmount >= invoice.total
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {invoice.paidAmount >= invoice.total ? 'مدفوع بالكامل وخالص الحساب ✓' : `متبقي حساب (${invoice.remainingAmount} ج.م)`}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              /* DETAILED TABLE VIEW */
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6 print:bg-transparent print:border-slate-400">
                  <div>
                    <span className="text-slate-500 block">اسم المريض:</span>
                    <span className="font-bold text-slate-900 text-sm">{invoice.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">رقم الهاتف:</span>
                    <span className="font-bold text-slate-900 text-sm" dir="ltr">{invoice.patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الطبيب المعالج:</span>
                    <span className="font-bold text-slate-900">{invoice.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">كود الحجز:</span>
                    <span className="font-bold text-amber-700">{invoice.appointmentCode}</span>
                  </div>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-900 text-slate-900">
                        <th className="py-2.5 px-2 font-black">#</th>
                        <th className="py-2.5 px-3 font-black">بيان الخدمة / الإجراء الطبي</th>
                        <th className="py-2.5 px-3 font-black text-center">الكمية</th>
                        <th className="py-2.5 px-3 font-black text-center">سعر الوحدة</th>
                        <th className="py-2.5 px-3 font-black text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invoice.items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-2.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{item.description}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.unitPrice} ج.م</td>
                          <td className="py-2.5 px-3 text-left font-black text-slate-950">{item.total} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t-2 border-slate-900 pt-4">
                  <div className="flex-1 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600">طريقة الدفع:</span>
                      <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-300">
                        {invoice.paymentMethod === 'cash' ? 'نقداً (Cash)' :
                         invoice.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' :
                         invoice.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                         invoice.paymentMethod === 'visa' ? 'بطاقة بنكية / فيزا' : 'تحويل بنكي'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 print:bg-transparent print:border-slate-800">
                    <div className="flex justify-between text-slate-600">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold">{invoice.subtotal} ج.م</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>الخصم الممنوح:</span>
                        <span>- {invoice.discount} ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-black text-slate-950">
                      <span>إجمالي الفاتورة:</span>
                      <span className="text-base text-emerald-700">{invoice.total} ج.م</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-300 pt-2 text-slate-800">
                      <span className="font-bold">المبلغ المسدد:</span>
                      <span className="font-black text-slate-900">{invoice.paidAmount} ج.م</span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold">
                      <span>المبلغ المتبقي:</span>
                      <span className={`font-black ${invoice.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {invoice.remainingAmount > 0 ? `${invoice.remainingAmount} ج.م` : 'خالص السداد بالكامل ✓'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {invoice.notes && (
              <p className="mt-4 text-slate-500 text-[11px] leading-relaxed italic border-t border-slate-200 pt-2">
                ملاحظات: {invoice.notes}
              </p>
            )}

            {/* Stamp & Signatures */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-4">
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

              <div className="text-left text-[11px] text-slate-600 space-y-1">
                <p>توقيع مسؤول الخزينة: ........................</p>
                <p>توقيع المستلم / المريض: ........................</p>
              </div>
            </div>

            {/* Print Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 flex justify-between">
              <span>تاريخ الإصدار: {new Date(invoice.issuedAt).toLocaleString('ar-EG')}</span>
              <span>مركز د. محمد فوزي الماسة لطب وزراعة الأسنان</span>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
          >
            إغلاق
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة الفاتورة 🖨️</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrint(true)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 text-amber-900 hover:bg-amber-500/25 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="فتح في نافذة طباعة خارجية مستقلة"
            >
              <span>نافذة طباعة ↗</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
