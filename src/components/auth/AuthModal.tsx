import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { UserRole, AuthMode } from '../../types';
import {
  X,
  User,
  Phone,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileBadge,
  UserCheck,
  Building2,
  Send,
  RefreshCw,
  HeartPulse
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { login, register, registeredUsers, showToast } = useClinic();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [useOtpLogin, setUseOtpLogin] = useState<boolean>(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // OTP state
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regNationalId, setRegNationalId] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regGender, setRegGender] = useState<'male' | 'female'>('male');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState<string>('');
  const [forgotSent, setForgotSent] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');

  // Validation / Error / Success state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanQuery = loginIdentifier.trim().toLowerCase();
    if (!cleanQuery) {
      setErrorMessage('يرجى إدخال رقم الجوال أو البريد الإلكتروني');
      return;
    }

    const user = registeredUsers.find(
      u => u.phone.trim().toLowerCase() === cleanQuery || (u.email && u.email.trim().toLowerCase() === cleanQuery)
    );

    if (!user && cleanQuery !== 'admin' && cleanQuery !== 'secretary') {
      setErrorMessage('لم يتم العثور على حساب مسجل بهذا الرقم. يرجى إنشاء حساب جديد.');
      return;
    }

    if (!useOtpLogin && !loginPassword.trim()) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    if (useOtpLogin && otpStep === 'request') {
      handleSendOtp();
      return;
    }

    if (useOtpLogin && otpStep === 'verify') {
      const code = otpDigits.join('');
      if (code.length < 4) {
        setErrorMessage('يرجى إدخال رمز التحقق المكون من 4 أرقام');
        return;
      }
    }

    const passwordToUse = useOtpLogin ? (user?.password || '1234') : loginPassword;
    const success = login(loginIdentifier, passwordToUse, selectedRole);
    if (success) {
      onClose();
    } else {
      setErrorMessage('بيانات الدخول غير صحيحة، يرجى التأكد من كلمة المرور');
    }
  };

  const handleSendOtp = () => {
    const cleanQuery = loginIdentifier.trim().toLowerCase();
    if (!cleanQuery) {
      setErrorMessage('يرجى إدخال رقم الجوال أولاً لإرسال رمز التحقق');
      return;
    }

    const isRegistered = registeredUsers.some(
      u => u.phone.trim().toLowerCase() === cleanQuery || (u.email && u.email.trim().toLowerCase() === cleanQuery)
    );

    if (!isRegistered && cleanQuery !== 'admin' && cleanQuery !== 'secretary') {
      setErrorMessage('هذا الرقم غير مسجل لدينا، يرجى إنشاء حساب جديد أولاً.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpStep('verify');
      setOtpDigits(['1', '2', '3', '4']);
      showToast('تم إرسال رمز التحقق SMS بنجاح');
    }, 600);
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('يرجى إدخال الاسم بالكامل');
      return;
    }

    if (!regPhone.trim() || regPhone.trim().length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف/موبايل صحيح (مثال: 01XXXXXXXXX)');
      return;
    }

    if (!regPassword.trim() || regPassword.length < 4) {
      setErrorMessage('يرجى إدخال كلمة مرور مكونة من 4 أحرف أو أرقام على الأقل');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('يجب الموافقة على الشروط والأحكام للمتابعة');
      return;
    }

    const registeredPhone = regPhone.trim();
    const registeredName = regName.trim();

    register({
      name: registeredName,
      phone: registeredPhone,
      email: regEmail.trim() || undefined,
      nationalId: regNationalId.trim() || undefined,
      gender: regGender,
      password: regPassword
    });

    // Clear form, prefill login, and switch to login tab
    setLoginIdentifier(registeredPhone);
    setLoginPassword('');
    setRegName('');
    setRegPhone('');
    setRegEmail('');
    setRegNationalId('');
    setRegPassword('');
    setRegConfirmPassword('');
    setMode('login');
    setSuccessMessage(`تم إنشاء حسابك بنجاح يا ${registeredName}! يرجى كتابة كلمة المرور وتسجيل الدخول.`);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setErrorMessage('يرجى إدخال رقم الجوال أو البريد المسجل');
      return;
    }
    setErrorMessage(null);
    setForgotSent(true);
    showToast('تم إرسال رابط إعادة تعيين كلمة المرور بنجاح');
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="auth-modal-container"
        className="bg-white text-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden relative my-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header & Close Button */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 relative">
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#08284d] p-1 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-950/50 shrink-0">
              <img 
                src="/assets/masa_logo.svg" 
                alt="Masa Logo" 
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                {mode === 'login' && 'تسجيل الدخول'}
                {mode === 'register' && 'إنشاء حساب جديد'}
                {mode === 'forgot_password' && 'استعادة كلمة المرور'}
              </h2>
              <p className="text-xs text-sky-200">
                مركز د. محمد فوزي - الماسة لطب وزراعة الأسنان
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector (Login / Register) */}
        {mode !== 'forgot_password' && (
          <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5">
            <button
              type="button"
              id="tab-login-btn"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'login'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              type="button"
              id="tab-register-btn"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'register'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>إنشاء حساب جديد</span>
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* ===================== 1. LOGIN MODE ===================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع الحساب:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="role-patient-toggle"
                  onClick={() => setSelectedRole('patient')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedRole === 'patient'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>مريض / مراجع</span>
                </button>
                <button
                  type="button"
                  id="role-secretary-toggle"
                  onClick={() => setSelectedRole('secretary')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedRole === 'secretary'
                      ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>فريق الاستقبال والسكرتارية</span>
                </button>
              </div>
            </div>

            {/* Login Method Toggle (Password vs OTP) */}
            <div className="flex items-center justify-between text-xs bg-slate-100/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setUseOtpLogin(false);
                  setOtpStep('request');
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  !useOtpLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                كلمة المرور
              </button>
              <button
                type="button"
                onClick={() => setUseOtpLogin(true)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  useOtpLogin ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                رمز التحقق السريع (OTP)
              </button>
            </div>

            {/* Identifier input (Phone or Email) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الموبايل أو البريد الإلكتروني:
              </label>
              <div className="relative">
                <input
                  id="login-identifier-input"
                  type="text"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="01XXXXXXXXX أو user@example.com"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm transition outline-none"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            {/* If Standard Password */}
            {!useOtpLogin ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    كلمة المرور:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setForgotIdentifier(loginIdentifier);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm transition outline-none"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              /* If OTP Login */
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70 space-y-3">
                {otpStep === 'request' ? (
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-600 mb-3">
                      سنرسل رمز تحقق مكون من 4 أرقام عبر رسالة SMS إلى رقمك.
                    </p>
                    <button
                      type="button"
                      id="send-otp-btn"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      {isSendingOtp ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>إرسال رمز التحقق (SMS)</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span>أدخل الرمز المكون من 4 أرقام:</span>
                    </div>
                    <div className="flex items-center justify-center gap-2" dir="ltr">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpDigitChange(idx, e.target.value)}
                          className="w-12 h-12 text-center text-lg font-black rounded-xl border border-amber-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-xs"
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] text-amber-700 hover:underline font-bold"
                      >
                        إعادة إرسال الرمز
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
              />
              <label htmlFor="remember-me-checkbox" className="text-xs text-slate-600 cursor-pointer">
                تذكر بيانات الدخول على هذا الجهاز
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="submit-login-btn"
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>دخول إلى حسابي</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>

            {/* Switch to Register link */}
            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">ليس لديك حساب بعد؟ </span>
              <button
                type="button"
                id="switch-to-register-btn"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="text-xs font-black text-amber-600 hover:text-amber-700 hover:underline"
              >
                سجل حساباً جديداً الآن
              </button>
            </div>
          </form>
        )}

        {/* ===================== 2. REGISTER MODE ===================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الاسم بالكامل (ثلاثي أو رباعي) *
              </label>
              <div className="relative">
                <input
                  id="reg-name-input"
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="مثال: أحمد محمود السيد"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm transition outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الموبايل للتأكيد والمواعيد *
              </label>
              <div className="relative">
                <input
                  id="reg-phone-input"
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm transition outline-none"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            {/* Email & National ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    id="reg-email-input"
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs transition outline-none"
                    dir="ltr"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم القومي / الهوية
                </label>
                <div className="relative">
                  <input
                    id="reg-national-id-input"
                    type="text"
                    value={regNationalId}
                    onChange={e => setRegNationalId(e.target.value)}
                    placeholder="29XXXXXXXXXXXX"
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs transition outline-none"
                    dir="ltr"
                  />
                  <FileBadge className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    id="reg-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs transition outline-none"
                    dir="ltr"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs transition outline-none"
                    dir="ltr"
                  />
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Agree Terms Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="agree-terms-checkbox"
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
              />
              <label htmlFor="agree-terms-checkbox" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
                أوافق على <span className="text-amber-600 font-bold">شروط الخدمة</span> وسياسة الخصوصية واستلام تنبيهات المواعيد عبر الرسائل.
              </label>
            </div>

            {/* Submit Register Button */}
            <button
              id="submit-register-btn"
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>إنشاء الحساب وبدء التجربة</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            {/* Back to Login link */}
            <div className="text-center pt-1 pb-2">
              <span className="text-xs text-slate-500">لديك حساب بالفعل؟ </span>
              <button
                type="button"
                id="switch-to-login-btn"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-xs font-black text-amber-600 hover:text-amber-700 hover:underline"
              >
                تسجيل الدخول هنا
              </button>
            </div>
          </form>
        )}

        {/* ===================== 3. FORGOT PASSWORD MODE ===================== */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotSubmit} className="p-5 space-y-4">
            {!forgotSent ? (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  أدخل رقم جوالك أو بريدك الإلكتروني وسنرسل لك رمزاً لإعادة تعيين كلمة المرور فوراً.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الجوال أو البريد المسجل:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={e => setForgotIdentifier(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-md transition"
                >
                  إرسال رابط الاستعادة
                </button>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  تم إرسال رمز إعادة التعيين
                </h3>
                <p className="text-xs text-slate-500">
                  تم إرسال التعليمات إلى {forgotIdentifier}. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotSent(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotSent(false);
                  setErrorMessage(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                ← العودة إلى تسجيل الدخول
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
