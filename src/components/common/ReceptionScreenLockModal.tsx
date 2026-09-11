import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Lock, ShieldCheck, KeyRound, AlertCircle, Delete, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReceptionScreenLockModal: React.FC = () => {
  const { isScreenLocked, unlockScreen, changeScreenLockPin, currentUser } = useClinic();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  // Keyboard support for numeric typing and Enter key
  useEffect(() => {
    if (!isScreenLocked) {
      setPin('');
      setErrorMsg(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isChangingPin) return; // Don't intercept when changing PIN inputs
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 6) {
          setPin(prev => prev + e.key);
          setErrorMsg(null);
        }
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
        setErrorMsg(null);
      } else if (e.key === 'Enter') {
        handleSubmitUnlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScreenLocked, pin, isChangingPin]);

  if (!isScreenLocked) return null;

  const handleDigitPress = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setErrorMsg(null);
    }
  };

  const handleDeleteDigit = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const handleSubmitUnlock = () => {
    if (!pin) {
      setErrorMsg('يرجى إدخال رمز PIN');
      return;
    }

    const success = unlockScreen(pin);
    if (!success) {
      setErrorMsg('رمز PIN أو كلمة المرور غير صحيحة! يرجى التأكد من الرمز المعتمد.');
      setPin('');
    } else {
      setPin('');
      setErrorMsg(null);
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPinInput || !newPinInput) {
      setErrorMsg('يرجى تعبئة الحقول');
      return;
    }
    if (newPinInput.length < 4) {
      setErrorMsg('يجب أن يتكون رمز PIN الجديد من 4 أرقام على الأقل');
      return;
    }

    const verified = unlockScreen(currentPinInput);
    if (!verified) {
      setErrorMsg('رمز PIN الحالي غير صحيح');
      return;
    }

    // Now set the new PIN
    changeScreenLockPin(newPinInput);
    setChangeSuccess('تم تغيير رمز PIN بنجاح! يمكنك استخدامه الآن.');
    setTimeout(() => {
      setIsChangingPin(false);
      setChangeSuccess(null);
      setCurrentPinInput('');
      setNewPinInput('');
    }, 1500);
  };

  return (
    <div
      id="reception-screen-lock-modal"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-white shadow-2xl flex flex-col items-center gap-5 text-center relative overflow-hidden"
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-black text-white">قفل شاشة الاستقبال</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            تم تأمين الشاشة لحماية سرية بيانات المرضى والحسابات المالية أثناء غياب السكرتيرة
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold border border-emerald-500/25">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>جلسة دائمة مشفرة ومحفوظة</span>
          </div>
        </div>

        {!isChangingPin ? (
          <>
            {/* PIN Dots Display */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center justify-center gap-3 py-3">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                      pin.length > index
                        ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-500/50'
                        : 'border-slate-700 bg-slate-800/60'
                    }`}
                  />
                ))}
              </div>

              {/* Show Typed PIN preview */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  {pin.length > 0 ? (showPin ? pin : '•'.repeat(pin.length)) : 'أدخل الرمز المكون من 4 أرقام'}
                </span>
                {pin.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="text-rose-400 text-xs font-bold flex items-center gap-1 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Numeric Keypad for fast touchscreen or mouse click */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitPress(digit)}
                  className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg transition active:scale-95 shadow-xs border border-slate-700/60 cursor-pointer flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 text-xs font-bold transition active:scale-95 border border-slate-700/30 cursor-pointer flex items-center justify-center"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handleDigitPress('0')}
                className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg transition active:scale-95 shadow-xs border border-slate-700/60 cursor-pointer flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDeleteDigit}
                className="h-12 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 transition active:scale-95 border border-slate-700/30 cursor-pointer flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Unlock Button */}
            <button
              type="button"
              onClick={handleSubmitUnlock}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>إلغاء قفل الشاشة ومتابعة العمل</span>
            </button>

            {/* Change PIN toggle */}
            <button
              type="button"
              onClick={() => {
                setIsChangingPin(true);
                setErrorMsg(null);
              }}
              className="text-slate-400 hover:text-amber-400 text-[11px] underline underline-offset-4 transition cursor-pointer"
            >
              تغيير رمز PIN لقفل الشاشة
            </button>
          </>
        ) : (
          /* Change PIN Form */
          <form onSubmit={handleSaveNewPin} className="w-full flex flex-col gap-3">
            <div className="text-right">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">رمز PIN الحالي أو كلمة مرور السكرتارية</label>
              <input
                type="password"
                maxLength={20}
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value)}
                placeholder="أدخل الرمز الحالي"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white text-center font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="text-right">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">رمز PIN الجديد (4 إلى 6 أرقام)</label>
              <input
                type="password"
                maxLength={6}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="الرمز الجديد"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white text-center font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            {errorMsg && (
              <div className="text-rose-400 text-xs font-bold flex items-center gap-1 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {changeSuccess && (
              <div className="text-emerald-400 text-xs font-bold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{changeSuccess}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                حفظ الرمز الجديد
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setErrorMsg(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-3 w-full">
          المستخدم النشط: <span className="text-slate-300 font-bold">{currentUser?.name}</span>
        </div>
      </motion.div>
    </div>
  );
};
