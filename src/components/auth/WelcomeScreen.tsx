import React from 'react';
import { ToothLogo } from '../common/ToothLogo';
import {
  MapPin,
  Clock,
  Phone,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  ChevronLeft,
  Award,
  Users,
  Smile
} from 'lucide-react';
import { motion } from 'motion/react';
import { useClinic } from '../../context/ClinicContext';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between font-['Cairo',sans-serif] selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      {/* Ambient background lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-slate-800/80 z-10">
        <ToothLogo size={42} showText={true} textColor="text-white" />
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>مركز طبي متخصص</span>
        </div>
      </header>

      {/* Main Hero / Welcome Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center text-center z-10">
        {/* Animated Authentic Clinic Logo Badge */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-br from-sky-400 via-sky-600 to-slate-900 p-1 shadow-2xl shadow-sky-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#08284d] rounded-[22px] flex items-center justify-center p-2 relative overflow-hidden group">
              <img 
                src="/assets/masa_logo.svg" 
                alt="مركز د. محمد فوزي - الماسة لطب وزراعة الأسنان"
                className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-2.5 rounded-2xl shadow-lg border-2 border-slate-950 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Center Titles */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs sm:text-sm font-black mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <span>رعاية متكاملة لابتسامة مثالية</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            مركز د. محمد فوزى
            <span className="block text-2xl sm:text-3xl md:text-4xl text-amber-400 mt-1">
              الماسة لتجميل وزراعة الأسنان
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mt-2">
            نقدم لكم أحدث تقنيات طب وزراعة وتجميل الأسنان والتقويم الشفاف بالمحلة الكبرى بإشراف د. محمد فوزي ونخبة من الاستشاريين.
          </p>
        </motion.div>

        {/* Prominent Clinic Address Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md my-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-start sm:items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold text-amber-400 block mb-0.5">
                العنوان والموقع:
              </span>
              <p className="text-xs sm:text-sm font-black text-white leading-snug">
                المحله الكبرى ميدان الشون مقابل حلوني هبه اعلي معمل الدره
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Button: START (ابدأ) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md flex flex-col gap-3.5"
        >
          <button
            onClick={onStart}
            id="start-app-button"
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group border border-amber-300"
          >
            <span>ابدأ الآن</span>
            <ChevronLeft className="w-6 h-6 transform group-hover:-translate-x-1.5 transition-transform" />
          </button>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-2.5 text-center flex flex-col items-center">
              <CalendarCheck className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-300">حجز إلكتروني فوري</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-2.5 text-center flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-300">تعقيم فائق 100%</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-2.5 text-center flex flex-col items-center">
              <Smile className="w-4 h-4 text-sky-400 mb-1" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-300">تجميل وزراعة</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>المواعيد: يومياً 10:00 ص - 10:00 م</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>موبايل: 01101722551</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>أرضي: 0402218878</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
