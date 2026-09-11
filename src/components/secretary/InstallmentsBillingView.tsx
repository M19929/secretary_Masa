import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Printer,
  Plus,
  ArrowUpDown,
  Filter,
  Users,
  Clock,
  Sparkles,
  Phone
} from 'lucide-react';
import { Appointment } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { normalizeNumberInput } from '../../utils/numberUtils';

interface InstallmentsBillingViewProps {
  onOpenInstallmentModal: (apt: Appointment) => void;
  onPrintStatement: (apt: Appointment) => void;
}

export const InstallmentsBillingView: React.FC<InstallmentsBillingViewProps> = ({
  onOpenInstallmentModal,
  onPrintStatement
}) => {
  const { appointments } = useClinic();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'remaining' | 'settled' | 'unpaid'>('all');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<'all' | 'ortho' | 'implant' | 'general'>('all');

  // Calculate high-level financial metrics
  const stats = useMemo(() => {
    let totalContractValue = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalOrthoPatients = 0;
    let patientsWithBalance = 0;
    let settledPatients = 0;

    appointments.forEach((apt) => {
      if (apt.status === 'cancelled') return;

      const total = apt.totalAmount !== undefined ? Number(apt.totalAmount) : Number(apt.price || 0);
      const paid = apt.paidAmount !== undefined ? Number(apt.paidAmount) : (apt.paymentStatus === 'paid' ? total : 0);
      const remaining = apt.remainingAmount !== undefined ? Number(apt.remainingAmount) : Math.max(0, total - paid);

      totalContractValue += total;
      totalCollected += paid;
      totalOutstanding += remaining;

      if (apt.serviceName?.includes('تقويم') || apt.isInstallment) {
        totalOrthoPatients += 1;
      }

      if (remaining > 0) {
        patientsWithBalance += 1;
      } else {
        settledPatients += 1;
      }
    });

    return {
      totalContractValue,
      totalCollected,
      totalOutstanding,
      totalOrthoPatients,
      patientsWithBalance,
      settledPatients
    };
  }, [appointments]);

  // Filtered Appointments
  const filteredList = useMemo(() => {
    return appointments
      .filter((apt) => apt.status !== 'cancelled')
      .filter((apt) => {
        const total = apt.totalAmount !== undefined ? Number(apt.totalAmount) : Number(apt.price || 0);
        const paid = apt.paidAmount !== undefined ? Number(apt.paidAmount) : (apt.paymentStatus === 'paid' ? total : 0);
        const remaining = apt.remainingAmount !== undefined ? Number(apt.remainingAmount) : Math.max(0, total - paid);

        // Search
        const q = searchQuery.toLowerCase().trim();
        const normQ = normalizeNumberInput(q);
        const matchesSearch =
          !q ||
          apt.patientName.toLowerCase().includes(q) ||
          apt.patientPhone.includes(q) ||
          (normQ && apt.patientPhone.includes(normQ)) ||
          apt.appointmentCode.toLowerCase().includes(q) ||
          (normQ && apt.appointmentCode.toLowerCase().includes(normQ)) ||
          apt.serviceName.toLowerCase().includes(q);

        // Balance Filter
        let matchesBalance = true;
        if (balanceFilter === 'remaining') {
          matchesBalance = remaining > 0;
        } else if (balanceFilter === 'settled') {
          matchesBalance = remaining <= 0;
        } else if (balanceFilter === 'unpaid') {
          matchesBalance = paid === 0;
        }

        // Service Filter
        let matchesService = true;
        if (serviceCategoryFilter === 'ortho') {
          matchesService = apt.serviceName?.includes('تقويم') || !!apt.isInstallment;
        } else if (serviceCategoryFilter === 'implant') {
          matchesService = apt.serviceName?.includes('زراعة') || apt.serviceName?.includes('تركيب');
        } else if (serviceCategoryFilter === 'general') {
          matchesService = !apt.serviceName?.includes('تقويم') && !apt.serviceName?.includes('زراعة');
        }

        return matchesSearch && matchesBalance && matchesService;
      });
  }, [appointments, searchQuery, balanceFilter, serviceCategoryFilter]);

  // WhatsApp quick reminder
  const sendWhatsAppInstallmentReminder = (apt: Appointment) => {
    const total = apt.totalAmount !== undefined ? Number(apt.totalAmount) : Number(apt.price || 0);
    const paid = apt.paidAmount !== undefined ? Number(apt.paidAmount) : (apt.paymentStatus === 'paid' ? total : 0);
    const remaining = apt.remainingAmount !== undefined ? Number(apt.remainingAmount) : Math.max(0, total - paid);

    const text = `مرحباً ${apt.patientName} 🌸،%0Aتحية طيبة من مركز د. محمد فوزي الماسة لطب وجراحة وتجميل الأسنان.%0Aنحيطكم علماً ببيان حساب خطة علاجكم (${apt.serviceName}):%0A%0A💰 إجمالي التكلفة المتفق عليها: ${total.toLocaleString()} ج.م%0A✅ المسدد حتى الآن: ${paid.toLocaleString()} ج.م%0A⚠️ المبلغ المتبقي للسداد: ${remaining.toLocaleString()} ج.م%0A%0A📅 موعد جلستكم القادمة: ${apt.date} (${apt.timeSlot})%0A👨‍⚕️ الطبيب المعالج: ${apt.doctorName}%0Aرقم الحجز / الملف: ${apt.appointmentCode}%0A📍 العنوان: سكة طنطا - بجوار العيادة الشعبيه - برج النوري - المحلة الكبرى.%0Aشاكرين لثقتكم الغالية بمركز الماسة 💎`;
    const cleanPhone = apt.patientPhone.replace(/[^0-9]/g, '');
    const internationalPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    window.open(`https://wa.me/${internationalPhone}?text=${text}`, '_blank');
  };

  return (
    <div id="installments-billing-view" className="flex flex-col gap-6" dir="rtl">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>أقساط التقويم والماليات وإدارة دفعات المرضى</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                خاص بالسكرتارية والخزينة
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة مبالغ خطط التقويم والعلاجات، سداد الأقساط الشهرية، واستبيان هل المريض دفع أم باقي مبلغ مستحق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            إجمالي الحالات: {filteredList.length}
          </span>
        </div>
      </div>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Contracts Value */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي قيمة الخطط والعقود</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.totalContractValue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            تكاليف كشوفات وخطط التقويم المسجلة
          </span>
        </div>

        {/* Total Collected */}
        <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span>المحصل فعلياً في الخزينة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-900 font-mono">
              {stats.totalCollected.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700">ج.م</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-2 block">
            تم تحصيل {stats.totalContractValue > 0 ? Math.round((stats.totalCollected / stats.totalContractValue) * 100) : 0}% من إجمالي المبالغ
          </span>
        </div>

        {/* Total Outstanding (KEY USER REQUIREMENT) */}
        <div className="p-4 rounded-3xl bg-rose-50/80 border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-rose-800 font-bold">
            <span>المتبقي للتحصيل (أقساط جارية)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-900 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-700 font-mono">
              {stats.totalOutstanding.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-rose-600">ج.م</span>
          </div>
          <span className="text-[11px] text-rose-700 mt-2 block">
            مستحقات قيد السداد على {stats.patientsWithBalance} مريض
          </span>
        </div>

        {/* Orthodontics / Installment Patients */}
        <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
            <span>مرضى التقويم والأقساط</span>
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-900 font-mono">
              {stats.totalOrthoPatients}
            </span>
            <span className="text-xs font-bold text-amber-700">حالة تقويم</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-2 block">
            {stats.settledPatients} حالات سددت بالكامل • {stats.patientsWithBalance} جاري التقسيط
          </span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            id="installments-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالمريض، الهاتف، كود الحجز، أو الخدمة..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pl-8 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Buttons & Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          
          {/* Balance Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setBalanceFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                balanceFilter === 'all'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({appointments.filter(a => a.status !== 'cancelled').length})
            </button>

            <button
              onClick={() => setBalanceFilter('remaining')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                balanceFilter === 'remaining'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              متبقي عليه مبلغ ({stats.patientsWithBalance})
            </button>

            <button
              onClick={() => setBalanceFilter('settled')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                balanceFilter === 'settled'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              خالص بالكامل ({stats.settledPatients})
            </button>
          </div>

          {/* Service Filter */}
          <select
            value={serviceCategoryFilter}
            onChange={(e) => setServiceCategoryFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-700 font-bold focus:outline-hidden"
          >
            <option value="all">جميع التخصصات</option>
            <option value="ortho">تقويم الأسنان فقط 🦷</option>
            <option value="implant">الزراعة والتركيبات</option>
            <option value="general">العلاج العام والحشو</option>
          </select>

        </div>
      </div>

      {/* Main Billing & Installments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <CreditCard className="w-12 h-12 text-slate-300" />
            <h3 className="font-black text-sm text-slate-800">
              لا توجد حسابات أو مرضى يطابقون خيارات البحث الحالية
            </h3>
            <p className="text-xs text-slate-500">
              يمكنك مسح البحث أو تغيير الفلتر لعرض المرضى وحسابات التقويم
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="py-3 px-4">رقم الملف</th>
                  <th className="py-3 px-4">المريض</th>
                  <th className="py-3 px-4">الخدمة / خطة العلاج</th>
                  <th className="py-3 px-4">الطبيب</th>
                  <th className="py-3 px-4">إجمالي التكلفة</th>
                  <th className="py-3 px-4">المدفوع</th>
                  <th className="py-3 px-4">المتبقي (الأقساط)</th>
                  <th className="py-3 px-4">نسبة السداد</th>
                  <th className="py-3 px-4 text-center">إجراءات السكرتيرة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((apt) => {
                  const total = apt.totalAmount !== undefined ? Number(apt.totalAmount) : Number(apt.price || 0);
                  const paid = apt.paidAmount !== undefined ? Number(apt.paidAmount) : (apt.paymentStatus === 'paid' ? total : 0);
                  const remaining = apt.remainingAmount !== undefined ? Number(apt.remainingAmount) : Math.max(0, total - paid);
                  const isPaid = remaining <= 0;
                  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : (isPaid ? 100 : 0);

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-amber-800">
                          {apt.appointmentCode}
                        </span>
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                          <span className="text-slate-500 font-mono" dir="ltr">{apt.patientPhone}</span>
                        </div>
                      </td>

                      {/* Service / Plan */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{apt.serviceName}</span>
                          {(apt.serviceName?.includes('تقويم') || apt.isInstallment) && (
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md w-fit mt-0.5">
                              نظام أقساط
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {apt.doctorName}
                      </td>

                      {/* Total Cost */}
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {total.toLocaleString()} ج.م
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-4 font-mono font-black text-emerald-700">
                        {paid.toLocaleString()} ج.م
                      </td>

                      {/* Remaining (KEY USER REQUIREMENT) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className={`font-mono font-black text-sm ${
                            isPaid ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {remaining.toLocaleString()} ج.م
                          </span>
                          <span className={`text-[10px] font-bold w-fit px-1.5 py-0.5 rounded-md mt-0.5 ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isPaid ? 'خالص بالكامل ✓' : 'متبقي للسداد'}
                          </span>
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 w-24">
                          <span className="text-[10px] font-mono font-bold text-slate-600">{pct}%</span>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full ${isPaid ? 'bg-emerald-600' : 'bg-amber-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Secretary Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Manage Installments & Payments Button */}
                          <button
                            id={`manage-installment-btn-${apt.id}`}
                            onClick={() => onOpenInstallmentModal(apt)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shadow-2xs transition cursor-pointer"
                            title="إدارة الحساب وتسجيل دفعة قسط"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>إدارة الأقساط 💵</span>
                          </button>

                          {/* WhatsApp Reminder Button */}
                          <button
                            onClick={() => sendWhatsAppInstallmentReminder(apt)}
                            className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                            title="إرسال كشف حساب ومطالبة عبر واتساب"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Print Statement */}
                          <button
                            onClick={() => onPrintStatement(apt)}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                            title="طباعة كشف حساب معتمد"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

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
  );
};
