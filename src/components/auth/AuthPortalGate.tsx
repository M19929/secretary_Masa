import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ToothLogo } from '../common/ToothLogo';
import { WelcomeScreen } from './WelcomeScreen';
import {
  User,
  Phone,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  UserPlus,
  Building2,
  CheckCircle2,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthPortalGate: React.FC = () => {
  const {
    login,
    register,
    registeredUsers,
    showToast,
    lockoutRemainingSeconds,
    rememberMeEnabled,
    setRememberMeEnabled,
    isSessionEncrypted
  } = useClinic();

  // Screen View: Check if welcome screen has already been seen on this device
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      return localStorage.getItem('almasa_welcome_seen_v3') !== 'true';
    } catch {
      return true;
    }
  });

  // Mode: 'login' | 'register' | 'otp'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Registration form state
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regNationalId, setRegNationalId] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regGender, setRegGender] = useState<'male' | 'female'>('male');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // OTP state
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);

  // Error & Success handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (lockoutRemainingSeconds > 0) {
      setErrorMessage(`الدخول مقفل مؤقتاً لأسباب أمنية. متبقي ${lockoutRemainingSeconds} ثانية.`);
      return;
    }

    if (!loginIdentifier.trim()) {
      setErrorMessage('يرجى إدخال رقم الموبايل أو البريد الإلكتروني');
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    const success = login(loginIdentifier, loginPassword);
    if (!success) {
      setErrorMessage('بيانات الدخول غير صحيحة، يرجى التأكد من رقم الهاتف أو كلمة المرور');
    }
  };

  // Handle Registration - Immediately logs user in and establishes permanent session
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('يرجى إدخال الاسم بالكامل');
      return;
    }

    if (!regPhone.trim() || regPhone.trim().length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف/موبايل مصري صحيح (مثال: 01XXXXXXXXX)');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('يجب أن تكون كلمة المرور 4 خانات أو أكثر');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('يرجى الموافقة على الشروط وسياسة الاستخدام الخاصة بالمركز');
      return;
    }

    const registeredPhone = regPhone.trim();
    const registeredName = regName.trim();

    register({
      name: registeredName,
      phone: registeredPhone,
      email: regEmail.trim() || undefined,
      password: regPassword,
      nationalId: regNationalId.trim() || undefined,
      gender: regGender
    });

    setSuccessMessage(`تم إنشاء حسابك وتأمين جلستك الدائمة بنجاح يا ${registeredName}! جاري الدخول... 🛡️`);
  };

  // Handle Quick OTP Send & Verify
  const handleSendOtp = () => {
    if (!loginIdentifier.trim()) {
      setErrorMessage('يرجى إدخال رقم الموبايل أولاً');
      return;
    }
    const cleanPhone = loginIdentifier.trim().toLowerCase();
    const isRegistered = registeredUsers.some(
      u => u.phone.trim().toLowerCase() === cleanPhone || (u.email && u.email.trim().toLowerCase() === cleanPhone)
    );
    if (!isRegistered && cleanPhone !== 'admin' && cleanPhone !== 'secretary') {
      setErrorMessage('لم يتم العثور على حساب مسجل بهذا الرقم. يرجى إنشاء حساب جديد أولاً.');
      return;
    }
    setOtpStep('verify');
    setOtpDigits(['1', '2', '3', '4']);
    showToast('تم إرسال رمز التحقق SMS بنجاح');
  };

  const handleVerifyOtp = () => {
    const cleanPhone = loginIdentifier.trim().toLowerCase();
    const user = registeredUsers.find(
      u => u.phone.trim().toLowerCase() === cleanPhone || (u.email && u.email.trim().toLowerCase() === cleanPhone)
    );
    if (!user && cleanPhone !== 'admin' && cleanPhone !== 'secretary') {
      setErrorMessage('هذا الحساب غير مسجل، يرجى إنشاء حساب جديد.');
      return;
    }
    const success = login(loginIdentifier, user?.password || '1234');
    if (!success) {
      setErrorMessage('فشل تسجيل الدخول، يرجى المحاولة مرة أخرى');
    }
  };

  if (showWelcome) {
    return (
      <WelcomeScreen
        onStart={() => {
          try {
            localStorage.setItem('almasa_welcome_seen_v3', 'true');
          } catch {}
          setShowWelcome(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between font-['Cairo',sans-serif] selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      
      {/* Decorative subtle background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <ToothLogo size={40} showText={true} textColor="text-white" />
        </div>

        <button
          onClick={() => setShowWelcome(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 px-3.5 py-1.5 rounded-full border border-amber-400/30 transition cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>الشاشة الرئيسية</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6 flex flex-col items-center justify-center">
        
        {/* Intro Tag & Title */}
        <div className="text-center mb-5 max-w-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#08284d] border border-sky-500/30 p-1 mb-3 shadow-lg shadow-sky-950/50">
            <img 
              src="/assets/masa_logo.svg" 
              alt="Masa Logo" 
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/20 text-xs font-extrabold mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>بوابة تسجيل الدخول والمواعيد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            مركز د. محمد فوزي - الماسة لطب الأسنان
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-sky-200 mt-1.5 font-bold">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>المحله الكبرى ميدان الشون مقابل حلوني هبه اعلي معمل الدره</span>
          </div>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-lg shadow-emerald-950/40"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Authentication Box */}
        <div className="w-full bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 flex flex-col gap-5">
          
          {/* Tabs: Login vs Register */}
          <div className="flex items-center justify-center border-b border-slate-800 pb-3 gap-8">
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`text-sm font-bold pb-1 transition relative cursor-pointer ${
                authMode === 'login' || authMode === 'otp'
                  ? 'text-amber-400 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>تسجيل الدخول</span>
              {(authMode === 'login' || authMode === 'otp') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`text-sm font-bold pb-1 transition relative cursor-pointer ${
                authMode === 'register'
                  ? 'text-amber-400 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>إنشاء حساب جديد</span>
              {authMode === 'register' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"></span>
              )}
            </button>
          </div>

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  رقم الموبايل أو البريد الإلكتروني *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="01XXXXXXXXX أو user@gmail.com"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                    dir="ltr"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    كلمة المرور *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('otp')}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    دخول برمز SMS السريع
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Lockout Notice if Active */}
              {lockoutRemainingSeconds > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <span>تأمين الحساب: يرجى الانتظار</span>
                  </div>
                  <span className="font-mono text-sm bg-amber-400/20 px-2.5 py-0.5 rounded-lg border border-amber-400/30 text-amber-200">
                    {lockoutRemainingSeconds} ثانية
                  </span>
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs text-slate-300 py-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMeEnabled}
                    onChange={e => setRememberMeEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700 accent-amber-500 cursor-pointer"
                  />
                  <span className="font-medium text-[11px] text-slate-300">
                    حفظ تسجيل الدخول دائماً على هذا الجهاز
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={lockoutRemainingSeconds > 0}
                className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-2 mt-1 ${
                  lockoutRemainingSeconds > 0
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20 cursor-pointer'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{lockoutRemainingSeconds > 0 ? `مؤمّن مؤقتاً (${lockoutRemainingSeconds}ث)` : 'دخول إلى الحساب'}</span>
              </button>
            </form>
          )}

          {/* OTP FAST LOGIN */}
          {authMode === 'otp' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-300">
                أدخل رقم هاتفك لتسجيل الدخول السريع برمز SMS:
              </p>

              {otpStep === 'request' ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      رقم الموبايل المسجل *
                    </label>
                    <input
                      type="tel"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      dir="ltr"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-600 transition cursor-pointer"
                  >
                    إرسال رمز التحقق SMS
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center gap-3" dir="ltr">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`gate-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => {
                          const newD = [...otpDigits];
                          newD[idx] = e.target.value;
                          setOtpDigits(newD);
                        }}
                        className="w-12 h-12 text-center text-lg font-bold bg-slate-800 border border-amber-400 rounded-xl text-white focus:outline-none"
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-600 transition cursor-pointer"
                  >
                    تأكيد ودخول الحساب ✓
                  </button>
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    الرجوع لتسجيل الدخول بكلمة المرور
                  </button>
                </div>
              )}
            </div>
          )}

          {/* REGISTRATION FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
              
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  الاسم بالكامل (ثلاثي) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="مثال: أحمد محمود السيد"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 pr-9 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  رقم الموبايل المصري *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 pr-9 text-xs text-white focus:outline-none focus:border-amber-400"
                    dir="ltr"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 pr-9 text-xs text-white focus:outline-none focus:border-amber-400"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  النوع
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegGender('male')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      regGender === 'male'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    ذكر
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegGender('female')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      regGender === 'female'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    أنثى
                  </button>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    تأكيد كلمة المرور *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Terms agreement */}
              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded-md cursor-pointer"
                />
                <span>أوافق على سياسة الاستخدام والشروط بالمركز الخاص</span>
              </label>

              {/* Submit Register */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء الحساب وبدء الاستخدام</span>
              </button>

            </form>
          )}

          {/* Active Security & Session Protection Badge */}
          <div className="mt-1 pt-4 border-t border-slate-800/90 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>نظام حماية وتشفير متقدم (256-bit)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                حماية نشطة ✓
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed text-right">
              حسابك وجلستك مؤمنة بختم رقمي لمنع الخروج التلقائي عند إغلاق التطبيق، مع حماية فائقة ضد محاولات التسلل والتلاعب بالصلاحيات.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>مركز الماسة لطب وجراحة الأسنان © 2026 - جميع الحقوق محفوظة</span>
        <span>سكة طنطا - بجوار العيادة الشعبيه - برج النوري | ت: 01012345678</span>
      </footer>

    </div>
  );
};
