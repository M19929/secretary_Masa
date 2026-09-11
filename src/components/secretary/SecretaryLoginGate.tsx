import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ToothLogo } from '../common/ToothLogo';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SecretaryLoginGate: React.FC = () => {
  const {
    unlockSecretaryDashboard,
    clinicInfo
  } = useClinic();

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = passwordInput.trim();
    if (!cleanInput) {
      setErrorMessage('يرجى إدخال كلمة مرور السكرتارية');
      return;
    }

    setIsSubmitting(true);

    // Attempt unlock
    const success = unlockSecretaryDashboard(cleanInput, rememberMe);
    if (!success) {
      setIsSubmitting(false);
      setErrorMessage('كلمة المرور غير صحيحة! يرجى إدخال كلمة المرور المعتمدة للسكرتارية.');
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between font-['Cairo',sans-serif] selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-slate-800/80 z-10">
        <ToothLogo size={42} showText={true} textColor="text-white" />
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>لوحة إدارة العيادة والاستقبال</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col gap-6"
        >
          {/* Clinic Brand & Lock Header */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-slate-900 p-1 shadow-xl shadow-sky-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#08284d] rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src="/assets/masa_logo.svg"
                    alt="مركز د. محمد فوزي - الماسة لطب وزراعة الأسنان"
                    className="w-full h-full object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md border-2 border-slate-900">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                تسجيل دخول لوحة السكرتارية
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                لوحة التحكم والاستقبال محمية بكلمة المرور لتأمين حسابات وسجلات المرضى.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>منظومة الاستقبال والخزينة الإلكترونية</span>
            </div>
          </div>

          {/* Error Alert Box */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold p-3 rounded-2xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>كلمة مرور السكرتارية المعتمدة:</span>
                </label>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="أدخل كلمة المرور..."
                  autoFocus
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-700 text-amber-500 focus:ring-0 accent-amber-500 cursor-pointer"
                />
                <span>تذكر تسجيل الدخول على هذا الجهاز</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              <span>دخول وفتح لوحة السكرتارية</span>
            </button>
          </form>

          {/* Secure System Badge without any password hint */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>نظام محمي ومشفر بالكامل لضمان سرية حسابات وبيانات المرضى</span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>مركز دكتور محمد فوزي الماسة لتجميل وزراعة الأسنان © {new Date().getFullYear()}</span>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>هاتف الاستقبال:</span>
          <span className="font-mono text-slate-300 dir-ltr">{clinicInfo.phoneDisplay || '01101722551'}</span>
        </div>
      </footer>
    </div>
  );
};
