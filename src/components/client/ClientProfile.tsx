import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  ChevronLeft,
  Edit2,
  LogOut,
  LogIn,
  UserPlus,
  FileBadge,
  Save,
  X,
  Building2,
  CalendarCheck,
  Star,
  CheckCircle2,
  Trash2,
  Edit3
} from 'lucide-react';

export const ClientProfile: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    appointments,
    setClientTab,
    updateUserProfile,
    logout,
    openAuthModal,
    showToast,
    openRatingModal,
    deleteDoctorReview
  } = useClinic();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [bloodType, setBloodType] = useState('A+');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setNationalId(currentUser.nationalId || '');
      setBloodType(currentUser.bloodType || 'A+');
      setGender(currentUser.gender || 'male');
    }
  }, [currentUser]);

  const patientAppointments = appointments.filter(
    a => currentUser && (a.patientPhone === currentUser.phone || a.patientName === currentUser.name)
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('الاسم ورقم الموبايل مطلوبان');
      return;
    }
    updateUserProfile({
      name,
      phone,
      email: email || undefined,
      nationalId: nationalId || undefined,
      bloodType,
      gender
    });
    setIsEditing(false);
  };

  // If user is not logged in
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setClientTab('home')}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
            الملف الشخصي
          </h2>
          <div className="w-8" />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <User className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900">
              سجل دخولك لمتابعة ملفك بالمركز
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              قم بتسجيل الدخول أو إنشاء حساب جديد للوصول لمواعيدك المحجوزة وتقارير الكشف بمركز الماسة.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2 max-w-xs mx-auto">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>

            <button
              onClick={() => openAuthModal('register')}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>إنشاء حساب جديد</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setClientTab('home')}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
          ملفي الطبي والشخصي
        </h2>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
            isEditing
              ? 'bg-slate-200 text-slate-700'
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          {isEditing ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>إلغاء</span>
            </>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </>
          )}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30 border border-white/20 shrink-0">
              {currentUser.name.charAt(0)}
            </div>

            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg text-white">{currentUser.name}</span>
              <span className="text-xs text-amber-300 font-mono" dir="ltr">{currentUser.phone}</span>
              <span className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>
                  {currentUser.role === 'secretary' || currentUser.role === 'admin' ? 'طاقم السكرتارية' : 'ملف مريض نشط ومسجل'}
                </span>
                {currentUser.memberSince && (
                  <span className="text-slate-400">• مسجل منذ {currentUser.memberSince}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <button
          onClick={() => setClientTab('appointments')}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-amber-200 transition text-center group cursor-pointer"
        >
          <span className="text-lg font-black text-slate-900 block group-hover:text-amber-600 transition">
            {patientAppointments.length}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">إجمالي المواعيد</span>
        </button>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-lg font-black text-emerald-600 block">
            {patientAppointments.filter(a => a.status === 'completed' || a.status === 'confirmed').length}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">المواعيد المؤكدة</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-lg font-black text-amber-600 block">{currentUser.bloodType || 'A+'}</span>
          <span className="text-[10px] text-slate-400 font-bold">فصيلة الدم</span>
        </div>
      </div>

      {/* Edit Form or Information Display */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3.5">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-amber-500" />
            <span>تعديل البيانات الشخصية:</span>
          </h3>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">الاسم بالكامل:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">رقم الموبايل:</label>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">البريد الإلكتروني:</label>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">الرقم القومي / الهوية:</label>
              <input
                type="text"
                dir="ltr"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="29XXXXXXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">فصيلة الدم:</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">النوع:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  gender === 'male'
                    ? 'bg-amber-50 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                ذكر
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  gender === 'female'
                    ? 'bg-amber-50 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                أنثى
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ التعديلات في الملف</span>
          </button>
        </form>
      ) : (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <span>بيانات الملف الشخصي</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              بيانات متزامنة
            </span>
          </h3>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400">رقم الموبايل:</span>
            <span className="text-slate-800 font-mono font-bold" dir="ltr">{currentUser.phone}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-50">
            <span className="text-slate-400">البريد الإلكتروني:</span>
            <span className="text-slate-800 font-medium" dir="ltr">{currentUser.email || 'غير مضاف'}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-50">
            <span className="text-slate-400">الرقم القومي / الهوية:</span>
            <span className="text-slate-800 font-medium" dir="ltr">{currentUser.nationalId || 'غير مضاف'}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-50">
            <span className="text-slate-400">النوع:</span>
            <span className="text-slate-800 font-medium">{currentUser.gender === 'female' ? 'أنثى' : 'ذكر'}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-50">
            <span className="text-slate-400">المركز المعالج:</span>
            <span className="text-slate-800 font-medium">مركز الماسة لطب وجراحة الأسنان (سكة طنطا)</span>
          </div>
        </div>
      )}

      {/* Patient Reviews & Completed Visits Rating */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>تقييماتي لكشوفات الأطباء</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">
            {patientAppointments.filter(a => a.status === 'completed').length} كشوفات مكتملة
          </span>
        </div>

        {patientAppointments.filter(a => a.status === 'completed').length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {patientAppointments
              .filter(a => a.status === 'completed')
              .map(apt => (
                <div key={apt.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{apt.doctorName}</span>
                      <span className="text-[11px] text-slate-500">{apt.serviceName} • {apt.date}</span>
                    </div>
                    {apt.rating ? (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 text-amber-900 text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{apt.rating}/5</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => openRatingModal(apt)}
                        className="text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                        <span>قيّم الكشف الآن</span>
                      </button>
                    )}
                  </div>

                  {apt.reviewComment && (
                    <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 italic">
                      "{apt.reviewComment}"
                    </p>
                  )}
                  {apt.rating && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 mt-1">
                      <button
                        type="button"
                        onClick={() => openRatingModal(apt)}
                        className="text-[11px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition"
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
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer hover:bg-rose-50 px-2 py-1 rounded-lg transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>حذف التقييم</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-400">
            عند إتمام كشفك وجلستك في المركز، سيتاح لك تقييم الطبيب وتوثيق تجربتك الطبية هنا بكل شفافية.
          </div>
        )}
      </div>

      {/* Account Security & Session Protection Status */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 sm:p-5 rounded-3xl text-white shadow-sm border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">حماية وأمان الحساب</h4>
              <p className="text-[10px] text-slate-400">جلسة رقمية مؤمنة ومحفوظة على هذا الجهاز</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
            مشفر 256-bit ✓
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400">استمرارية تسجيل الدخول:</span>
            <span className="text-emerald-400 font-bold">دائمة بدون خروج</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400">ختم بصمة الجهاز:</span>
            <span className="text-sky-400 font-mono font-bold">معتمد وموثق ✓</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          تم تفعيل أعلى درجات الأمان لحسابك: لن يطلب منك التطبيق إعادة كتابة كلمة المرور عند الخروج أو التحديث، مع حماية مشددة تمنع أي محاولات تخمين أو تلاعب خارجي بالبيانات.
        </p>
      </div>

      {/* Account actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-rose-200/60 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </div>

    </div>
  );
};
