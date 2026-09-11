import React from 'react';
import { X, Printer, CheckCircle2, AlertTriangle, Building, Phone, MapPin, Calendar, User } from 'lucide-react';
import { Appointment } from '../../types';
import { printElement } from '../../utils/printHelper';

interface InstallmentStatementPrintModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const InstallmentStatementPrintModal: React.FC<InstallmentStatementPrintModalProps> = ({
  appointment,
  onClose
}) => {
  const total = appointment.totalAmount !== undefined ? Number(appointment.totalAmount) : Number(appointment.price || 0);
  const paid = appointment.paidAmount !== undefined ? Number(appointment.paidAmount) : (appointment.paymentStatus === 'paid' ? total : 0);
  const remaining = appointment.remainingAmount !== undefined ? Number(appointment.remainingAmount) : Math.max(0, total - paid);
  const isPaidInFull = remaining <= 0;

  const handlePrint = (preferPopup: boolean = false) => {
    printElement('installment-statement-print-paper', {
      title: `كشف حساب تقويم وأقساط - ${appointment.patientName}`,
      preferPopup
    });
  };

  return (
    <div
      id="installment-statement-print-modal"
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[95vh]">
        
        {/* Modal Controls (Not printed) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Printer className="w-4 h-4 text-amber-400" />
            <span>معاينة كشف حساب وأقساط التقويم للطباعة</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint(false)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الآن 🖨️</span>
            </button>
            <button
              onClick={() => handlePrint(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs transition cursor-pointer"
              title="فتح في نافذة طباعة خارجية مستقلة"
            >
              <span>نافذة طباعة ↗</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div id="installment-statement-print-paper" className="p-6 sm:p-8 bg-white text-slate-900 font-['Cairo',sans-serif] overflow-y-auto flex flex-col gap-6">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-slate-950">
                مركز د. محمد فوزي الماسة
              </h2>
              <span className="text-xs font-bold text-amber-700">
                لطب وجراحة وتجميل وزراعة وتقويم الأسنان
              </span>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                سكة طنطا - بجوار العيادة الشعبية - برج النوري - المحلة الكبرى
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1" dir="ltr">
                <Phone className="w-3 h-3 text-slate-400" />
                01012345678 / 040-2223344
              </p>
            </div>

            <div className="flex flex-col items-end text-left font-mono">
              <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 border border-slate-200">
                كشف حساب تقويم مريض
              </span>
              <span className="text-xs text-slate-600 mt-1 font-bold">
                رقم الملف: <strong className="text-amber-800 font-mono">{appointment.appointmentCode}</strong>
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                تاريخ الاستخراج: {new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>

          {/* Patient Details Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">اسم المريض:</span>
              <span className="font-bold text-slate-900">{appointment.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">رقم الهاتف:</span>
              <span className="font-bold font-mono" dir="ltr">{appointment.patientPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">الطبيب المعالج:</span>
              <span className="font-bold text-slate-900">د. {appointment.doctorName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">خطة العلاج:</span>
              <span className="font-bold text-amber-800">{appointment.serviceName}</span>
            </div>
          </div>

          {/* Financial Summary Breakdown */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] text-slate-500 font-bold block">إجمالي خطة العلاج</span>
              <span className="text-lg font-black text-slate-900 font-mono">{total.toLocaleString()} ج.م</span>
            </div>
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50">
              <span className="text-[11px] text-emerald-800 font-bold block">إجمالي المسدد</span>
              <span className="text-lg font-black text-emerald-900 font-mono">{paid.toLocaleString()} ج.م</span>
            </div>
            <div className={`p-3.5 rounded-xl border ${
              isPaidInFull ? 'border-blue-200 bg-blue-50' : 'border-rose-200 bg-rose-50'
            }`}>
              <span className="text-[11px] font-bold block text-slate-700">المبلغ المتبقي</span>
              <span className={`text-lg font-black font-mono ${
                isPaidInFull ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {remaining.toLocaleString()} ج.م
              </span>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-black text-slate-900">
              جدول الدفعات والأقساط المسددة:
            </h4>
            
            {(!appointment.paymentHistory || appointment.paymentHistory.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                لا توجد دفعات مسجلة سابقاً
              </p>
            ) : (
              <table className="w-full text-right border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2 px-3">رقم الإيصال</th>
                    <th className="py-2 px-3">تاريخ الدفعة</th>
                    <th className="py-2 px-3">المبلغ المسدد</th>
                    <th className="py-2 px-3">طريقة السداد</th>
                    <th className="py-2 px-3">البيان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointment.paymentHistory.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3 font-mono text-slate-700">{p.receiptNumber}</td>
                      <td className="py-2 px-3">{p.date}</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">{p.amount.toLocaleString()} ج.م</td>
                      <td className="py-2 px-3">{p.paymentMethod === 'cash' ? 'نقدي' : p.paymentMethod === 'instapay' ? 'إنستاباي' : p.paymentMethod}</td>
                      <td className="py-2 px-3 text-slate-600">{p.note || 'قسط تقويم'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Note / Agreement */}
          {appointment.installmentNote && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <strong className="block text-slate-900 mb-0.5">ملاحظات الاتفاقية:</strong>
              {appointment.installmentNote}
            </div>
          )}

          {/* Signatures & Stamps */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs">
            <div className="flex flex-col gap-8">
              <span className="font-bold text-slate-700">توقيع المستلم (الاستقبال والخزينة)</span>
              <span className="font-mono text-slate-400">.................................</span>
            </div>
            <div className="flex flex-col gap-8">
              <span className="font-bold text-slate-700">ختم المركز والاعتماد</span>
              <span className="font-mono text-slate-400">.................................</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
