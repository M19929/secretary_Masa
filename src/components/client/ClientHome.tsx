import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ClinicGoogleMap } from '../common/ClinicGoogleMap';
import {
  Calendar,
  Percent,
  Info,
  User,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  Clock,
  Award,
  ShieldCheck,
  Star,
  PhoneCall,
  ArrowRight,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ClientHome: React.FC = () => {
  const {
    setClientTab,
    startBooking,
    offers,
    services,
    doctors,
    doctorReviews,
    currentUser,
    isAuthenticated,
    openAuthModal,
    clinicInfo,
    clinicGallery
  } = useClinic();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<any>(null);
  const [homeGalleryTab, setHomeGalleryTab] = useState('الكل');

  const heroSlides = [
    {
      title: 'ابتسامتك تستحق\nأفضل رعاية',
      subtitle: 'نحن هنا لنهتم بابتسامتك بأحدث التقنيات',
      actionText: 'احجز الآن',
      serviceId: 'serv-1',
      bgGradient: 'from-[#0A192F] via-[#102A4C] to-[#1A365D]',
    },
    {
      title: 'خصم 25% على\nتنظيف وتلميع الأسنان',
      subtitle: 'عرض خاص لفترة محدودة يشمل كشف مجاني',
      actionText: 'استفد من العرض',
      offerId: 'off-1',
      bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
    },
    {
      title: 'ابتسامة هوليوود\nبلمسة احترافية',
      subtitle: 'عدسات فينير وزركون بضمان معتمد 10 سنوات',
      actionText: 'احجز استشارتك',
      serviceId: 'serv-8',
      bgGradient: 'from-[#111827] via-[#1F2937] to-[#374151]',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const featuredOffer = (offers && offers[0]) || {
    title: 'عرض تنظيف الأسنان',
    subtitle: 'تنظيف + تلميع + فلورايد',
    originalPrice: 400,
    discountedPrice: 299,
    discountPercent: 25
  };

  const handleHeroAction = () => {
    const slide = heroSlides[currentSlide];
    if (slide.offerId) {
      const off = offers?.find(o => o.id === slide.offerId);
      startBooking(undefined, off);
    } else {
      const srv = services?.find(s => s.id === slide.serviceId) || (services && services[0]);
      if (srv) {
        startBooking(srv);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      
      {/* User Greeting & Status Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-xs">
        {isAuthenticated && currentUser ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">أهلاً بك،</span>
                <span className="text-xs font-black text-slate-900">{currentUser.name}</span>
                <span className="text-amber-500 text-xs">✨</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {currentUser.role === 'secretary' || currentUser.role === 'admin' ? 'طاقم السكرتارية' : 'حساب مريض مفعل'}
                </span>
                <span>•</span>
                <span dir="ltr">{currentUser.phone}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              💎
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">مركز د. محمد فوزي الماسة</span>
              <span className="text-[10px] text-slate-400">سجل دخولك لمتابعة مواعيدك بالمحلة</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <button
              onClick={() => setClientTab('profile')}
              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              ملفي الطبي
            </button>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                دخول
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="hidden sm:inline-flex text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                حساب جديد
              </button>
            </>
          )}
        </div>
      </div>

      {/* 1. Hero Carousel Banner (Matching Screenshot 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0B1E36] text-white shadow-xl min-h-[220px] p-6 flex items-center justify-between">
        {/* Ambient glow & 3D tooth artwork */}
        <div className="absolute left-3 -bottom-4 w-44 h-44 opacity-95 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
          {/* Stylized 3D Glowing Tooth */}
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="heroToothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
              <linearGradient id="heroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="70" fill="url(#heroGlow)" filter="blur(8px)" opacity="0.4" />
            <path
              d="M48 40 C35 40 28 54 28 75 C28 100 40 120 54 132 C60 137 68 136 72 125 C75 116 78 98 80 98 C82 98 85 116 88 125 C92 136 100 137 106 132 C120 120 132 100 132 75 C132 54 125 40 112 40 C100 40 90 52 80 52 C70 52 60 40 48 40 Z"
              fill="url(#heroToothGrad)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            {/* Highlight shine */}
            <path
              d="M45 52 C40 58 38 68 38 78 C38 82 42 84 45 80 C48 76 52 65 54 56 C54 52 48 50 45 52 Z"
              fill="#FFFFFF"
              opacity="0.9"
            />
            <circle cx="115" cy="55" r="4" fill="#FDE047" className="animate-ping" />
            <circle cx="115" cy="55" r="3" fill="#FDE047" />
          </svg>
        </div>

        {/* Text & Action */}
        <div className="z-10 max-w-[62%] flex flex-col items-start gap-2.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-1.5"
            >
              <h2 className="text-xl sm:text-2xl font-black leading-tight text-white whitespace-pre-line tracking-tight">
                {heroSlides[currentSlide].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                {heroSlides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={handleHeroAction}
            className="mt-1 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{heroSlides[currentSlide].actionText}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel indicator dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. 6 Quick Action Grid Cards (Matching Screenshot 1 exactly) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        
        {/* Card 1: خدماتنا (Tooth) */}
        <button
          onClick={() => setClientTab('services')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-center group active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center mb-2 transition">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">خدماتنا</span>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">خدمات متكاملة لعلاجك</span>
        </button>

        {/* Card 2: العروض (Discount Tag) */}
        <button
          onClick={() => setClientTab('offers')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-center group active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center mb-2 transition">
            <Percent className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">العروض</span>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">اكتشف أحدث العروض</span>
        </button>

        {/* Card 3: حجز موعد (Calendar Check) */}
        <button
          onClick={() => startBooking()}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-center group active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-2 transition">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">حجز موعد</span>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">احجز موعدك بسهولة</span>
        </button>

        {/* Card 4: عن المركز (Info) */}
        <button
          onClick={() => setClientTab('about')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-center group active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-600 flex items-center justify-center mb-2 transition">
            <Info className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">عن المركز</span>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">تعرف علينا أكثر</span>
        </button>

        {/* Card 5: ملفي (User/Profile) */}
        <button
          onClick={() => setClientTab('profile')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-center group active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-600 flex items-center justify-center mb-2 transition">
            <User className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">ملفي</span>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">بياناتك ومواعيدك</span>
        </button>

        {/* Card 6: واتساب العيادة والحجوزات (WhatsApp) */}
        <button
          onClick={() => {
            const whatsappUrl = `https://wa.me/201101722551?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن مواعيد مركز د. محمد فوزي الماسة لطب وجراحة الأسنان')}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-center group active:scale-95 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:bg-emerald-600 transition">
            <PhoneCall className="w-5 h-5 fill-white" />
          </div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">واتساب العيادة</span>
          <span className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-0.5" dir="ltr">01101722551</span>
        </button>

      </div>

      {/* 3. Section: أحدث العروض (Matching Screenshot 1) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
            أحدث العروض
          </h3>
          <button
            onClick={() => setClientTab('offers')}
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Big Offer Banner Card (Matching Screenshot) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#0D254C] via-[#103060] to-[#1E3A8A] text-white p-5 shadow-lg">
          {/* 3D tooth artwork */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-32 h-32 opacity-95 pointer-events-none">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <path
                d="M38 30 C28 30 22 42 22 58 C22 78 32 94 42 104 C47 108 53 107 56 99 C58 92 60 78 62 78 C64 78 66 92 68 99 C71 107 77 108 82 104 C92 94 102 78 102 58 C102 42 96 30 86 30 C76 30 68 40 62 40 C56 40 48 30 38 30 Z"
                fill="#FFFFFF"
                stroke="#93C5FD"
                strokeWidth="1.5"
              />
              <circle cx="90" cy="40" r="2.5" fill="#FDE047" />
            </svg>
            <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow">
              خصم 40%
            </div>
          </div>

          <div className="max-w-[65%] flex flex-col gap-1.5">
            <h4 className="font-extrabold text-base sm:text-lg text-white">
              {featuredOffer.title}
            </h4>
            <p className="text-xs text-slate-200">
              {featuredOffer.subtitle}
            </p>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs line-through text-slate-400">
                بدلاً من {featuredOffer.originalPrice} ج.م
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300">
                {featuredOffer.discountedPrice} ج.م فقط
              </span>
            </div>

            <button
              onClick={() => startBooking(undefined, featuredOffer)}
              className="mt-2 w-fit px-5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              احجز الآن
            </button>
          </div>
        </div>
      </div>

      {/* 4. Doctors Preview (All 6 doctors specified by user) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              نخبة أطباء واستشاريي المركز
            </h3>
            <span className="text-[11px] text-slate-500">مركز د. محمد فوزي الماسة - المحلة الكبرى</span>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
            {doctors.length} أطباء
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2 hover:border-amber-200 transition"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {doc.name}
                </span>
                <span className="text-[10px] text-amber-600 font-bold mt-0.5 line-clamp-1">
                  {doc.specialty}
                </span>
                <span className="text-[9px] text-slate-400 line-clamp-1">
                  {doc.title}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{doc.rating}</span>
                <span className="text-slate-400 text-[9px]">({doc.reviewCount})</span>
              </div>
              <button
                onClick={() => {
                  startBooking();
                }}
                className="w-full mt-1 py-1 text-[11px] font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg transition cursor-pointer"
              >
                حجز موعد كشف
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Patient Reviews & Ratings Section */}
      {doctorReviews && doctorReviews.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-1.5">
                <span>آراء وتقييمات المرضى</span>
                <span className="text-amber-500">⭐</span>
              </h3>
              <span className="text-[11px] text-slate-500">تجارب حقيقية من مراجعي عيادات الماسة</span>
            </div>
            <button
              onClick={() => setClientTab('appointments')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              أضف تقييمك
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {doctorReviews.slice(0, 4).map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col gap-2 hover:border-amber-200 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">{rev.patientName}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">{rev.doctorName}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  "{rev.comment}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>تم الكشف والتقييم</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Section: معرض صور وتجهيزات المركز والعيادات (المحدث مباشرة من السكرتيرة) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                معرض صور وتجهيزات المركز والعيادات
              </h3>
              <span className="text-[11px] text-slate-500">أحدث الأجهزة وغرف الكشف وابتسامات مرضانا</span>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
            {clinicGallery.length} صور
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['الكل', 'تجهيزات المركز', 'عيادات الكشف', 'حالات قبل وبعد'].map((cat) => (
            <button
              key={cat}
              onClick={() => setHomeGalleryTab(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                homeGalleryTab === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {clinicGallery
            .filter(p => homeGalleryTab === 'الكل' || p.category === homeGalleryTab)
            .slice(0, 6)
            .map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedGalleryPhoto(photo)}
                className="group relative rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col"
              >
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-bold">
                    {photo.category}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-amber-600 transition">
                    {photo.title}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 8. Google Maps Clinic Location Section */}
      <ClinicGoogleMap height="280px" />

      {/* Lightbox Modal for Photo Zoom */}
      {selectedGalleryPhoto && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-800">
            <button
              onClick={() => setSelectedGalleryPhoto(null)}
              className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={selectedGalleryPhoto.url}
                alt={selectedGalleryPhoto.title}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm text-white">{selectedGalleryPhoto.title}</span>
                <span className="text-xs text-amber-400">{selectedGalleryPhoto.category}</span>
              </div>
              <span className="text-[11px] text-slate-400">مركز د. محمد فوزي الماسة</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
